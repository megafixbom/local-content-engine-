# Local Content Engine

An AI-powered tool for selling monthly marketing content to local businesses and
bands. Generate blog posts, social content, review responses, gig announcements,
video scripts, booking pitches, and vector designs in one click — then deliver
them to clients as a paid service.

Targeting **$500/month** with 2-3 clients at $200-250/mo.

## Quick start

```bash
# 1. Install dependencies
npm run install:all

# 2. Create your API key file
cp .env.example .env
```

Open `.env` and paste in **your own** API key from any OpenAI-compatible provider.
The key comes from you — it is not provided by this project. Example free option:

```env
USER_LLM_API_KEY=gsk_...
USER_LLM_BASE_URL=https://api.groq.com/openai/v1
USER_LLM_MODEL=llama-3.3-70b-versatile
```

```bash
# 3. Run both server and client
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

The frontend proxies `/api` to the backend, so everything works through one port.

## What it generates

| Mode | Task | Best for |
|------|------|----------|
| Band | 5 social media posts | Growing a band's fanbase |
| Band | Gig announcement template | Announcing shows |
| Band | Booking pitch email | Landing weddings / parties / clubs |
| Band | Blog: "Booking [Band]" | Getting found by event planners |
| Band | Hashtags (20) | Instagram/TikTok reach |
| Band | Auto-post CSV (5) | Scheduling posts with platforms + dates |
| Business | 5 social media posts | Consistent local marketing |
| Business | SEO blog post | Ranking on Google |
| Business | Review responses | Managing reputation |
| Business | Google Business posts | Local search visibility |
| Business | Hashtags (20) | Instagram/TikTok reach |
| Business | WhatsApp broadcasts (5) | Society/community group outreach |
| Business | Auto-post CSV (5) | Scheduling posts with platforms + dates |
| Teacher | Channel setup pack | Description, SEO tags, About, posting schedule |
| Teacher | Shorts/Reels scripts | Stopping the scroll, growing the channel |
| Teacher | Lesson video script | Turning viewers into paying students |
| Teacher | Parent pitch videos | Reassuring parents that lessons are worth it |
| Teacher | Original song ideas | Writing simple, kid-friendly songs |
| Teacher | 2-week content calendar | Staying consistent without thinking |
| Teacher | Hashtags (20) | Instagram/TikTok reach |
| Teacher | WhatsApp broadcasts (5) | Society/community group outreach |
| Teacher | Auto-post CSV (5) | Scheduling posts with platforms + dates |
| Design studio | Channel logo | Brand identity |
| Design studio | Facebook ad / LinkedIn banner / IG post | Paid & organic social promotion |
| Design studio | YouTube thumbnail / channel banner | Clickable, on-brand videos |
| Design studio | WhatsApp / story graphics | Local reach (Mumbai society groups etc.) |
| Design studio | AI photo posts (Photo mode) | Real images for social posts & thumbnails |

The Design studio now has two output types: **Vector (SVG)** for crisp logos and
banners, and **Photo mode** which generates real AI images (free via Pollinations,
no API key needed) at exact platform sizes — ready to post for a friend's channel.

The **Clients tab** is your pipeline: add each paying client, set their monthly
retainer and due date, and the app tracks status (prospect → active → done) with
overdue alerts. Profiles and client data save automatically in your browser.
The **Print** button produces a clean, branded deliverable for each client, and
the Auto-post CSV downloads as a real `.csv` with the next 5 weekdays pre-filled
— ready to import into a scheduler.

Content localizes to a service area when one is provided — e.g. a Mumbai-based
guitar teacher in Malad serving Borivali to Bandra gets scripts and CTAs that
reference the local area.

AITO (rock / 80s / Bollywood covers / electronic — weddings, parties, clubs) is
preloaded as a sample band profile. The Music teacher tab is preloaded with
"Tiny Riffs Guitar" (handle @TinyRiffsGuitar) — a kids guitar channel based in
Mumbai. The Design studio generates unlimited free vector (SVG) designs using
the configured LLM key.

## Your path to $500/month

**The product:** a monthly content package for local businesses and bands.

**Package to sell:**
- 4 blog posts/mo (SEO)
- 12 social posts/mo
- Review responses + Google Business posts
- Deliverables exported as `.md` files and pasted into the client's channels

**Pricing:**
- Small business: $200/mo
- Band: $200-250/mo (gig announcements + booking outreach included)

**Target: 2-3 clients = $400-750/mo**

**Getting your first 2-3 clients (this is the real work):**
1. Pick one niche first — e.g. restaurants in your city, local bands, or a kids guitar teacher.
2. Generate a **free sample** for 10 businesses using this tool, personalize it,
   and send it with a pitch ("I made a sample of what your monthly content could
   look like").
3. Follow up after 3 days. Expect 1 in 5 to reply, 1 in 10 to sign.
4. Use the "Booking pitch email" generator to help AITO land gigs — that's your
   first case study for the music niche.

**For the guitar teacher channel:** generate Shorts + lesson scripts in the Music
teacher tab. Shorts grow the channel; lesson videos position him as the teacher
parents trust — both funnel viewers into booking his lessons.

## Weekly fresh ideas (no repeats)

A GitHub Actions workflow generates **new ideas every week, automatically** — and
never repeats.

- Runs **every Monday** (and can be triggered manually in Actions → "Weekly content refresh" → Run workflow).
- Writes a dated snapshot to `content/weekly/YYYY-MM-DD/` for both Tiny Riffs Guitar and AITO.
- **No-repeat:** every generated title/topic is stored in `content/.history.json`.
  Each week the AI is told the full list of past titles and instructed not to reuse them.
- Rate-limit retries are built in.

**One-time setup (5 minutes):**
1. Push this repo to GitHub.
2. In the repo: **Settings → Secrets and variables → Actions → New repository secret**, add:
   - `USER_LLM_API_KEY` = your Groq (or other provider) key
   - `USER_LLM_BASE_URL` = `https://api.groq.com/openai/v1`
   - `USER_LLM_MODEL` = `llama-3.3-70b-versatile`
3. Done — fresh content lands in your repo every Monday.

You can also run it manually anytime, locally:

```bash
node scripts/generate-weekly.js
```

## Generated content packs

The repo ships ready-to-use starter packs in `content/`:

- `content/tiny-riffs/` — kids guitar channel: channel setup pack, Shorts scripts,
  lesson script, parent pitch videos, original song ideas, 2-week calendar
- `content/aito/` — band: social posts, gig announcement template, booking pitch
  email, booking blog post

Regenerate or extend them from the app, or directly:

```bash
node scripts/gen-pack.js
```

## Costs

- Hosting: free tiers (Vercel/Netlify/Render) are enough at this scale.
- LLM API: roughly $1-4/month at this content volume on a cheap provider
  (free tiers exist — see Google AI Studio / Groq / OpenRouter).
- Total: under $5/month to run.

## Project layout

```
server/          Express backend that calls the LLM API
server/prompts.js   Shared prompt templates (server + weekly script)
client/          React + Vite frontend
scripts/dev.js   Runs both server and client together
scripts/gen-pack.js   Regenerates the content packs in content/
scripts/generate-weekly.js   Weekly fresh-idea generator with no-repeat dedup
content/         Generated client deliverables (.md)
.github/workflows/weekly-content.yml   Weekly auto-generation workflow
.env.example     API key template (copy to .env)
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.
