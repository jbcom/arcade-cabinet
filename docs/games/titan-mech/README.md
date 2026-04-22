# Titan Mech

A heavy mech piloting game about moving mass through an authored industrial arena.

## Creative Pillars

- Heavy chassis control: the mech should feel powerful but not weightless.
- Arena navigation: obstacles should be placed deliberately as cover and pathing decisions.
- Systems-first combat: integrity, energy, heat, scrap, and telemetry define the fantasy.

## Presentation Direction

The mech is a composed industrial machine, not a capsule stand-in: torso armor, cockpit glass, servo legs, a backpack reactor, and a forward cannon all need distinct silhouettes. The arena is an industrial proving ground with ring markings, gantries, reactors, pylons, and cover blocks arranged from deterministic engine data so the game starts from the same readable combat space in browser tests, the cabinet route, and Android.

Lighting uses cool cyan telemetry, amber hazard accents, and red weapon heat over dark metal rather than a single-color neon wash. The camera sits behind and above the chassis, tightening slightly on portrait screens while keeping the objective rings, obstacles, and mech centerline legible.

## Current Feature and Polish Pass

- Weapon feedback now exposes firing, cooling, dry, and overheated states from pure simulation.
- Firing consumes energy and heat budget while the scene renders muzzle flash, reticle, and overheat feedback.
- Objective rings, pylon progress, damage vignette, and brighter threat hierarchy improve the mobile combat read.
- The cabinet landing uses the shared cartridge frame with a mech label, play control, and rules drawer.

## Responsive and Android Contract

- The root fills its parent with `GameViewport`.
- Camera follow keeps the mech centered across viewport sizes.
- Desktop keyboard/mouse and mobile touch controls both update the same `TitanControls` state.
- The pure engine owns boot state, drive force calculation, objective progress, system heat, and deterministic arena layout.
- Android packaging uses the standalone Capacitor app shell.

## Stack

React Three Fiber, Rapier, Koota
