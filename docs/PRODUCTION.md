---
title: Production Checklist
updated: 2026-04-23
status: in-progress
domain: release
---

# Production Checklist

This document owns what still blocks a polished 1.0 release. Daily progress
context lives in [STATE.md](./STATE.md). Pre-submit verification lives in
[LAUNCH_READINESS.md](./LAUNCH_READINESS.md).

## 1.0 Definition

Arcade Cabinet 1.0 is:

- one store-ready Capacitor app,
- 12 launch-track cartridges only,
- 8-15 minute default loops in `standard`,
- local save/resume and settings,
- coherent cabinet-wide visual identity,
- mobile, desktop web, GitHub Pages, and Android parity,
- green validation across lint, typecheck, unit, browser/e2e, build, and Android.

## Shipping Targets

| Target | Status | Remaining work |
| --- | --- | --- |
| Desktop web | Active | Final polish and docs alignment. |
| Mobile web | Active | Per-game touch/readability tuning remains. |
| Android debug | Active | Keep smoke-testing during polish. |
| Android release AAB | Active | Final store metadata, icon/splash, and release signoff remain. |
| GitHub Pages | Active | Re-verify after each major cabinet polish merge. |

## Shared 1.0 Blockers

- Every cartridge must finish its remaining work in [STATE.md](./STATE.md).
- Every landing and gameplay route needs current screenshot evidence.
- No black canvas, unreadable HUD, broken save/resume, or overlapping mobile
  controls can remain.
- Cabinet docs and AGENTS guidance must match the actual repo state.

## Store/Release Blockers

- Final production icon, splash, and store screenshots.
- Signed release/AAB verification.
- Privacy policy route and data-safety disclosure verified against actual code.
- Large-screen and rotate/resize behavior verified for the single app shell.

## Post-1.0 Work

Anything outside the 12 launch cartridges, any new imports, and any major
content expansion are post-1.0 by default unless the owner explicitly reopens
scope.
