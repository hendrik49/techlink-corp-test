const path = require('path')
const { app, BrowserWindow, session, ipcMain } = require('electron')
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') })

const { activateLockdown, deactivateLockdown } = require('./lockdown')
const { scanProcesses, startMonitor, stopMonitor } = require('./process-monitor')
const { listVirtualCameras } = require('./camera-guard')

const VERIFICATION_URL =
  process.env.VERIFICATION_URL || 'https://verify.teklink.it.com/verify'
const IS_DEV = process.env.NODE_ENV === 'development'

let mainWindow = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    kiosk: !IS_DEV,
    fullscreen: !IS_DEV,
    frame: IS_DEV,
    alwaysOnTop: !IS_DEV,
    resizable: IS_DEV,
    minimizable: false,
    closable: IS_DEV,
    skipTaskbar: !IS_DEV,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webviewTag: true,
      devTools: IS_DEV,
    },
  })

  if (!IS_DEV) {
    mainWindow.setAlwaysOnTop(true, 'screen-saver')
    mainWindow.setVisibleOnAllWorkspaces(true)
  }

  mainWindow.setMenu(null)

  mainWindow.webContents.on('before-input-event', (_event, input) => {
    if (
      !IS_DEV &&
      input.control &&
      input.shift &&
      input.key.toLowerCase() === 'i'
    ) {
      _event.preventDefault()
    }
  })

  const allowedOrigins = [
    new URL(VERIFICATION_URL).origin,
    'file://',
  ]

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const isAllowed = allowedOrigins.some((origin) => url.startsWith(origin))
    if (!isAllowed) {
      event.preventDefault()
    }
  })

  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))

  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'))

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

ipcMain.on('request-exit', () => {
  deactivateLockdown()
  app.quit()
})

app.whenReady().then(async () => {
  session.defaultSession.setPermissionRequestHandler(
    (_webContents, permission, callback) => {
      const allowed = ['media', 'mediaKeySystem']
      callback(allowed.includes(permission))
    }
  )

  createWindow()

  if (!IS_DEV) {
    activateLockdown(mainWindow)
  }

  const blockedProcesses = await scanProcesses()
  const virtualCams = await listVirtualCameras()

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('system-check-result', {
      blockedProcesses,
      virtualCams,
      verificationUrl: VERIFICATION_URL,
      isDev: IS_DEV,
    })
  })

  startMonitor((detected) => {
    if (mainWindow) {
      mainWindow.webContents.send('violation', {
        type: 'blocked_process',
        processes: detected,
      })
    }
  })

  app.on('before-quit', () => {
    stopMonitor()
  })
})

app.on('window-all-closed', () => {
  deactivateLockdown()
  app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
