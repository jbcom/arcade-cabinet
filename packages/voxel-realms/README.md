# Voxel Realms

An infinite voxel survival experience with streamed terrain chunks and first-person movement.

## Creative Pillars

- Procedural wonder: terrain generation should feel like a world, not a test grid.
- Safe spawn readability: the first seconds need orientation and stable footing.
- First-person survival: the player reads the horizon, ground, and resources from eye level.

## Presentation Direction

The world begins from a designed spawn pad that proves scale and orientation while generated terrain streams around the player. Natural voxel greens, dirt, stone, sky, and a blue horizon beacon replace debug cubes with a playable starting point.

## Responsive and Android Contract

- The root fills its parent with `GameViewport`.
- Pointer-lock exploration fills the parent viewport.
- The standalone app shell uses dynamic viewport units to keep the horizon stable under mobile browser chrome.
- Android packaging uses the standalone Capacitor app shell.

## Stack

React Three Fiber, Rapier, Web Workers
