---
title: Copilot Instructions
description: AI coding assistant rules for Arcade Cabinet.
---

# Arcade Cabinet Copilot Rules

- **Tech Stack**: Rely heavily on `react@19`, `tailwindcss@4`, `@react-three/fiber`, and `@react-three/rapier`.
- **Styling**: Do not use CSS modules or standard CSS files for component styling. Stick entirely to Tailwind v4 utility classes or inline styles where dynamic scaling requires it.
- **Physics**: Do not import or suggest `@react-three/cannon`. We are strictly standardized on `@react-three/rapier`.
- **State Management**: Prefer updating game state via `koota` entity traits instead of sprawling `useState` hooks, especially within `useFrame` loops, to avoid `Maximum update depth exceeded` crashes.
- **Layout**: Always enforce `height: 100svh` and `overflow: hidden` for the top-level game `<div />` wrapping a `<Canvas />`.
