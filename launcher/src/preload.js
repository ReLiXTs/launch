const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getConfig: () => ipcRenderer.invoke('get-config'),
  checkUpdates: () => ipcRenderer.invoke('check-updates'),
  launchMinecraft: (options) => ipcRenderer.invoke('launch-minecraft', options),
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  getAutoRam: () => ipcRenderer.invoke('get-auto-ram'),
  downloadUpdate: (version) => ipcRenderer.invoke('download-update', version),
  
  on: (channel, callback) => {
    const validChannels = ['update-available', 'download-progress'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
  },
  
  removeListener: (channel, callback) => {
    const validChannels = ['update-available', 'download-progress'];
    if (validChannels.includes(channel)) {
      ipcRenderer.removeListener(channel, callback);
    }
  }
});
