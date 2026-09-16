import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, Upload, KeyRound, ArrowLeft, ShieldCheck } from 'lucide-react'

const DOWNLOAD_URL = '/api/source-download.php'
const UPLOAD_URL = '/api/source-upload.php'
const TOKEN_KEY = 'techlink_source_token'

function readStoredToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

export default function SourcePortal() {
  const [token, setToken] = useState(readStoredToken)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [fileName, setFileName] = useState('')
  const fileRef = useRef(null)

  function persistToken(value) {
    setToken(value)
    try {
      if (value) sessionStorage.setItem(TOKEN_KEY, value)
      else sessionStorage.removeItem(TOKEN_KEY)
    } catch {
      /* ignore */
    }
  }

  async function handleDownload() {
    setError(null)
    setMessage(null)
    if (!token.trim()) {
      setError('Enter the access token first.')
      return
    }

    setBusy(true)
    try {
      const res = await fetch(DOWNLOAD_URL, {
        method: 'GET',
        headers: { 'X-Source-Token': token.trim() },
      })

      const contentType = res.headers.get('Content-Type') || ''
      if (!res.ok) {
        let detail = `Download failed (${res.status})`
        if (contentType.includes('application/json')) {
          const data = await res.json()
          detail = data.error || detail
        }
        throw new Error(detail)
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'techlink-source.zip'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      setMessage('Download started: techlink-source.zip')
    } catch (err) {
      setError(err.message || 'Download failed')
    } finally {
      setBusy(false)
    }
  }

  async function handleUpload(e) {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (!token.trim()) {
      setError('Enter the access token first.')
      return
    }

    const file = fileRef.current?.files?.[0]
    if (!file) {
      setError('Choose a .zip package to upload.')
      return
    }
    if (!file.name.toLowerCase().endsWith('.zip')) {
      setError('Only .zip packages are accepted.')
      return
    }

    setBusy(true)
    try {
      const form = new FormData()
      form.append('package', file)
      form.append('token', token.trim())

      const res = await fetch(UPLOAD_URL, {
        method: 'POST',
        headers: { 'X-Source-Token': token.trim() },
        body: form,
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) {
        throw new Error(data.error || `Upload failed (${res.status})`)
      }

      setMessage(data.message || `Stored as ${data.id}`)
      setFileName('')
      if (fileRef.current) fileRef.current.value = ''
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-2xl mx-auto px-6 py-12 lg:py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to site
        </Link>

        <div className="mb-10">
          <p className="text-[10px] font-medium tracking-[0.25em] uppercase text-accent-muted mb-3">
            Developer portal
          </p>
          <h1 className="font-display text-4xl text-slate-900 tracking-wide mb-3">
            Source package
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed max-w-xl">
            Download the sanitized TechLink website source as a{' '}
            <span className="text-slate-800">.zip</span>, modify locally, then
            upload your package for review. Uploads are stored only — they are
            never deployed automatically.
          </p>
        </div>

        <div className="space-y-8">
          <section className="bg-white border border-slate-200 p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-4">
              <KeyRound className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-medium tracking-wide text-slate-900 uppercase">
                Access token
              </h2>
            </div>
            <label className="block text-xs text-slate-500 mb-2" htmlFor="source-token">
              Shared developer token
            </label>
            <input
              id="source-token"
              type="password"
              autoComplete="off"
              value={token}
              onChange={(e) => persistToken(e.target.value)}
              placeholder="Enter access token"
              className="w-full border border-slate-200 bg-surface px-4 py-3 text-sm text-slate-900 outline-none focus:border-accent transition-colors"
            />
          </section>

          <section className="bg-white border border-slate-200 p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-4">
              <Download className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-medium tracking-wide text-slate-900 uppercase">
                Download
              </h2>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Receives <code className="text-xs text-slate-800">techlink-source.zip</code>{' '}
              (secrets and <code className="text-xs">node_modules</code> excluded).
            </p>
            <button
              type="button"
              onClick={handleDownload}
              disabled={busy}
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-white text-sm px-5 py-3 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {busy ? 'Working…' : 'Download source ZIP'}
            </button>
          </section>

          <section className="bg-white border border-slate-200 p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-4">
              <Upload className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-medium tracking-wide text-slate-900 uppercase">
                Upload modified ZIP
              </h2>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Text-source allowlist only. Nested archives and executables are
              rejected.
            </p>
            <form onSubmit={handleUpload} className="space-y-4">
              <label
                htmlFor="source-package"
                className="flex flex-col items-center justify-center border border-dashed border-slate-300 bg-surface px-6 py-10 cursor-pointer hover:border-accent transition-colors"
              >
                <Upload className="w-5 h-5 text-slate-400 mb-3" />
                <span className="text-sm text-slate-700">
                  {fileName || 'Drop your file or click to choose a .zip'}
                </span>
                <input
                  id="source-package"
                  ref={fileRef}
                  type="file"
                  accept=".zip,application/zip"
                  className="hidden"
                  onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
                />
              </label>
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center gap-2 border border-slate-300 text-slate-800 text-sm px-5 py-3 hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                {busy ? 'Working…' : 'Upload for review'}
              </button>
            </form>
          </section>

          <div className="flex gap-3 text-xs text-slate-500 leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <p>
              Safety model: ZIP packaging, extension allowlist, path checks, token
              gate, and store-only inbox — uploads are never executed or served as
              the live site.
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3" role="alert">
              {error}
            </p>
          )}
          {message && (
            <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 px-4 py-3" role="status">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
