import { useEffect } from 'react'

export function CameraView({ videoRef, isReady, error, facingMode, onSwitch }) {
  return (
    <div className="relative w-full h-full bg-gaming-bg overflow-hidden">
      {/* Video element */}
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
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gaming-bg">
          <div className="w-12 h-12 border-2 border-gaming-cyan border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gaming-cyan/70 text-sm">Kamera wird gestartet...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gaming-bg p-8">
          <div className="text-4xl mb-4">📷</div>
          <p className="text-red-400 text-center text-sm mb-2">Kamera nicht verfügbar</p>
          <p className="text-gaming-border text-center text-xs">{error}</p>
        </div>
      )}

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 pointer-events-none">
        <div className="w-8 h-8 border-l-2 border-t-2 border-gaming-cyan/40 m-3" />
      </div>
      <div className="absolute top-0 right-0 pointer-events-none">
        <div className="w-8 h-8 border-r-2 border-t-2 border-gaming-cyan/40 m-3" />
      </div>
      <div className="absolute bottom-20 left-0 pointer-events-none">
        <div className="w-8 h-8 border-l-2 border-b-2 border-gaming-cyan/40 m-3" />
      </div>
      <div className="absolute bottom-20 right-0 pointer-events-none">
        <div className="w-8 h-8 border-r-2 border-b-2 border-gaming-cyan/40 m-3" />
      </div>

      {/* Camera flip button */}
      <button
        onClick={onSwitch}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gaming-surface/80 border border-gaming-border
                   flex items-center justify-center text-gaming-cyan hover:border-gaming-cyan hover:bg-gaming-card/80
                   transition-all active:scale-95 backdrop-blur-sm"
        title="Kamera wechseln"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
          <path d="M20 7h-3.4A4 4 0 0 0 12 4a4 4 0 0 0-4.6 3H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="13" r="3" />
          <path d="M8 3l4-2 4 2" />
        </svg>
      </button>

      {/* Facing mode indicator */}
      <div className="absolute top-4 left-4">
        <span className="text-xs text-gaming-cyan/60 bg-gaming-surface/60 backdrop-blur-sm px-2 py-1 rounded-full border border-gaming-border/40">
          {facingMode === 'environment' ? '🔭 Rück' : '🤳 Front'}
        </span>
      </div>
    </div>
  )
}
