# Entropy Edge

A 3D pressure puzzle about stabilizing a collapsing grid before sector stability reaches zero.

## Creative Pillars

- Spatial logic under pressure: movement, falling blocks, and targets must be readable at speed.
- Collapsing-system tension: timer, shake, and falling geometry create urgency.
- Readable anchor objectives: anchors should always stand apart from hazards.

## Presentation Direction

The grid is a failing machine room in abstract space. Cyan player light, dark tiles, falling blocks, magenta anchors, low fog, and a slow camera orbit should make the scene feel like a tactical diorama rather than a flat board.

## Responsive and Android Contract

- The canvas fills its parent with `GameViewport`.
- Orbit controls frame the full grid instead of requiring fine panning.
- Keyboard is supported on desktop; mobile and Android work as a presentation target while touch controls are a follow-up interaction layer.
- The package has a standalone Vite/Capacitor app shell.

## Stack

React Three Fiber, Koota
