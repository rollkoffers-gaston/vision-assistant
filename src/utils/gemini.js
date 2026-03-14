import { GoogleGenAI } from '@google/genai'

const DEFAULT_MODEL = 'gemini-2.5-flash'

export async function analyzeFrame({ apiKey, imageBase64, mimeType = 'image/jpeg', prompt, systemPrompt }) {
  if (!apiKey) throw new Error('Kein API-Key konfiguriert. Bitte in den Einstellungen eintragen.')

  const ai = new GoogleGenAI({ apiKey })

  const contents = []

  if (prompt) {
    contents.push({ text: prompt })
  }

  contents.push({
    inlineData: {
      mimeType,
      data: imageBase64,
    }
  })

  const response = await ai.models.generateContent({
    model: DEFAULT_MODEL,
    contents: [{ role: 'user', parts: contents }],
    config: {
      systemInstruction: systemPrompt,
    }
  })

  return response.text
}
