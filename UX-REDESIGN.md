# Vision Assistant — UX Redesign v2

## Core Principle
**Don't interrupt the game flow.** The app should feel like a HUD overlay, not a chat app.

## Key Changes

### 1. Camera-First Design
- Camera view is ALWAYS visible (fullscreen background)
- Tips/responses appear as **floating overlays ON TOP of the camera**
- No separate chat panel that covers the camera

### 2. Push-to-Talk with Video
- **Hold button → records video + audio simultaneously**
- Release → video (last 5-10 seconds) + audio transcript sent to Gemini
- Audio gets transcribed (browser SpeechRecognition or Whisper)
- Gemini receives: video frames + voice question + context
- For simplicity: capture multiple frames during the hold period (every 1-2 seconds) and send as images

### 3. Response Display — HUD Style
- Responses appear as **toast/popup overlays** on the camera view
- **Short by default** — 1-2 sentences with action recommendation
- **"Read More" button** to expand full response
- Auto-fade after 10 seconds (unless tapped)
- Semi-transparent dark background so camera is still visible
- Stack multiple tips if they come in sequence

### 4. Response Format
- Short, actionable tips: "⚡ Sell the Geodes (trade item). Keep Di-Hydrogen for fuel."
- Action recommendations first, explanation second
- Gaming-friendly: use icons, color coding
- Don't spoil the game — help the flow, don't over-explain

### 5. Quick Capture (no hold)
- Single tap on capture button = instant screenshot + analysis
- Same HUD overlay response

### 6. Google Search Grounding
- Already implemented (googleSearch tool in Gemini API)
- Make sure it's always active

### 7. Auto-Mode
- Toggle: auto-capture every N seconds
- Tips appear silently as overlays
- Only interrupt with audio if something important

### 8. Audio Output
- TTS reads responses aloud (already works)
- Short responses = read automatically
- Long responses = read only summary

## UI Layout
```
┌─────────────────────────────┐
│                             │
│     CAMERA FEED (full)      │
│                             │
│  ┌─────────────────────┐    │
│  │ ⚡ Sell Geodes,     │    │  ← Floating tip overlay
│  │ keep Di-Hydrogen    │    │
│  │         [Read More] │    │
│  └─────────────────────┘    │
│                             │
│                             │
│  ┌──┐    ┌────┐    ┌──┐    │
│  │⚙️│    │🎤📹│    │📸│    │  ← Bottom action bar
│  └──┘    └────┘    └──┘    │
└─────────────────────────────┘
```

- Center button: Push-to-talk (hold = record video+audio)
- Right button: Quick screenshot capture
- Left button: Settings
- Swipe up: History of past tips

## Tech Notes
- Video: use MediaRecorder API for short clips
- Send as multiple frames (extract from video) to Gemini
- Audio: SpeechRecognition for live transcript
- Gemini: multi-image + text input with Google Search grounding
- System prompt: "Give SHORT actionable gaming tips. 1-2 sentences max. Action first, explanation second. Use ⚡ for actions, 📦 for items, 🗺️ for navigation. Include [More] marker if there's additional detail."
