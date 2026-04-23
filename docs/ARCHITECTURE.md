---
title: Architecture
updated: 2026-04-23
status: current
domain: technical
---

# Architecture

This document owns the cabinet runtime, directory structure, and data flow.
Product intent lives in [DESIGN.md](./DESIGN.md). Validation policy lives in
[TESTING.md](./TESTING.md). Release gating lives in
[LAUNCH_READINESS.md](./LAUNCH_READINESS.md) and [PRODUCTION.md](./PRODUCTION.md).

## System Overview

```text
React Router cabinet shell
  -> shared cartridge frame, circular gallery, cabinet menu, settings, save/resume
  -> per-game React presentation in app/games/<slug>
  -> deterministic mechanics in src/games/<slug>
  -> shared static assets and wasm in public/
  -> one Capacitor Android shell in android/
```

## Root Layout

```text
app/
  arcade/               # cabinet routes, gallery, cartridge browser, route shell
  games/<slug>/         # game React entry, HUD, scenes, landing labels, transitions
  shared/               # cabinet runtime UI, hooks, joystick, atoms, global styles

src/
  games/<slug>/         # deterministic simulation, state, systems, domain types
  shared/               # session mode, save models, runtime helpers, pure utilities

public/                 # wasm, static assets, icons, favicons, generated labels/previews
android/                # single Capacitor Android app built from dist/
e2e/                    # Vitest Browser cabinet, landing, and gameplay coverage
docs/                   # product, technical, testing, visual, and release ownership docs
reference/              # archived pre-migration source snapshots for salvage/reference
```

## Asset Layout

```text
public/assets/
  cabinet/              # shared cabinet art such as the social/hero image
  games/<slug>/
    labels/             # cartridge label art and presentation textures
    previews/           # runtime previews used by the cabinet shell
    reference/          # non-runtime reference art kept with the active game
    wasm/               # game-specific wasm payloads when required
  reference/            # archived public artifacts from pre-migration branches
```

Runtime assets belong in `public/assets`. Screenshot evidence belongs in
`test-screenshots/`. Archived branch assets belong in `public/assets/reference/`.

## Runtime Contracts

### Cabinet shell

- `/` is the cabinet browser.
- `/games/:slug` is the fullscreen cartridge route.
- All cartridges start from the same frame language: title, label surface, rules,
  mode selector, and standardized start action.
- `app/shared/ui/CabinetRuntime.tsx` owns pause, rules, settings, result recording,
  and failure fallback behavior.

### Deterministic game split

- `app/` may compose UI state, scene transitions, input wiring, and transient
  effects.
- `src/` owns anything that affects scoring, failure, progression, route choice,
  or end-of-run outcomes.
- UI-only particles, glow, camera sway, and decorative timing stay out of pure
  logic unless another layer needs deterministic event timing.

### Session model

- Every launch cartridge exposes `cozy`, `standard`, and `challenge`.
- `standard` is the 1.0 default and must support an 8-15 minute run with one
  recoverable mistake.
- Local persistence stores settings, best score, last selected mode, milestones,
  and one active save slot per game.

## Launch Cartridges

The cabinet 1.0 launch scope is fixed to 12 cartridges:

1. Bioluminescent Sea
2. Cosmic Gardener
3. Enchanted Forest
4. Entropy Edge
5. Mega Track
6. Otterly Chaotic
7. Overcast Glacier
8. Primordial Ascent
9. Titan Mech: Overheat
10. Beppo Laughs
11. Cognitive Dissonance
12. Farm Follies

No Astro routes, package workspaces, or per-game shells are part of the current
architecture. Voxel Realms remains out of cabinet scope.

Pre-migration workspace code that still matters for archaeology has been copied
into `reference/copilot-setup-vite-biome-typescript-stack/`. That tree is
reference-only and must not be treated as live runtime code.

## Shared Technical Rules

- Tailwind v4 is the UI styling baseline.
- React Router owns routing.
- Vitest Browser is the canonical browser and screenshot harness.
- Direct Playwright is diagnostic only when the browser harness cannot surface a
  visual issue.
- Touch-anywhere joystick is the default movement pattern for movement games.
- Parent-sized layout is mandatory. Games must size from their container, not
  `window.innerWidth` or `window.innerHeight`.
- Android packaging comes from the same Vite output used by web and GitHub Pages.

## Remaining Technical Work

- Finish shared cabinet gallery-to-landing transition polish so every cartridge
  label feels like one physical cabinet flow.
- Audit every cartridge for strict save/resume parity and pause-menu coverage.
- Remove or replace any lingering generic placeholder geometry that still reads
  like a POC instead of final presentation.
- Keep moving ad hoc per-game UI helpers into `app/shared` only where reuse is
  real; do not create a second hidden framework.
