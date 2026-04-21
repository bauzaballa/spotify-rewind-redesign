# Spotify Rewind

Visualize your complete Spotify listening history — no login, no backend, no data leaving your browser.

🔗 **[Live demo](https://spotify-rewind-pearl.vercel.app)**

---

## What is this?

Spotify Rewind is a client-side app that processes your personal Spotify data export and turns it into a full listening dashboard. It runs entirely in the browser — your data is never uploaded anywhere.

## How to use it

1. **Download your data** from Spotify: go to *Settings → Privacy → Download your data* and request your **Extended streaming history**. Spotify will email you a `.zip` file within a few days.
2. **Drop the zip** onto the upload screen — or select individual JSON files. The app reads everything using JSZip, directly in the browser.
3. **Explore your stats** across 8 sections in the dashboard.

> Don't have your export yet? Hit **"Load sample data"** to try the app right away.

---

## Features

### Overview
Total hours listened, unique tracks, artists and albums, skip rate, and your all-time top track and artist.

### Top Tracks / Artists / Albums
Ranked lists with play counts, total listening time, and skip rates. Plays under 30 seconds are excluded from all calculations.

### Podcasts
Breakdown by show with episode counts and listening time.

### Platforms
Which devices you actually used — Android, iOS, macOS, Windows, Web Player — and how much time on each.

### Time Analysis
Peak listening hour, favorite day of the week, monthly listening trends (last 24 months), and a daily activity heatmap filterable by year.

### Habits
Shuffle rate, skip rate, offline listening rate, track completion rate, and a per-artist skip ranking.

---

## Tech stack

| | |
|---|---|
| Framework | React 19 + Vite 8 |
| Charts | Recharts |
| Animations | Framer Motion |
| File parsing | JSZip |
| Styling | CSS Modules + custom properties |
| Deploy | Vercel (static) |

**Notable implementation details:**
- Chunked async processing keeps the UI responsive on histories with tens of thousands of entries
- All derived data uses `useMemo` — no `useEffect` for data derivation
- Framer Motion `AnimatePresence` drives screen transitions (upload → loader → dashboard) and per-section fade+slide animations
- Zero backend — deployable as a plain static site

---

## Privacy

Your data never leaves your browser. The app has no server, no analytics, and makes no network requests after the initial page load. Everything is processed locally.

---

## Running locally

```bash
git clone https://github.com/bauzaballa/spotify-rewind.git
cd spotify-rewind
npm install
npm run dev
```

---

## Roadmap

- [ ] Export stats as image or PDF
- [ ] Year-over-year comparison view
- [ ] Search within your history
- [ ] Dark/light theme toggle

---

Made by [Bautista Zaballa](https://github.com/bauzaballa)