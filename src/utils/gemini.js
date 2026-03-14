const GEMINI_MODEL = 'gemini-2.5-flash'
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

export async function analyzeFrame({ apiKey, imageBase64, mimeType = 'image/jpeg', prompt, systemPrompt, provider = 'gemini' }) {
  if (!apiKey) throw new Error('Kein API-Key konfiguriert. Bitte in den Einstellungen eintragen.')

  if (provider === 'openrouter') {
    return analyzeViaOpenRouter({ apiKey, imageBase64, mimeType, prompt, systemPrompt })
  }

  return analyzeViaGemini({ apiKey, imageBase64, mimeType, prompt, systemPrompt })
}

async function analyzeViaGemini({ apiKey, imageBase64, mimeType, prompt, systemPrompt }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`

  const parts = []

  if (prompt) {
    parts.push({ text: prompt })
  } else {
    parts.push({ text: 'Was siehst du auf diesem Bild? Gib mir hilfreiche Tipps.' })
  }

  parts.push({
    inlineData: {
      mimeType,
      data: imageBase64,
    }
  })

  const body = {
    contents: [{ role: 'user', parts }],
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    tools: [{
      googleSearch: {}
    }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    }
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    const msg = err?.error?.message || `API Fehler: ${response.status}`
    throw new Error(msg)
  }

  const data = await response.json()

  if (!data.candidates || !data.candidates[0]?.content?.parts) {
    throw new Error('Keine Antwort von Gemini erhalten')
  }

  return data.candidates[0].content.parts
    .filter(p => p.text)
    .map(p => p.text)
    .join('\n')
}

async function analyzeViaOpenRouter({ apiKey, imageBase64, mimeType, prompt, systemPrompt }) {
  const messages = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: prompt || 'Was siehst du auf diesem Bild? Gib mir hilfreiche Tipps.'
        },
        {
          type: 'image_url',
          image_url: {
            url: `data:${mimeType};base64,${imageBase64}`
          }
        }
      ]
    }
  ]

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin,
    },
    body: JSON.stringify({
      model: 'google/gemini-2.0-flash-001',
      messages,
      max_tokens: 1024,
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message || `OpenRouter Fehler: ${response.status}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || 'Keine Antwort erhalten'
}
