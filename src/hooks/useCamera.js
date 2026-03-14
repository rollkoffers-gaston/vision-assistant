import { useState, useRef, useCallback, useEffect } from 'react'

export function useCamera() {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [facingMode, setFacingMode] = useState('environment') // 'environment' = back, 'user' = front
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState(null)

  const startCamera = useCallback(async (facing = facingMode) => {
    setIsReady(false)
    setError(null)

    // Stop existing stream
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
        audio: false,
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setIsReady(true)
      }
    } catch (err) {
      console.error('Camera error:', err)
      setError(err.message || 'Kamera nicht verfügbar')
    }
  }, [facingMode])

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

    // Return base64 without the data:image/jpeg;base64, prefix
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    const base64 = dataUrl.split(',')[1]
    return { base64, dataUrl }
  }, [isReady])

  // Start camera on mount
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
  }
}
