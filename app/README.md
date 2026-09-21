# unex — clickable MVP prototype

Soft reopen for two people after a mess — **buttons only**. Dark Gen Z UI mock flows (no real OTP/SMS).

## Stack

- Next.js App Router + TypeScript + Tailwind CSS v4
- Zustand (+ localStorage persist) for client state
- Mobile-first phone shell on desktop

## Run

```bash
cd /workspace/unex/app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

## Mock flows

1. **Splash** → continue → stub login (name only)
2. **Invite** partner → send invite → **Waiting** → **Simulate accept**
3. **Home** — partner status/mood, tap deck (5/day)
4. Tap a chip → confirm → **toast** (`tap sent ✦` / hold copy)
5. **Mute & archive** — toggles; sender-facing copy:
   - Mute → *Not reading right now*
   - Need space hold → *Delivered when they're ready*
   - Clear unread → *Cleared unread* (one batched signal)
6. **Safety** (buried) — End pair (Block) + Report → *Connection ended*

## Brand

- Name always lowercase: **unex**
- bg `#0c0b10`, accents `#c4b5fd` / `#f9a8d4`
- Culture: Mute & Archive first; Block is the quiet fire exit

See `../PRD.md`, `../BRAND.md`, `../wireframes/index.html`.

## Reset

Clear site data / localStorage key `unex-mvp`, or use **start fresh** after ending a pair.
