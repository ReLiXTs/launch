const $ = (id) => document.getElementById(id);

// DOM
const usernameInput = $('username');
const usernameHint = $('username-hint');
const versionSelect = $('version-select');
const modloaderSelect = $('modloader-select');
const ramSlider = $('ram-slider');
const ramValue = $('ram-value');
const maxRamLabel = $('max-ram-label');
const autoRamBtn = $('auto-ram-btn');
const recommendedRam = $('recommended-ram');
const launchBtn = $('launch-btn');

const updateNotification = $('update-notification');
const updateBtn = $('update-btn');
const dismissUpdateBtn = $('dismiss-update-btn');
const updateMessage = $('update-message');
const downloadProgress = $('download-progress');
const progressStatus = $('progress-status');
const progressPercent = $('progress-percent');
const progressFill = $('progress-fill');
const versionInfo = $('version-info');
const aboutVersion = $('about-version');
const updateStatus = $('update-status');
const statusLog = $('status-log');
const totalRamSpan = $('total-ram');
const freeRamSpan = $('free-ram');
const cpuCountSpan = $('cpu-count');

const msLoginBtn = $('ms-login-btn');
const msLoginLabel = msLoginBtn.querySelector('.btn-label');
const msLogoutBtn = $('ms-logout-btn');
const accountAvatar = $('account-avatar');
const avatarPlaceholder = $('avatar-placeholder');
const accountName = $('account-name');
const accountSub = $('account-sub');

let currentUpdate = null;
let account = null;

// ---------- Tabs ----------
document.querySelectorAll('.nav-item').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
    btn.classList.add('active');
    $(`tab-${btn.dataset.tab}`).classList.add('active');
  });
});

// ---------- Logging ----------
function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString('ru-RU');
  const entry = document.createElement('p');
  entry.className = `log-entry ${type}`;
  entry.textContent = `[${timestamp}] ${message}`;
  statusLog.appendChild(entry);
  statusLog.scrollTop = statusLog.scrollHeight;
}

// ---------- Account UI ----------
function renderAccount() {
  if (account && account.profile) {
    accountAvatar.src = `https://crafatar.com/avatars/${account.profile.id}?overlay`;
    accountAvatar.classList.remove('hidden');
    avatarPlaceholder.classList.add('hidden');
    accountName.textContent = account.profile.name;
    accountSub.textContent =
      account.ownsGame === false ? 'Аккаунт без лицензии Minecraft' : 'Вход выполнен через Microsoft';
    msLoginBtn.classList.add('hidden');
    msLogoutBtn.classList.remove('hidden');
    usernameInput.disabled = true;
    usernameHint.textContent = '(используется аккаунт Microsoft)';
  } else {
    accountAvatar.classList.add('hidden');
    avatarPlaceholder.classList.remove('hidden');
    accountName.textContent = 'Не выполнен вход';
    accountSub.textContent = 'Войдите через Microsoft, чтобы играть онлайн';
    msLoginBtn.classList.remove('hidden');
    msLogoutBtn.classList.add('hidden');
    usernameInput.disabled = false;
    usernameHint.textContent = '(офлайн-режим)';
  }
}

msLoginBtn.addEventListener('click', async () => {
  msLoginBtn.disabled = true;
  msLoginLabel.textContent = 'Открываем браузер...';
  try {
    log('Открыт браузер для входа через Microsoft', 'info');
    account = await window.api.msLogin();
    log(`Вход выполнен: ${account.profile.name}`, 'success');
    if (account.ownsGame === false) {
      log('Внимание: на этом аккаунте не найдена лицензия Minecraft', 'error');
    }
    renderAccount();
  } catch (error) {
    log(`Ошибка входа через Microsoft: ${error.message}`, 'error');
  } finally {
    msLoginBtn.disabled = false;
    msLoginLabel.textContent = 'Войти через Microsoft';
  }
});

msLogoutBtn.addEventListener('click', async () => {
  await window.api.msLogout();
  account = null;
  renderAccount();
  log('Выход из аккаунта Microsoft выполнен', 'info');
});

// ---------- RAM ----------
ramSlider.addEventListener('input', (e) => {
  ramValue.textContent = e.target.value;
});

autoRamBtn.addEventListener('click', async () => {
  try {
    const ram = await window.api.getAutoRam();
    ramSlider.value = ram.recommended;
    ramValue.textContent = ram.recommended;
    log(`ОЗУ автоматически настроена: ${ram.recommended} МБ`, 'success');
  } catch (error) {
    log(`Ошибка автонастройки ОЗУ: ${error.message}`, 'error');
  }
});

// ---------- Launch ----------
launchBtn.addEventListener('click', async () => {
  try {
    const username = usernameInput.value.trim() || 'Player';
    if (!account) localStorage.setItem('kamysh_username', username);

    const options = {
      username,
      version: versionSelect.value,
      ram: parseInt(ramSlider.value, 10),
      modLoader: modloaderSelect.value
    };

    const who = account ? `аккаунт ${account.profile.name}` : 'офлайн';
    log(`Запуск Minecraft: ${options.version}, ${options.ram} МБ ОЗУ (${who})`, 'info');
    launchBtn.disabled = true;
    launchBtn.textContent = '⏳ Запуск...';

    const result = await window.api.launchMinecraft(options);

    if (result.success) {
      log('Minecraft запущен успешно!', 'success');
    } else {
      log(`Ошибка запуска: ${result.error}`, 'error');
    }
  } catch (error) {
    log(`Ошибка: ${error.message}`, 'error');
  } finally {
    launchBtn.disabled = false;
    launchBtn.textContent = '🎮 Запустить Minecraft';
  }
});

// ---------- Updates ----------
updateBtn.addEventListener('click', async () => {
  if (!currentUpdate) return;
  try {
    updateNotification.classList.add('hidden');
    downloadProgress.classList.remove('hidden');
    log('Загрузка обновления...', 'info');

    await window.api.downloadUpdate(currentUpdate.remoteVersion);

    log('Обновление загружено успешно!', 'success');
    downloadProgress.classList.add('hidden');
    updateStatus.classList.remove('updating');
    updateStatus.classList.add('updated');
  } catch (error) {
    log(`Ошибка загрузки обновления: ${error.message}`, 'error');
    downloadProgress.classList.add('hidden');
  }
});

dismissUpdateBtn.addEventListener('click', () => {
  updateNotification.classList.add('hidden');
  log('Обновление отложено', 'info');
});

window.api.on('download-progress', (progress) => {
  progressFill.style.width = `${progress.progress}%`;
  progressPercent.textContent = `${progress.progress}%`;
  const labels = { downloading: 'Загрузка обновления...', extracting: 'Распаковка файлов...', complete: 'Готово!' };
  progressStatus.textContent = labels[progress.status] || '...';
});

window.api.on('update-available', (update) => handleUpdateCheck(update));

function handleUpdateCheck(update) {
  if (update.hasUpdate) {
    currentUpdate = update;
    updateMessage.textContent = `Доступна новая версия контента: ${update.remoteVersion}`;
    updateNotification.classList.remove('hidden');
    updateStatus.classList.add('updating');
    log(`Доступно обновление: ${update.remoteVersion}`, 'info');
  } else {
    updateStatus.classList.remove('updating');
    updateStatus.classList.add('updated');
    log('У вас последняя версия', 'success');
  }
}

// ---------- Init ----------
async function init() {
  try {
    const config = await window.api.getConfig();
    versionInfo.textContent = 'Актуально';
    aboutVersion.textContent = '1.0.0';
    log('Конфигурация загружена', 'success');

    const systemInfo = await window.api.getSystemInfo();
    totalRamSpan.textContent = `${systemInfo.totalMemory} МБ`;
    freeRamSpan.textContent = `${systemInfo.freeMemory} МБ`;
    cpuCountSpan.textContent = systemInfo.cpus;

    ramSlider.max = systemInfo.totalMemory;
    maxRamLabel.textContent = `${Math.floor(systemInfo.totalMemory / 1024)} ГБ`;

    const optimalRam = await window.api.getAutoRam();
    recommendedRam.textContent = `Рекомендуется: ${optimalRam.recommended} МБ`;
    ramSlider.value = optimalRam.recommended;
    ramValue.textContent = optimalRam.recommended;

    const savedUsername = localStorage.getItem('kamysh_username');
    if (savedUsername) usernameInput.value = savedUsername;

    account = await window.api.getAccount();
    renderAccount();

    log('Проверка обновлений...', 'info');
    const update = await window.api.checkUpdates();
    handleUpdateCheck(update);

    log('Лаунчер готов к работе', 'success');
  } catch (error) {
    log(`Ошибка инициализации: ${error.message}`, 'error');
  }
}

init();
