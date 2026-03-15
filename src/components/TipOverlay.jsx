import { useState, useEffect, useCallback } from 'react'

// Parse short vs long form from response
// Format: "⚡ Short tip here. [Mehr] Long explanation here."
function parseResponse(text) {
  if (!text) return { short: '', more: '' }

  // Check for [Mehr] or [More] marker
  const moreMatch = text.match(/\[(?:Mehr|More)\]\s*([\s\S]+)/)
  if (moreMatch) {
    const idx = text.indexOf('[')
    return {
      short: text.slice(0, idx).trim(),
      more: moreMatch[1].trim(),
    }
  }

  // If response is short enough, use as-is
  if (text.length <= 160) {
    return { short: text, more: '' }
  }

  // Split long response: first 2 sentences as short
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  const short = sentences.slice(0, 2).join(' ').trim()
  const more = sentences.slice(2).join(' ').trim()
  return { short, more }
}

function TipCard({ tip, onDismiss, onExpand }) {
  const [expanded, setExpanded] = useState(false)
  const [fading, setFading] = useState(false)
  const { short, more } = parseResponse(tip.response)

  useEffect(() => {
    if (!tip.loading && !tip.error) {
      const fadeTimer = setTimeout(() => setFading(true), 10000)
      const dismissTimer = setTimeout(() => onDismiss(tip.id), 11000)
      return () => {
        clearTimeout(fadeTimer)
        clearTimeout(dismissTimer)
      }
    }
  }, [tip.loading, tip.error, tip.id, onDismiss])

  const handleTap = () => {
    // Tapping resets fade timer (by re-rendering, timer resets via key)
    setFading(false)
    if (more && !expanded) {
      setExpanded(true)
      onExpand?.(tip.id)
    }
  }

  return (
    <div
      className={`tip-card transition-all duration-1000 ${fading ? 'opacity-0 translate-y-2' : 'opacity-100'}`}
      onClick={handleTap}
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
              onClick={(e) => { e.stopPropagation(); onDismiss(tip.id) }}
              className="ml-auto text-white/40 hover:text-white/80 text-lg leading-none"
            >
              ×
            </button>
          </div>
        )}

        {/* Response */}
        {!tip.loading && !tip.error && (
          <>
            <div className="flex items-start gap-2">
              <p className="text-white text-sm leading-snug flex-1">
                {expanded ? tip.response : short}
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); onDismiss(tip.id) }}
                className="text-white/30 hover:text-white/60 text-lg leading-none mt-0.5 flex-shrink-0"
              >
                ×
              </button>
            </div>

            {/* Read More / Collapse */}
            {more && !expanded && (
              <button
                onClick={(e) => { e.stopPropagation(); setExpanded(true); setFading(false) }}
                className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
              >
                Mehr lesen ▾
              </button>
            )}
            {expanded && more && (
              <button
                onClick={(e) => { e.stopPropagation(); setExpanded(false) }}
                className="mt-2 text-xs text-cyan-400/60 hover:text-cyan-400 font-medium flex items-center gap-1"
              >
                Weniger ▴
              </button>
            )}

            {/* Timestamp */}
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
  )
}

export function TipOverlay({ tips, onDismiss }) {
  // Show max 3 most recent tips
  const visibleTips = tips.slice(-3)

  return (
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
  )
}
