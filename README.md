---
title: Arcade Cabinet
description: A single Capacitor/Vite cabinet for high-fidelity web and Android games.
author: Arcade Cabinet Team
last_updated: 2026-04-23
---

# Arcade Cabinet

![Arcade Cabinet Hero](public/assets/cabinet/hero.png)

Arcade Cabinet is one React, Vite, and Capacitor app that contains every playable game. The same codepath serves desktop web, mobile web, GitHub Pages, and Android.

The launch track is currently fixed to 12 cartridges:

- Bioluminescent Sea
- Cosmic Gardener
- Enchanted Forest
- Entropy Edge
- Mega Track
- Otterly Chaotic
- Overcast Glacier
- Primordial Ascent
- Titan Mech: Overheat
- Beppo Laughs
- Cognitive Dissonance
- Farm Follies

## Architecture

- `app/`: routes, cabinet views, React components, R3F scenes, HUDs, styles, and browser-facing presentation.
- `src/`: game logic, state, systems, math, procedural generation, input logic, and pure shared utilities.
- `public/`: static assets, generated previews, wasm, and shared public files.
- `reference/`: archived pre-migration source snapshots that remain available for
  reconstruction work but are not part of the live runtime.
- `android/`: the single Capacitor Android shell generated from the root app.

## Docs Map

- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md): runtime structure and cabinet contracts
- [docs/DESIGN.md](./docs/DESIGN.md): cabinet identity and per-cartridge pillars
- [docs/STATE.md](./docs/STATE.md): current branch state and remaining per-game work
- [docs/TESTING.md](./docs/TESTING.md): canonical validation policy
- [docs/VISUAL_REVIEW.md](./docs/VISUAL_REVIEW.md): screenshot and visual acceptance rules
- [docs/LAUNCH_READINESS.md](./docs/LAUNCH_READINESS.md): manual release checklist
- [docs/PRODUCTION.md](./docs/PRODUCTION.md): remaining 1.0 release blockers
- [docs/REPOSITORY_MAP.md](./docs/REPOSITORY_MAP.md): live vs archived code and asset ownership

## Development

```bash
pnpm install
pnpm dev
pnpm test
pnpm test:e2e
pnpm build
```

## Android

```bash
pnpm android:sync
pnpm android:build
```
