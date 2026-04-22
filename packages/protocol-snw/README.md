# Protocol: SNW

A tactical survival protocol set in a cold neon void.

## Creative Pillars

- Combat perimeter: threats should read as approaching lanes around the player.
- Neon target clarity: enemies, crosshair, and integrity UI must remain high contrast.
- System health pressure: the player manages survival as an operating protocol.

## Presentation Direction

The scene is a tactical firing range, not a dense environment. Dark teal space, restrained directional light, cyan UI, and clean silhouettes create the protocol mood while keeping targets readable.

## Responsive and Android Contract

- The root fills its parent with `GameViewport`.
- HUD panels stay compact so the crosshair and threat lanes remain open.
- Desktop pointer play is supported today.
- Android packaging uses the standalone Capacitor app shell.

## Stack

React Three Fiber, Rapier
