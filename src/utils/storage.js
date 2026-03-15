const KEYS = {
  API_KEY: 'vision_assistant_api_key',
  SYSTEM_PROMPT: 'vision_assistant_system_prompt',
  AUTO_CAPTURE: 'vision_assistant_auto_capture',
  CAPTURE_INTERVAL: 'vision_assistant_capture_interval',
  PROVIDER: 'vision_assistant_provider',
  MODEL: 'vision_assistant_model',
}

export const DEFAULT_SYSTEM_PROMPT = `Du bist ein Gaming-Begleiter. WICHTIG: Antworte IMMER vollständig, nie abgeschnitten.

Format:
- ERSTE ZEILE: Kurzer Tipp (1 Satz, max 15 Wörter) mit Icon
- DANACH: Leere Zeile + Details (2-3 Sätze)

Icons: ⚡ Aktionen | 📦 Items | 🗺️ Navigation | 💰 Geld | ⚠️ Warnung

Regeln:
- Deutsch
- Spoilere nicht
- Hilf den Spielfluss aufrechtzuerhalten
- Sei konkret und actionable`

export function getSettings() {
  return {
    apiKey: localStorage.getItem(KEYS.API_KEY) || '',
    systemPrompt: localStorage.getItem(KEYS.SYSTEM_PROMPT) || DEFAULT_SYSTEM_PROMPT,
    autoCapture: localStorage.getItem(KEYS.AUTO_CAPTURE) === 'true',
    captureInterval: parseInt(localStorage.getItem(KEYS.CAPTURE_INTERVAL) || '10', 10),
    provider: localStorage.getItem(KEYS.PROVIDER) || 'gemini',
    model: localStorage.getItem(KEYS.MODEL) || 'gemini-2.5-flash',
  }
}

export function saveSettings(settings) {
  if (settings.apiKey !== undefined) localStorage.setItem(KEYS.API_KEY, settings.apiKey)
  if (settings.systemPrompt !== undefined) localStorage.setItem(KEYS.SYSTEM_PROMPT, settings.systemPrompt)
  if (settings.autoCapture !== undefined) localStorage.setItem(KEYS.AUTO_CAPTURE, String(settings.autoCapture))
  if (settings.captureInterval !== undefined) localStorage.setItem(KEYS.CAPTURE_INTERVAL, String(settings.captureInterval))
  if (settings.provider !== undefined) localStorage.setItem(KEYS.PROVIDER, settings.provider)
  if (settings.model !== undefined) localStorage.setItem(KEYS.MODEL, settings.model)
}
