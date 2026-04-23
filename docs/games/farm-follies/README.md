# Farm Follies

A farm-chaos stacker about dropping, merging, and banking animal tiers before wobble overtakes the tower.

## Creative Pillars

- One-verb stacking: the player should always know the next useful action is a lane drop or bank.
- Farm identity: animal tiers, barn framing, hay colors, and wobble feedback replace abstract blocks.
- Recoverable chaos: standard mode uses lives and banking instead of immediate floor-touch game over.

## Couch-Friendly Loop

Drop animals into lanes, merge matching tiers, let the tower get a little dangerous, then bank before wobble peaks. The run is meant to be replayable from the couch, not a 30-second fail-fast physics demo.

## 1.0 Polish Notes

- Same-lane merges now fire deterministic animal abilities: goats headbutt sway, pigs cushion drops, cows brace the beam, and horses kick the tower upright.
- The pure stack cue forecasts best lane, merge preview, bank readiness, lane heights, and collapse risk so guidance is deterministic instead of UI-only.
- Collapse payoff is deterministic: severity, spill direction, scatter count, banked percent, and recovery advice all come from the pure run state.
- Animal pose cues now give late tiers extra silhouette language, motion marks, and ribbons so higher merges feel like named farm friends instead of larger blocks.
- The standard drop sequence opens with pair-friendly tiers so the player learns the merge rule immediately instead of waiting for a rare setup.
- The playfield renders distinct animal tokens instead of letter blocks, with tier badges, species silhouettes, late-tier pose details, a best-drop ghost token, highlighted lane, and live sway meter.
- Wobble has steady/sway/danger bands so mobile players can read when to widen drops or bank before collapse.
- Desktop and mobile HUDs now keep the bank button and best-lane forecast readable without covering the stack.

## Responsive and Android Contract

The initial cabinet import uses deterministic stack logic under `src/games/farm-follies` and a responsive barn presentation under `app/games/farm-follies`. Drop lanes and bank controls are thumb-sized for mobile and Android.
