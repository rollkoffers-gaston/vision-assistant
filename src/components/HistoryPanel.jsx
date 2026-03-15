export function HistoryPanel({ tips, isVisible, onClose }) {
  if (!isVisible) return null

  return (
    <div
      className="absolute inset-0 z-30 flex flex-col"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel slides up from bottom */}
      <div className="relative mt-auto bg-gray-950/95 backdrop-blur-md rounded-t-3xl border-t border-white/10 max-h-[70vh] flex flex-col">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            <h2 className="text-cyan-400 font-semibold text-sm tracking-wider uppercase">Verlauf</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tip list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {tips.length === 0 ? (
            <div className="text-center text-white/30 text-sm py-8">
              Noch keine Tipps aufgenommen
            </div>
          ) : (
            [...tips].reverse().map(tip => (
              <div key={tip.id} className="bg-white/5 border border-white/10 rounded-xl p-3">
                {tip.imageDataUrl && (
                  <img
                    src={tip.imageDataUrl}
                    alt="Screenshot"
                    className="w-full h-24 object-cover rounded-lg mb-2 opacity-60"
                  />
                )}
                {tip.question && (
                  <p className="text-cyan-400/70 text-xs mb-1">🎤 {tip.question}</p>
                )}
                {tip.loading ? (
                  <p className="text-white/40 text-xs">Analysiere...</p>
                ) : tip.error ? (
                  <p className="text-red-400/70 text-xs">⚠️ {tip.error}</p>
                ) : (
                  <p className="text-white/80 text-sm leading-snug">{tip.response}</p>
                )}
                <p className="text-white/20 text-xs mt-1.5">
                  {new Date(tip.timestamp).toLocaleTimeString('de-DE', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
