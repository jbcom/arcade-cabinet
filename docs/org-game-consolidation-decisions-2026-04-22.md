---
title: Arcade Consolidation Decisions
description: Owner decisions and local evidence for cabinet approvals, standalone products, merge tracks, and scope reductions.
date: 2026-04-22
---

# Arcade Consolidation Decisions: 2026-04-22

This document records owner decisions made after the docs-first audit in `docs/org-game-audit-2026-04-22.md`. It is a decision layer over that audit. Where this document conflicts with the initial audit recommendation table, this document wins.

This pass used local documentation and source inspection only. It did not perform repo transfers, destructive cleanup, or broad build/test runs.

## Owner Decisions

| Project | Decision | Implementation Meaning |
| --- | --- | --- |
| Beppo Laughs | Approved | Cabinet candidate remains approved for future cartridge evaluation. |
| Cognitive Dissonance | Approved | Cabinet candidate remains approved for future cartridge evaluation. |
| Farm Follies | Approved | Treat as the canonical stacking/merge cartridge and the active merge destination for related stacker POCs. |
| Overcast: Glacier | Reduce scope and approve | Keep the core downhill kitten arcade loop, but cut boss/biome/native ambitions until the first readable loop is proven. |
| Grovekeeper | Standalone | Do not fold into the cabinet unless a separate, much smaller cartridge is designed later. |
| Marmalade Drops | Standalone | Keep as its own product despite cabinet-like mechanics. |
| Mean Streets | Standalone | Keep as its own product. |
| Midway Mayhem | Standalone | Keep as its own product; do not use it as the canonical cabinet racer without a separate decision. |
| Otter River Rush | Standalone | Keep as its own product. |
| petitio-principii | Standalone | Keep as its own product. |
| Pond Warfare | Standalone, with engine concepts merged into Otter Elite Force | Preserve Pond Warfare as its own repo while evaluating its engine and systems as source material for Otter Elite Force. |
| Stellar Descent | Standalone | Keep as its own product. |
| Syntheteria | Standalone | Keep as its own product. |
| Overheat: Titan | Merge into current Titan Mech direction | Bring the best extraction, heat, cockpit, and resource-loop ideas into the cabinet Titan game. |
| Voxel Realms | Merge into Bok, not a cabinet cartridge | Use Voxel Realms techniques to improve Bok visuals and onboarding; keep Bok as the destination product. |
| Aetheria, Aethermoor, Dragon's Labyrinth | Merge ideas into King's Road | Use King's Road as the RPG consolidation destination. |
| Sky Hats, Farm Follies, Infinite Headaches, Psyduck stacker | Confirm exploratory merge location | Farm Follies already contains the active consolidation and POC references. |
| pixels-pygame-palace and typescript-tutor | Merge under jbcom org | Combine into one education/tooling product outside arcade-cabinet. |
| wheres-ball-though | Move to jbcom org | Pending explicit repo-transfer execution. |

## Approved Cabinet Follow-Up

The approved cabinet-adjacent products are not automatically imported into the current cabinet app. Each still needs cartridge criteria before implementation:

- Beppo Laughs: prove mobile look/move controls and readable escape pressure in the first 15 seconds.
- Cognitive Dissonance: make the player goal and mental-state consequences legible without internal design copy.
- Farm Follies: continue as the canonical stacker, preserving related POCs as source history.
- Overcast: Glacier: reduce to a single endless downhill lane loop with warmth/cocoa, one enemy type, one kick, and one photo power-up before expanding.

## Standalone Overrides

These projects are now explicitly standalone even if the initial audit called them cabinet candidates:

- Grovekeeper
- Marmalade Drops
- Mean Streets
- Midway Mayhem
- Otter River Rush
- petitio-principii
- Pond Warfare
- Stellar Descent
- Syntheteria

Pond Warfare is a special case: standalone product ownership remains, but engine and design patterns should be evaluated for Otter Elite Force.

## Merge Track: Bok Plus Voxel Realms

Destination: `bok`

Source: current cabinet `voxel-realms`

Local evidence:

- Bok already has a complete product skeleton: menu, hub, island select, sailing, game, victory/death, 8 biomes, bosses, weapons, hub buildings, tests, and persistence docs.
- Bok already owns the right architecture for this product: React interface, Koota state, JollyPixel voxel rendering, chunk terrain, Yuka AI, Rapier physics, SQLite persistence, and cross-platform input abstraction.
- Voxel Realms is visually useful but belongs to the same product class as Bok: sandbox voxel exploration with biome discovery, materials, resource pickup, long-session expectation, and world readability.

What to merge from Voxel Realms:

- Staged spawn-camp onboarding and clear first-30-second landmarks.
- Deterministic event fields such as recent pickup, biome discovery, nearest resource, nearest landmark, and objective text.
- Environmental composition patterns: silhouette ridges, water/shoreline framing, block clouds, biome contrast, and stronger fog/sky/light staging.
- CI-safe visual strategies such as instanced rendering fallback and startup staging.
- Resource pickup feedback and survey-ping language.

What not to merge:

- A second voxel engine.
- Another app shell.
- Survival sandbox scope that duplicates or dilutes Bok's roguelike island-hopping identity.

Scope reductions to make Bok shippable:

- Ship 3 biomes first instead of 8.
- Ship 3 bosses and 3 Tome page arcs first instead of a full boss set.
- Keep hub progression to one clear upgrade loop for first release.
- Make block interaction quest-limited rather than promising full creative building.
- Cap intended runs at 12 to 18 minutes.
- Treat mobile as first-class for movement and combat, but defer complex inventory/build-mode gestures.

Recommended next action:

Create a Bok feature branch, copy Voxel Realms visual and deterministic telemetry ideas into Bok documentation first, then port only the specific rendering/state patterns that close visual readability gaps.

## Merge Track: King's Road RPG Consolidation

Destination: `kings-road`

Sources: `aetheria`, `aethermoor`, `dragons-labyrinth`

Local evidence:

- King's Road has the most stable and focused RPG frame: a config-driven 3D pilgrimage along a 30 km road, mobile-first controls, JSON content, SQLite persistence, and a clear Holy Grail destination.
- Aetheria contributes anchor-based procedural world ideas, strong class archetypes, gothic pressure, and mobile-only touch assumptions, but its Expo/React Native direction should not be merged wholesale.
- Aethermoor contributes direct-address writing, classless weapon-skill progression, diegetic UI, content-density philosophy, and persistence ideas, but its adult/full-expression material should not be merged into King's Road.
- Dragon's Labyrinth contributes distance-as-pressure, geography-driven progression, companion stress, and staged dread, but its Godot/Python direction and horror identity should not replace King's Road.

What to merge:

- Aetheria's fixed world anchors as pilgrimage waystations or relic sites.
- Aethermoor's direct-address language and classless weapon-skill progression.
- Dragon's Labyrinth's distance pressure as late-road omen/corruption mechanics, not a full horror conversion.
- Diegetic HUD and mobile-first control language from all three where it strengthens King's Road.

Scope reductions:

- Keep six road anchors, but ship one main route plus micro/meso side quests first.
- Defer macro quest chains that require 60 to 120 minute commitments.
- Avoid full procedural RPG sprawl; use procedural support for encounter texture, not product identity.
- Treat companion psychology as optional after the main route is playable.

Recommended next action:

Open a King's Road consolidation branch and create a migration design doc before code movement. Favor data/content concepts and UX rules over engine imports.

## Merge Track: Otter Elite Force Plus Pond Warfare And Rivermarsh

Destination: `otter-elite-force`

Sources: `pond-warfare`, `rivermarsh`

Local evidence:

- Pond Warfare has the stronger near-complete defense engine concept: defend the Lodge, vertical map, panel grid, resources, manual units, specialists, waves, boss/sabotage/escort events, and post-match progression.
- Otter Elite Force has the stronger product identity: campaign-first tactical otter squad, Copper-Silt Reach, named missions, radio contacts, authored zones/phases, and a clearer brand.
- Otter Elite Force is already mid-rewrite on SolidJS, LittleJS, bitECS, and mission compiler infrastructure. Pond Warfare uses Pixi/Preact/bitECS and should not be imported as a runtime wholesale.
- Rivermarsh is a standalone 3D otter ecosystem/RPG, but it offers useful wetland biome, weather, ecosystem, species, and river traversal vocabulary.

What to merge:

- Pond Warfare's defend-lodge structure as an Otter Elite Force mission mode.
- Pond's compact roster model, resource economy, specialist autonomy, panel/zone planning, and match-event pacing.
- Pond's upgrade web and post-match economy if simplified enough for campaign clarity.
- Rivermarsh's biome/weather/ecosystem vocabulary as mission modifiers and map identity, not as a 3D renderer import.

What not to merge:

- Pond's Pixi/Preact runtime.
- Rivermarsh's full 3D exploration engine.
- Multiple overlapping otter strategy shells.

Scope reductions:

- Start with one Otter Elite Force mission that uses the Pond defend-lodge engine shape.
- Limit resources to two or three readable types.
- Keep specialists to a small named roster before expanding.
- Convert Pond systems into OEF mission DSL concepts, not copied runtime code.

Recommended next action:

Write a small OEF design spike: "Pond Lodge Defense Mission." Map Pond's engine entities to OEF mission DSL data and LittleJS/bitECS systems before any code import.

## Merge Track: Farm Follies Stacker Consolidation

Destination: `farm-follies`

Sources: `sky-hats`, `infinite-headaches`, `psyducks-infinite-headache`, legacy Farm Follies POCs

Local evidence:

- Farm Follies already documents itself as the consolidation of Legacy 2D, Homestead Headaches, Psyduck Merge, and Sky Hats.
- Its `docs/STATE.md` says the architectural consolidation is complete and identifies inherited pieces from Homestead Headaches, Psyduck's Infinite Headache, and Sky Hats.
- The repo preserves related POCs under `pocs/`, including `psyducks-infinite-headache`, `infinite-headaches`, and `sky-hats`.
- Sky Hats contributes robust Rapier/Jenga-style stacking ideas.
- Psyduck contributes the addictive Suika-style merge threshold and growth loop.
- Infinite Headaches contributes ECS stacking, wobble, and banking systems.

Consolidation decision:

Farm Follies is the active merge-in-progress and should be treated as the canonical stacker unless future playtesting proves another stacker has a more coherent identity.

Scope reductions:

- Keep one primary verb: drop/stack/merge.
- Use farm identity as the wrapper rather than preserving separate hat/duck products.
- Ship a short couch-friendly score/challenge loop before deep progression.

Recommended next action:

Audit Farm Follies visually and mechanically as a single product, then archive or bundle the redundant POCs only after its stacker loop is proven.

## Merge Track: Titan Mech Plus Overheat Extraction

Destination: current cabinet Titan game

Source: `overheat-titan-extraction`

Local evidence:

- Current cabinet Titan Mech already has deterministic heat, energy, coolant, weapon gating, pylon/reactor objectives, and R3F arena presentation.
- Overheat: Titan has a richer extraction identity: survey, grind ore, build heat, fill hopper, eject cubes, tractor/silo sell flow, contracts, rare isotopes, cockpit/dashboard, headlamp, boot/pause/meltdown, mobile controls, and upgrades.
- Overheat should inform Titan's identity and systems, but its monolithic implementation and in-progress migration should not replace the cabinet app structure.

What to merge:

- Heat as the central risk/reward pressure.
- Ore/contact grinding, hopper, cube ejection, tractor beam, and silo objective.
- Cockpit/dashboard presentation and diegetic terminal feedback.
- Rare isotope pickups and short contracts.
- Headlamp, muzzle/heat/cooling effects, and clearer overheat feedback.

Scope reductions:

- Reframe as a 5 to 10 minute extraction arena, not an open sandbox.
- Keep one ore type plus one rare isotope for the first pass.
- Use one silo and one reactor/pylon objective set.
- Keep combat as readable pressure, not a full shooter campaign.

Recommended next action:

Add a Titan Mech design doc in the cabinet repo that reconciles combat and extraction into one loop before porting Overheat systems.

## Merge Track: Overcast Glacier Scope Reduction

Destination: `overcast-glacier`

Decision: approved after scope reduction

Local evidence:

- The docs position Overcast as a chaotic infinite-downhill kung-fu kitten arcade game, which is a strong cabinet-adjacent identity.
- Current state docs say the web game loads and supports movement, warmth, cocoa, score, game over, high score, and flash.
- Current state docs also identify broken enemy spawning, untested kick, no photography implementation, and missing touch controls.

Approved reduced loop:

- Endless downhill movement.
- Warmth/cocoa survival pressure.
- One visible snowman enemy type.
- One kick action.
- One photo/flash power-up.
- Touch controls from the first playable pass.

Deferred:

- Boss fight.
- Multiple biomes.
- Transformation system.
- Native parity beyond the proven web loop.

Recommended next action:

Fix enemy spawning and touch controls before adding new content.

## jbcom Org Moves And Product Consolidation

These are high-impact repository ownership/product moves and were not executed in this docs pass.

| Project | Target | Status |
| --- | --- | --- |
| pixels-pygame-palace | Merge with typescript-tutor under jbcom org | Pending implementation plan and repo move confirmation. |
| typescript-tutor | Merge with pixels-pygame-palace under jbcom org | Pending implementation plan and repo move confirmation. |
| wheres-ball-though | Move to jbcom org | Pending explicit transfer execution. |

Recommended next action:

Before transferring, inspect remotes, branch protection, open PRs/issues, GitHub Pages settings, and package/deployment identity for each repo. Then perform transfers through GitHub with a recorded checklist.

## Execution Order

1. Keep this decision layer beside the original audit and use it as the owner-approved source of truth.
2. Do not delete or transfer repos until each move has a git bundle backup and a GitHub settings checklist.
3. Start with design docs for the three largest merge tracks: Bok/Voxel, King's Road RPG consolidation, and Otter Elite Force/Pond/Rivermarsh.
4. Port only concepts and tightly scoped code into the destination repos.
5. Re-run visual/playability audits after each destination has one proven loop.
