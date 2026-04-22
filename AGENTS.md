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

## Current Cabinet Launch Intake

This repo is the single Vite/React/Capacitor arcade cabinet with the root split:

```text
app/      # routes, React views, R3F scenes, HUDs, styles, cartridge labels
src/      # pure game logic, systems, input normalization, deterministic state
public/   # shared static assets, wasm, previews, generated labels
android/  # single Capacitor Android app
```

The cabinet must feel like one physical arcade cabinet with game cartridges, not a portfolio of POC descriptions. Every imported game needs:

- A cartridge label identity in the cabinet browser: shared cabinet frame, shared typography/framing rules, unique label colors/art direction/title voice.
- A playable web route under `app/games/<slug>` and deterministic logic under `src/games/<slug>`.
- Touch-anywhere joystick or pointer/touch parity as appropriate. Do not reintroduce fixed D-pad controls.
- Desktop and mobile Vitest Browser screenshots proving nonblank render and readable first interaction.
- README/changelog notes that explain the core identity, loop, and mobile/Android assumptions without marketing-spec filler.

Incoming cabinet work:

- Beppo Laughs: import as a maze/escape cartridge only after controls, goal, pressure, and first-15-second readability are defined.
- Cognitive Dissonance: import as an atmospheric state-intervention cartridge with legible player goal and consequences.
- Farm Follies: import or link from the canonical stacker repo once the drop/stack/merge loop is stable enough for cabinet presentation.
- Overcast: Glacier: import as a reduced downhill kitten arcade loop: warmth/cocoa, one snowman enemy, one kick, one photo/flash power-up, and touch controls.
- Titan Mech / Overheat: merge Overheat's extraction, heat, cockpit, ore, hopper, cube, tractor/silo, and contract ideas into the current Titan Mech cabinet game without importing a second app shell.

Voxel Realms has left the cabinet. It now lives in `arcade-cabinet/voxel-realms` as a standalone public repo, with Bok carrying a note to evaluate its techniques later. Keep Voxel Realms out of active cabinet launch planning unless there is a new explicit owner decision.
