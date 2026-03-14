import { useState, useEffect, useRef, useCallback } from 'react'
import { CameraView } from './components/CameraView'
import { ChatPanel } from './components/ChatPanel'
import { SettingsPanel } from './components/SettingsPanel'
import { ActionBar } from './components/ActionBar'
import { useCamera } from './hooks/useCamera'
import { useVoiceInput } from './hooks/useVoiceInput'
import { analyzeFrame } from './utils/gemini'
import { speak, stop as stopTTS } from './utils/tts'
import { getSettings, saveSettings } from './utils/storage'

export default function App() {
  const [settings, setSettings] = useState(getSettings)
  const [showChat, setShowChat] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [messages, setMessages] = useState([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [notification, setNotification] = useState(null)
  const [voiceTranscript, setVoiceTranscript] = useState('')

  const autoTimerRef = useRef(null)
  const pendingVoiceRef = useRef('')

  const camera = useCamera()

  // Voice input handler
  const voiceInput = useVoiceInput({
    onResult: useCallback((transcript) => {
      setVoiceTranscript(transcript)
      pendingVoiceRef.current = transcript
      // Auto-capture on voice result
      setTimeout(() => {
        handleCapture(transcript)
      }, 100)
    }, []),
    onError: useCallback((err) => {
      showNotification(err, 'error')
    }, []),
  })

  // Show notification
  const showNotification = useCallback((text, type = 'info') => {
    setNotification({ text, type })
    setTimeout(() => setNotification(null), 3000)
  }, [])

  // Main capture + analyze
  const handleCapture = useCallback(async (voicePrompt = '') => {
    if (isAnalyzing) return

    if (!settings.apiKey) {
      showNotification('Bitte API-Key in Einstellungen eintragen', 'warn')
      setShowSettings(true)
      return
    }

    const frame = camera.captureFrame()
    if (!frame) {
      showNotification('Kamera nicht bereit', 'error')
      return
    }

    const msgId = Date.now()
    const newMsg = {
      id: msgId,
      timestamp: msgId,
      imageDataUrl: frame.dataUrl,
      question: voicePrompt || '',
      response: '',
      loading: true,
      error: null,
    }

    setMessages(prev => [...prev, newMsg])
    setIsAnalyzing(true)
    setVoiceTranscript('')
    pendingVoiceRef.current = ''

    try {
      const response = await analyzeFrame({
        apiKey: settings.apiKey,
        imageBase64: frame.base64,
        mimeType: 'image/jpeg',
        prompt: voicePrompt || undefined,
        systemPrompt: settings.systemPrompt,
        provider: settings.provider || 'gemini',
      })

      setMessages(prev => prev.map(m =>
        m.id === msgId ? { ...m, response, loading: false } : m
      ))

      // Auto-speak response
      speak(response)

    } catch (err) {
      console.error('Analysis error:', err)
      const errorMsg = err.message || 'Analyse fehlgeschlagen'
      setMessages(prev => prev.map(m =>
        m.id === msgId ? { ...m, loading: false, error: errorMsg } : m
      ))
      showNotification(errorMsg, 'error')
    } finally {
      setIsAnalyzing(false)
    }
  }, [isAnalyzing, settings, camera, showNotification])

  // Auto-capture timer
  useEffect(() => {
    if (autoTimerRef.current) {
      clearInterval(autoTimerRef.current)
      autoTimerRef.current = null
    }

    if (settings.autoCapture && camera.isReady) {
      autoTimerRef.current = setInterval(() => {
        handleCapture()
      }, settings.captureInterval * 1000)
    }

    return () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current)
    }
  }, [settings.autoCapture, settings.captureInterval, camera.isReady, handleCapture])

  // Settings save
  const handleSaveSettings = useCallback((newSettings) => {
    setSettings(newSettings)
    saveSettings(newSettings)
    showNotification('Einstellungen gespeichert', 'success')
  }, [showNotification])

  // First run: open settings if no API key
  useEffect(() => {
    if (!settings.apiKey) {
      setTimeout(() => setShowSettings(true), 1000)
    }
  }, [])

  return (
    <div className="relative w-full h-full bg-gaming-bg overflow-hidden select-none">

      {/* Camera view - fills entire screen */}
      <div className="absolute inset-0">
        <CameraView
          videoRef={camera.videoRef}
          isReady={camera.isReady}
          error={camera.error}
          facingMode={camera.facingMode}
          onSwitch={camera.switchCamera}
        />
      </div>

      {/* Top overlay: app title */}
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gaming-cyan animate-pulse" />
            <span className="text-gaming-cyan text-xs font-medium tracking-widest uppercase opacity-80">
              Vision Assistant
            </span>
          </div>
          {settings.autoCapture && (
            <div className="flex items-center gap-1.5 bg-gaming-teal/20 border border-gaming-teal/40
                            px-2 py-0.5 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-gaming-teal animate-pulse" />
              <span className="text-xs text-gaming-teal">Auto {settings.captureInterval}s</span>
            </div>
          )}
        </div>
      </div>

      {/* Voice transcript overlay */}
      {(voiceInput.isListening || voiceTranscript) && (
        <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 z-10 pointer-events-none">
          <div className="bg-gaming-bg/90 border border-gaming-cyan/40 rounded-xl px-4 py-3 text-center backdrop-blur-sm">
            {voiceInput.isListening ? (
              <div className="flex items-center justify-center gap-3">
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className="w-1 bg-gaming-cyan rounded-full animate-bounce"
                      style={{
                        height: `${12 + Math.random() * 16}px`,
                        animationDelay: `${i * 100}ms`,
                      }}
                    />
                  ))}
                </div>
                <span className="text-gaming-cyan text-sm">Zuhören...</span>
              </div>
            ) : (
              <p className="text-white text-sm">{voiceTranscript}</p>
            )}
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className={`absolute top-16 left-4 right-4 z-50 animate-fadeIn pointer-events-none`}>
          <div className={`px-4 py-2 rounded-lg border text-sm text-center backdrop-blur-sm ${
            notification.type === 'error'
              ? 'bg-red-500/20 border-red-500/40 text-red-300'
              : notification.type === 'warn'
              ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300'
              : notification.type === 'success'
              ? 'bg-gaming-teal/20 border-gaming-teal/40 text-gaming-teal'
              : 'bg-gaming-cyan/20 border-gaming-cyan/40 text-gaming-cyan'
          }`}>
            {notification.text}
          </div>
        </div>
      )}

      {/* Action bar */}
      {!showChat && !showSettings && (
        <ActionBar
          onCapture={() => handleCapture(pendingVoiceRef.current)}
          onVoice={voiceInput.toggle}
          onToggleChat={() => setShowChat(true)}
          onToggleSettings={() => setShowSettings(true)}
          isListening={voiceInput.isListening}
          isAnalyzing={isAnalyzing}
          autoCapture={settings.autoCapture}
          hasMessages={messages.length > 0}
          voiceSupported={voiceInput.isSupported}
        />
      )}

      {/* Chat panel */}
      <ChatPanel
        messages={messages}
        isVisible={showChat}
        onClose={() => setShowChat(false)}
      />

      {/* Settings panel */}
      {showSettings && (
        <SettingsPanel
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

    </div>
  )
}
