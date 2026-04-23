title: Engine Pillar
updated: 2026-04-23
status: current
domain: technical
---

# Engine Pillar

This document owns the pure-simulation side of the cabinet.

## Core Rule

If it changes scoring, progression, win/loss state, route choice, or difficulty,
it belongs in `src/`, not `app/`.

## What Lives Here

- session-mode tuning,
- deterministic start state,
- scoring,
- objective routing,
- AI or hazard rules,
- save snapshots,
- event telemetry needed by UI/R3F,
- recoverability and failure rules.

## What Does Not Live Here

- decorative particles,
- camera sway,
- one-off animation timing with no gameplay effect,
- CSS-only state,
- label presentation copy.

## Cabinet Guidance

Not every game uses the same internal pattern. Some use a small deterministic
reducer-style loop, some use Three/Rapier orchestration, and some still keep a
limited ECS bridge. The standard is not one engine framework. The standard is
deterministic logic with test ownership in `src/games/<slug>`.
