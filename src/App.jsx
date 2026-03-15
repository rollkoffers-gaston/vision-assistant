import { useState, useEffect, useRef, useCallback } from 'react'
import { CameraView } from './components/CameraView'
import { TipOverlay } from './components/TipOverlay'
import { HistoryPanel } from './components/HistoryPanel'
import { SettingsPanel } from './components/SettingsPanel'
import { ActionBar } from './components/ActionBar'
import { useCamera } from './hooks/useCamera'
import { usePushToTalk } from './hooks/usePushToTalk'
import { analyzeFrames } from './utils/gemini'
import { speak, stop as stopTTS } from './utils/tts'
import { getSettings, saveSettings } from './utils/storage'

export default function App() {
  const [settings, setSettings] = useState(getSettings)
  const [showHistory, setShowHistory] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [tips, setTips] = useState([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [notification, setNotification] = useState(null)
  const [recordingTranscript, setRecordingTranscript] = useState('')

  const autoTimerRef = useRef(null)

  const camera = useCamera()

  // Push-to-talk hook
  const ptt = usePushToTalk({
    onError: useCallback((err) => showNotification(err, 'error'), []),
  })

  // Mirror live transcript from PTT
  useEffect(() => {
    setRecordingTranscript(ptt.transcript)
  }, [ptt.transcript])

  const showNotification = useCallback((text, type = 'info') => {
    setNotification({ text, type })
    setTimeout(() => setNotification(null), 3000)
  }, [])

  // Add a tip entry (loading state)
  const addTip = useCallback((extra = {}) => {
    const id = Date.now()
    const frame = camera.captureFrame()
    const newTip = {
      id,
      timestamp: id,
      imageDataUrl: frame?.dataUrl || null,
      question: extra.question || '',
      response: '',
      loading: true,
      error: null,
    }
    setTips(prev => [...prev, newTip])
    return { id, frame }
  }, [camera])

  // Update tip with result
  const resolveTip = useCallback((id, response) => {
    setTips(prev => prev.map(t => t.id === id ? { ...t, response, loading: false } : t))
  }, [])

  const rejectTip = useCallback((id, error) => {
    setTips(prev => prev.map(t => t.id === id ? { ...t, loading: false, error } : t))
  }, [])

  // Dismiss a tip
  const dismissTip = useCallback((id) => {
    setTips(prev => prev.filter(t => t.id !== id))
  }, [])

  // Quick capture: single screenshot → analyze
  const handleQuickCapture = useCallback(async () => {
    if (isAnalyzing) return

    if (!settings.apiKey) {
      showNotification('Bitte API-Key eintragen', 'warn')
      setShowSettings(true)
      return
    }

    const frame = camera.captureFrame()
    if (!frame) {
      showNotification('Kamera nicht bereit', 'error')
      return
    }

    const id = Date.now()
    setTips(prev => [...prev, {
      id,
      timestamp: id,
      imageDataUrl: frame.dataUrl,
      question: '',
      response: '',
      loading: true,
      error: null,
    }])
    setIsAnalyzing(true)

    try {
      const response = await analyzeFrames({
        apiKey: settings.apiKey,
        frames: [{ base64: frame.base64, mimeType: 'image/jpeg' }],
        transcript: '',
        systemPrompt: settings.systemPrompt,
        provider: settings.provider || 'gemini',
        model: settings.model || 'gemini-2.5-flash',
      })

      resolveTip(id, response)
      autoSpeak(response)
    } catch (err) {
      const msg = err.message || 'Analyse fehlgeschlagen'
      rejectTip(id, msg)
      showNotification(msg, 'error')
    } finally {
      setIsAnalyzing(false)
    }
  }, [isAnalyzing, settings, camera, resolveTip, rejectTip, showNotification])

  // Push-to-talk start
  const handlePTTStart = useCallback(async () => {
    if (isAnalyzing) return
    const stream = camera.getStream()
    await ptt.startRecording(stream)
  }, [isAnalyzing, camera, ptt])

  // Push-to-talk end → extract frames + send
  const handlePTTEnd = useCallback(async () => {
    if (!ptt.isRecording) return

    const result = await ptt.stopRecording()
    if (!result) return

    const { blob, transcript } = result

    if (!settings.apiKey) {
      showNotification('Bitte API-Key eintragen', 'warn')
      setShowSettings(true)
      return
    }

    const id = Date.now()
    // Get a current frame for thumbnail
    const thumbFrame = camera.captureFrame()
    setTips(prev => [...prev, {
      id,
      timestamp: id,
      imageDataUrl: thumbFrame?.dataUrl || null,
      question: transcript || '',
      response: '',
      loading: true,
      error: null,
    }])
    setIsAnalyzing(true)

    try {
      // Extract 3-5 frames from recorded video
      let frames = []

      if (blob.size > 1000) {
        try {
          frames = await camera.extractFramesFromBlob(blob, 4)
        } catch (e) {
          console.warn('Frame extraction failed, using current frame:', e)
        }
      }

      // Fallback: use current camera frame
      if (frames.length === 0 && thumbFrame) {
        frames = [{ base64: thumbFrame.base64, mimeType: 'image/jpeg' }]
      }

      if (frames.length === 0) {
        throw new Error('Keine Frames verfügbar')
      }

      const response = await analyzeFrames({
        apiKey: settings.apiKey,
        frames,
        transcript: transcript || '',
        systemPrompt: settings.systemPrompt,
        provider: settings.provider || 'gemini',
        model: settings.model || 'gemini-2.5-flash',
      })

      resolveTip(id, response)
      autoSpeak(response)
    } catch (err) {
      const msg = err.message || 'Analyse fehlgeschlagen'
      rejectTip(id, msg)
      showNotification(msg, 'error')
    } finally {
      setIsAnalyzing(false)
    }
  }, [ptt, settings, camera, resolveTip, rejectTip, showNotification])

  // Auto-speak: read short responses automatically
  const autoSpeak = useCallback((text) => {
    if (!text || !window.speechSynthesis) return

    // Extract short portion for TTS
    const moreIdx = text.indexOf('[Mehr]')
    const moreIdx2 = text.indexOf('[More]')
    const cutIdx = moreIdx >= 0 ? moreIdx : moreIdx2 >= 0 ? moreIdx2 : -1
    const shortText = cutIdx >= 0 ? text.slice(0, cutIdx).trim() : text

    // If short enough, read all; otherwise just first 2 sentences
    if (shortText.length <= 200) {
      speak(shortText)
    } else {
      const sentences = shortText.match(/[^.!?]+[.!?]+/g) || [shortText]
      speak(sentences.slice(0, 2).join(' '))
    }
  }, [])

  // Auto-capture timer
  useEffect(() => {
    if (autoTimerRef.current) {
      clearInterval(autoTimerRef.current)
      autoTimerRef.current = null
    }

    if (settings.autoCapture && camera.isReady) {
      autoTimerRef.current = setInterval(() => {
        handleQuickCapture()
      }, settings.captureInterval * 1000)
    }

    return () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current)
    }
  }, [settings.autoCapture, settings.captureInterval, camera.isReady, handleQuickCapture])

  // Settings save
  const handleSaveSettings = useCallback((newSettings) => {
    setSettings(newSettings)
    saveSettings(newSettings)
    showNotification('Einstellungen gespeichert ✓', 'success')
  }, [showNotification])

  // First run: open settings if no API key
  useEffect(() => {
    if (!settings.apiKey) {
      setTimeout(() => setShowSettings(true), 800)
    }
  }, [])

  // Active tips (non-dismissed)
  const activeTips = tips.filter(t => t.loading || t.response || t.error)

  return (
    <div className="relative w-full h-full bg-black overflow-hidden select-none">

      {/* Camera view - fullscreen background */}
      <div className="absolute inset-0">
        <CameraView
          videoRef={camera.videoRef}
          isReady={camera.isReady}
          error={camera.error}
          facingMode={camera.facingMode}
          onSwitch={camera.switchCamera}
          zoom={camera.zoom}
          maxZoom={camera.maxZoom}
          zoomSupported={camera.zoomSupported}
          onZoom={camera.setZoomLevel}
        />
      </div>

      {/* Top HUD bar */}
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
        <div className="px-4 pt-safe pt-3 pb-1 flex items-center justify-between">
          {/* App indicator */}
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-cyan-400 text-xs font-medium tracking-widest uppercase">
              Vision
            </span>
          </div>

          {/* Auto-capture indicator */}
          {settings.autoCapture && (
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm border border-teal-500/40 px-2.5 py-1 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-xs text-teal-400">Auto {settings.captureInterval}s</span>
            </div>
          )}

          {/* History button (top right) */}
          {tips.length > 0 && (
            <div className="pointer-events-auto">
              <button
                onClick={() => setShowHistory(true)}
                className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm border border-white/20 px-2.5 py-1 rounded-full hover:border-cyan-400/40 transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-white/60">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span className="text-white/60 text-xs">{tips.length}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recording indicator overlay */}
      {ptt.isRecording && (
        <div className="absolute top-0 left-0 right-0 bottom-0 z-10 pointer-events-none border-2 border-red-500/60 rounded-none" />
      )}

      {/* Voice transcript while recording */}
      {ptt.isRecording && (
        <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 z-20 pointer-events-none">
          <div className="bg-black/75 backdrop-blur-md border border-red-500/30 rounded-2xl px-4 py-3 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-400 text-xs font-medium">Aufnahme läuft</span>
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            </div>
            {recordingTranscript ? (
              <p className="text-white text-sm">{recordingTranscript}</p>
            ) : (
              <div className="flex items-center justify-center gap-1.5">
                {[0, 1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className="w-1 bg-red-400/70 rounded-full animate-bounce"
                    style={{
                      height: `${8 + (i % 3) * 6}px`,
                      animationDelay: `${i * 80}ms`,
                    }}
                  />
                ))}
              </div>
            )}
            <p className="text-white/30 text-xs mt-2">Loslassen zum Analysieren</p>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className="absolute top-14 left-4 right-4 z-50 pointer-events-none">
          <div className={`px-4 py-2 rounded-xl border text-sm text-center backdrop-blur-sm ${
            notification.type === 'error'
              ? 'bg-red-500/20 border-red-500/40 text-red-300'
              : notification.type === 'warn'
              ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300'
              : notification.type === 'success'
              ? 'bg-teal-500/20 border-teal-500/40 text-teal-300'
              : 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
          }`}>
            {notification.text}
          </div>
        </div>
      )}

      {/* Tip overlays — float above action bar */}
      {!showSettings && !showHistory && (
        <TipOverlay tips={activeTips} onDismiss={dismissTip} />
      )}

      {/* Action bar */}
      {!showSettings && !showHistory && (
        <ActionBar
          onPushToTalkStart={handlePTTStart}
          onPushToTalkEnd={handlePTTEnd}
          onQuickCapture={handleQuickCapture}
          onToggleSettings={() => setShowSettings(true)}
          onToggleHistory={() => setShowHistory(true)}
          isRecording={ptt.isRecording}
          isAnalyzing={isAnalyzing}
          hasHistory={tips.length > 0}
        />
      )}

      {/* History panel */}
      <HistoryPanel
        tips={tips}
        isVisible={showHistory}
        onClose={() => setShowHistory(false)}
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
