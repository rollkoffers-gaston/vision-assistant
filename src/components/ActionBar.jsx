import { useState } from 'react'

export function ActionBar({
  onCapture,
  onVoice,
  onToggleChat,
  onToggleSettings,
  isListening,
  isAnalyzing,
  autoCapture,
  hasMessages,
  voiceSupported,
}) {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-4 pt-3"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
    >
      {/* Glass background */}
      <div className="absolute inset-0 bg-gradient-to-t from-gaming-bg via-gaming-bg/80 to-transparent pointer-events-none" />

      <div className="relative flex items-end justify-between gap-3">

        {/* Left: Chat history */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={onToggleChat}
            className={`w-12 h-12 rounded-full border flex items-center justify-center
                        transition-all active:scale-90
                        ${hasMessages
                          ? 'bg-gaming-card border-gaming-cyan/60 text-gaming-cyan hover:border-gaming-cyan shadow-cyan-glow'
                          : 'bg-gaming-surface border-gaming-border text-gaming-border hover:border-gaming-cyan/40 hover:text-gaming-cyan/60'
                        }`}
            title="Chat Verlauf"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {hasMessages && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-gaming-cyan rounded-full" />
            )}
          </button>
          <span className="text-xs text-gaming-border/50">Chat</span>
        </div>

        {/* Center: Main capture button */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={onCapture}
            disabled={isAnalyzing}
            className={`relative w-20 h-20 rounded-full border-2 flex items-center justify-center
                        transition-all active:scale-90
                        ${isAnalyzing
                          ? 'border-gaming-cyan/50 bg-gaming-surface cursor-not-allowed'
                          : autoCapture
                          ? 'border-gaming-teal bg-gaming-teal/20 hover:bg-gaming-teal/30 shadow-[0_0_20px_rgba(0,184,148,0.4)]'
                          : 'border-gaming-cyan bg-gaming-cyan/15 hover:bg-gaming-cyan/25 animate-pulse-cyan'
                        }`}
          >
            {isAnalyzing ? (
              <div className="w-8 h-8 border-2 border-gaming-cyan border-t-transparent rounded-full animate-spin" />
            ) : autoCapture ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                   className="w-9 h-9 text-gaming-teal">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" fill="currentColor" />
                <line x1="12" y1="2" x2="12" y2="6" />
                <line x1="12" y1="18" x2="12" y2="22" />
                <line x1="2" y1="12" x2="6" y2="12" />
                <line x1="18" y1="12" x2="22" y2="12" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                   className="w-9 h-9 text-gaming-cyan">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            )}
          </button>
          <span className="text-xs text-gaming-border/50">
            {isAnalyzing ? 'Analysiere...' : autoCapture ? 'Auto-Modus' : 'Aufnehmen'}
          </span>
        </div>

        {/* Right: Voice + Settings */}
        <div className="flex flex-col gap-2">
          {voiceSupported && (
            <button
              onClick={onVoice}
              className={`w-12 h-12 rounded-full border flex items-center justify-center
                          transition-all active:scale-90
                          ${isListening
                            ? 'border-red-400 bg-red-500/20 text-red-400 animate-pulse'
                            : 'bg-gaming-surface border-gaming-border text-gaming-border hover:border-gaming-cyan/40 hover:text-gaming-cyan/60'
                          }`}
              title={isListening ? 'Spracherkennung stoppen' : 'Frage stellen (Sprache)'}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </button>
          )}

          <button
            onClick={onToggleSettings}
            className="w-12 h-12 rounded-full bg-gaming-surface border border-gaming-border
                       flex items-center justify-center text-gaming-border
                       hover:border-gaming-teal/60 hover:text-gaming-teal/70
                       transition-all active:scale-90"
            title="Einstellungen"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
        </div>

      </div>
    </div>
  )
}
