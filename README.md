# Local Content Engine

An AI-powered tool for selling monthly marketing content to local businesses and
bands. Generate blog posts, social content, review responses, gig announcements,
and booking pitches in one click — then deliver them to clients as a paid service.

## Quick start

```bash
# 1. Install dependencies
npm run install:all

# 2. Create your API key file
cp .env.example .env
```

Open `.env` and paste in **your own** API key from any OpenAI-compatible provider
(DeepSeek is cheap and great for this). The key comes from you — it is not provided
by this project.

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
| Business | 5 social media posts | Consistent local marketing |
| Business | SEO blog post | Ranking on Google |
| Business | Review responses | Managing reputation |
| Business | Google Business posts | Local search visibility |
| Teacher | Shorts/Reels scripts | Stopping the scroll, growing the channel |
| Teacher | Lesson video script | Turning viewers into paying students |
| Teacher | Parent pitch videos | Reassuring parents that lessons are worth it |
| Teacher | Original song ideas | Writing simple, kid-friendly songs |
| Teacher | 2-week content calendar | Staying consistent without thinking |

AITO (rock / 80s / Bollywood covers / electronic — weddings, parties, clubs) is
preloaded as a sample band profile. The Music teacher tab is preloaded with
"Tiny Riffs Guitar" (handle @TinyRiffsGuitar) — a kids guitar channel.

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

## Costs

- Hosting: free tiers (Vercel/Netlify/Render) are enough at this scale.
- LLM API: roughly $1-4/month at this content volume on DeepSeek.
- Total: under $5/month to run.

## Project layout

```
server/          Express backend that calls the LLM API
client/          React + Vite frontend
scripts/dev.js   Runs both server and client together
.env.example     API key template (copy to .env)
```
