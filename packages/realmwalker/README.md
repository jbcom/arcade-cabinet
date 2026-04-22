# Realmwalker

A fantasy traversal game where the player crosses unstable realms, fights hostiles, and collects relics.

## Creative Pillars

- Mythic traversal: movement should feel like crossing strange territory.
- Zone-shift identity: each zone should change color and mood.
- Relic risk/reward: progression should be legible through loot and danger.

## Presentation Direction

The player is a small figure inside unstable realms. Zone color, mist, pillars, and a bright weapon silhouette establish fantasy space while preserving motion readability.

## Responsive and Android Contract

- The root fills its parent with `GameViewport`.
- Third-person camera follow keeps the player centered.
- Desktop keyboard play is supported today.
- Android packaging uses the standalone Capacitor app shell.

## Stack

React Three Fiber, Rapier, Koota
