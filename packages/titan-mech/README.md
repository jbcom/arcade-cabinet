# Titan Mech

A heavy mech piloting game about moving mass through an authored industrial arena.

## Creative Pillars

- Heavy chassis control: the mech should feel powerful but not weightless.
- Arena navigation: obstacles should be placed deliberately as cover and pathing decisions.
- Systems-first combat: integrity, energy, scrap, and telemetry define the fantasy.

## Presentation Direction

Dark metal ground, cyan telemetry lights, ring markings, and hard directional shadows sell scale without cluttering the field. Deterministic arena structures give each run an authored starting space.

## Responsive and Android Contract

- The root fills its parent with `GameViewport`.
- Camera follow keeps the mech centered across viewport sizes.
- Desktop keyboard play is supported today.
- Android packaging uses the standalone Capacitor app shell.

## Stack

React Three Fiber, Rapier, Koota
