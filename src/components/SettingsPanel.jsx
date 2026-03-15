import { useState } from 'react'
import { DEFAULT_SYSTEM_PROMPT } from '../utils/storage'
import { GEMINI_MODELS } from '../utils/gemini'

export function SettingsPanel({ settings, onSave, onClose }) {
  const [apiKey, setApiKey] = useState(settings.apiKey)
  const [systemPrompt, setSystemPrompt] = useState(settings.systemPrompt)
  const [autoCapture, setAutoCapture] = useState(settings.autoCapture)
  const [captureInterval, setCaptureInterval] = useState(settings.captureInterval)
  const [provider, setProvider] = useState(settings.provider || 'gemini')
  const [model, setModel] = useState(settings.model || 'gemini-2.5-flash')
  const [showKey, setShowKey] = useState(false)

  const handleSave = () => {
    onSave({ apiKey, systemPrompt, autoCapture, captureInterval, provider, model })
    onClose()
  }

  const handleReset = () => {
    setSystemPrompt(DEFAULT_SYSTEM_PROMPT)
  }

  return (
    <div
      className="absolute inset-0 bg-gray-950/98 backdrop-blur-sm z-30 flex flex-col"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/40">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-teal-400" />
          <h2 className="text-teal-400 font-semibold text-sm tracking-wider uppercase">Einstellungen</h2>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10
                     text-white/40 hover:text-white transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">

        {/* Provider Selection */}
        <div className="space-y-2">
          <label className="text-xs text-cyan-400/80 font-medium uppercase tracking-wider">
            Provider
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setProvider('gemini')}
              className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                provider === 'gemini'
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400'
                  : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
              }`}
            >
              🔮 Gemini API
            </button>
            <button
              onClick={() => setProvider('openrouter')}
              className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                provider === 'openrouter'
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400'
                  : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
              }`}
            >
              🌐 OpenRouter
            </button>
          </div>
        </div>

        {/* Model Selection */}
        {provider === 'gemini' && (
          <div className="space-y-2">
            <label className="text-xs text-cyan-400/80 font-medium uppercase tracking-wider">
              Modell
            </label>
            <div className="space-y-1.5">
              {GEMINI_MODELS.map(m => (
                <button
                  key={m.id}
                  onClick={() => setModel(m.id)}
                  className={`w-full py-2.5 px-3 rounded-xl border text-left transition-all ${
                    model === m.id
                      ? 'bg-cyan-500/20 border-cyan-400'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className={`text-sm font-medium ${model === m.id ? 'text-cyan-400' : 'text-white/70'}`}>
                    {m.name}
                  </div>
                  <div className="text-xs text-white/40">{m.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* API Key */}
        <div className="space-y-2">
          <label className="text-xs text-cyan-400/80 font-medium uppercase tracking-wider">
            {provider === 'gemini' ? 'Gemini API Key' : 'OpenRouter API Key'}
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder={provider === 'gemini' ? 'AIzaSy...' : 'sk-or-...'}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5
                         text-sm text-white placeholder-white/20 focus:outline-none
                         focus:border-cyan-400/60 transition-colors pr-10"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-2.5 text-white/30 hover:text-cyan-400 transition-colors"
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
          <p className="text-xs text-white/30">
            {provider === 'gemini' ? (
              <>Key von{' '}
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer"
                 className="text-cyan-400/70 underline">aistudio.google.com</a> — lokal gespeichert</>
            ) : (
              <>OpenRouter Key von{' '}
              <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer"
                 className="text-cyan-400/70 underline">openrouter.ai/keys</a></>
            )}
          </p>
        </div>

        {/* System Prompt */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-cyan-400/80 font-medium uppercase tracking-wider">
              System Prompt
            </label>
            <button
              onClick={handleReset}
              className="text-xs text-white/30 hover:text-teal-400 transition-colors"
            >
              Zurücksetzen
            </button>
          </div>
          <textarea
            value={systemPrompt}
            onChange={e => setSystemPrompt(e.target.value)}
            rows={5}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5
                       text-sm text-white placeholder-white/20 focus:outline-none
                       focus:border-cyan-400/60 transition-colors resize-none leading-relaxed"
          />
        </div>

        {/* Auto Capture */}
        <div className="space-y-3">
          <label className="text-xs text-cyan-400/80 font-medium uppercase tracking-wider">
            Auto-Capture
          </label>

          <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm text-white">Automatisch aufnehmen</p>
              <p className="text-xs text-white/30 mt-0.5">Regelmäßige Screenshots analysieren</p>
            </div>
            <button
              onClick={() => setAutoCapture(!autoCapture)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                autoCapture ? 'bg-cyan-500' : 'bg-white/20'
              }`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                autoCapture ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          {autoCapture && (
            <div className="space-y-1">
              <label className="text-xs text-white/40">
                Intervall: {captureInterval}s
              </label>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={captureInterval}
                onChange={e => setCaptureInterval(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
              <div className="flex justify-between text-xs text-white/20">
                <span>5s</span>
                <span>60s</span>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
          <p className="text-xs text-white/40 leading-relaxed">
            🎮 <strong className="text-cyan-400/70">HUD-Modus:</strong> Kamera immer sichtbar
            <br/>🎤 <strong className="text-cyan-400/70">Push-to-Talk:</strong> Halten = Video+Sprache • Tippen = Foto
            <br/>🔮 <strong className="text-cyan-400/70">Gemini 2.5 Flash</strong> mit Google Search Grounding
            <br/>🔒 Alle Daten bleiben auf deinem Gerät
          </p>
        </div>
      </div>

      {/* Save button */}
      <div className="px-4 py-4 border-t border-white/10">
        <button
          onClick={handleSave}
          className="w-full py-3 bg-cyan-500 text-black font-semibold rounded-xl
                     hover:bg-cyan-400 active:scale-98 transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)]"
        >
          Speichern
        </button>
      </div>
    </div>
  )
}
