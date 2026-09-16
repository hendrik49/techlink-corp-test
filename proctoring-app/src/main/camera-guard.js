const { exec } = require('child_process')
const { virtualCameraDeviceNames } = require('../shared/blocklist')

/**
 * Enumerate video input devices at the OS level and flag any that match
 * known virtual camera names.  Falls back to an empty list on error.
 */
function listVirtualCameras() {
  return new Promise((resolve) => {
    if (process.platform === 'win32') {
      // PowerShell: list video capture devices via WMI
      const cmd =
        'powershell -NoProfile -Command "Get-CimInstance Win32_PnPEntity | Where-Object { $_.PNPClass -eq \'Camera\' -or $_.PNPClass -eq \'Image\' -or $_.Service -eq \'usbvideo\' } | Select-Object -ExpandProperty Name"'
      exec(cmd, { timeout: 10_000 }, (err, stdout) => {
        if (err) return resolve([])
        resolve(matchDevices(stdout))
      })
    } else if (process.platform === 'darwin') {
      // macOS: use system_profiler to list camera devices
      const cmd =
        'system_profiler SPCameraDataType 2>/dev/null | grep "Model ID\\|Unique ID\\|^\\s" || true'
      exec(cmd, { timeout: 10_000 }, (err, stdout) => {
        if (err) return resolve([])
        resolve(matchDevices(stdout))
      })
    } else {
      // Linux: list /dev/video* and query device names via v4l2
      const cmd =
        'for d in /dev/video*; do v4l2-ctl -d "$d" --info 2>/dev/null | grep "Card type"; done || true'
      exec(cmd, { timeout: 10_000 }, (err, stdout) => {
        if (err) return resolve([])
        resolve(matchDevices(stdout))
      })
    }
  })
}

function matchDevices(stdout) {
  const lines = stdout.toLowerCase()
  const found = []
  for (const name of virtualCameraDeviceNames) {
    if (lines.includes(name)) {
      found.push(name)
    }
  }
  return found
}

module.exports = { listVirtualCameras }
