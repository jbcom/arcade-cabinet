# Overcast: Glacier

A reduced cabinet cartridge from the larger Overcast Glacier standalone repo: a kung-fu kitten skis a corrupted arctic simulation, collects cocoa warmth, kicks snowmen, and photographs glitches.

## Creative Pillars

- Downhill clarity: the first readable surface is three lanes, a warm player, and threats approaching from the horizon.
- Kung-fu interruption: snowmen are not just obstacles; they invite a timed kick or dodge decision.
- Warmth survival: cocoa and damage form a controllable stressor rather than a short hard timer.

## Presentation Direction

The cabinet version keeps the strongest identity from the source repo while cutting scope: midnight arctic blue, matrix-green glitch targets, cocoa warmth, bright snowmen, and a playful Y2K action tone. It is a couch-friendly lane run, not the full boss/biome/transformation product.

The player should understand the run from the cartridge label and first frame: Kicks is on a corrupted slope, warmth drains slowly, cocoa restores safety, snowmen can be kicked, and glitches are photo opportunities.

## Current Cabinet Pass

- Added a deterministic pure simulation for warmth drain, lane steering, cocoa collection, snowman kick/hit resolution, glitch photos, scoring, combo, and spawning.
- Added deterministic segment cue state for named glacier segments, weather, traffic intensity, nearest hazards, lane warning, and warmth pressure.
- Added late-route spawn profiles that increase traffic by segment while keeping standard mode below challenge density and preserving cocoa recovery when warmth drops.
- Added deterministic finish cue ratings, bonus scoring, route lights, and a React aurora/runout celebration for completed 8-15 minute routes.
- Added a React presentation with shared cartridge landing, touch-anywhere joystick, action buttons, three-lane slope, weather bands, lane warnings, richer cocoa/snowman/glitch tokens, kitten silhouette, segment gate, finish lights, and warmth HUD.
- Added unit and browser start-flow coverage.

## Responsive and Android Contract

- The root fills its parent with `GameViewport`.
- Joystick and keyboard update the same `OvercastControls` state.
- The presentation is parent-relative and does not depend on full browser viewport assumptions.
- The loop is intentionally reduced before any native/mobile-specific Overcast scope is reintroduced.

## Source Repo Notes

Source: `/Users/jbogaty/src/arcade-cabinet/overcast-glacier`

Keep importing ideas from the standalone repo selectively. Do not bring in the multi-app workspace, Babylon/Expo split, boss fight, biome set, or transformation system until this reduced loop is proven in cabinet screenshots.
