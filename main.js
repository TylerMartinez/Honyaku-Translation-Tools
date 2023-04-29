const { app, BrowserWindow, ipcMain, session } = require('electron')
const path = require('path')
const os = require('os')
const fs = require('fs')

require('electron-reload')('./dist/**/*')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

const createWindow = () => {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false,
    },
    frame: false,
    minWidth: 620,
    minHeight: 600
  })

  // and load the index.html of the app.
  win.loadFile('./index.html')

  // Open the DevTools.
  win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  // Handle ipc messages
  ipcMain.handle('fs:existsSync', (_, filename) => fs.existsSync(filename))
  ipcMain.handle('fs:writeFileSync', (_, filename, content) =>   fs.writeFileSync(filename, content)) 
  ipcMain.handle('fs:readFileSync', (_, filename) => fs.readFileSync(filename)) 
  ipcMain.handle('fs:writeFile', (_, filename) => fs.writeFile(filename))
  
  ipcMain.handle('app:getAppdata', () => app.getPath('appData'))
  ipcMain.handle('app:currentWindow', () => win),

  ipcMain.handle('window:isMaximized', () => win.isMaximized())
  ipcMain.on('window:maximize', () => win.maximize())
  ipcMain.on('window:unmaximize', () => win.unmaximize())
  ipcMain.on('window:minimize', () => win.minimize())
  ipcMain.on('window:close', () => win.close())

  // Open the window
  createWindow()
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
