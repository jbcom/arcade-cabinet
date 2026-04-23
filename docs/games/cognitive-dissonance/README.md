# Cognitive Dissonance

A diegetic AI-cabinet game about maintaining coherence by matching escaping patterns with rim controls.

## Creative Pillars

- Diegetic controls: the player operates the cabinet itself through three visible rim buttons.
- Coherence maintenance: coherence and tension must be readable before the player is punished.
- Pattern matching: the core verb is holding the color that matches the active escaping pattern.
- Phase-lock recovery: sustained correct matching should create an explicit payoff that vents tension and restores coherence.

## Couch-Friendly Loop

Watch the glass mind, match the active pattern, charge phase lock, vent tension, restore coherence, and survive the shift. Standard mode keeps coherence loss reversible; challenge mode increases overlapping pressure.

## Current Feature and Polish Pass

- Sustained correct matching now charges a deterministic phase-lock recovery event.
- The pure engine exposes a shift cue with stage, active/next pattern, urgency, phase-lock charge, and instruction text.
- The raw Three scene now presents the playfield as a cabinet glass assembly with frame rails, scanlines, pattern rain, rim nodes, and phase-lock halo feedback.
- The mobile HUD uses a compact two-column layout so the glass mind and rim controls stay visible in portrait screenshots.

## Responsive and Android Contract

The React component owns a raw Three renderer lifecycle and cleanup. Deterministic coherence logic lives in `src/games/cognitive-dissonance`; the sphere, HUD, and rim buttons live in `app/games/cognitive-dissonance`.
