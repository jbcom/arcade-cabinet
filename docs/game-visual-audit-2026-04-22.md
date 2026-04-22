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
| Otterly Chaotic | Landing now matches the pasture-chase identity; gameplay desktop and mobile stay active during capture. | Added goat intent indicators, bark shockwave, stun stars, goal pull line, salad feedback, and a longer playable opening window. | Add more expressive otter/goat composite poses without hurting CI startup. |
| Primordial Ascent | Landing label and portrait gameplay emphasize upward escape. | Added grapple target state, tether/reticle feedback, lava heat shimmer, HUD state color, and stronger route framing. | Add better first-contact tutorialization for missed grapples. |
| Titan Mech | Landing label gives the game a stronger cartridge identity; gameplay has brighter combat hierarchy. | Added weapon feedback state, fire/heat/coolant gating, muzzle flash, overheat ring, objective rings, reticle, and damage vignette. | Add enemy attack readability and a clearer victory state. |
| Voxel Realms | Landing label and gameplay now present survey progression instead of debug terrain. | Added biome discovery, pickup telemetry, pickup pulses, biome silhouettes, survey HUD notices, and richer camp composition. | Add material-face variety for common blocks and more shoreline dressing. |

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
