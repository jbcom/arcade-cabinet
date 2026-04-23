---
title: Design
updated: 2026-04-23
status: current
domain: product
---

# Design

This document owns the cabinet identity, launch-track player promise, and the
creative pillars for each cartridge. Technical split lives in
[ARCHITECTURE.md](./ARCHITECTURE.md). Current implementation status lives in
[STATE.md](./STATE.md). Visual acceptance lives in
[VISUAL_REVIEW.md](./VISUAL_REVIEW.md).

## Cabinet Identity

Arcade Cabinet is one living machine, not a gallery of POC writeups. The player
should feel three layers in sequence:

1. A cabinet browser with shared framing and motion language.
2. A cartridge label with a distinct voice, color, and motif for one game.
3. A playable game route that honors the promise made by the label.

The shared identity is stable:

- one cabinet frame,
- one typography system,
- one set of start/rules/settings controls,
- one mode selector,
- one pause/runtime shell.

What changes per cartridge is the label voice: palette, motif, copy tone,
pressure language, and the scene composition inside the shared frame.

## Couch-Friendly 1.0 Promise

- Default runs target 8-15 minutes in `standard`.
- Standard pressure must be recoverable and readable.
- Mobile play is first-class, not a fallback.
- Android, desktop web, and mobile web must all express the same core loop.
- A cartridge must communicate its goal inside the first 15 seconds without a
  wall of internal design exposition.

## Logical Domain Pillars

### Cabinet product pillars

- Cabinet coherence: every game starts from the same machine.
- Cartridge identity: every game still has a unique voice.
- Recoverable play: stress is opt-in, not cheap.
- Mobile-first readability: controls and HUDs remain clear in portrait play.
- Deterministic testing: what the player sees is reproducible enough to test.

### Launch cartridge pillars

| Game | Core message | Core loop | Pillars |
| --- | --- | --- | --- |
| Bioluminescent Sea | Light turns an unknowable trench into a route you can trust. | Follow beacon chains, collect glow, read threats, reach landmarks, replay for cleaner routes. | Quiet navigation; light as currency; threats as silhouettes; layered ocean depth. |
| Cosmic Gardener | A garden grows when motion is guided into constellations. | Launch, flip, plant stars, complete the active pattern, claim bloom, preview the next set. | Pinball energy; readable constellation routing; wonder without clutter; cultivated tabletop identity. |
| Enchanted Forest | Deliberate spell grammar keeps a threatened grove in harmony. | Read corruption paths, draw runes, alternate spell types, build harmony, survive waves. | Gesture spellcasting; readable grove defense; distinct ritual feedback; cadence over panic. |
| Entropy Edge | Stability is earned by choosing when to secure and when to surge. | Cross sectors, secure anchors, build resonance, clear routes, carry reserves forward. | Spatial logic; collapsing-system tension; anchor readability; recoverable reserve economy. |
| Mega Track | Speed feels fair when every hazard reads early. | Race a three-leg cup, clean-pass traffic, trigger overdrive, recover at checkpoints. | Toy-scale speed; lane clarity; impact readability; deterministic road choreography. |
| Otterly Chaotic | A rescue is readable when the chase triangle is honest. | Read goat intent, bark to rally, guard salad pieces, push them to safety. | Protect the salad; readable chase triangle; comedic physicality; recoverable arena pressure. |
| Overcast Glacier | Warmth and momentum keep a weird downhill day under control. | Steer lanes, collect cocoa, kick snowmen, photograph glitches, clear route segments. | Downhill clarity; kung-fu interruption; warmth survival; reduced-scope arcade weirdness. |
| Primordial Ascent | A controlled grapple rhythm turns panic into ascent. | Lock anchors, swing upward, recover on shelves, outpace lava, reach air pockets. | Vertical escape; grapple readability; lava as pacing; authored climb composition. |
| Titan Mech: Overheat | Heat discipline turns extraction into a readable contract loop. | Survey pylons, mine ore, manage heat, bank hopper loads, upgrade the chassis. | Heavy mech control; heat economy; industrial extraction; evolving contracts. |
| Beppo Laughs | Composure is the only way out of the circus. | Choose junctions, collect gate items, manage fear/despair, route to the exit. | Maze readability; route memory; pressure through mood, not unfair speed; theatrical room identity. |
| Cognitive Dissonance | Matching the machine keeps the shift coherent. | Hold the correct rim control, vent tension, phase-lock the shift, stabilize or shatter. | Diegetic controls; coherence before punishment; visible phase-lock payoff; cabinet-glass presentation. |
| Farm Follies | Controlled chaos is a score engine when the player can bank it. | Drop, stack, merge, use animal abilities, bank before collapse, chase a higher tier. | One-verb stacking; farm identity; recoverable collapse; expressive animal tiers. |

## Remaining Product Work

- Revisit every landing label so the copy reads like a finished cartridge, not
  an internal feature list.
- Ensure every game has a clear rules drawer and replay promise.
- Tighten late-run identity for the weakest routes so they remain interesting
  after the opening 90 seconds.
- Keep imports and merge-track repos out of the cabinet unless they satisfy the
  same cartridge criteria.
