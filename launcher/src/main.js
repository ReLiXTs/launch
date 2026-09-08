const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const Updater = require('./updater');
const MinecraftLauncher = require('./minecraft');
const config = require('./config.json');

let mainWindow;
let updater;
let minecraftLauncher;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    minWidth: 800,
    minHeight: 500,
    icon: path.join(__dirname, '../assets/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    frame: true,
    resizable: true,
    title: `${config.serverName} Launcher`
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));
  
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

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('get-config', () => {
  return config;
});

ipcMain.handle('check-updates', async () => {
  return await checkForUpdates();
});

ipcMain.handle('launch-minecraft', async (event, options) => {
  try {
    const result = await minecraftLauncher.launch(options);
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-system-info', () => {
  const os = require('os');
  return {
    totalMemory: Math.round(os.totalmem() / 1024 / 1024),
    freeMemory: Math.round(os.freemem() / 1024 / 1024),
    cpus: os.cpus().length,
    platform: os.platform(),
    arch: os.arch()
  };
});

ipcMain.handle('get-auto-ram', () => {
  return minecraftLauncher.getOptimalRam();
});

ipcMain.handle('download-update', async (event, version) => {
  return await updater.downloadUpdate(version, (progress) => {
    mainWindow.webContents.send('download-progress', progress);
  });
});

async function checkForUpdates() {
  try {
    const update = await updater.checkForUpdates();
    if (update && update.hasUpdate) {
      mainWindow.webContents.send('update-available', update);
    }
    return update;
  } catch (error) {
    console.error('Update check error:', error);
    return { hasUpdate: false, error: error.message };
  }
}

setInterval(() => {
  checkForUpdates();
}, config.updateCheckInterval);
