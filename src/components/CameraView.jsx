export function CameraView({ videoRef, isReady, error, facingMode, onSwitch }) {
  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Video element - fullscreen */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isReady ? 'opacity-100' : 'opacity-0'
        } ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
        style={{ objectFit: 'cover' }}
      />

      {/* Loading state */}
      {!isReady && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
          <div className="w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-cyan-400/70 text-sm">Kamera wird gestartet...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black p-8">
          <div className="text-4xl mb-4">📷</div>
          <p className="text-red-400 text-center text-sm mb-2">Kamera nicht verfügbar</p>
          <p className="text-white/40 text-center text-xs">{error}</p>
        </div>
      )}

      {/* Subtle HUD corner decorations */}
      {isReady && (
        <>
          <div className="absolute top-3 left-3 w-5 h-5 border-l border-t border-cyan-400/30 pointer-events-none" />
          <div className="absolute top-3 right-3 w-5 h-5 border-r border-t border-cyan-400/30 pointer-events-none" />
          <div className="absolute bottom-28 left-3 w-5 h-5 border-l border-b border-cyan-400/30 pointer-events-none" />
          <div className="absolute bottom-28 right-3 w-5 h-5 border-r border-b border-cyan-400/30 pointer-events-none" />
        </>
      )}

      {/* Camera flip button */}
      <button
        onClick={onSwitch}
        className="absolute top-12 right-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm border border-white/20
                   flex items-center justify-center text-white/60
                   hover:bg-black/60 hover:text-white active:scale-90 transition-all"
        title="Kamera wechseln"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <path d="M20 7h-3.4A4 4 0 0 0 12 4a4 4 0 0 0-4.6 3H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="13" r="3" />
          <path d="M8 3l4-2 4 2" />
        </svg>
      </button>
    </div>
  )
}
