# Mega Track

A high-speed lane racer about reading a deterministic hazard ribbon early and making decisive lane changes.

## Creative Pillars

- Instant lane reads: the player should know the safe lane without parsing detail.
- Toy-scale speed: the car and track should feel exaggerated and physical.
- Impact clarity: crashes need to be understandable, not surprising.
- Fair opening rhythm: early hazards teach side-lane reads before the center lane becomes dangerous.

## Systems Contract

- `createInitialState` seeds an authored obstacle run so screenshots and Android boots never start on an empty track.
- `createObstacle(index)` is deterministic and replaces all random spawning.
- `tick` owns acceleration, lane clamps, obstacle cleanup/spawn extension, swept collision checks, integrity, impact count, and boost charge.
- Browser and engine tests must not mock `Math.random`; the game should be reproducible from pure inputs.

## Presentation Direction

Mega Track is an arcade tabletop racer staged as a dark asphalt ribbon suspended in bright air. Cyan and yellow rails frame the safe play space, checkpoint gates sell speed, and composite cars/cones/barriers replace POC cubes while keeping obstacle silhouettes readable.

## Current Feature and Polish Pass

- Overdrive, clean-pass, and impact timing now persist as deterministic telemetry in the pure race state.
- The R3F scene renders overdrive lane strips, road speed lines, recent clean-pass rings, impact sparks, and differentiated hazard bases.
- The HUD calls out recent impact type and clean-lane feedback without obscuring the road.
- The cabinet landing uses the shared cartridge frame with a track label, play control, and rules drawer.

## Responsive and Android Contract

- The root fills its parent with `GameViewport`.
- Input reduces to left/right lane choice, mapped to keyboard and on-screen pointer controls.
- The package has a standalone Vite/Capacitor app shell.
- The fixed chase camera widens for portrait while keeping the player car, lane markers, and next hazards visible.
- Vitest Browser captures page-mode desktop and mobile screenshots through the shared harness.

## Stack

React Three Fiber, Vitest Browser
