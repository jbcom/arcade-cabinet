# Mega Track

A high-speed lane racer about reading obstacles early and making decisive lane changes.

## Creative Pillars

- Instant lane reads: the player should know the safe lane without parsing detail.
- Toy-scale speed: the car and track should feel exaggerated and physical.
- Impact clarity: crashes need to be understandable, not surprising.

## Presentation Direction

Mega Track is an arcade tabletop racer. Bold lane colors, an aggressive chase camera, forward fog, and simple obstacle silhouettes should sell speed while keeping upcoming decisions visible.

## Responsive and Android Contract

- The root fills its parent with `GameViewport`.
- Input reduces to left/right lane choice, which maps cleanly to keyboard, swipe, or future touch buttons.
- The package has a standalone Vite/Capacitor app shell.
- The scene must remain readable in portrait and landscape.

## Stack

React Three Fiber
