---
title: Visual Review
updated: 2026-04-23
status: in-progress
domain: visual
---

# Visual Review

This document owns the cabinet-level visual acceptance rules. Detailed
per-cartridge notes live in [game-visual-audit-2026-04-22.md](./game-visual-audit-2026-04-22.md).

## Shared Acceptance

- The cabinet browser must read as one physical machine.
- Cartridge labels must share framing and typography while preserving distinct
  color, motif, and voice.
- Gameplay views must preserve that promise instead of collapsing into generic
  placeholder geometry or unreadable HUD overlays.

## Screenshot Contract

- Cabinet: desktop, mobile, tablet.
- Every landing: desktop and mobile.
- Every gameplay route: desktop and mobile.
- Screenshots must be regenerated after meaningful presentation changes.

## Common Failure Modes

- Black or empty scene.
- Overlapping joystick, HUD, or action buttons.
- Label copy that reads like internal implementation notes.
- Mobile portrait framing that hides the next required action.
- Placeholder geometry that still reads like a POC.

## Current Focus

The next visual pass should prioritize:

1. cabinet gallery transition polish,
2. landing-label polish across all 12 games,
3. late-run scene identity for the weakest cartridges,
4. Android portrait readability after the next feature wave.
