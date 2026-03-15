import { useState, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'

function TipCard({ tip, onDismiss }) {
  const [showDetail, setShowDetail] = useState(false)
  const [fading, setFading] = useState(false)

  // tip.response is now a structured object: { summary, action, icon, details }
  const parsed = tip.response || {}
  const { summary = '', action = '', icon = '💡', details = '' } = parsed

  useEffect(() => {
    if (!tip.loading && !tip.error) {
      const fadeTimer = setTimeout(() => setFading(true), 12000)
      const dismissTimer = setTimeout(() => onDismiss(tip.id), 13000)
      return () => {
        clearTimeout(fadeTimer)
        clearTimeout(dismissTimer)
      }
    }
  }, [tip.loading, tip.error, tip.id, onDismiss])

  const handleCardTap = () => {
    if (tip.loading || tip.error) return
    setFading(false)
    setShowDetail(true)
  }

  const handleClose = (e) => {
    e.stopPropagation()
    onDismiss(tip.id)
  }

  const handleCloseDetail = (e) => {
    e.stopPropagation()
    setShowDetail(false)
    setFading(false)
  }

  return (
    <>
      {/* Collapsed card */}
      <div
        className={`tip-card transition-all duration-1000 ${fading ? 'opacity-0 translate-y-2' : 'opacity-100'}`}
        onClick={handleCardTap}
        style={{ touchAction: 'manipulation' }}
      >
        <div className="bg-black/75 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 mx-4 shadow-2xl">
          {/* Loading state */}
          {tip.loading && (
            <div className="flex items-center gap-3 py-1">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
              <span className="text-cyan-400 text-sm">Analysiere...</span>
            </div>
          )}

          {/* Error state */}
          {tip.error && (
            <div className="flex items-center gap-2">
              <span className="text-red-400 text-sm">⚠️ {tip.error}</span>
              <button
                onClick={handleClose}
                className="ml-auto text-white/40 hover:text-white/80 text-lg leading-none"
              >
                ×
              </button>
            </div>
          )}

          {/* Response (collapsed) */}
          {!tip.loading && !tip.error && (
            <>
              <div className="flex items-start gap-2">
                <span className="text-xl flex-shrink-0 mt-0.5">{icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold leading-snug">{summary}</p>
                  {action && (
                    <p className="text-cyan-300 text-xs mt-1 leading-snug">{action}</p>
                  )}
                </div>
                <button
                  onClick={handleClose}
                  className="text-white/30 hover:text-white/60 text-lg leading-none mt-0.5 flex-shrink-0"
                >
                  ×
                </button>
              </div>

              {details && (
                <p className="text-cyan-400/60 text-xs mt-2 text-right">Tippen für Details ▾</p>
              )}

              <div className="mt-1.5 flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-cyan-500/50" />
                <span className="text-white/20 text-xs">
                  {new Date(tip.timestamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Fullscreen detail overlay */}
      {showDetail && !tip.loading && !tip.error && (
        <div
          className="fixed inset-0 z-50 flex flex-col"
          style={{ top: '15%' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex-1 bg-black/90 backdrop-blur-xl border-t border-white/10 rounded-t-3xl flex flex-col overflow-hidden">
            {/* Header: close button */}
            <div className="flex justify-end px-4 pt-4 pb-2 flex-shrink-0">
              <button
                onClick={handleCloseDetail}
                className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white/70 hover:text-white transition-colors text-lg"
              >
                ×
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 pb-8">
              {/* Icon + Summary */}
              <div className="text-center mb-5">
                <div className="text-5xl mb-3">{icon}</div>
                <h2 className="text-white text-lg font-bold leading-snug">{summary}</h2>
              </div>

              {/* Action box */}
              {action && (
                <div className="border border-cyan-400/40 bg-cyan-400/5 rounded-xl px-4 py-3 mb-5">
                  <p className="text-cyan-300 text-sm leading-relaxed">
                    <span className="font-semibold">⚡ </span>{action}
                  </p>
                </div>
              )}

              {/* Markdown details */}
              {details && (
                <div className="prose prose-invert prose-sm max-w-none
                  prose-headings:text-white prose-headings:font-bold
                  prose-p:text-white/80 prose-p:leading-relaxed
                  prose-li:text-white/80
                  prose-strong:text-white
                  prose-code:text-cyan-300 prose-code:bg-white/10 prose-code:rounded prose-code:px-1
                  prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10
                  prose-a:text-cyan-400
                  prose-hr:border-white/10">
                  <ReactMarkdown>{details}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export function TipOverlay({ tips, onDismiss }) {
  // Show max 3 most recent tips
  const visibleTips = tips.slice(-3)

  return (
    <>
      <div className="absolute bottom-28 left-0 right-0 z-20 flex flex-col gap-2 pointer-events-none">
        {visibleTips.map(tip => (
          <div key={tip.id} className="pointer-events-auto">
            <TipCard
              tip={tip}
              onDismiss={onDismiss}
            />
          </div>
        ))}
      </div>
    </>
  )
}
