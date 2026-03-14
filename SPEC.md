# Vision Assistant — Game Companion App

## What It Does
A web app that uses the phone camera to capture what you see (e.g., a game on TV/monitor), sends frames to Gemini for analysis, and reads the response aloud via TTS.

## Features
1. **Camera feed** — Shows live camera preview
2. **Capture button** — Takes a snapshot (or auto-captures every N seconds)
3. **Gemini Vision analysis** — Sends frame to Gemini 2.5 Flash with context prompt
4. **Text-to-Speech** — Reads the analysis aloud (browser SpeechSynthesis API for simplicity, or ElevenLabs)
5. **Chat history** — Shows previous Q&A pairs
6. **Voice input** — Ask questions via microphone about what you see
7. **Context prompt** — Pre-configured for No Man's Sky but customizable

## Tech Stack
- React + Vite + TailwindCSS
- Gemini API (client-side, key entered by user in settings)
- Browser MediaDevices API for camera
- Browser SpeechSynthesis for TTS (free, no API key needed)
- Browser SpeechRecognition for voice input
- Cloudflare Pages for hosting

## UI
- Dark theme (matches gaming vibe)
- Fullscreen camera preview
- Floating action button to capture/ask
- Slide-up panel for chat history
- Settings gear for API key + context prompt

## Security
- API key stored in localStorage only (never sent to any server)
- All API calls direct from browser to Gemini API
- No backend needed

## Default Context Prompt
"You are a No Man's Sky gaming assistant. Analyze what you see in this screenshot and provide helpful tips, identify items, explain what the player should do next, or answer any questions about what's on screen. Be concise and practical. Answer in German."
