title: Interface Pillar
updated: 2026-04-23
status: current
domain: design-system
---

# Interface Pillar

This document owns the cabinet-facing UI rules.

## Core Rule

The cabinet should feel standardized without flattening every game into the same
label or HUD.

## Shared UI Rules

1. Tailwind v4 is the shared styling baseline.
2. The cabinet frame, typography, mode selector, rules drawer, pause menu, and
   settings shell are shared.
3. Game-specific visual language belongs inside the cartridge label and gameplay
   route, not in the global cabinet chrome.
4. Movement games use touch-anywhere joystick; do not regress to fixed D-pads.
5. Controls and HUD must remain readable in portrait mobile play.

## Current Work

- Keep tightening the circular gallery, label zoom, and landing transition so
  browsing feels like loading cartridges into one cabinet.
- Remove residual internal-spec copy from labels and public routes.
