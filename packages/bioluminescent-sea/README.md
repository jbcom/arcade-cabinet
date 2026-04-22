# Bioluminescent Sea

A deep-sea collection game about staying calm while light, predators, and distance compete for the player's attention.

## Creative Pillars

- Quiet navigation: movement should feel smooth, gliding, and touch friendly.
- Light as currency: every collectible is also a navigational beacon.
- Threats read as silhouettes: danger should be visible by shape and motion before it reaches the player.

## Presentation Direction

The player should feel small inside a layered ocean volume. Collectibles sit close to the eye as cyan, violet, and pale-blue glow, while predators and pirate shapes live at the edge of visibility.

The scene uses a parent-sized canvas, particulate drift, and a deep vertical gradient so it can run fullscreen, inside the Astro cabinet, or inside an Android WebView without assuming `window.innerHeight`.

## Responsive and Android Contract

- The root component fills its parent with `GameViewport`.
- Canvas dimensions are driven by the containing element through `ResizeObserver`.
- Touch input is primary; desktop pointer input should behave the same.
- The standalone app shell uses dynamic viewport units for mobile web and Capacitor.

## Stack

React, Canvas, Framer Motion
