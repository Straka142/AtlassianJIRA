require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json());

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ERROR: ANTHROPIC_API_KEY is not set in .env file');
  process.exit(1);
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

let fileContext = '';
let uploadedFileNames = [];

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 15 * 1024 * 1024 },
});

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.post('/api/upload', upload.array('files', 10), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files received' });
  }

  try {
    let newContext = '';
    const newFileNames = [];

    for (const file of req.files) {
      const ext = path.extname(file.originalname).toLowerCase();
      let text = '';

      if (['.txt', '.md', '.csv'].includes(ext)) {
        text = fs.readFileSync(file.path, 'utf-8');
      } else if (ext === '.pdf') {
        const pdfParse = require('pdf-parse');
        const buffer = fs.readFileSync(file.path);
        const data = await pdfParse(buffer);
        text = data.text;
      } else if (['.js', '.ts', '.jsx', '.tsx', '.py', '.html', '.css', '.json'].includes(ext)) {
        text = fs.readFileSync(file.path, 'utf-8');
      }

      if (text.trim()) {
        newContext += `\n\n--- Content from: ${file.originalname} ---\n${text.trim()}`;
        newFileNames.push(file.originalname);
      }

      try { fs.unlinkSync(file.path); } catch (_) {}
    }

    fileContext += newContext;
    uploadedFileNames.push(...newFileNames);

    res.json({ success: true, files: newFileNames, allFiles: uploadedFileNames });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/files', (_req, res) => {
  fileContext = '';
  uploadedFileNames = [];
  res.json({ success: true });
});

app.get('/api/files', (_req, res) => {
  res.json({ files: uploadedFileNames });
});

app.post('/api/chat', async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const contextSection = fileContext
    ? `\n\nYou have been given these special learning materials to help answer questions:\n${fileContext.slice(0, 10000)}`
    : '';

  const systemPrompt = `You are "Sparky", a super friendly and enthusiastic learning helper for elementary school students (ages 5–11)!
You LOVE learning and you get genuinely excited about every question kids ask!
Keep your answers SHORT and SIMPLE — 2 to 3 sentences max, using easy words young kids understand.
Always be encouraging, warm, and positive! Use everyday examples kids can relate to.
When a child asks something, celebrate their curiosity first, then answer it.
End with a fun follow-up question or a little cheer when it fits naturally.
Never say anything scary, sad, or inappropriate. You are always safe and friendly.${contextSection}`;

  try {
    const cleanHistory = history
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .slice(-10);

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 350,
      system: systemPrompt,
      messages: [...cleanHistory, { role: 'user', content: message }],
    });

    res.json({ response: response.content[0].text });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to get response from AI' });
  }
});

app.listen(PORT, () => {
  console.log(`🌟 Sparky's server is running at http://localhost:${PORT}`);
  console.log(`📚 File context: ${uploadedFileNames.length} files loaded`);
});
