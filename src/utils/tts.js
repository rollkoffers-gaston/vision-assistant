let currentUtterance = null

export function speak(text, { onStart, onEnd, onError } = {}) {
  if (!window.speechSynthesis) {
    console.warn('SpeechSynthesis not supported')
    return
  }

  // Cancel any ongoing speech
  stop()

  currentUtterance = new SpeechSynthesisUtterance(text)
  currentUtterance.lang = 'de-DE'
  currentUtterance.rate = 1.0
  currentUtterance.pitch = 1.0
  currentUtterance.volume = 1.0

  // Try to find a German voice
  const voices = window.speechSynthesis.getVoices()
  const germanVoice = voices.find(v => v.lang.startsWith('de')) ||
                      voices.find(v => v.lang.startsWith('en'))
  if (germanVoice) {
    currentUtterance.voice = germanVoice
  }

  if (onStart) currentUtterance.onstart = onStart
  if (onEnd) currentUtterance.onend = onEnd
  if (onError) currentUtterance.onerror = onError

  window.speechSynthesis.speak(currentUtterance)
}

export function stop() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
  currentUtterance = null
}

export function isSpeaking() {
  return window.speechSynthesis?.speaking || false
}
