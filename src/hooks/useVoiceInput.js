import { useState, useRef, useCallback } from 'react'

export function useVoiceInput({ onResult, onError } = {}) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef(null)

  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const start = useCallback(() => {
    if (!isSupported) {
      onError?.('SpeechRecognition wird von diesem Browser nicht unterstützt.')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition

    recognition.lang = 'de-DE'
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    recognition.continuous = false

    recognition.onstart = () => {
      setIsListening(true)
      setTranscript('')
    }

    recognition.onresult = (event) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          interimTranscript += result[0].transcript
        }
      }

      const current = finalTranscript || interimTranscript
      setTranscript(current)

      if (finalTranscript) {
        onResult?.(finalTranscript.trim())
      }
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      if (event.error !== 'aborted') {
        onError?.(`Spracherkennung Fehler: ${event.error}`)
      }
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }, [isSupported, onResult, onError])

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsListening(false)
  }, [])

  const toggle = useCallback(() => {
    if (isListening) {
      stop()
    } else {
      start()
    }
  }, [isListening, start, stop])

  return { isListening, transcript, isSupported, start, stop, toggle }
}
