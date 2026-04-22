# Realmwalker

A fantasy traversal game where the player crosses unstable realms, fights hostiles, and collects relics.

## Creative Pillars

- Mythic traversal: movement should feel like crossing strange territory.
- Zone-shift identity: each zone should change color and mood.
- Relic risk/reward: progression should be legible through loot and danger.

## Presentation Direction

The player is a small hooded figure with a bright weapon silhouette inside unstable realms. Zone color, mist, runic floor rings, floating sigils, portal lighting, and crystal-capped pylons establish fantasy space while preserving motion readability.

## Responsive and Android Contract

- The root fills its parent with `GameViewport`.
- Third-person camera follow keeps the player centered.
- Desktop keyboard and touch D-pad movement are supported.
- Android packaging uses the standalone Capacitor app shell.

## Stack

React Three Fiber, Rapier, Koota
