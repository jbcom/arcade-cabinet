---
title: Arcade Cabinet
description: A single Capacitor/Vite cabinet for high-fidelity web and Android games.
author: Arcade Cabinet Team
last_updated: 2026-04-22
---

# Arcade Cabinet

![Arcade Cabinet Hero](public/hero.png)

Arcade Cabinet is one React, Vite, and Capacitor app that contains every playable game. The same codepath serves desktop web, mobile web, GitHub Pages, and Android.

## Architecture

- `app/`: routes, cabinet views, React components, R3F scenes, HUDs, styles, and browser-facing presentation.
- `src/`: game logic, state, systems, math, procedural generation, input logic, and pure shared utilities.
- `public/`: static assets, generated previews, wasm, and shared public files.
- `android/`: the single Capacitor Android shell generated from the root app.

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
