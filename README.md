# Vision Assistant 👁️

A mobile-first web app that uses your phone camera + Gemini Vision AI to analyze what you see on screen — built as a No Man's Sky gaming companion.

## Features

- 📸 **Live camera feed** with front/back switching
- 🤖 **Gemini 2.5 Flash** vision analysis (client-side, no backend!)
- 🎤 **Voice input** via SpeechRecognition API
- 🔊 **Text-to-Speech** responses via SpeechSynthesis API
- 💬 **Chat history** with screenshot thumbnails
- ⚡ **Auto-capture** mode (configurable interval)
- 🎮 **Dark gaming theme** — cyan/teal accents

## Usage

1. Open the app on your phone
2. Enter your Gemini API key in Settings (⚙️)
3. Point camera at your TV/screen
4. Tap the capture button or ask via voice
5. Get AI analysis read aloud!

## Tech Stack

- React + Vite
- TailwindCSS
- @google/genai (Gemini 2.5 Flash)
- Browser MediaDevices API
- Browser SpeechSynthesis + SpeechRecognition APIs

## Get your API key

Free from [Google AI Studio](https://aistudio.google.com/apikey) — no credit card needed.

## Security

Your API key is stored **only in localStorage** and never sent to any server. All Gemini calls go directly from your browser to Google's API.

## Development

```bash
npm install
npm run dev
```
