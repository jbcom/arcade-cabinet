# Primordial Ascent

A procedural grappling climb where the player escapes rising lava by reading climbable surfaces and preserving momentum.

## Creative Pillars

- Vertical escape: every frame should push the eye upward.
- Grapple readability: cyan grapple ceilings and green rest surfaces are the visual grammar.
- Lava pressure: the rising red plane is a constant pacing threat.

## Presentation Direction

Low ambient light, strong emissive targets, fog, and a rising lava field turn simple procedural geometry into a hostile vertical space. The player should always understand what can be grabbed, where to rest, and how close failure is.

## Responsive and Android Contract

- The root fills its parent with `GameViewport`.
- Pointer-lock play is fullscreen-first.
- The scene can still render inside the cabinet island for smoke tests and previews.
- Android packaging uses the standalone Capacitor app shell.

## Stack

React Three Fiber, Rapier, Koota
