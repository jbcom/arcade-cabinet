---
title: Interface Pillar
description: Shared UI components, styling, and layout conventions.
---

# Interface Pillar: Tailwind & Overlays

The UI layer is designed to be lightweight, modular, and non-intrusive to the WebGL canvases.

## Standards

1. **Styling**: **Tailwind CSS v4** is the absolute standard. No CSS Modules, no styled-components.
2. **Container Layout**: Every game's outermost container MUST use `height: 100svh`, `width: 100%`, and `overflow: hidden`. This prevents iOS/Android navigation bar collapsing and guarantees that Vitest Browser interactions trigger correctly without scrolling.
3. **Shared Components**: The `@arcade-cabinet/shared` package provides standardized generic components:
   - `<HUDOverlay>`: A 4-corner flexbox layout for game scores and timers.
   - `<StartScreen>` & `<GameOverScreen>`: Unified menu states.
   - `<OverlayButton>`: Reusable, accessible game buttons.

## Reactive UI
Because game logic lives in Koota ECS, the React UI uses `useTrait()` to subscribe to game variables. This ensures the React tree only re-renders when specific traits (like `PhaseTrait` or `ScoreTrait`) change, completely ignoring 60FPS position data.
