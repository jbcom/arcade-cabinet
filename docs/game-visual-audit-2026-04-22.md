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
| Bioluminescent Sea | Landing reads as a deep-sea cartridge; latest desktop/mobile gameplay captures include the canvas and HUD together, with the mobile submersible correctly framed. | Added oxygen recovery by creature type, recoverable standard/cozy predator impacts with grace, viewport-sized scene initialization, page-mode screenshot evidence, richer late-depth landmark telemetry, route compass, collection bursts, stronger headlamp/depth silhouettes, warning glints, and a run-summary-driven Living Map completion celebration. | Add optional post-completion route modifiers for replay variety. |
| Cosmic Gardener | Landing label has a distinct pinball-garden voice; gameplay remains strong in desktop and portrait with visible save count and recovery valve language. | Added deterministic recovery bloom ball saves, recovery pulse feedback, completion bonus/next-pattern preview, resonance bloom, launch/drain pulses, constellation edge completion feedback, and a compact narrow-portrait lower-board layout that moves gauges out of the flipper apron. | Add richer late-pattern table dressing and a stronger all-constellations zen transition. |
| Enchanted Forest | Landing, grove stage, and mobile rune scale now feel coherent; latest gameplay captures show a visible rune cue, focus ring, shadow path, and target tree read on desktop and mobile. | Added deterministic ritual cue telemetry, desktop/mobile rune cue HUD, stage focus rings, target-tree ritual lighting, standard/cozy opening damage grace, harmony surge documentation, shadow path metadata, and larger rune affordances. | Add richer per-spell sound/visual cadence once audio verification is easier. |
| Entropy Edge | Landing label and gameplay now read as a failing machine table with clear cyan route beacons, red blocked hazards, and a portrait-framed sector path. | Added deterministic sector cue state, completion cue state, HUD objective/pressure routing, route beacons, hazard markings, responsive camera framing, resonance surge payoff, resonance bands, stabilized field rings/pulses, and corrected Three opacity usage. | Add optional sector modifiers for replay variety after the 1.0 core loop is locked. |
| Mega Track | Landing and gameplay now read as a three-leg toy-scale cup with leg HUD, safe-lane callouts, checkpoint gates, visible hazard previews, authored scenery bands, and portrait framing that keeps the car in view. | Added checkpoint repair/boost recovery, deterministic race cue state, deterministic scenery band cues, next-hazard HUD text, safe-lane overlays, repair pulses, overdrive/impact/clean-pass telemetry, lane strips, speed markings, collision sparks, hazard bases, and leg-specific trackside set pieces. | Add optional contract/cup modifiers after the core 1.0 loop is locked. |
| Overcast: Glacier | Reduced cartridge now reads as a named glacier route with weather, traffic intensity, lane warnings, and richer collectible/threat tokens. | Added segment cue state, named route gates, weather bands, lane warning overlays, richer cocoa/snowman/glitch shapes, kitten silhouette details, segment HUD text, late-route traffic profiles, recovery-aware cocoa spawning, and aurora runout finish celebration. | Add optional late-segment set dressing variation after the core loop is locked. |
| Otterly Chaotic | Landing now matches the pasture-chase identity; gameplay desktop and mobile stay active during capture with a visible next-action cue and bark radius ring. | Added deterministic rescue cue telemetry, HUD next-action/round cue, arena cue rings, goat intent indicators, bark shockwave, stun stars, goal pull line, salad feedback, and a longer playable opening window. | Add more expressive otter/goat composite poses without hurting CI startup. |
| Primordial Ascent | Landing label and portrait gameplay now emphasize an authored upward route instead of a mostly dark shaft, with first-contact grip guidance visible in HUD and reticle. | Added deterministic route cue state, next-anchor and shelf HUD pills, brighter anchor halos, route beacons, recovery shelf rings, surface air shaft glow, softer fog/lighting, missed-grip guide cues, reticle hints, and next-anchor guide markers. | Add optional climb-route variants after the core tutorialized loop is locked. |
| Titan Mech: Overheat | Landing label now frames the game as an extraction cartridge; gameplay exposes route, contract, heat, pylon state, threat state, and delivery state in the same cabinet frame. | Added contract cue state, page-mode screenshots, active route chevrons, pylon beams, stronger extractor glow, threat markers, attack-lane beams, HUD contract/delivery/threat stages, weapon feedback, ore rigs, sustained payout cube, reticle, damage vignette, and clearer contract-complete copy. | Add richer enemy behavior variety and contract-to-contract upgrade choices. |
| Beppo Laughs | Landing reads as a circus cartridge and gameplay now presents the route as a stage with lit curtains rather than a flat internal map. | Added pure route cue state, memory/missing-item/recommended-curtain telemetry, circus-stage play surface, portal buttons, cue lighting, and route memory pips. | Add more ending variety, lighting beats, and late-maze room identity. |
| Cognitive Dissonance | Landing and gameplay now read as a diegetic AI-cabinet cartridge with glass frame, scanlines, rim nodes, pattern rain, compact portrait HUD, and distinct stable/shatter endings. | Added phase-lock recovery, deterministic shift cue state, cabinet-glass Three presentation, phase-lock halo feedback, next-pattern HUD text, mobile HUD compression, glass-lock rings, and fracture-shard ending payoffs. | Tune sound and haptic fallback after the shared audio pass. |
| Farm Follies | Landing label has the strongest cartridge readability of the new imports; gameplay now shows best-lane forecasting, a ghost next-drop token, readable bank action, and real merged animal tokens. | Added deterministic stack cue state, best-lane/merge preview HUD, bank-ready metric, lane highlight, ghost token forecast, pair-friendly opening drops, deterministic merge abilities, animal silhouettes/tier badges, late-tier pose/ribbon details, sway/danger meter, ability feedback, and scattered collapse payoff visuals. | Add optional late-run animal tier set dressing after the core score chase is locked. |

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
