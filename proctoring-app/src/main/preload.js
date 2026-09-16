const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('proctor', {
  onSystemCheckResult: (callback) =>
    ipcRenderer.on('system-check-result', (_event, data) => callback(data)),

  onViolation: (callback) =>
    ipcRenderer.on('violation', (_event, data) => callback(data)),

  requestExit: () => ipcRenderer.send('request-exit'),
})
