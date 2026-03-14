import { useEffect, useRef } from 'react'
import { speak } from '../utils/tts'

export function ChatPanel({ messages, isVisible, onClose }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    if (isVisible && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isVisible])

  if (!isVisible) return null

  return (
    <div
      className="absolute inset-0 bg-gaming-bg/95 backdrop-blur-sm z-20 flex flex-col animate-slideUp"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gaming-border bg-gaming-surface">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gaming-cyan animate-pulse" />
          <h2 className="text-gaming-cyan font-semibold text-sm tracking-wider uppercase">Chat Verlauf</h2>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gaming-card
                     text-gaming-border hover:text-gaming-cyan transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gaming-border">
            <div className="text-5xl mb-4">👁️</div>
            <p className="text-sm text-center">Noch keine Analysen. Mach ein Foto um zu starten!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

function MessageBubble({ message }) {
  const handleSpeak = () => {
    speak(message.response)
  }

  return (
    <div className="animate-fadeIn space-y-2">
      {/* Timestamp */}
      <div className="text-xs text-gaming-border/60 text-center">
        {new Date(message.timestamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
      </div>

      {/* Screenshot thumbnail */}
      {message.imageDataUrl && (
        <div className="flex justify-end">
          <img
            src={message.imageDataUrl}
            alt="Captured frame"
            className="w-24 h-16 object-cover rounded-lg border border-gaming-border opacity-80"
          />
        </div>
      )}

      {/* User question */}
      {message.question && (
        <div className="flex justify-end">
          <div className="bg-gaming-teal/20 border border-gaming-teal/40 rounded-xl rounded-tr-sm
                          px-3 py-2 max-w-xs text-sm text-white">
            <span className="text-gaming-teal/80 text-xs mr-1">🎤</span>
            {message.question}
          </div>
        </div>
      )}

      {/* AI response */}
      <div className="flex justify-start">
        <div className="bg-gaming-card border border-gaming-border rounded-xl rounded-tl-sm
                        px-3 py-2 max-w-sm text-sm text-white/90 leading-relaxed relative pr-9">
          {message.loading ? (
            <div className="flex items-center gap-2 text-gaming-cyan/70">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-gaming-cyan rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-gaming-cyan rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-gaming-cyan rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs">Analysiere...</span>
            </div>
          ) : message.error ? (
            <span className="text-red-400 text-xs">{message.error}</span>
          ) : (
            <>
              {message.response}
              {/* Speak button */}
              <button
                onClick={handleSpeak}
                className="absolute right-2 top-2 w-5 h-5 text-gaming-border hover:text-gaming-cyan transition-colors"
                title="Vorlesen"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
