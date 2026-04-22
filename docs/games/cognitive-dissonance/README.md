# Cognitive Dissonance

A diegetic AI-cabinet game about maintaining coherence by matching escaping patterns with rim controls.

## Creative Pillars

- Diegetic controls: the player operates the cabinet itself through three visible rim buttons.
- Coherence maintenance: coherence and tension must be readable before the player is punished.
- Pattern matching: the core verb is holding the color that matches the active escaping pattern.

## Couch-Friendly Loop

Watch the glass mind, match the active pattern, lower tension, restore coherence, and survive the shift. Standard mode keeps coherence loss reversible; challenge mode increases overlapping pressure.

## Responsive and Android Contract

The React component owns a raw Three renderer lifecycle and cleanup. Deterministic coherence logic lives in `src/games/cognitive-dissonance`; the sphere, HUD, and rim buttons live in `app/games/cognitive-dissonance`.
