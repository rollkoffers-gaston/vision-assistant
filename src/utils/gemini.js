export const GEMINI_MODELS = [
  { id: 'gemini-3.1-pro-preview', name: '🔥 Gemini 3.1 Pro Preview', description: 'Neuestes SOTA — beste Qualität, Reasoning + Vision' },
  { id: 'gemini-3.1-flash-lite-preview', name: 'Gemini 3.1 Flash Lite Preview', description: 'Neueste Generation, schnell & günstig' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Schnell & zuverlässig' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Sehr gute Qualität' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: 'Legacy (wird Juni deprecated)' },
]

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

// Single frame analysis (quick capture)
export async function analyzeFrame({ apiKey, imageBase64, mimeType = 'image/jpeg', prompt, systemPrompt, provider = 'gemini', model }) {
  if (!apiKey) throw new Error('Kein API-Key konfiguriert. Bitte in den Einstellungen eintragen.')

  return analyzeFrames({
    apiKey,
    frames: [{ base64: imageBase64, mimeType }],
    transcript: prompt || '',
    systemPrompt,
    provider,
    model,
  })
}

// Multi-frame analysis (push-to-talk with video frames)
export async function analyzeFrames({ apiKey, frames, transcript, systemPrompt, provider = 'gemini', model }) {
  if (!apiKey) throw new Error('Kein API-Key konfiguriert. Bitte in den Einstellungen eintragen.')

  if (provider === 'openrouter') {
    return analyzeFramesViaOpenRouter({ apiKey, frames, transcript, systemPrompt, model })
  }

  return analyzeFramesViaGemini({ apiKey, frames, transcript, systemPrompt, model })
}

async function analyzeFramesViaGemini({ apiKey, frames, transcript, systemPrompt, model }) {
  const geminiModel = model || 'gemini-2.5-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`

  const parts = []

  const textPrompt = transcript
    ? transcript
    : 'Was siehst du? Gib mir einen kurzen Tipp.'

  parts.push({ text: textPrompt })

  for (const frame of frames) {
    parts.push({
      inlineData: {
        mimeType: frame.mimeType || 'image/jpeg',
        data: frame.base64,
      }
    })
  }

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

async function analyzeFramesViaOpenRouter({ apiKey, frames, transcript, systemPrompt, model }) {
  const userContent = [
    {
      type: 'text',
      text: transcript || 'Was siehst du? Gib mir einen kurzen Tipp.'
    },
    ...frames.slice(0, 1).map(frame => ({
      type: 'image_url',
      image_url: {
        url: `data:${frame.mimeType || 'image/jpeg'};base64,${frame.base64}`
      }
    }))
  ]

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent }
  ]

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin,
    },
    body: JSON.stringify({
      model: model || 'google/gemini-2.0-flash-001',
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
