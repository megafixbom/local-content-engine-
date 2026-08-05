import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, '../.env') });

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const API_KEY = process.env.USER_LLM_API_KEY;
const BASE_URL = process.env.USER_LLM_BASE_URL;
const MODEL = process.env.USER_LLM_MODEL;

const appUrl = `${BASE_URL || 'https://api.openai.com/v1'}/chat/completions`;

async function callLLM(systemPrompt, userPrompt, maxTokens = 2200) {
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

function businessSystemPrompt() {
  return [
    'You are a professional content marketer who creates persuasive, locally-focused marketing content.',
    'Write in natural, enthusiastic English. Avoid obvious AI-sounding phrases like "unlock", "elevate", "dive into", "seamless".',
    'Match the requested tone. Use the business details and location to make content feel authentic.',
    'Do not invent facts (phone numbers, prices, dates, links) that were not provided. Use placeholders like [PHONE] where needed.'
  ].join('\n');
}

function bandSystemPrompt() {
  return [
    'You are a music promotion expert and copywriter who helps bands book shows and grow their fanbase.',
    'Write in natural, enthusiastic English. Avoid obvious AI-sounding phrases.',
    'For venue pitches: lead with the band\'s value to the venue, be short, persuasive, professional.',
    'For social posts: use emojis sparingly and naturally, keep posts under 150 words.',
    'Do not invent facts (dates, venues, prices, links) that were not provided. Use placeholders like [DATE], [VENUE], [PHONE].'
  ].join('\n');
}

function teacherSystemPrompt() {
  return [
    'You are an expert YouTube and social media strategist who helps music teachers grow their channel and turn viewers into paying students.',
    'Write scripts in natural, warm, spoken English. Short sentences. Sound like a friendly teacher talking, not a corporate ad.',
    'For Shorts: lead with a strong hook in the first 3 seconds, teach one tiny thing, end with one clear call to action.',
    'For lessons: hook, short recap, main teach in simple steps, a practice tip, and a call to action.',
    'Keep parents in mind: they are deciding whether music lessons are good for their kid. Reassure and inspire them.',
    'Localize naturally when the teacher provides a location: reference the local area, nearby localities, and the convenience of a teacher close to home. Do NOT invent specific street names, apartment names, prices, phone numbers, or business names.',
    'Never invent facts. Use placeholders like [YOUR NAME], [CHANNEL LINK], [PHONE] where needed.'
  ].join('\n');
}

function buildBusinessUserPrompt(b) {
  return [
    `Business name: ${b.name}`,
    `Business type: ${b.type}`,
    `Location: ${b.location}`,
    `Services/products: ${b.services}`,
    `Tone: ${b.tone}`,
    `Target keyword: ${b.keyword || 'n/a'}`
  ].join('\n');
}

function buildBandUserPrompt(b) {
  return [
    `Band name: ${b.name}`,
    `Genre/style: ${b.genre}`,
    `Where they play: ${b.venues}`,
    `Tone: ${b.tone}`
  ].join('\n');
}

function buildTeacherUserPrompt(t) {
  return [
    `Channel name: ${t.name}`,
    `What is taught: ${t.subject}`,
    `Who is taught: ${t.students}`,
    `Teaching style / tone: ${t.style}`,
    `Location / service area: ${t.location || 'not specified'}`
  ].join('\n');
}

function contentPromptForBand(promptBase, request) {
  const builders = {
    blog: 'Write a 600-800 word blog post: "Booking [BAND] for your event" aimed at wedding planners, party hosts, and venue managers. Include a title, a meta description (under 155 chars), an H2 outline, and the full article body in Markdown.',
    social: `Create ${request.count || 5} social media posts for the band (mix of Facebook, Instagram, and one short video caption). Each post under 150 words. Label each with its platform.`,
    gig: 'Create a gig announcement post template the band can reuse whenever they book a show. Include emoji placeholders, venue slot, date slot, and a call to action.',
    pitch: 'Write a professional booking pitch email (200-250 words) the band can send to venue owners, wedding planners, and club managers. Include subject line options.'
  };
  return builders[request.type] || builders.blog;
}

function contentPromptForBusiness(promptBase, request) {
  const builders = {
    blog: `Write a 600-800 word SEO blog post about: "${request.topic || promptBase}". Include a title, meta description (under 155 chars), an H2 outline, and the full article body in Markdown. Target the keyword naturally.`,
    social: `Create ${request.count || 5} social media posts (Facebook and Instagram mix). Each under 150 words. Label each with its platform.`,
    review: 'Create a response template for customer reviews (both positive and one negative/neutral). Under 120 words each.',
    gbp: 'Create 3 Google Business Profile posts (announcement, offer, event style). Under 100 words each.'
  };
  return builders[request.type] || builders.blog;
}

function contentPromptForTeacher(promptBase, request) {
  const builders = {
    short: `Create 3 YouTube Shorts / Reels scripts (30-60 seconds each). For each: give the title, the hook (first 3 seconds), the body (one tiny guitar skill taught in simple steps a kid can follow), and a call to action. Make one script specifically about playing a famous easy melody a kid would love.`,
    lesson: `Write one 5-8 minute lesson video script. Include: an opening hook, a quick recap of what students need, the main lesson broken into 3 simple steps, a practice tip, what to do next, and a clear call to action to subscribe and to book a lesson. Keep language simple for young kids with encouragement from the teacher.`,
    parents: `Create 3 short video scripts (30-60 seconds) aimed at PARENTS of young kids in the teacher's local area, about the benefits of guitar lessons (confidence, discipline, fun). Each: hook, message, and call to action to subscribe and to book a lesson — mention the teacher is based nearby and teaches in the local area. Warm and reassuring tone.`,
    songs: `Create 5 original, kid-friendly song ideas for a children's guitar channel. For each idea give: the title, the theme, an easy open-chord progression (chord names only), a simple structure (e.g. intro/verse/chorus), one lyrical hook line, and why kids will love it. Keep chord progressions playable for beginners.`,
    setup: `Create a complete YouTube channel setup pack: 1) Channel description (under 200 words, mentioning who it helps, what they will learn, and the local area), 2) 15 SEO tags for the channel and videos, 3) a short About section, 4) 3 title options for a 60-second welcome/intro video, 5) a suggested posting schedule for a small channel.`,
    calendar: `Create a 2-week content calendar for a kids guitar channel: 5 Shorts ideas and 1 lesson video idea per week. For each idea give: title, one-line concept, and why it will attract parents or kids. Also suggest the best posting rhythm for growing a small channel.`
  };
  return builders[request.type] || builders.short;
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

function designSystemPrompt() {
  return [
    'You are a professional graphic designer who creates clean, modern vector designs.',
    'You output ONLY raw SVG code. No markdown fences, no explanation, no HTML wrapper.',
    'Start directly with <svg> and end with </svg>.',
    'Use the exact width and height given. Use viewBox="0 0 W H".',
    'Use <text> elements for brand text, centered, with large readable fonts, and 2-3 harmonious colors.',
    'Keep the composition centered and leave safe margins so nothing is cut off on banners or thumbnails.',
    'Use gradients, simple shapes, and clean geometry. Avoid filters that most browsers cannot render.'
  ].join('\n');
}

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
