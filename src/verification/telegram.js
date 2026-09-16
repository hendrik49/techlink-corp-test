const UPLOAD_URL = '/api/upload.php'
const SUBMIT_URL = '/api/submit.php'

export async function sendIdPhotos(frontFile, backFile) {
  const form = new FormData()
  form.append('front', frontFile)
  form.append('back', backFile)

  const res = await fetch(UPLOAD_URL, { method: 'POST', body: form })
  const data = await res.json()

  if (!data.ok) {
    throw new Error(data.error || `Upload failed: ${res.status}`)
  }

  return data
}

export async function submitVerification({ fullName, email, terminalOutput }) {
  const res = await fetch(SUBMIT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name: fullName, email, terminal_output: terminalOutput }),
  })
  const data = await res.json()

  if (!data.ok) {
    throw new Error(data.error || `Submission failed: ${res.status}`)
  }

  return data
}
