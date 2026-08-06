import fs from 'node:fs';
import path from 'node:path';
import {
  teacherSystemPrompt,
  bandSystemPrompt,
  buildTeacherUserPrompt,
  buildBandUserPrompt,
  contentPromptForTeacher,
  contentPromptForBand
} from '../server/prompts.js';

const ROOT = path.resolve(import.meta.dirname, '..');
const HISTORY_FILE = path.join(ROOT, 'content', '.history.json');
const OUT_ROOT = path.join(ROOT, 'content', 'weekly');

function loadEnv() {
  const envPath = path.join(ROOT, '.env');
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
      }
    }
  }
}

function readHistory() {
  try {
    return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function writeHistory(history) {
  fs.mkdirSync(path.dirname(HISTORY_FILE), { recursive: true });
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2) + '\n');
}

function previousTitles(history, key, limit = 40) {
  const list = history[key] || [];
  return list.slice(-limit);
}

async function callLLM(systemPrompt, userPrompt, maxTokens = 2600) {
  const key = process.env.USER_LLM_API_KEY;
  if (!key) {
    throw new Error('USER_LLM_API_KEY is not set');
  }
  const base = process.env.USER_LLM_BASE_URL || 'https://api.openai.com/v1';
  const model = process.env.USER_LLM_MODEL || 'gpt-4o-mini';

  let lastErr;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.9,
        max_tokens: maxTokens
      })
    });
    if (res.ok) {
      const data = await res.json();
      return data.choices[0].message.content.trim();
    }
    if (res.status !== 429 && res.status < 500) {
      const text = await res.text();
      throw new Error(`LLM error (${res.status}): ${text.slice(0, 400)}`);
    }
    lastErr = new Error(`LLM error (${res.status})`);
    await new Promise((r) => setTimeout(r, 10000 * attempt));
  }
  throw lastErr;
}

function extractTitles(content) {
  const idx = content.search(/^TITLES:\s*$/im);
  if (idx === -1) return [];
  const section = content.slice(idx + 8);
  return section
    .split('\n')
    .map((l) => l.replace(/^[-*#\d.\s]+/, '').trim())
    .filter((l) => l.length > 2);
}

function buildUserPrompt(base, task, history, key) {
  const prev = previousTitles(history, key);
  let prompt = base + '\n' + task;
  if (prev.length > 0) {
    prompt +=
      '\n\nPreviously used titles and topics for this content type. DO NOT reuse any of them — create fresh, different ideas:\n' +
      prev.map((t) => `- ${t}`).join('\n');
  }
  prompt +=
    '\n\nAfter the main content, add a final section that is exactly a line reading "TITLES:" followed by one title per line listing every title, topic, or idea you used in this response.';
  return prompt;
}

const JOBS = [
  {
    profile: {
      kind: 'teacher',
      name: 'Tiny Riffs Guitar',
      subject: 'Guitar',
      students: 'Young kids, beginners',
      style: 'Patient, fun, encouraging',
      location: 'Mumbai: based in Malad, teaches across Mumbai'
    },
    system: teacherSystemPrompt,
    buildUser: buildTeacherUserPrompt,
    taskFor: contentPromptForTeacher,
    tasks: ['short', 'parents', 'songs', 'calendar', 'whatsapp', 'hashtags']
  },
  {
    profile: {
      kind: 'band',
      name: 'AITO',
      genre: 'Rock, 80s, local Bollywood covers, electronic',
      venues: 'Weddings, private parties, and clubs',
      tone: 'High energy, fun, professional'
    },
    system: bandSystemPrompt,
    buildUser: buildBandUserPrompt,
    taskFor: contentPromptForBand,
    tasks: ['social', 'gig', 'pitch', 'blog', 'hashtags']
  }
];

async function main() {
  loadEnv();
  const history = readHistory();
  const date = new Date().toISOString().slice(0, 10);
  let generated = 0;

  for (const job of JOBS) {
    const base = job.buildUser(job.profile);
    for (const type of job.tasks) {
      const key = `${job.profile.name}-${type}`;
      const task = job.taskFor(base, { type, count: 5 });
      const user = buildUserPrompt(base, task, history, key);

      process.stdout.write(`  ${job.profile.name} / ${type} ... `);
      try {
        const content = await callLLM(job.system(), user);
        const titles = extractTitles(content);
        const clean = content.replace(/^TITLES:\s*$/im, '').trim() + '\n';
        if (titles.length > 0) {
          history[key] = [...(history[key] || []), ...titles];
        }
        const dir = path.join(OUT_ROOT, date, job.profile.name.replace(/[^a-z0-9]/gi, '-').toLowerCase());
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, `${type}.md`), clean);
        generated += 1;
        console.log(`done (${titles.length} titles recorded)`);
      } catch (err) {
        console.log(`FAILED: ${err.message}`);
        process.exitCode = 1;
      }
    }
  }

  writeHistory(history);
  console.log(`\nDone. ${generated} files written to content/weekly/${date}/`);
  console.log(`No-repeat history now holds ${Object.values(history).reduce((a, l) => a + l.length, 0)} titles.`);
}

main();
