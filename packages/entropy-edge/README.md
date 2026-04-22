# Entropy Edge

A 3D pressure puzzle about stabilizing a collapsing grid before sector stability reaches zero.

## Creative Pillars

- Spatial logic under pressure: movement, falling blocks, and targets must be readable at speed. The route line, highlighted tiles, and vector HUD make the next anchor legible from the first frame.
- Collapsing-system tension: timer, shake, seeded falling geometry, landed blocks, and shockwaves create urgency without hiding the board.
- Readable anchor objectives: anchors should always stand apart from hazards. Deterministic placement protects the player cell and current anchor while still filling the sector with pressure.
- Tactical diorama: the sector should read as a failing machine table with rails, rift pillars, guide seams, and suspended blocks rather than a flat diamond.

## Presentation Direction

The grid is a failing machine room in abstract space. Cyan player light, dark tiles, falling blocks, magenta anchors, low fog, rift pillars, and a slow camera orbit should make the scene feel like a tactical diorama rather than a flat board.

Browser screenshots use page capture so the R3F canvas, HUD, vector readout, and mobile directional controls are verified together through the Vitest Browser harness.

## Gameplay Systems

- `src/engine/simulation.ts` owns deterministic anchor selection, seeded block fields, falling-block spawn choice, movement cooldowns, stability bands, target vectors, scoring, resonance, shockwaves, and win/loss transitions.
- The React layer owns input capture, Koota state synchronization, and rendering orchestration.
- Runtime randomness is avoided in gameplay placement and camera shake so unit tests, browser screenshots, Astro islands, and Android builds reproduce the same sector composition.

## Responsive and Android Contract

- The canvas fills its parent with `GameViewport`.
- Orbit controls frame the full grid instead of requiring fine panning.
- Keyboard is supported on desktop; mobile and Android expose compact directional controls over the same percentage-based grid.
- The package has a standalone Vite/Capacitor app shell.
- Browser and e2e coverage stay inside the shared Vitest Browser harness.

## Stack

React Three Fiber, Koota
