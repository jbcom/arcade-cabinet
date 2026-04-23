# Entropy Edge

A 3D pressure puzzle about stabilizing a collapsing grid before sector stability reaches zero.

## Creative Pillars

- Spatial logic under pressure: movement, falling blocks, and targets must be readable at speed. The route line, highlighted tiles, and vector HUD make the next anchor legible from the first frame.
- Collapsing-system tension: timer, shake, seeded falling geometry, landed blocks, and shockwaves create urgency without hiding the board.
- Readable anchor objectives: anchors should always stand apart from hazards. Deterministic placement protects the player cell and current anchor while still filling the sector with pressure.
- Tactical diorama: the sector should read as a failing machine table with rails, rift pillars, guide seams, route beacons, hazard marks, and suspended blocks rather than a flat diamond.

## Presentation Direction

The grid is a failing machine room in abstract space. Cyan player light, dark tiles, falling blocks, magenta anchors, low fog, rift pillars, and a slow camera orbit should make the scene feel like a tactical diorama rather than a flat board.

Browser screenshots use page capture so the R3F canvas, HUD, vector readout, and mobile directional controls are verified together through the Vitest Browser harness.

## Current Feature and Polish Pass

- Max resonance now produces a deterministic surge event that clears or weakens a nearby blocked cell.
- The pure engine exposes a sector cue with objective text, pressure state, route bearing, recommended move, and nearest falling-cell metadata.
- Route beacons, brighter hazard markings, responsive portrait camera framing, and a stronger sector frame make the board readable in desktop and mobile screenshots.
- Resonance bands around the player make stability state readable without relying only on HUD text.
- Three.js color alpha usage was replaced with explicit opacity so R3F rendering is stable.
- The cabinet landing uses the shared cartridge frame with an abstract grid label, play control, and rules drawer.

## Gameplay Systems

- `src/engine/simulation.ts` owns deterministic anchor selection, seeded block fields, falling-block spawn choice, movement cooldowns, stability bands, sector cues, target vectors, scoring, resonance, shockwaves, and win/loss transitions.
- The React layer owns input capture, Koota state synchronization, and rendering orchestration.
- Runtime randomness is avoided in gameplay placement and camera shake so unit tests, browser screenshots, cabinet routes, and Android builds reproduce the same sector composition.

## Responsive and Android Contract

- The canvas fills its parent with `GameViewport`.
- Orbit controls frame the full grid instead of requiring fine panning.
- Keyboard is supported on desktop; mobile and Android expose compact directional controls over the same percentage-based grid.
- The package has a standalone Vite/Capacitor app shell.
- Browser and e2e coverage stay inside the shared Vitest Browser harness.

## Stack

React Three Fiber, Koota
