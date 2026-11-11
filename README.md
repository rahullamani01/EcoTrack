<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/10416666-ef8c-4e64-8123-77deb5c132ee

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Live Demo (GitHub Pages)

The frontend is deployed to GitHub Pages by `.github/workflows/deploy-pages.yml`:

**https://rahullamani01.github.io/EcoTrack/**

Because GitHub Pages only serves static files, the hosted demo runs in **static mode**:

- **Tree Monitoring** falls back to the bundled on-campus inventory in `src/data/campusTrees.ts`
  (5 verified trees photographed at Sanjay Ghodawat University, Atigre, Kolhapur).
- Login, database writes and the Gemini-powered EcoGuide / Waste Sorting require the Express backend.

### Full stack locally

```bash
npm install
npm run dev          # Express + Vite on http://localhost:3000
```

Requires a `.env` with `MONGODB_URI` and `GEMINI_API_KEY`.

### Refresh tree records in the database

```bash
npm run sync:trees   # upserts src/data/campusTrees.ts into MongoDB (or .data/)
```
