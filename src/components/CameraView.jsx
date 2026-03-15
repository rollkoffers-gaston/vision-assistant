export function CameraView({ videoRef, isReady, error, facingMode, onSwitch, zoom, maxZoom, zoomSupported, onZoom }) {
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

      {/* Zoom slider */}
      {isReady && zoomSupported && maxZoom > 1 && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-20">
          <span className="text-cyan-400/80 text-xs font-mono">{zoom.toFixed(1)}x</span>
          <input
            type="range"
            min="1"
            max={maxZoom}
            step="0.1"
            value={zoom}
            onChange={(e) => onZoom?.(parseFloat(e.target.value))}
            className="w-28 accent-cyan-400 -rotate-90 origin-center"
            style={{ WebkitAppearance: 'none', height: '2px' }}
          />
          <span className="text-white/40 text-xs">🔍</span>
        </div>
      )}

      {/* Zoom buttons (fallback if slider feels bad on mobile) */}
      {isReady && zoomSupported && maxZoom > 1 && (
        <div className="absolute left-4 bottom-32 flex flex-col gap-1.5 z-20">
          <button
            onClick={() => onZoom?.(Math.min(zoom + 0.5, maxZoom))}
            className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm border border-white/20
                       flex items-center justify-center text-white/70 text-lg font-bold
                       active:scale-90 active:bg-cyan-500/30 transition-all"
          >+</button>
          <div className="text-center text-cyan-400/80 text-xs font-mono">{zoom.toFixed(1)}x</div>
          <button
            onClick={() => onZoom?.(Math.max(zoom - 0.5, 1))}
            className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm border border-white/20
                       flex items-center justify-center text-white/70 text-lg font-bold
                       active:scale-90 active:bg-cyan-500/30 transition-all"
          >−</button>
        </div>
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
