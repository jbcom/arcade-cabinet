---
title: State
updated: 2026-04-23
status: in-progress
domain: context
---

# State

This document records what exists in the cabinet right now and what remains
before a polished 1.0. It should be the first stop before opening feature work.
Longer-horizon release framing lives in [PRODUCTION.md](./PRODUCTION.md).

## Current Baseline

- The repo is a single Vite/React/Capacitor cabinet using `app | src | public`.
- The launch track is fixed to 12 cartridges.
- Shared session mode, save/resume, settings, pause menu, cabinet routes, and
  cartridge label framing are already in the app.
- Canonical browser coverage and screenshots run through Vitest Browser.
- Android debug and release bundle paths are wired from the same build output.

## Current Branch Focus

The branch is still in the 1.0 polish phase. The work is no longer migration.
The remaining job is feature completion, visual coherence, responsive hardening,
and release discipline.

## Remaining 1.0 Work By Cartridge

| Game | Remaining highest-value work |
| --- | --- |
| Bioluminescent Sea | Add replay modifiers and verify late-route landmark identity stays strong on mobile. |
| Cosmic Gardener | Playtest zen finish pacing and add late-pattern table dressing only if it improves readability. |
| Enchanted Forest | Deepen later-wave grove variety without weakening rune legibility. |
| Entropy Edge | Add replayable sector modifiers and finish reserve-economy tuning. |
| Mega Track | Tune longer cup pacing and add optional late-leg modifiers without obscuring hazard reads. |
| Otterly Chaotic | Add arena event variants and continue simplifying rescue read for first-time players. |
| Overcast Glacier | Increase late-route segment variety while preserving reduced-scope clarity. |
| Primordial Ascent | Strengthen portrait touch grapple feel and final climb-route variation. |
| Titan Mech: Overheat | Refine the contract-upgrade loop and tighten extraction/combat balance over multi-contract runs. |
| Beppo Laughs | Expand room-event variety and tune route length to stay inside the 8-15 minute target. |
| Cognitive Dissonance | Tune full-shift pacing and ending readability now that runtime feedback fallback is in place. |
| Farm Follies | Add late-run tier variety and keep banking decisions readable under tower chaos. |

## Remaining Shared Work

- Full visual audit pass for all landings and gameplay routes after the next
  polish wave.
- Shared cabinet gallery transition polish so selecting a cartridge feels like
  loading the same physical machine.
- Android release hardening: final metadata, icons, screenshots, and policy docs.
- Final pass on docs so every root domain and cartridge has a current owner doc.

## Repo Decisions That Remain In Force

- Astro is gone and should stay gone.
- Direct Playwright is not the canonical test path.
- Voxel Realms remains standalone and out of cabinet scope.
- Removed/standalone repos are source context only, not cabinet imports.
