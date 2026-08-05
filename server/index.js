import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import {
  businessSystemPrompt,
  bandSystemPrompt,
  teacherSystemPrompt,
  designSystemPrompt,
  buildBusinessUserPrompt,
  buildBandUserPrompt,
  buildTeacherUserPrompt,
  contentPromptForBand,
  contentPromptForBusiness,
  contentPromptForTeacher
} from './prompts.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, '../.env') });

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const API_KEY = process.env.USER_LLM_API_KEY;
const BASE_URL = process.env.USER_LLM_BASE_URL;
const MODEL = process.env.USER_LLM_MODEL;

const appUrl = `${BASE_URL || 'https://api.openai.com/v1'}/chat/completions`;

export async function callLLM(systemPrompt, userPrompt, maxTokens = 2200) {
  if (!API_KEY) {
    throw new Error('MISSING_KEY');
  }
  const res = await fetch(appUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: maxTokens
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LLM error (${res.status}): ${text.slice(0, 500)}`);
  }

  const data = await res.json();
  return data.choices[0].message.content.trim();
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, configured: Boolean(API_KEY), model: MODEL || null });
});

app.post('/api/generate', async (req, res) => {
  try {
    const { profile, request } = req.body || {};
    if (!profile || !request || !request.type) {
      return res.status(400).json({ error: 'profile and request.type are required' });
    }

    const kind = profile.kind;
    const routers = {
      band: { sys: bandSystemPrompt, user: buildBandUserPrompt, content: contentPromptForBand },
      teacher: { sys: teacherSystemPrompt, user: buildTeacherUserPrompt, content: contentPromptForTeacher },
      business: { sys: businessSystemPrompt, user: buildBusinessUserPrompt, content: contentPromptForBusiness }
    };
    const router = routers[kind] || routers.business;

    const system = router.sys();
    const user = router.user(profile);
    const task = router.content(user, request);

    const text = await callLLM(system, task);
    res.json({ content: text });
  } catch (err) {
    if (err.message === 'MISSING_KEY') {
      return res.status(500).json({
        error: 'API key not configured. Create a .env file in the project root with your USER_LLM_API_KEY. See README.md.'
      });
    }
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/design', async (req, res) => {
  try {
    const { subject, purpose, style, width, height } = req.body || {};
    if (!subject) {
      return res.status(400).json({ error: 'subject is required' });
    }
    const w = width || 1024;
    const h = height || 1024;
    const user = [
      `Create a ${purpose} for "${subject}".`,
      `Style: ${style}.`,
      `Canvas: ${w} x ${h} pixels.`
    ].join('\n');
    const svg = await callLLM(designSystemPrompt(), user, 4000);
    res.json({ content: svg });
  } catch (err) {
    if (err.message === 'MISSING_KEY') {
      return res.status(500).json({
        error: 'API key not configured. Create a .env file in the project root with your USER_LLM_API_KEY. See README.md.'
      });
    }
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Content engine server running on http://localhost:${PORT}`);
});
