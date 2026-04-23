# Titan Mech: Overheat

A heavy mech extraction game about moving mass through an authored industrial arena while heat, ore, weapons, coolant, and hopper pressure compete for attention.

## Creative Pillars

- Heavy chassis control: the mech should feel powerful but not weightless.
- Heat economy: extraction, movement, weapons, and coolant all pull against the same thermal limit.
- Industrial extraction: pylon rings, ore rigs, hopper load, credits, and ejected ore cubes define the run objective.

## Presentation Direction

The mech is a composed industrial machine, not a capsule stand-in: torso armor, cockpit glass, servo legs, a backpack reactor, extractor hardware, and a forward cannon all need distinct silhouettes. The arena is an industrial extraction yard with ring markings, ore rigs, gantries, reactors, pylons, and cover blocks arranged from deterministic engine data so the game starts from the same readable combat space in browser tests, the cabinet route, and Android.

Lighting uses cool cyan telemetry, amber hazard accents, and red weapon heat over dark metal rather than a single-color neon wash. The camera sits behind and above the chassis, tightening slightly on portrait screens while keeping the objective rings, obstacles, and mech centerline legible.

## Current Feature and Polish Pass

- Weapon feedback now exposes firing, cooling, dry, and overheated states from pure simulation.
- Overheat extraction state now exposes hopper load, credits, rare isotope finds, extractor feedback, and ore-to-scrap conversion.
- Contract cue state now exposes the next pylon, distance, bearing, extraction readiness, and heat-priority stage so the HUD and arena route agree.
- Firing consumes energy and heat budget while the scene renders muzzle flash, reticle, and overheat feedback.
- Extracting inside pylon rings consumes energy, raises heat, fills the hopper, and ejects a credit/scrap payout when full.
- Objective rings, active route chevrons, pylon beams, damage vignette, and brighter threat markers improve the mobile combat read.
- The cabinet landing uses the shared cartridge frame with an Overheat label, play control, and rules drawer.

## Responsive and Android Contract

- The root fills its parent with `GameViewport`.
- Camera follow keeps the mech centered across viewport sizes.
- Desktop keyboard/mouse and mobile touch controls both update the same `TitanControls` state.
- The pure engine owns boot state, drive force calculation, objective progress, extraction economy, system heat, and deterministic arena layout.
- Android packaging uses the standalone Capacitor app shell.

## Stack

React Three Fiber, Rapier, Koota
