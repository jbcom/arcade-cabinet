---
title: Game Visual Audit
description: Screenshot-driven visual coherence and feature-completion notes after the single-app migration.
date: 2026-04-22
---

# Game Visual Audit: 2026-04-22

Source evidence: Vitest Browser e2e screenshots in `test-screenshots/games`,
`test-screenshots/landings`, and `test-screenshots/cabinet`. Gameplay captures run
at desktop 1280x720 and mobile browser dimensions; landing captures verify the
shared cartridge frame before gameplay starts.

## Current Pass

| Game | Screenshot read | Status after this pass | Next priority |
| --- | --- | --- | --- |
| Bioluminescent Sea | Landing reads as a deep-sea cartridge; gameplay shows readable glow chains and route HUD. | Added route landmark telemetry, route compass, collection bursts, stronger headlamp/depth silhouettes, and warning glints. | Add more creature-specific collection scoring and late-depth landmarks. |
| Cosmic Gardener | Landing label has a distinct pinball-garden voice; gameplay remains strong in desktop and portrait. | Added completion bonus/next-pattern preview, resonance bloom, launch/drain pulses, and constellation edge completion feedback. | Reduce lower-board clutter further on very narrow portrait captures. |
| Enchanted Forest | Landing, grove stage, and mobile rune scale now feel coherent. | Added harmony surge documentation, shadow path metadata, visible target telegraphs, and larger rune affordances. | Add richer per-spell sound/visual cadence once audio verification is easier. |
| Entropy Edge | Landing label and gameplay both read as the same failing-grid identity. | Added resonance surge payoff, resonance bands, corrected Three opacity usage, and clearer anchor/blocked/falling contrast. | Add a more dramatic sector-stabilized win transition. |
| Mega Track | Landing and gameplay now share the lane-racing motif. | Added overdrive/impact/clean-pass telemetry, lane strips, speed markings, collision sparks, hazard bases, and HUD feedback. | Add authored track-side scenery variation by distance band. |
| Overcast: Glacier | Added as a reduced cabinet cartridge with a strong arctic glitch label and readable three-lane play. | Added warmth/cocoa survival, snowman kick timing, glitch photo charges, combo scoring, touch joystick steering, and responsive lane presentation. | Capture fresh desktop/mobile screenshots and decide whether enemy density or cocoa pacing needs tuning. |
| Otterly Chaotic | Landing now matches the pasture-chase identity; gameplay desktop and mobile stay active during capture. | Added goat intent indicators, bark shockwave, stun stars, goal pull line, salad feedback, and a longer playable opening window. | Add more expressive otter/goat composite poses without hurting CI startup. |
| Primordial Ascent | Landing label and portrait gameplay now emphasize an authored upward route instead of a mostly dark shaft. | Added deterministic route cue state, next-anchor and shelf HUD pills, brighter anchor halos, route beacons, recovery shelf rings, surface air shaft glow, and softer fog/lighting. | Add better first-contact tutorialization for missed grapples. |
| Titan Mech: Overheat | Landing label now frames the game as an extraction cartridge; gameplay has brighter combat and ore-loop hierarchy. | Added weapon feedback state, fire/heat/coolant gating, extractor/hopper/credit state, ore rigs, muzzle flash, overheat ring, objective rings, reticle, and damage vignette. | Add enemy attack readability, visible cube delivery timing, and a clearer victory state. |
| Beppo Laughs | Landing reads as a circus cartridge and gameplay presents junction choices without hiding the route state. | Imported as a reduced maze loop with composure/despair pressure, item-gated rooms, route memory, and shared start/runtime persistence. | Add more ending variety, lighting beats, and late-maze room identity. |
| Cognitive Dissonance | Landing and gameplay retain the diegetic AI-cabinet identity without a second app shell. | Imported as a raw Three adapter with pattern matching, reversible coherence, tension waves, rim controls, and shared runtime persistence. | Add richer shift escalation and more visible stable/shatter endings. |
| Farm Follies | Landing label has the strongest cartridge readability of the new imports; gameplay now shows a real merged animal token in screenshots. | Added pair-friendly opening drops, deterministic merge abilities, animal silhouettes/tier badges, sway/danger meter, and ability feedback. | Add collapse animation and more late-tier animal poses. |

## 1.0 Runtime Pass

- The home path now opens with a compact cabinet marquee and keeps the cartridge gallery as the main selection surface.
- Every launch cartridge is wired to local-only runtime persistence for last selected mode and one active run.
- Game routes now expose the shared cabinet menu: Resume, Restart, Rules, Settings, Cabinet, and Quit Run.
- Shared settings cover sound, haptics, reduced motion, graphics quality, handedness, joystick sensitivity, and text scale.
- Vitest Browser screenshots were regenerated for cabinet desktop/mobile/tablet, every landing desktop/mobile, and every gameplay route desktop/mobile.

## Extracted From Active Cabinet

- Voxel Realms was extracted to the public standalone repo `arcade-cabinet/voxel-realms`. Its voxel rendering, spawn-camp, pickup telemetry, and biome discovery techniques should be evaluated by Bok later rather than kept as an active cabinet cartridge.

## Cabinet Identity Pass

- The home gallery now renders shared `CartridgeLabel` components instead of screenshots or poster images.
- Selecting a gallery cartridge marks the label for a browser View Transition into the game landing label.
- Every active game now starts from the shared `CartridgeStartScreen`: one cabinet frame, one typography system, one label surface, with game-specific color/motif/description/rules.
- `test-screenshots/landings` captures every cartridge landing at desktop and mobile dimensions.

## Test Contract

- Browser screenshots remain generated through Vitest Browser e2e flows.
- Direct Playwright is not used for the canonical screenshot paths in this pass.
- The cabinet screenshot helper captures a viewport-sized element so gallery/home images do not include the full long page.
- Future visual changes should keep landing, gameplay, and cabinet screenshot evidence in the same harness before merge.
