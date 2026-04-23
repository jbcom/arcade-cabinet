title: Physics Pillar
updated: 2026-04-23
status: current
domain: technical
---

# Physics Pillar

This document owns spatial simulation guidance for the cabinet.

## Core Rule

Use a physics stack only when the game loop actually benefits from it.
Determinism and readability matter more than engine purity.

## Current Cabinet Reality

- `@react-three/rapier` is used where it materially helps.
- Some launch cartridges are not physics-first and should stay that way.
- WASM assets required by physics-backed routes must live in `public/` and stay
  Android-safe.

## Rules

1. Do not add a physics engine just to imitate depth.
2. If physics affects gameplay, expose the outcome through deterministic state or
   deterministic event fields.
3. Keep mobile performance in mind before adding more rigid bodies or particles.
4. Never let physics hide the next player decision.
