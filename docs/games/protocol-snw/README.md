# Protocol: SNW

A tactical survival protocol set in a cold neon void.

## Creative Pillars

- Combat perimeter: threats should read as approaching lanes around the player.
- Neon target clarity: enemies, crosshair, and integrity UI must remain high contrast.
- System health pressure: the player manages survival as an operating protocol.

## Presentation Direction

The scene is a tactical firing range, not a dense environment. A circular signal ring, perimeter beacons, readable cover baffles, and hostile constructs are generated from deterministic engine data so the cabinet route, browser tests, and Android shell share the same authored combat space.

The visual grammar is cold and operational: cyan means player/system signal, magenta/red means hostile breach pressure, amber marks warnings, and outer void blocks only frame the arena instead of swallowing it. The camera stays high enough to read threat lanes on desktop, then tightens in portrait without hiding the ring center.

## Responsive and Android Contract

- The root fills its parent with `GameViewport`.
- HUD panels stay compact so the crosshair and threat lanes remain open.
- Desktop keyboard/pointer and mobile touch controls both write into the same `SNWControls` state.
- The pure engine owns initial state, wave enemy spawning, enemy pressure, dash velocity, hit resolution, and arena layout.
- Android packaging uses the standalone Capacitor app shell.

## Stack

React Three Fiber, Rapier
