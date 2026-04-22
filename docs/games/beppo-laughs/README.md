# Beppo Laughs

A nightmare circus maze about keeping composure while choosing a route through locked junctions.

## Creative Pillars

- Composure over panic: fear, despair, and recovery should read as the central survival economy.
- Junction choices: movement is a series of large, legible path decisions rather than tiny maze steering.
- Item-gated escape: tickets, keys, and blockade items create route planning without importing the Angular/Ionic shell.

## Couch-Friendly Loop

Choose a junction, reveal a room, collect blockade items, avoid too much backtracking despair, and reach the exit flap with composure intact. Standard mode uses slow passive fear and item recovery so the player can learn the route over an 8-15 minute run.

## Responsive and Android Contract

The cabinet version is a reduced React cartridge. The maze graph and sanity logic live in `src/games/beppo-laughs`; the circus label, HUD, map, and junction buttons live in `app/games/beppo-laughs`. Mobile and Android use the same large junction buttons as desktop.
