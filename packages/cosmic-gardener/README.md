# Cosmic Gardener

A pinball puzzle garden where the player plants stars, routes energy, and keeps the cosmic ball alive long enough to complete constellations.

## Creative Pillars

- Pinball energy: launch, bounce, drain, and flipper timing should always be legible. Rails, lower pockets, the plunger lane, and bumper stars create the first read.
- Readable constellation routing: the board must communicate which stars matter and why. Each level starts from a deterministic nursery of constellation-aligned bumper stars, so the pattern is visible before the player acts.
- Wonder without visual clutter: nebula dust, streams, and hit effects reinforce state changes instead of hiding the table.
- Cosmic gardening, not empty space: the player should feel like they are cultivating a living tabletop instrument rather than staring into a blank background.

## Presentation Direction

The game is a cosmic tabletop. The player reads the table frame, lower flippers, launcher, nursery stars, and constellation goal as one composed scene. Warm star golds and pinks sit over a cooler nebula field, with energy streams acting as functional visual feedback.

Browser screenshots use page capture instead of selecting the largest canvas because this game is a DOM-composited pinball table with canvas-backed atmosphere. The screenshot contract should show the full table, HUD, stars, flippers, launcher, and constellation overlay.

## Gameplay Systems

- `src/engine/cosmicGardenSimulation.ts` owns deterministic starter gardens, star growth stages, energy transfer, void-zone placement, pinball orb creation, flipper stepping, drain detection, and bumper collision response.
- `useEnergyRouting` and `usePinballPhysics` orchestrate React state around those pure systems instead of generating gameplay IDs and layouts with runtime randomness.
- Starter stars are mapped directly to constellation points, while completion still requires routing the authored pattern connections.

## Responsive and Android Contract

- Board coordinates stay percentage-based.
- The root fills its parent with `GameViewport`.
- The layout should compose vertically on portrait phones and wider inside the Astro cabinet.
- The standalone app shell remains Capacitor-ready through the shared Vite app structure.
- Browser and e2e coverage stay inside the shared Vitest Browser harness.

## Stack

React, Framer Motion
