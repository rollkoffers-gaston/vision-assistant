import { useState, useRef, useCallback, useEffect } from 'react'

export function usePushToTalk({ onResult, onError }) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')

  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const recognitionRef = useRef(null)
  const streamRef = useRef(null)
  const transcriptRef = useRef('')

  // Check support
  const isSupported = typeof navigator !== 'undefined' && !!navigator.mediaDevices

  const startRecording = useCallback(async (existingStream) => {
    try {
      chunksRef.current = []
      transcriptRef.current = ''
      setTranscript('')

      // Try to get audio+video stream, preferring the existing camera stream
      let stream = existingStream
      if (!stream || !stream.active) {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        streamRef.current = stream
      } else {
        streamRef.current = null // Don't own it
      }

      // Setup MediaRecorder
      const mimeType = getSupportedMimeType()
      const options = mimeType ? { mimeType } : {}

      const mediaRecorder = new MediaRecorder(stream, options)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.start(100) // collect data every 100ms
      setIsRecording(true)

      // Start speech recognition in parallel
      startSpeechRecognition()

    } catch (err) {
      console.error('Recording start error:', err)
      onError?.(`Aufnahme fehlgeschlagen: ${err.message}`)
    }
  }, [onError])

  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
      setIsRecording(false)
      return null
    }

    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }

    return new Promise((resolve) => {
      mediaRecorderRef.current.onstop = async () => {
        const mimeType = mediaRecorderRef.current.mimeType || 'video/webm'
        const blob = new Blob(chunksRef.current, { type: mimeType })
        chunksRef.current = []

        // Clean up own stream if we created it
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop())
          streamRef.current = null
        }

        setIsRecording(false)

        const finalTranscript = transcriptRef.current
        setTranscript('')
        transcriptRef.current = ''

        resolve({ blob, transcript: finalTranscript })
      }

      mediaRecorderRef.current.stop()
    })
  }, [])

  const startSpeechRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    try {
      const recognition = new SpeechRecognition()
      recognition.lang = 'de-DE'
      recognition.continuous = true
      recognition.interimResults = true
      recognition.maxAlternatives = 1

      recognition.onresult = (event) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        if (finalTranscript) {
          transcriptRef.current += finalTranscript + ' '
        }
        const display = (transcriptRef.current + interimTranscript).trim()
        setTranscript(display)
      }

      recognition.onerror = (e) => {
        // Ignore no-speech errors
        if (e.error !== 'no-speech' && e.error !== 'aborted') {
          console.warn('Speech recognition error:', e.error)
        }
      }

      recognition.start()
      recognitionRef.current = recognition
    } catch (err) {
      console.warn('Speech recognition failed:', err)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
    }
  }, [])

  return {
    isRecording,
    transcript,
    isSupported,
    startRecording,
    stopRecording,
  }
}

function getSupportedMimeType() {
  const types = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=h264,opus',
    'video/webm',
    'video/mp4',
  ]
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) return type
  }
  return ''
}
