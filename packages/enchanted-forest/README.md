# Enchanted Forest

A gesture and rhythm defense game about protecting sacred trees by drawing musical runes.

## Creative Pillars

- Gesture spellcasting: drawing is the primary verb, not a menu shortcut.
- Sacred grove protection: tree health and incoming corruption define the tactical read.
- Music reinforces intent: audio feedback should make each spell feel deliberate.

## Presentation Direction

The grove should feel theatrical and hand-authored. Trees form a readable stage line, corruption advances as visible waves, and rune drawing owns the foreground. Emerald, violet, and warm firefly accents separate safe life, magic, and threat.

## Responsive and Android Contract

- Tree positions and spell coordinates are percentage-based.
- The game root fills its parent with `GameViewport`.
- Touch drawing must remain the first-class input path for mobile web and Android.
- Desktop pointer input should mirror the touch spell path.

## Stack

React, Framer Motion, Canvas, Tone.js
