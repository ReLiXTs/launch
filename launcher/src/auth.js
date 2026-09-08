// Стандартный, документированный поток входа для сторонних Minecraft-лаунчеров
// (см. https://wiki.vg/Microsoft_Authentication_Scheme). Используется официальными
// публичными API Microsoft/Xbox/Minecraft, без хранения пароля пользователя в лаунчере —
// пользователь вводит логин/пароль в системном браузере на сайте Microsoft.

const crypto = require('crypto');
const http = require('http');
const { shell } = require('electron');
const fetch = require('node-fetch');

const AUTH_BASE = 'https://login.microsoftonline.com/consumers/oauth2/v2.0';
const SCOPES = 'XboxLive.signin offline_access';

function base64url(buffer) {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

class MicrosoftAuth {
  constructor(clientId) {
    this.clientId = clientId;
  }

  async login() {
    if (!this.clientId || this.clientId === 'YOUR_AZURE_CLIENT_ID') {
      throw new Error(
        'Вход через Microsoft не настроен: укажите msal.clientId в config.json ' +
          '(зарегистрируйте приложение в Azure Portal — см. README).'
      );
    }

    const verifier = base64url(crypto.randomBytes(32));
    const challenge = base64url(crypto.createHash('sha256').update(verifier).digest());
    const state = base64url(crypto.randomBytes(16));

    const { code, redirectUri } = await this.getAuthCode(challenge, state);
    const msToken = await this.exchangeCodeForToken(code, verifier, redirectUri);
    const xbl = await this.authenticateXBL(msToken.access_token);
    const xsts = await this.authenticateXSTS(xbl.Token);
    const uhs = xbl.DisplayClaims.xui[0].uhs;
    const mcToken = await this.loginMinecraft(xsts.Token, uhs);
    const profile = await this.getMinecraftProfile(mcToken.access_token);
    const ownsGame = await this.checkOwnership(mcToken.access_token);

    return {
      accessToken: mcToken.access_token,
      refreshToken: msToken.refresh_token,
      profile,
      ownsGame
    };
  }

  // Открывает системный браузер и поднимает локальный сервер для redirect_uri
  getAuthCode(challenge, state) {
    return new Promise((resolve, reject) => {
      let settled = false;
      const server = http.createServer((req, res) => {
        let url;
        try {
          url = new URL(req.url, 'http://127.0.0.1');
        } catch {
          res.end();
          return;
        }
        if (url.pathname !== '/callback') {
          res.end();
          return;
        }

        const returnedState = url.searchParams.get('state');
        const code = url.searchParams.get('code');
        const error = url.searchParams.get('error_description');

        res.setHeader('Content-Type', 'text/html; charset=utf-8');

        if (error || !code || returnedState !== state) {
          res.end('<h2>Ошибка входа. Это окно можно закрыть.</h2>');
          if (!settled) {
            settled = true;
            server.close();
            reject(new Error(error || 'Не удалось получить код авторизации'));
          }
          return;
        }

        res.end('<h2>Вход выполнен! Можно закрыть это окно и вернуться в лаунчер.</h2>');
        if (!settled) {
          settled = true;
          server.close();
          resolve({ code, redirectUri: this._redirectUri });
        }
      });

      server.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        this._redirectUri = `http://127.0.0.1:${port}/callback`;

        const authUrl = new URL(`${AUTH_BASE}/authorize`);
        authUrl.searchParams.set('client_id', this.clientId);
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('redirect_uri', this._redirectUri);
        authUrl.searchParams.set('response_mode', 'query');
        authUrl.searchParams.set('scope', SCOPES);
        authUrl.searchParams.set('state', state);
        authUrl.searchParams.set('code_challenge', challenge);
        authUrl.searchParams.set('code_challenge_method', 'S256');

        shell.openExternal(authUrl.toString());
      });

      setTimeout(() => {
        if (!settled) {
          settled = true;
          server.close();
          reject(new Error('Время ожидания входа истекло (5 минут)'));
        }
      }, 5 * 60 * 1000);
    });
  }

  async exchangeCodeForToken(code, verifier, redirectUri) {
    const body = new URLSearchParams({
      client_id: this.clientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: verifier,
      scope: SCOPES
    });
    const res = await fetch(`${AUTH_BASE}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error_description || 'Ошибка получения токена Microsoft');
    return data;
  }

  async refreshLogin(refreshToken) {
    const body = new URLSearchParams({
      client_id: this.clientId,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      scope: SCOPES
    });
    const res = await fetch(`${AUTH_BASE}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    });
    const msToken = await res.json();
    if (!res.ok) throw new Error(msToken.error_description || 'Не удалось обновить сессию');

    const xbl = await this.authenticateXBL(msToken.access_token);
    const xsts = await this.authenticateXSTS(xbl.Token);
    const uhs = xbl.DisplayClaims.xui[0].uhs;
    const mcToken = await this.loginMinecraft(xsts.Token, uhs);
    const profile = await this.getMinecraftProfile(mcToken.access_token);
    const ownsGame = await this.checkOwnership(mcToken.access_token);

    return {
      accessToken: mcToken.access_token,
      refreshToken: msToken.refresh_token || refreshToken,
      profile,
      ownsGame
    };
  }

  async authenticateXBL(msAccessToken) {
    const res = await fetch('https://user.auth.xboxlive.com/user/authenticate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        Properties: {
          AuthMethod: 'RPS',
          SiteName: 'user.auth.xboxlive.com',
          RpsTicket: `d=${msAccessToken}`
        },
        RelyingParty: 'http://auth.xboxlive.com',
        TokenType: 'JWT'
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error('Ошибка авторизации Xbox Live');
    return data;
  }

  async authenticateXSTS(xblToken) {
    const res = await fetch('https://xsts.auth.xboxlive.com/xsts/authorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        Properties: { SandboxId: 'RETAIL', UserTokens: [xblToken] },
        RelyingParty: 'rp://api.minecraftservices.com/',
        TokenType: 'JWT'
      })
    });
    const data = await res.json();
    if (!res.ok) {
      if (data?.XErr === 2148916233) throw new Error('На этом аккаунте Microsoft нет профиля Xbox Live.');
      if (data?.XErr === 2148916238) throw new Error('Аккаунт — детский профиль, нужна семейная группа Xbox.');
      throw new Error('Ошибка XSTS-авторизации');
    }
    return data;
  }

  async loginMinecraft(xstsToken, uhs) {
    const res = await fetch('https://api.minecraftservices.com/authentication/login_with_xbox', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identityToken: `XBL3.0 x=${uhs};${xstsToken}` })
    });
    const data = await res.json();
    if (!res.ok) throw new Error('Ошибка входа в Minecraft Services');
    return data;
  }

  async getMinecraftProfile(mcAccessToken) {
    const res = await fetch('https://api.minecraftservices.com/minecraft/profile', {
      headers: { Authorization: `Bearer ${mcAccessToken}` }
    });
    if (res.status === 404) throw new Error('На этом аккаунте не куплена лицензия Minecraft.');
    const data = await res.json();
    if (!res.ok) throw new Error('Не удалось получить профиль Minecraft');
    return data; // { id, name, skins, capes }
  }

  async checkOwnership(mcAccessToken) {
    try {
      const res = await fetch('https://api.minecraftservices.com/entitlements/mcstore', {
        headers: { Authorization: `Bearer ${mcAccessToken}` }
      });
      const data = await res.json();
      return Array.isArray(data.items) && data.items.length > 0;
    } catch {
      return null;
    }
  }
}

module.exports = MicrosoftAuth;
