# Changelog

All notable changes to this project are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-08-05

### Added

- React + Vite frontend with three content modes and a design studio.
- Express backend exposing OpenAI-compatible chat API and SVG design generation.
- **Band mode:** social posts, gig announcement template, booking pitch email,
  and "Booking [Band]" blog post. Preloaded with AITO.
- **Business mode:** social posts, SEO blog post, review responses, and Google
  Business posts.
- **Teacher mode:** channel setup pack, Shorts/Reels scripts, lesson video script,
  parent pitch videos, original song ideas, and 2-week content calendar.
  Preloaded with Tiny Riffs Guitar (kids guitar, Mumbai).
- **Design studio:** unlimited free vector (SVG) logo, ad, banner, thumbnail, and
  story generation at platform-correct sizes.
- Location-aware content generation for local service areas.
- Copy-to-clipboard and `.md` / `.svg` download for client delivery.
- Starter content packs for Tiny Riffs Guitar and AITO under `content/`.
- `scripts/gen-pack.js` to regenerate the content packs.
- `scripts/dev.js` to run server and client together.
- README with a $500/month monetization playbook.

### Security

- `.env` with API keys is git-ignored; only a `.env.example` template is committed.
- Vite upgraded to 6.4.3 to resolve esbuild dev-server advisories.
