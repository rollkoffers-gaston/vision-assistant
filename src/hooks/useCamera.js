import { useState, useRef, useCallback, useEffect } from 'react'

export function useCamera() {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [facingMode, setFacingMode] = useState('environment')
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState(null)

  const startCamera = useCallback(async (facing = 'environment') => {
    setIsReady(false)
    setError(null)

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }

    try {
      const constraints = {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true, // Include audio for MediaRecorder push-to-talk
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setIsReady(true)
      }
    } catch (err) {
      // Try without audio if audio fails
      try {
        const constraints = {
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        }
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setIsReady(true)
        }
      } catch (err2) {
        console.error('Camera error:', err2)
        setError(err2.message || 'Kamera nicht verfügbar')
      }
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsReady(false)
  }, [])

  const switchCamera = useCallback(async () => {
    const newFacing = facingMode === 'environment' ? 'user' : 'environment'
    setFacingMode(newFacing)
    await startCamera(newFacing)
  }, [facingMode, startCamera])

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !isReady) return null

    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480

    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    const base64 = dataUrl.split(',')[1]
    return { base64, dataUrl, mimeType: 'image/jpeg' }
  }, [isReady])

  // Extract multiple frames from a recorded video blob
  const extractFramesFromBlob = useCallback((blob, count = 4) => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(blob)
      const video = document.createElement('video')
      video.src = url
      video.muted = true

      video.onloadedmetadata = async () => {
        const duration = video.duration
        const frames = []
        const interval = duration / (count + 1)

        for (let i = 1; i <= count; i++) {
          const time = interval * i
          await new Promise(res => {
            video.currentTime = time
            video.onseeked = () => res()
          })

          const canvas = document.createElement('canvas')
          canvas.width = video.videoWidth || 640
          canvas.height = video.videoHeight || 480
          const ctx = canvas.getContext('2d')
          ctx.drawImage(video, 0, 0)

          const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
          const base64 = dataUrl.split(',')[1]
          frames.push({ base64, dataUrl, mimeType: 'image/jpeg' })
        }

        URL.revokeObjectURL(url)
        resolve(frames)
      }

      video.onerror = () => {
        URL.revokeObjectURL(url)
        resolve([])
      }
    })
  }, [])

  const getStream = useCallback(() => streamRef.current, [])

  useEffect(() => {
    startCamera(facingMode)
    return () => stopCamera()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    videoRef,
    isReady,
    error,
    facingMode,
    startCamera,
    stopCamera,
    switchCamera,
    captureFrame,
    extractFramesFromBlob,
    getStream,
  }
}
