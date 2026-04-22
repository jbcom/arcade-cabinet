# Gridizen

A model-table city builder where the player grows a settlement by placing roads, zones, and utilities.

## Creative Pillars

- City legibility: roads, zones, water, terrain, and services must read at a glance.
- Infrastructure feedback: warnings should explain missing roads, power, and water visually.
- Calm civic iteration: the loop should feel like steady planning, not noisy micromanagement.

## Presentation Direction

Gridizen should read as a physical planning model. A restrained civic palette, day/night lighting, simple building massing, and icon-like warnings keep the city scannable on desktop and phone screens.

## Responsive and Android Contract

- The scene fills its parent with `GameViewport`.
- Camera controls target the city center and avoid losing the board.
- HUD and tool panels must sit on predictable edges.
- The package has a standalone Vite/Capacitor app shell.

## Stack

React Three Fiber, Koota
