const KEYS = {
  API_KEY: 'vision_assistant_api_key',
  SYSTEM_PROMPT: 'vision_assistant_system_prompt',
  AUTO_CAPTURE: 'vision_assistant_auto_capture',
  CAPTURE_INTERVAL: 'vision_assistant_capture_interval',
  PROVIDER: 'vision_assistant_provider',
}

export const DEFAULT_SYSTEM_PROMPT = `Du bist ein Gaming-Begleiter. Gib KURZE actionable Tipps (1-2 Sätze). Aktion zuerst, Erklärung in [Mehr]. Nutze ⚡ für Aktionen, 📦 für Items, 🗺️ für Navigation. Spoilere das Spiel nicht. Hilf den Spielfluss aufrechtzuerhalten. Antworte auf Deutsch.`

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
