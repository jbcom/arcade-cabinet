# Bioluminescent Sea

A deep-sea collection game about staying calm while light, predators, and distance compete for the player's attention.

## Creative Pillars

- Quiet navigation: movement should feel smooth, gliding, and touch friendly. The player pilots a small submersible with a headlamp cone rather than a generic cursor.
- Light as currency: every collectible is also a navigational beacon. Plankton clusters, jellyfish, and glow fish differ in silhouette, value, scale, and pulse rhythm.
- Threats read as silhouettes: danger should be visible by shape and motion before it reaches the player. Predators use dark body mass, lure lights, and red eye cues; pirate skiffs use amber search cones.
- The ocean is a layered volume: shafts, trench ridges, coral fans, bubbles, and far silhouettes should sell depth on both desktop and mobile.

## Presentation Direction

The player should feel small inside a layered ocean volume. Collectibles sit close to the eye as cyan, violet, and pale-blue glow, while predators and pirate shapes live at the edge of visibility.

The scene uses a parent-sized canvas, particulate drift, authored beacon lanes, and a deep vertical gradient so it can run fullscreen, inside the arcade cabinet, or inside an Android WebView without assuming `window.innerHeight`.

The HUD stays compact: score, time, and chain sit at the top edge, while the dive-plan panel reports oxygen, pressure, depth, and nearest-threat distance without blocking the center of the playfield.

## Current Feature and Polish Pass

- Standard and cozy predator contact now costs oxygen with a short grace window instead of ending the dive immediately; challenge mode keeps hard collision pressure.
- Collected creatures now restore oxygen by type, making beacon chains a true recovery route rather than score-only pickups.
- Gameplay screenshots now use full page capture so HUD, oxygen, route, and pressure evidence are verified alongside the canvas scene.
- The dive initializes from the actual viewport size so mobile starts with the submersible and route in frame.
- Route landmark beacons now expose deterministic bearing, distance, and label telemetry from pure dive logic.
- The route HUD adds a compass readout so the player can follow trench markers instead of reading the objective as prose only.
- The late route now moves through Whale-Fall Windows, Trench Choir, Abyss Orchard, and the Living Map so the second half of the dive has more authored identity.
- Dive completion now uses the real run summary to produce a rating, oxygen-bank note, landmark sequence, and route-complete backdrop instead of a generic end panel.
- Collection bursts, a stronger headlamp cone, deeper silhouettes, and threat warning glints make pickups and danger readable in desktop and mobile captures.
- The cabinet landing uses the shared cartridge frame with a deep-sea label, play control, and rules drawer.

## Gameplay Systems

- `src/engine/deepSeaSimulation.ts` owns the deterministic dive route, authored creature distribution, scoring chains, predator collision, threat telemetry, completion celebration model, and particle wrapping.
- React owns orchestration, input capture, canvas rendering, and UI state only.
- Runtime randomness is intentionally avoided in gameplay setup so unit tests and Vitest Browser screenshots can reproduce the same scene across desktop, mobile, docs islands, and Android builds.
- Collection chains reset after the streak window and cap at the authored maximum; the first pickup starts at `x1` instead of inheriting a stale multiplier.

## Responsive and Android Contract

- The root component fills its parent with `GameViewport`.
- Canvas dimensions are driven by the containing element through `ResizeObserver`.
- Touch input is primary; desktop pointer input should behave the same.
- The standalone app shell uses dynamic viewport units for mobile web and Capacitor.
- No direct Playwright dependency is required for screenshots or flow coverage; browser coverage runs through the shared Vitest Browser harness.

## Stack

React, Canvas, Framer Motion
