const KEYS = {
  API_KEY: 'vision_assistant_api_key',
  SYSTEM_PROMPT: 'vision_assistant_system_prompt',
  AUTO_CAPTURE: 'vision_assistant_auto_capture',
  CAPTURE_INTERVAL: 'vision_assistant_capture_interval',
  PROVIDER: 'vision_assistant_provider',
}

const DEFAULT_SYSTEM_PROMPT = `Du bist ein No Man's Sky Gaming-Assistent. Analysiere was du in diesem Screenshot siehst und gib hilfreiche Tipps, identifiziere Items, erkläre was der Spieler als nächstes tun sollte, oder beantworte Fragen zu dem was auf dem Bildschirm zu sehen ist. Sei präzise und praktisch. Antworte auf Deutsch. Du hast Zugang zu Google Search für aktuelle Informationen.`

export function getSettings() {
  return {
    apiKey: localStorage.getItem(KEYS.API_KEY) || '',
    systemPrompt: localStorage.getItem(KEYS.SYSTEM_PROMPT) || DEFAULT_SYSTEM_PROMPT,
    autoCapture: localStorage.getItem(KEYS.AUTO_CAPTURE) === 'true',
    captureInterval: parseInt(localStorage.getItem(KEYS.CAPTURE_INTERVAL) || '10', 10),
    provider: localStorage.getItem(KEYS.PROVIDER) || 'gemini',
  }
}

export function saveSettings(settings) {
  if (settings.apiKey !== undefined) localStorage.setItem(KEYS.API_KEY, settings.apiKey)
  if (settings.systemPrompt !== undefined) localStorage.setItem(KEYS.SYSTEM_PROMPT, settings.systemPrompt)
  if (settings.autoCapture !== undefined) localStorage.setItem(KEYS.AUTO_CAPTURE, String(settings.autoCapture))
  if (settings.captureInterval !== undefined) localStorage.setItem(KEYS.CAPTURE_INTERVAL, String(settings.captureInterval))
  if (settings.provider !== undefined) localStorage.setItem(KEYS.PROVIDER, settings.provider)
}

export { DEFAULT_SYSTEM_PROMPT }
