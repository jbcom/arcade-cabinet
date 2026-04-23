---
title: Repository Map
updated: 2026-04-23
status: current
domain: technical
---

# Repository Map

This document is the canonical map of live runtime code, runtime assets,
verification artifacts, and archived pre-migration source snapshots.

## Live Runtime Trees

```text
app/
  arcade/               # cabinet routes, gallery, transitions, shared shell
  games/<slug>/         # React entry, landing, HUD, scene composition
  shared/               # shared UI atoms, cabinet shell, joystick, hooks

src/
  games/<slug>/         # deterministic rules, systems, simulation, state
  shared/               # save models, session modes, pure runtime helpers

public/assets/
  cabinet/              # cabinet-wide runtime imagery
  games/<slug>/         # per-cartridge runtime assets
  reference/            # archived public artifacts from old branches

docs/games/<slug>/      # human-readable ownership docs for each live cartridge
test-screenshots/       # checked-in visual proof, never runtime assets
```

## Launch Cartridges

Each active cartridge has four authoritative locations:

1. `app/games/<slug>`
2. `src/games/<slug>`
3. `docs/games/<slug>`
4. `public/assets/games/<slug>`

Active slugs:

- `beppo-laughs`
- `bioluminescent-sea`
- `cognitive-dissonance`
- `cosmic-gardener`
- `enchanted-forest`
- `entropy-edge`
- `farm-follies`
- `mega-track`
- `otterly-chaotic`
- `overcast-glacier`
- `primordial-ascent`
- `titan-mech`

## Runtime Asset Rules

Per-game runtime assets live under `public/assets/games/<slug>/` with the same
subdirectory contract for every active cartridge:

- `labels/`: cartridge label art, in-frame graphic treatments, and future print-like surfaces.
- `previews/`: runtime preview images or lightweight presentation assets used by the cabinet shell.
- `reference/`: non-runtime reference art retained with the live cartridge for reconstruction work.
- `wasm/`: game-specific wasm payloads when required by the live runtime.

Current live shared asset roots:

- `public/assets/cabinet/hero.png`
- `public/assets/games/primordial-ascent/wasm/rapier_wasm3d_bg.wasm`
- `public/assets/games/primordial-ascent/reference/primordial-start-screen.png`
- `public/assets/games/titan-mech/wasm/rapier_wasm3d_bg.wasm`

The machine-readable companion manifest is `public/assets/manifest.json`.

## Verification Artifacts

These are checked-in proof artifacts, not runtime assets:

- `test-screenshots/cabinet/`: cabinet desktop/mobile/tablet captures.
- `test-screenshots/landings/`: one landing capture per active cartridge and viewport.
- `test-screenshots/games/`: gameplay captures per active cartridge and viewport.
- `test-screenshots/components/`: targeted shared/component captures.

If a runtime issue is found, update the implementation in `app/`, `src/`, or
`public/assets/` and then regenerate the evidence in `test-screenshots/`.

## Archived Source Snapshots

Pre-migration workspace code has been copied into:

- `reference/copilot-setup-vite-biome-typescript-stack/`
- `public/assets/reference/copilot-setup-vite-biome-typescript-stack/`

Those trees exist so future agents can salvage package-era implementations
without needing the deleted branches or remote history to still be available.

What the archive contains:

- package-era source in `packages/`
- Astro and per-game shell source in `apps/`
- workspace root manifests and config
- old docs, e2e, shared test harness code, and workflow config
- `pending/` POC material carried forward from that branch
- selected historical public artifacts and screenshots

What it does not mean:

- archived code is not authoritative for the current runtime
- archived `apps/*` shells are not the current deployment path
- archived public artifacts are not the current runtime asset roots

## Decision Rule

When there is a disagreement between the live tree and the archive:

1. Trust `app/`, `src/`, `public/assets/`, and `docs/games/` first.
2. Use `test-screenshots/` to confirm current visual behavior.
3. Use `reference/` only to recover missing ideas, assets, or logic intentionally.
