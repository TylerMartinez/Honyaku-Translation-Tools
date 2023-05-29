/* eslint-disable no-undef */
const { contextBridge, desktopCapturer, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('remote', {
  appDataPath: () => ipcRenderer.invoke('app:getAppdata'),
})

contextBridge.exposeInMainWorld('appWindow', {
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  maximize: () => ipcRenderer.send('window:maximize'),
  unmaximize: () => ipcRenderer.send('window:unmaximize'),
  minimize: () => ipcRenderer.send('window:minimize'),
  close: () => ipcRenderer.send('window:close'),
})

contextBridge.exposeInMainWorld('fs', {
  existsSync: (filename) => ipcRenderer.invoke('fs:existsSync', filename),
  writeFileSync: (filename, content) => ipcRenderer.invoke('fs:writeFileSync', filename, content),
  readFileSync: (filename) => ipcRenderer.invoke('fs:readFileSync', filename),
  writeFile: (filename) => ipcRenderer.invoke('fs:writeFile', filename),
})

contextBridge.exposeInMainWorld('desktopCapturer', {
  getSources: (config) => desktopCapturer.getSources(config),
})

contextBridge.exposeInMainWorld('dialog', {
  showOpenFileDialog: (title, properties) => ipcRenderer.invoke('dialog:showOpenFileDialog', title, properties),
})