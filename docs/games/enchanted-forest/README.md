# Enchanted Forest

A gesture and rhythm defense game about protecting sacred trees by drawing musical runes.

## Creative Pillars

- Gesture spellcasting: drawing is the primary verb, not a menu shortcut.
- Sacred grove protection: tree health and incoming corruption define the tactical read.
- Music reinforces intent: audio feedback should make each spell feel deliberate.
- Theatrical depth: the grove should read as a stage with ward rings, roots, standing stones, and foreground gesture energy, not a flat ambience layer.

## Presentation Direction

The grove should feel theatrical and hand-authored. Trees form a readable stage line, corruption advances as visible waves, and rune drawing owns the foreground. Emerald, violet, and warm firefly accents separate safe life, magic, and threat. The browser capture path uses a full page screenshot because decorative canvases are only part of the stage; trees, ward rings, UI, and pointer/touch drawing must be verified together.

## Current Feature and Polish Pass

- Ritual cue telemetry now recommends the next shield/heal/purify decision from pure state, including target tree, mana readiness, threat band, nearest shadow distance, and harmony hint.
- The HUD surfaces the recommended rune on desktop and mobile so the first minute reads as deliberate spell grammar instead of hidden trial-and-error.
- Grove and tree lighting now follow the ritual cue with target rings, draw-path guidance, and focus labels.
- Standard and cozy mode now soften opening shadow hits so the first minute stays recoverable while the player learns the spell cadence; challenge mode keeps full damage pressure.
- Rune cadence now builds harmony surge state through alternating spell types.
- Shadow intent paths are generated from pure logic and rendered as visible telegraphs toward targeted trees.
- Mobile rune affordances are larger and easier to read while shield, heal, and purify remain distinct.
- The cabinet landing uses the shared cartridge frame with a grove label, play control, and rules drawer.

## Simulation and Test Boundaries

`src/engine/forestSimulation.ts` owns deterministic wave spawning, tree state, spell application, shadow movement, wave transitions, threat scoring, and rune gesture classification. Rendering components consume those helpers instead of keeping gameplay math and random spawn rules in React effects.

Coverage is split between pure Vitest simulation tests and Vitest Browser plugin flow/e2e screenshots. Browser verification stays within the Vitest browser provider; the game package does not use direct Playwright commands.

## Responsive and Android Contract

- Tree positions and spell coordinates are percentage-based.
- The game root fills its parent with `GameViewport`.
- Touch drawing must remain the first-class input path for mobile web and Android.
- Desktop pointer input should mirror the touch spell path.
- The full viewport screenshot mode protects DOM/canvas hybrid games from accidentally verifying only a decorative canvas.

## Stack

React, Framer Motion, Canvas, Tone.js
