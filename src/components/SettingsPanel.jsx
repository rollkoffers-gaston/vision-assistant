import { useState } from 'react'
import { DEFAULT_SYSTEM_PROMPT } from '../utils/storage'

export function SettingsPanel({ settings, onSave, onClose }) {
  const [apiKey, setApiKey] = useState(settings.apiKey)
  const [systemPrompt, setSystemPrompt] = useState(settings.systemPrompt)
  const [autoCapture, setAutoCapture] = useState(settings.autoCapture)
  const [captureInterval, setCaptureInterval] = useState(settings.captureInterval)
  const [showKey, setShowKey] = useState(false)

  const handleSave = () => {
    onSave({ apiKey, systemPrompt, autoCapture, captureInterval })
    onClose()
  }

  const handleReset = () => {
    setSystemPrompt(DEFAULT_SYSTEM_PROMPT)
  }

  return (
    <div
      className="absolute inset-0 bg-gaming-bg/98 backdrop-blur-sm z-30 flex flex-col animate-slideUp"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gaming-border bg-gaming-surface">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gaming-teal" />
          <h2 className="text-gaming-teal font-semibold text-sm tracking-wider uppercase">Einstellungen</h2>
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">

        {/* API Key */}
        <div className="space-y-2">
          <label className="text-xs text-gaming-cyan/80 font-medium uppercase tracking-wider">
            Gemini API Key
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-gaming-card border border-gaming-border rounded-lg px-3 py-2.5
                         text-sm text-white placeholder-gaming-border/50 focus:outline-none
                         focus:border-gaming-cyan transition-colors pr-10"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-2.5 text-gaming-border hover:text-gaming-cyan transition-colors"
            >
              {showKey ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-gaming-border/50">
            Key wird nur lokal gespeichert. Hole ihn von{' '}
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer"
               className="text-gaming-cyan/70 underline">
              aistudio.google.com
            </a>
          </p>
        </div>

        {/* System Prompt */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-gaming-cyan/80 font-medium uppercase tracking-wider">
              System Prompt
            </label>
            <button
              onClick={handleReset}
              className="text-xs text-gaming-border hover:text-gaming-teal transition-colors"
            >
              Zurücksetzen
            </button>
          </div>
          <textarea
            value={systemPrompt}
            onChange={e => setSystemPrompt(e.target.value)}
            rows={6}
            className="w-full bg-gaming-card border border-gaming-border rounded-lg px-3 py-2.5
                       text-sm text-white placeholder-gaming-border/50 focus:outline-none
                       focus:border-gaming-cyan transition-colors resize-none leading-relaxed"
          />
        </div>

        {/* Auto Capture */}
        <div className="space-y-3">
          <label className="text-xs text-gaming-cyan/80 font-medium uppercase tracking-wider">
            Auto-Capture
          </label>

          <div className="flex items-center justify-between bg-gaming-card border border-gaming-border rounded-lg px-4 py-3">
            <div>
              <p className="text-sm text-white">Automatisch aufnehmen</p>
              <p className="text-xs text-gaming-border/60 mt-0.5">Regelmäßige Screenshots</p>
            </div>
            <button
              onClick={() => setAutoCapture(!autoCapture)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                autoCapture ? 'bg-gaming-cyan' : 'bg-gaming-border'
              }`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                autoCapture ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          {autoCapture && (
            <div className="space-y-1">
              <label className="text-xs text-gaming-border/70">
                Intervall: {captureInterval}s
              </label>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={captureInterval}
                onChange={e => setCaptureInterval(Number(e.target.value))}
                className="w-full accent-gaming-cyan"
              />
              <div className="flex justify-between text-xs text-gaming-border/50">
                <span>5s</span>
                <span>60s</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save button */}
      <div className="px-4 py-4 border-t border-gaming-border">
        <button
          onClick={handleSave}
          className="w-full py-3 bg-gaming-cyan text-gaming-bg font-semibold rounded-xl
                     hover:bg-gaming-cyan/90 active:scale-98 transition-all shadow-cyan-glow"
        >
          Speichern
        </button>
      </div>
    </div>
  )
}
