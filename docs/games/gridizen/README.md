# Gridizen

A model-table city builder where the player grows a river settlement by placing roads, zones, and utilities.

## Creative Pillars

- City legibility: the player should read roads, civic lots, zones, water, terrain, and warnings without needing camera precision.
- Infrastructure feedback: every building runs through road, power, and water service evaluation, and the warning icon language must match those systems.
- Calm civic iteration: city growth is deterministic and inspectable, so planning feels steady instead of noisy or arbitrary.
- Physical planning model: the board is presented like a tabletop diorama with rail edges, muted civic materials, and composite landmark shapes.

## Systems Contract

- `generateMap(seed)` is deterministic and `initMap` uses a fixed seed for repeatable browser, unit, and Android captures.
- `applyStarterSettlement` authors the initial civic district: road loop, residential blocks, a park, power, water, and a pump-fed river edge.
- `refreshCityServices` evaluates the starter city before the first tick, so the HUD, warnings, and screenshots reflect actual service state.
- `tickGame` advances time, service use, taxes, milestones, and zone growth without `Math.random()`.

## Presentation Direction

Gridizen should read as a civic planning table rather than a raw terrain grid. The camera frames the founded district first, terrain stays muted, roads receive lane markings, utilities get bespoke silhouettes, and parks/residential roofs add scale. Day/night lighting can change the mood, but it must not hide service readability.

## Responsive and Android Contract

- The scene fills its parent `GameViewport`, which is the arcade cabinet route on the web and the Capacitor WebView on Android.
- The camera targets the civic center, disables panning away from the model, and keeps touch zoom bounded for mobile.
- HUD and tool panels use compact edge layouts; Vitest Browser captures the full page on desktop and mobile to prove the player experience, not just the canvas.
- The standalone app shell must continue to build with Vite and sync/assemble through Capacitor Android.

## Stack

React Three Fiber, Koota, Vitest Browser
