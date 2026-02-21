# Normie High School — Class of '26

> *10,000 Faces. One Chain. Zero Regrets.*

A yearbook for all 10,000 [Normies](https://normies.art) NFTs on Ethereum. Browse every student, read their superlative, quote, GPA, clubs, and find out where they ended up.

**Live:** [normie-yearbook.vercel.app](https://normie-yearbook.vercel.app)

---

## Features

- **10,000 Normies** — paginated grid, 48 per page
- **Senior portraits** — lazy-loaded pixel art from the Normies API
- **Full yearbook profile** per Normie:
  - Superlative ("Most Likely to...")
  - Famous quote + attributed author (keyed to Expression trait)
  - GPA, clubs & activities
  - Student Record — all on-chain traits as badges
  - Student File — sport, profession, energy type, spirit animal, anime character, and more
  - Where Are They Now
  - Handwritten signature
- **Download card** — saves a front + back yearbook card as a single PNG (pure canvas, no dependencies)
- **Jump to any Normie** by ID (0–9999)
- **Surprise Me** button for random discovery

---

## Stack

| Layer | Tech |
|---|---|
| Server | Node.js + Express |
| Frontend | Vanilla HTML / CSS / JS |
| Data | [api.normies.art](https://api.normies.art) (proxied to avoid CORS) |
| Hosting | Vercel |

---

## Run Locally

```bash
git clone https://github.com/bolarinwa420/normie-yearbook.git
cd normie-yearbook
npm install
node server.js
```

Open `http://localhost:3002`

---

## Deploy

```bash
vercel --prod
```

---

## Project Structure

```
normie-yearbook/
├── public/
│   ├── index.html        # Single-page app
│   ├── app.js            # All logic — grid, modal, content engine, canvas download
│   └── styles.css        # B&W yearbook theme
├── server.js             # Express server + Normies API proxy
└── vercel.json           # Vercel deployment config
```

---

*Data via [Normies](https://normies.art) · Built on Ethereum · Est. Block #14,000,000*
