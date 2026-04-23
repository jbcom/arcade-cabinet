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

## Current Feature and Polish Pass

- Rescue cue telemetry now condenses bark readiness, goat chewing state, nearest goat pressure, salad health, ball-to-goal distance, and round progress into one deterministic next action.
- The HUD now presents the next action and round cue on desktop and mobile, with mobile objective text clamped to readable lines instead of truncating the play instruction.
- The arena renders rescue cue rings for the salad, bark radius, and recovery lane so the player can read the next move without scanning every goat label.
- Goat intent is now exposed from pure logic and rendered as chase, chewing, and stunned feedback.
- Bark events drive a visible shockwave, stun stars, rally timing, and rescue feedback.
- The opening chew balance now keeps desktop and mobile screenshot captures in active play instead of falling into game-over during inspection.
- The cabinet landing uses the shared cartridge frame with a pasture label, play control, and rules drawer.

## Responsive and Android Contract

- The arena canvas fills its parent with `GameViewport`.
- The fixed camera widens in portrait and keeps otter, salad, goats, water, and crater visible.
- Keyboard, touch-anywhere movement, and bark controls update the same deterministic simulation.
- Vitest Browser captures page-mode desktop and mobile screenshots through the shared harness.

## Stack

React Three Fiber, Koota, Vitest Browser
