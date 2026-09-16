const { exec } = require('child_process')
const { allProcesses } = require('../shared/blocklist')

const SCAN_INTERVAL_MS = 5_000

let monitorTimer = null

function getProcessListCommand() {
  switch (process.platform) {
    case 'win32':
      return 'tasklist /FO CSV /NH'
    case 'darwin':
      return 'ps -eo comm='
    default:
      return 'ps -eo comm='
  }
}

function parseProcessList(stdout) {
  if (process.platform === 'win32') {
    return stdout
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const match = line.match(/"([^"]+)"/)
        return match ? match[1].toLowerCase().replace(/\.exe$/i, '') : ''
      })
      .filter(Boolean)
  }
  return stdout
    .split('\n')
    .filter(Boolean)
    .map((name) => {
      const base = name.trim().split('/').pop()
      return base.toLowerCase()
    })
    .filter(Boolean)
}

function matchBlocklist(runningProcesses) {
  const matches = []
  for (const running of runningProcesses) {
    for (const blocked of allProcesses) {
      if (running.includes(blocked)) {
        matches.push({ process: running, matchedRule: blocked })
        break
      }
    }
  }
  return matches
}

function scanProcesses() {
  return new Promise((resolve) => {
    exec(getProcessListCommand(), { timeout: 10_000 }, (err, stdout) => {
      if (err) {
        resolve([])
        return
      }
      const running = parseProcessList(stdout)
      resolve(matchBlocklist(running))
    })
  })
}

function startMonitor(onViolation) {
  stopMonitor()
  monitorTimer = setInterval(async () => {
    const detected = await scanProcesses()
    if (detected.length > 0 && typeof onViolation === 'function') {
      onViolation(detected)
    }
  }, SCAN_INTERVAL_MS)
}

function stopMonitor() {
  if (monitorTimer) {
    clearInterval(monitorTimer)
    monitorTimer = null
  }
}

module.exports = { scanProcesses, startMonitor, stopMonitor }
