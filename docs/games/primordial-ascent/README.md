# Primordial Ascent

A procedural grappling climb where the player escapes rising lava by reading climbable surfaces and preserving momentum.

## Creative Pillars

- Vertical escape: every frame should push the eye upward.
- Grapple readability: cyan grapple ceilings and green rest surfaces are the visual grammar.
- Lava pressure: the rising red plane is a constant pacing threat.
- First-person apparatus: the player should see a climbing rig, tether feedback, and hand-scale motion cues instead of a bare camera.

## Presentation Direction

Low ambient light, strong emissive targets, fog, basalt ribs, and a rising lava field turn procedural geometry into a hostile vertical space. The authored cyan anchor chain is intentionally visible in screenshots and smoke tests so the arcade cabinet island reads as a playable ascent instead of an empty lava horizon.

The color script is deliberately split: cyan for grappleable ceilings, green for recovery moss, red/orange for lava pressure, and blue-black for the shaft volume. HUD typography stays compact and tabular so desktop and mobile players can scan altitude, lava gap, velocity, time, and objective progress without blocking the climb path.

## Current Feature and Polish Pass

- Grapple target state now reports in-range, locked, missed, and tension from pure logic.
- Route cue state now reports the next anchor, recovery shelf, target altitude, distance, and bearing so the HUD and R3F scene speak the same climb language.
- The crosshair, HUD grip control, tether beam, and target reticle respond to the same grapple state.
- Heat shimmer near lava, route beacons, brighter anchor halos, recovery shelf rings, and a surface air shaft make portrait screenshots read as a guided climb instead of a dark void.
- The cabinet landing uses the shared cartridge frame with a lava-ascent label, play control, and rules drawer.

## Simulation and Test Boundaries

`src/engine/primordialSimulation.ts` owns the deterministic state transitions: initial boot state, lava rise, altitude, objective progress, route cue selection, air-control impulses, jump impulse, tether impulses, and the authored route layout. React Three Fiber components consume those helpers instead of duplicating gameplay formulas.

Coverage is split between pure Vitest simulation tests and Vitest Browser plugin start-flow/e2e screenshots. Browser verification is intentionally routed through the Vitest browser provider; there are no direct Playwright test commands in the game package.

## Responsive and Android Contract

- The root fills its parent with `GameViewport`.
- Pointer-lock play is fullscreen-first on desktop.
- Touch players get on-screen Grip and Jump actions that dispatch the same runtime controls used by keyboard and pointer input.
- The scene can still render inside the cabinet island for smoke tests and previews.
- Android packaging uses the standalone Capacitor app shell.

## Stack

React Three Fiber, Rapier, Koota
