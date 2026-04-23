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

## Current Feature and Polish Pass

- Constellation completion now exposes the next-pattern preview and rewards completion with a resonance bloom bonus.
- Standard and cozy sessions now have deterministic recovery blooms that can save the last ball after real constellation progress or high cold pressure.
- Active constellation edges pulse by completion state, while completed links gain stronger glow.
- Launch and drain pulses make lower-table feedback more visible before the next ball action.
- Recovery bloom pulses and the HUD save counter make the ball-save valve visible without changing challenge mode.
- The cabinet landing uses the shared cartridge frame with a cosmic label, play control, and rules drawer before the tutorial step.

## Gameplay Systems

- `src/engine/cosmicGardenSimulation.ts` owns deterministic starter gardens, star growth stages, energy transfer, void-zone placement, pinball orb creation, flipper stepping, drain detection, and bumper collision response.
- `src/engine/cosmicSession.ts` owns session-mode tuning, void-zone scaling, and last-ball recovery bloom rules.
- `useEnergyRouting` and `usePinballPhysics` orchestrate React state around those pure systems instead of generating gameplay IDs and layouts with runtime randomness.
- Starter stars are mapped directly to constellation points, while completion still requires routing the authored pattern connections.

## Responsive and Android Contract

- Board coordinates stay percentage-based.
- The root fills its parent with `GameViewport`.
- The layout should compose vertically on portrait phones and wider inside the arcade cabinet.
- The standalone app shell remains Capacitor-ready through the shared Vite app structure.
- Browser and e2e coverage stay inside the shared Vitest Browser harness.

## Stack

React, Framer Motion
