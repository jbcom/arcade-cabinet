---
title: AI Agents Architecture
description: Overview of the AI models and systems powering the workspace.
system: Ralph Wiggum / Gemini
---

# AI Agents Architecture

This repository is actively maintained and evolved through a coalition of AI agents.

## Primary Operators

- **Gemini CLI (Subagent)**: Handles deep-dive refactoring, long-context comprehension, and rigorous visual verification via automated browser testing. Follows strict rules for dependency deduplication and UI/UX layout fixing.
- **Claude / Sonnet (Orchestrator)**: The primary workflow director driving structural decisions, establishing the monorepo architecture, and guiding the Gemini CLI subagent.

## Core Rules

1. **No Shortcuts**: All code changes require comprehensive empirical reproduction and validation.
2. **Visual Verification**: All games must be proven to render using Vitest browser screenshots.
3. **No Primitives**: 2D ports require actual effort to map into 3D using composite shapes, not simple capsules.

## Current Cabinet Launch State

This repo is the single Vite/React/Capacitor arcade cabinet with the root split:

```text
app/      # routes, React views, R3F scenes, HUDs, styles, cartridge labels
src/      # pure game logic, systems, input normalization, deterministic state
public/   # shared static assets, wasm, previews, generated labels
android/  # single Capacitor Android app
```

The cabinet must feel like one physical arcade cabinet with game cartridges, not a portfolio of POC descriptions. Every active cartridge needs:

- A cartridge label identity in the cabinet browser: shared cabinet frame, shared typography/framing rules, unique label colors/art direction/title voice.
- A playable web route under `app/games/<slug>` and deterministic logic under `src/games/<slug>`.
- Touch-anywhere joystick or pointer/touch parity as appropriate. Do not reintroduce fixed D-pad controls.
- Desktop and mobile Vitest Browser screenshots proving nonblank render and readable first interaction.
- README/changelog notes that explain the core identity, loop, remaining work, and mobile/Android assumptions without marketing-spec filler.

Current launch scope is fixed to 12 cartridges:

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

Shared 1.0 rules:

- `standard` mode targets an 8-15 minute run and must allow one recoverable mistake.
- Touch-anywhere joystick remains the movement standard for movement games.
- Vitest Browser remains the canonical browser/e2e/screenshot harness.
- Direct Playwright is diagnostic only.
- `app/` owns presentation; `src/` owns deterministic mechanics.
- The circular gallery, cartridge label, landing frame, and pause/settings shell are one cabinet-wide identity.

Documentation expectations:

- Root docs in `docs/` own architecture, design, state, testing, visual review, launch readiness, and production blockers.
- `docs/REPOSITORY_MAP.md` owns the canonical map of live runtime code, runtime assets, verification artifacts, and archived pre-migration source snapshots.
- Per-game docs under `docs/games/<slug>/` should explain identity, loop, current polish, and remaining work.
- Keep docs aligned to the real codebase. Do not leave migration-era future tense in place once a game is already imported.

Source-of-truth rules:

- `app/games/<slug>` is the live React/presentation entry for an active cartridge.
- `src/games/<slug>` is the live deterministic mechanics/source of truth for that cartridge.
- `public/assets/games/<slug>` is the live runtime asset root for that cartridge. Organize assets under `labels/`, `previews/`, `reference/`, and `wasm/`.
- `test-screenshots/` is the canonical checked-in screenshot evidence tree. Do not treat it as runtime art.
- `reference/` and `public/assets/reference/` are archival only. They exist so future agents can salvage old package-era implementations without hunting old branches.

Voxel Realms has left the cabinet. It now lives in `arcade-cabinet/voxel-realms` as a standalone public repo, with Bok carrying a note to evaluate its techniques later. Keep Voxel Realms out of active cabinet launch planning unless there is a new explicit owner decision.
