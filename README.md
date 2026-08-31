# G Connect Solutions — Website

A full rebuild of the G Connect Solutions site: Three.js hero, GSAP + ScrollTrigger
scroll animations, Lenis smooth scroll, and Barba.js page transitions, with a
mobile-first responsive design throughout.

## How to view it

This is a static site — no build step. Two easy options:

1. **Just open it:** double-click `index.html`. Barba.js page transitions need a
   real server to work (browsers block `fetch()` on `file://` URLs), so on double-click
   the site still works, but clicking between pages will do a normal full page load
   instead of the animated transition.
2. **Recommended — run a local server** so everything (including Barba transitions)
   works exactly as intended:
   - Python: `python3 -m http.server 8080` from this folder, then visit `http://localhost:8080`
   - Node: `npx serve .`
   - Or open the folder in VS Code and use the "Live Server" extension.

To publish it for real, upload this whole folder as-is to any static host
(Netlify, Vercel, GitHub Pages, cPanel, etc.) — no server-side code is needed.

## Structure

```
index.html               → Home page
pages/                    → The 5 service pages
  google-ads.html
  web-development.html
  logo-design.html
  lead-generation.html
  influencer-marketing.html
css/
  base.css                → Design tokens (colors, type), nav, buttons, footer, cursor
  home.css                → Home-page-only sections (hero, about, services, etc.)
  inner.css                → Shared styling for the 5 service pages
js/
  main.js                  → Lenis smooth scroll, ScrollTrigger reveals, cursor, marquees
  three-hero.js             → The Three.js "signal network" sphere in the home hero
  transitions.js             → Barba.js page-transition wiring
assets/                    → Your original images/videos, resized & compressed
```

## Design concept

The whole site leans into "signal" — the idea of one brand connecting to an
audience, which is literally your name. That shows up as: the network-sphere
visual in the hero, the "on-air" pulse dot in the nav CTA, the marigold-disc
wipe transition between pages, and the ticker-style marquee bands.

Colors (edit in `css/base.css` under `:root`):
- `--ink` — background, near-black warm charcoal
- `--cream` — the lighter "pause" sections (Why Choose Us)
- `--marigold` — primary accent (buttons, links, numbers)
- `--coral` — secondary accent (CTA hover, badges)

Fonts: **Space Grotesk** for headlines, **Inter** for body text — loaded from
Google Fonts in `css/base.css`.

## Easy things to customize

- **Copy:** all text lives directly in the HTML files — search and edit normally.
- **Phone / email / address:** appears in the footer and contact section of every
  page — search for `918310312791` and `admin@gconnectsolutions.com` to update
  everywhere at once.
- **Stats/numbers:** look for `data-target="..."` attributes — those are the
  animated counters (e.g. "200+ websites shipped").
- **Google Map:** the embedded map is in `index.html`'s contact section — swap
  the address in the iframe `src` query string, or generate a fresh embed link
  from Google Maps directly.
- **Images/videos:** everything lives in `assets/`; swap a file in place (keep
  the same filename) and it updates everywhere it's referenced.

## Performance note

Your original asset folder was ~260MB, largely from unoptimized phone photos
and videos. Everything here has been resized and compressed (down to ~77MB
total) so pages actually load quickly on mobile data.
