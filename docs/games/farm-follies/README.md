# Farm Follies

A farm-chaos stacker about dropping, merging, and banking animal tiers before wobble overtakes the tower.

## Creative Pillars

- One-verb stacking: the player should always know the next useful action is a lane drop or bank.
- Farm identity: animal tiers, barn framing, hay colors, and wobble feedback replace abstract blocks.
- Recoverable chaos: standard mode uses lives and banking instead of immediate floor-touch game over.

## Couch-Friendly Loop

Drop animals into lanes, merge matching tiers, let the tower get a little dangerous, then bank before wobble peaks. The run is meant to be replayable from the couch, not a 30-second fail-fast physics demo.

## Responsive and Android Contract

The initial cabinet import uses deterministic stack logic under `src/games/farm-follies` and a responsive barn presentation under `app/games/farm-follies`. Drop lanes and bank controls are thumb-sized for mobile and Android.
