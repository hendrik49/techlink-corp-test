const { globalShortcut, app } = require('electron')

const BLOCKED_SHORTCUTS = [
  'Alt+Tab',
  'Alt+F4',
  'Alt+Escape',
  'Alt+Space',
  'Ctrl+Escape',
  'Meta',             // Windows key / Cmd alone
  'Super',
  'CommandOrControl+Tab',
  'CommandOrControl+W',
  'CommandOrControl+Q',
  'CommandOrControl+N',
  'CommandOrControl+Shift+I',
  'CommandOrControl+Shift+J',
  'CommandOrControl+R',
  'F11',
  'F5',
]

let lockdownActive = false
let focusInterval = null

function activateLockdown(win) {
  if (lockdownActive) return
  lockdownActive = true

  for (const shortcut of BLOCKED_SHORTCUTS) {
    try {
      globalShortcut.register(shortcut, () => {
        // swallow the shortcut
      })
    } catch {
      // some shortcuts can't be registered on certain OSes
    }
  }

  // periodically re-focus the window to prevent it from losing focus
  focusInterval = setInterval(() => {
    if (win && !win.isDestroyed()) {
      if (!win.isFocused()) {
        win.focus()
      }
      win.setAlwaysOnTop(true, 'screen-saver')
    }
  }, 500)

  win.on('blur', () => {
    if (lockdownActive && !win.isDestroyed()) {
      setTimeout(() => {
        if (!win.isDestroyed()) win.focus()
      }, 100)
    }
  })

  win.on('minimize', (e) => {
    e.preventDefault()
    if (!win.isDestroyed()) win.restore()
  })

  // block Ctrl+Shift+Esc (Task Manager on Windows)
  win.webContents.on('before-input-event', (event, input) => {
    const isBlocked =
      (input.control && input.shift && input.key === 'Escape') ||
      (input.alt && input.key === 'F4') ||
      (input.alt && input.key === 'Tab') ||
      (input.meta)
    if (isBlocked) {
      event.preventDefault()
    }
  })
}

function deactivateLockdown() {
  if (!lockdownActive) return
  lockdownActive = false
  globalShortcut.unregisterAll()
  if (focusInterval) {
    clearInterval(focusInterval)
    focusInterval = null
  }
}

module.exports = { activateLockdown, deactivateLockdown }
