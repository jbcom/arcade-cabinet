# Cosmic Gardener

A pinball puzzle garden where the player plants stars, routes energy, and keeps the cosmic ball alive long enough to complete constellations.

## Creative Pillars

- Pinball energy: launch, bounce, drain, and flipper timing should always be legible.
- Readable constellation routing: the board must communicate which stars matter and why.
- Wonder without visual clutter: effects should reinforce state changes instead of hiding the table.

## Presentation Direction

The game is a cosmic tabletop. The player reads flippers and launch power first, then star growth, then constellation goals. Warm star golds and pinks sit over a cooler nebula field, with energy streams acting as functional visual feedback.

## Responsive and Android Contract

- Board coordinates stay percentage-based.
- The root fills its parent with `GameViewport`.
- The layout should compose vertically on portrait phones and wider inside the Astro cabinet.
- The standalone app shell remains Capacitor-ready through the shared Vite app structure.

## Stack

React, Framer Motion
