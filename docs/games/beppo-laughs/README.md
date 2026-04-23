# Beppo Laughs

A nightmare circus maze about keeping composure while choosing a route through locked junctions.

## Creative Pillars

- Composure over panic: fear, despair, and recovery should read as the central survival economy.
- Junction choices: movement is a series of large, legible path decisions rather than tiny maze steering.
- Item-gated escape: tickets, keys, and blockade items create route planning without importing the Angular/Ionic shell.

## Couch-Friendly Loop

Choose a junction, reveal a room, collect blockade items, avoid too much backtracking despair, and reach the exit flap with composure intact. Standard mode uses slow passive fear and item recovery so the player can learn the route over an 8-15 minute run.

## Current Feature and Polish Pass

- Route cue state now reports memory remaining, missing blockade items, recommended curtains, and threat level from pure maze state.
- The main play surface now presents a circus-stage room with north/east/south/west portal buttons, route memory pips, current room focus, lock text, and cue lighting instead of a flat debug map.
- HUD memory, objective text, and inventory badges share the same route cue language so mobile and Android players can understand the next useful decision without reading implementation notes.

## Responsive and Android Contract

The cabinet version is a reduced React cartridge. The maze graph and sanity logic live in `src/games/beppo-laughs`; the circus label, HUD, map, and junction buttons live in `app/games/beppo-laughs`. Mobile and Android use the same large junction buttons as desktop.
