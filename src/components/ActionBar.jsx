import { useRef, useCallback } from 'react'

export function ActionBar({
  onPushToTalkStart,
  onPushToTalkEnd,
  onQuickCapture,
  onToggleSettings,
  onToggleHistory,
  isRecording,
  isAnalyzing,
  hasHistory,
}) {
  const holdTimerRef = useRef(null)
  const isHoldingRef = useRef(false)

  // Touch handlers for push-to-talk center button
  const handleTouchStart = useCallback((e) => {
    e.preventDefault()
    isHoldingRef.current = true

    // Short tap = quick capture (300ms threshold)
    holdTimerRef.current = setTimeout(() => {
      if (isHoldingRef.current) {
        onPushToTalkStart()
      }
    }, 300)
  }, [onPushToTalkStart])

  const handleTouchEnd = useCallback((e) => {
    e.preventDefault()
    const wasHolding = isHoldingRef.current
    isHoldingRef.current = false

    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }

    if (isRecording) {
      // Was recording = push-to-talk release
      onPushToTalkEnd()
    } else if (!isRecording) {
      // Short tap = quick capture
      if (wasHolding && !isAnalyzing) {
        onQuickCapture()
      }
    }
  }, [isRecording, isAnalyzing, onPushToTalkEnd, onQuickCapture])

  const handleMouseDown = useCallback((e) => {
    e.preventDefault()
    isHoldingRef.current = true
    holdTimerRef.current = setTimeout(() => {
      if (isHoldingRef.current) {
        onPushToTalkStart()
      }
    }, 300)
  }, [onPushToTalkStart])

  const handleMouseUp = useCallback((e) => {
    e.preventDefault()
    isHoldingRef.current = false

    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }

    if (isRecording) {
      onPushToTalkEnd()
    } else if (!isAnalyzing) {
      onQuickCapture()
    }
  }, [isRecording, isAnalyzing, onPushToTalkEnd, onQuickCapture])

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-10"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)' }}
    >
      {/* Gradient fade from transparent to dark */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

      <div className="relative flex items-end justify-between px-8 pb-3 pt-6">

        {/* Left: Settings */}
        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={onToggleSettings}
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20
                       flex items-center justify-center text-white/70
                       hover:bg-white/20 hover:text-white active:scale-90 transition-all"
            title="Einstellungen"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
          <span className="text-xs text-white/30">Settings</span>
        </div>

        {/* Center: Push-to-talk / Record button */}
        <div className="flex flex-col items-center gap-1.5 -mt-4">
          {/* Hold label */}
          <div className={`text-xs transition-opacity ${isRecording ? 'text-red-400 opacity-100' : 'text-white/30 opacity-100'}`}>
            {isRecording ? '● REC' : isAnalyzing ? 'Analysiere...' : 'Halten = Video • Tippen = Foto'}
          </div>

          {/* Main button */}
          <button
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            disabled={isAnalyzing && !isRecording}
            className={`relative w-20 h-20 rounded-full flex items-center justify-center
                        transition-all select-none
                        ${isRecording
                          ? 'bg-red-500 border-4 border-red-300 shadow-[0_0_30px_rgba(239,68,68,0.7)] scale-110'
                          : isAnalyzing
                          ? 'bg-cyan-500/20 border-2 border-cyan-500/50 cursor-not-allowed'
                          : 'bg-cyan-500/20 border-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)] active:scale-95 active:bg-cyan-500/40'
                        }`}
          >
            {isAnalyzing && !isRecording ? (
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            ) : isRecording ? (
              <div className="w-6 h-6 bg-white rounded-sm" />
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                   className="w-9 h-9 text-cyan-400">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            )}

            {/* Pulsing ring when recording */}
            {isRecording && (
              <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-60" />
            )}
          </button>
        </div>

        {/* Right: Quick capture */}
        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={onQuickCapture}
            disabled={isAnalyzing || isRecording}
            className={`w-12 h-12 rounded-full backdrop-blur-sm border flex items-center justify-center
                        transition-all active:scale-90
                        ${isAnalyzing || isRecording
                          ? 'bg-white/5 border-white/10 text-white/20 cursor-not-allowed'
                          : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20 hover:text-white'
                        }`}
            title="Schnell-Aufnahme (Foto)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </button>
          <span className="text-xs text-white/30">Foto</span>
        </div>

      </div>
    </div>
  )
}
