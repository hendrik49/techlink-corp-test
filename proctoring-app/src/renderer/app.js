/* eslint-env browser */

const screens = {
  check: document.getElementById('check-screen'),
  blocked: document.getElementById('blocked-screen'),
  ready: document.getElementById('ready-screen'),
  verify: document.getElementById('verify-screen'),
}

const violationOverlay = document.getElementById('violation-overlay')

function showScreen(name) {
  for (const [key, el] of Object.entries(screens)) {
    el.classList.toggle('active', key === name)
  }
}

window.proctor.onSystemCheckResult((data) => {
  const { blockedProcesses, virtualCams, verificationUrl } = data

  const hasBlocked = blockedProcesses.length > 0
  const hasVirtualCams = virtualCams.length > 0

  if (hasBlocked || hasVirtualCams) {
    if (hasBlocked) {
      const list = document.getElementById('blocked-list')
      for (const item of blockedProcesses) {
        const li = document.createElement('li')
        li.textContent = item.process
        list.appendChild(li)
      }
    }

    if (hasVirtualCams) {
      const warning = document.getElementById('virtual-cam-warning')
      const names = document.getElementById('virtual-cam-names')
      warning.style.display = 'block'
      names.textContent = virtualCams.join(', ')
    }

    showScreen('blocked')
    return
  }

  showScreen('ready')

  document.getElementById('start-btn').addEventListener('click', () => {
    showScreen('verify')
    const webview = document.getElementById('verify-webview')
    webview.setAttribute('src', verificationUrl)

    webview.addEventListener('permissionrequest', (e) => {
      if (e.permission === 'media') {
        e.request.allow()
      }
    })
  })
})

window.proctor.onViolation((data) => {
  const list = document.getElementById('violation-list')
  list.innerHTML = ''
  for (const item of data.processes) {
    const li = document.createElement('li')
    li.textContent = item.process
    list.appendChild(li)
  }
  violationOverlay.classList.add('active')

  setTimeout(() => {
    violationOverlay.classList.remove('active')
  }, 8000)
})
