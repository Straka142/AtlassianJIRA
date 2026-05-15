# Sparky the Learning Star — Setup Guide

## Requirements
- Node.js 18+
- An Anthropic API key
- Chrome or Edge browser (for voice input)

## Quick Start

### 1. Set your API key
```bash
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

### 2. Install all dependencies
```bash
npm run setup
```

### 3. Start the app
```bash
npm run dev
```

Open **http://localhost:5173** in Chrome or Edge.

---

## How to use

1. **Talk to Sparky** — press the big microphone button and ask a question
2. **Load your files** — click "Load Files" and upload PDFs or text files; Sparky will use them to answer questions about your topic
3. **Type instead** — use the text box at the bottom if voice doesn't work

## Supported file types
- PDF (.pdf)
- Plain text (.txt)
- Markdown (.md)
- CSV (.csv)

## Voice support
Voice input uses the browser's built-in Web Speech API.
- ✅ Chrome — works
- ✅ Edge — works
- ❌ Firefox — not supported (use the text box)
- ❌ Safari — partial support
