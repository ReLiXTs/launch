const { app, BrowserWindow, ipcMain, safeStorage } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const Updater = require('./updater');
const MinecraftLauncher = require('./minecraft');
const MicrosoftAuth = require('./auth');
const config = require('./config.json');

let mainWindow;
let updater;
let minecraftLauncher;
let updateTimer;

// ---------- Хранение аккаунта (userData, а не внутри asar) ----------
const accountFile = () => path.join(app.getPath('userData'), 'account.json');

function saveAccount(account) {
  try {
    const toSave = { ...account };
    if (toSave.refreshToken && safeStorage.isEncryptionAvailable()) {
      toSave.refreshToken = safeStorage.encryptString(toSave.refreshToken).toString('base64');
      toSave.encrypted = true;
    }
    fs.writeFileSync(accountFile(), JSON.stringify(toSave, null, 2));
  } catch (err) {
    console.error('Не удалось сохранить аккаунт:', err);
  }
}

function loadAccount() {
  try {
    if (!fs.existsSync(accountFile())) return null;
    const data = JSON.parse(fs.readFileSync(accountFile(), 'utf-8'));
    if (data.encrypted && data.refreshToken && safeStorage.isEncryptionAvailable()) {
      data.refreshToken = safeStorage.decryptString(Buffer.from(data.refreshToken, 'base64'));
    }
    return data;
  } catch {
    return null;
  }
}

function clearAccount() {
  try {
    fs.unlinkSync(accountFile());
  } catch {
    /* уже нет файла — ничего страшного */
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1040,
    height: 700,
    minWidth: 880,
    minHeight: 580,
    backgroundColor: '#14161c',
    icon: path.join(__dirname, '..', 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    frame: true,
    resizable: true,
    title: `${config.serverName} Launcher`
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  updater = new Updater(config.github);
  minecraftLauncher = new MinecraftLauncher();

  setTimeout(() => {
    checkForUpdates();
  }, 2000);

  // Раньше setInterval стоял на верхнем уровне модуля и не отменялся —
  // теперь он создаётся вместе с окном и чистится при выходе.
  updateTimer = setInterval(checkForUpdates, config.updateCheckInterval);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (updateTimer) clearInterval(updateTimer);
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('get-config', () => config);

ipcMain.handle('check-updates', async () => checkForUpdates());

ipcMain.handle('launch-minecraft', async (event, options) => {
  try {
    const account = loadAccount();
    const result = await minecraftLauncher.launch({ ...options, account });
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-system-info', () => {
  return {
    totalMemory: Math.round(os.totalmem() / 1024 / 1024),
    freeMemory: Math.round(os.freemem() / 1024 / 1024),
    cpus: os.cpus().length,
    platform: os.platform(),
    arch: os.arch()
  };
});

ipcMain.handle('get-auto-ram', () => minecraftLauncher.getOptimalRam());

ipcMain.handle('download-update', async (event, version) => {
  return await updater.downloadUpdate(version, (progress) => {
    if (mainWindow) mainWindow.webContents.send('download-progress', progress);
  });
});

// ---------- Аккаунт Microsoft / Minecraft ----------
ipcMain.handle('get-account', () => {
  const account = loadAccount();
  if (!account) return null;
  return { profile: account.profile, ownsGame: account.ownsGame };
});

ipcMain.handle('ms-login', async () => {
  const auth = new MicrosoftAuth(config.msal.clientId);
  const result = await auth.login();
  saveAccount(result);
  return { profile: result.profile, ownsGame: result.ownsGame };
});

ipcMain.handle('ms-logout', () => {
  clearAccount();
  return true;
});

async function checkForUpdates() {
  try {
    const update = await updater.checkForUpdates();
    if (update && update.hasUpdate && mainWindow) {
      mainWindow.webContents.send('update-available', update);
    }
    return update;
  } catch (error) {
    console.error('Update check error:', error);
    return { hasUpdate: false, error: error.message };
  }
}
