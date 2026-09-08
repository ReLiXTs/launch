// DOM элементы
const usernameInput = document.getElementById('username');
const versionSelect = document.getElementById('version-select');
const ramSlider = document.getElementById('ram-slider');
const ramValue = document.getElementById('ram-value');
const maxRamLabel = document.getElementById('max-ram-label');
const autoRamBtn = document.getElementById('auto-ram-btn');
const recommendedRam = document.getElementById('recommended-ram');
const modloaderSelect = document.getElementById('modloader-select');
const launchBtn = document.getElementById('launch-btn');
const updateNotification = document.getElementById('update-notification');
const updateBtn = document.getElementById('update-btn');
const dismissUpdateBtn = document.getElementById('dismiss-update-btn');
const updateMessage = document.getElementById('update-message');
const downloadProgress = document.getElementById('download-progress');
const progressStatus = document.getElementById('progress-status');
const progressPercent = document.getElementById('progress-percent');
const progressFill = document.getElementById('progress-fill');
const versionInfo = document.getElementById('version-info');
const updateStatus = document.getElementById('update-status');
const statusLog = document.getElementById('status-log');
const totalRamSpan = document.getElementById('total-ram');
const freeRamSpan = document.getElementById('free-ram');
const cpuCountSpan = document.getElementById('cpu-count');

// Состояние приложения
let config = null;
let systemInfo = null;
let optimalRam = null;
let currentUpdate = null;

// Инициализация
async function init() {
  try {
    // Загружаем конфигурацию
    config = await window.api.getConfig();
    log('Конфигурация загружена', 'success');

    // Загружаем системную информацию
    systemInfo = await window.api.getSystemInfo();
    totalRamSpan.textContent = systemInfo.totalMemory;
    freeRamSpan.textContent = systemInfo.freeMemory;
    cpuCountSpan.textContent = systemInfo.cpus;

    // Настраиваем слайдер ОЗУ
    ramSlider.max = systemInfo.totalMemory;
    maxRamLabel.textContent = `${Math.floor(systemInfo.totalMemory / 1024)} ГБ`;

    // Получаем рекомендуемую ОЗУ
    optimalRam = await window.api.getAutoRam();
    recommendedRam.textContent = `Рекомендуется: ${optimalRam.recommended} МБ`;
    ramSlider.value = optimalRam.recommended;
    ramValue.textContent = optimalRam.recommended;

    // Загружаем сохраненный никнейм
    const savedUsername = localStorage.getItem('kamysh_username');
    if (savedUsername) {
      usernameInput.value = savedUsername;
    }

    // Проверяем обновления
    log('Проверка обновлений...', 'info');
    const update = await window.api.checkUpdates();
    handleUpdateCheck(update);

    log('Лаунчер готов к работе', 'success');
  } catch (error) {
    log(`Ошибка инициализации: ${error.message}`, 'error');
  }
}

// Обработчик изменения слайдера ОЗУ
ramSlider.addEventListener('input', (e) => {
  ramValue.textContent = e.target.value;
});

// Обработчик кнопки автонастройки ОЗУ
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

// Обработчик запуска Minecraft
launchBtn.addEventListener('click', async () => {
  try {
    const username = usernameInput.value.trim() || 'Player';
    
    // Сохраняем никнейм
    localStorage.setItem('kamysh_username', username);

    const options = {
      username: username,
      version: versionSelect.value,
      ram: parseInt(ramSlider.value),
      modLoader: modloaderSelect.value
    };

    log(`Запуск Minecraft с параметрами: ${options.version}, ${options.ram} МБ ОЗУ`, 'info');
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

// Обработчик кнопки обновления
updateBtn.addEventListener('click', async () => {
  if (!currentUpdate) return;

  try {
    updateNotification.classList.add('hidden');
    downloadProgress.classList.remove('hidden');
    
    log('Загрузка обновления...', 'info');
    
    await window.api.downloadUpdate(currentUpdate.remoteVersion);
    
    log('Обновление загружено успешно!', 'success');
    downloadProgress.classList.add('hidden');
    updateStatus.classList.add('updated');
    versionInfo.textContent = `Версия: ${currentUpdate.remoteVersion}`;
  } catch (error) {
    log(`Ошибка загрузки обновления: ${error.message}`, 'error');
    downloadProgress.classList.add('hidden');
  }
});

// Обработчик кнопки "Позже"
dismissUpdateBtn.addEventListener('click', () => {
  updateNotification.classList.add('hidden');
  log('Обновление отложено', 'info');
});

// Обработчик прогресса загрузки
window.api.on('download-progress', (progress) => {
  progressFill.style.width = `${progress.progress}%`;
  progressPercent.textContent = `${progress.progress}%`;
  
  switch (progress.status) {
    case 'downloading':
      progressStatus.textContent = 'Загрузка обновления...';
      break;
    case 'extracting':
      progressStatus.textContent = 'Распаковка файлов...';
      break;
    case 'complete':
      progressStatus.textContent = 'Готово!';
      break;
  }
});

// Обработчик доступного обновления
window.api.on('update-available', (update) => {
  handleUpdateCheck(update);
});

// Обработка результата проверки обновлений
function handleUpdateCheck(update) {
  if (update.hasUpdate) {
    currentUpdate = update;
    updateMessage.textContent = `Доступна новая версия: ${update.remoteVersion}`;
    updateNotification.classList.remove('hidden');
    updateStatus.classList.add('updating');
    log(`Доступно обновление: ${update.remoteVersion}`, 'info');
  } else {
    updateStatus.classList.remove('updating');
    updateStatus.classList.add('updated');
    versionInfo.textContent = `Версия: ${update.remoteVersion || 'актуальная'}`;
    log('У вас последняя версия', 'success');
  }
}

// Логирование
function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString('ru-RU');
  const entry = document.createElement('p');
  entry.className = `log-entry ${type}`;
  entry.textContent = `[${timestamp}] ${message}`;
  statusLog.appendChild(entry);
  statusLog.scrollTop = statusLog.scrollHeight;
}

// Запуск инициализации
init();
