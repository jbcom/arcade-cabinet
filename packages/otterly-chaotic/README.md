# Otterly Chaotic

A frantic 3D chase game where the player protects a rolling kudzu salad from hungry goats.

## Creative Pillars

- Protect the salad: the ball is the emotional center of the playfield.
- Readable chase triangle: otter, goats, and goal must stay visible.
- Comedic physicality: movement should feel playful without losing control clarity.
- Immediate touch play: mobile and Android players need movement and bark controls on screen.

## Systems Contract

- The simulation is deterministic for a given input sequence.
- `tick` owns otter acceleration, water movement, salad pushing, goat pursuit, bark stun, cooldowns, win/loss, and salad health.
- Engine tests cover movement, deterministic replay, bark stun, goat damage, and terminal states.

## Presentation Direction

The game is a small, readable chase arena. Bright pasture, blue water, a warm crater goal, fence rails, reeds, and soft composite animal models keep the tone playful while preserving collision readability.

## Responsive and Android Contract

- The arena canvas fills its parent with `GameViewport`.
- The fixed camera widens in portrait and keeps otter, salad, goats, water, and crater visible.
- Keyboard and on-screen D-pad/bark controls are both supported.
- Vitest Browser captures page-mode desktop and mobile screenshots through the shared harness.

## Stack

React Three Fiber, Koota, Vitest Browser
