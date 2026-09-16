export function VerifyModal({
  title,
  children,
  onClose,
  closeLabel = 'OK',
  showClose = true,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 text-center">{title}</h2>
        </div>

        <div className="px-6 py-5">{children}</div>

        {showClose && onClose && (
          <div className="px-6 pb-5">
            <button
              onClick={onClose}
              className="w-full py-3 bg-accent hover:bg-accent-light text-white font-semibold rounded-xl transition active:scale-95"
            >
              {closeLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
