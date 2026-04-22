---
title: Game Visual Audit
description: Screenshot-driven visual coherence and feature-completion notes after the single-app migration.
date: 2026-04-22
---

# Game Visual Audit: 2026-04-22

Source evidence: Vitest Browser e2e screenshots in `test-screenshots/games` at desktop
1280x720 and mobile 390x844. Screenshot order used for the first contact sheet:
Bioluminescent Sea, Cosmic Gardener, Enchanted Forest, Entropy Edge, Mega Track,
Otterly Chaotic, Primordial Ascent, Titan Mech, Voxel Realms.

## Current Pass

| Game | Screenshot read | Status after this pass | Next priority |
| --- | --- | --- | --- |
| Bioluminescent Sea | Strong underwater identity, readable creatures, good mobile scale. | No immediate visual fix in this pass. | Add richer collection feedback and more explicit route/depth landmarks. |
| Cosmic Gardener | Strong cosmic board identity and mobile framing. | No immediate visual fix in this pass. | Tighten lower flipper/paddle framing and add clearer constellation completion feedback. |
| Enchanted Forest | Coherent grove defense composition with readable wave UI. | No immediate visual fix in this pass. | Improve mobile rune/control affordance scale and enemy path telegraphing. |
| Entropy Edge | Strong tabletop arena and HUD identity. | No immediate visual fix in this pass. | Replace alpha-in-rgba Three color inputs and add clearer resonance state changes. |
| Mega Track | Previously read as a plain road with a placeholder white block car and empty sky. | Added authored racer silhouette, side pods, underglow, and moving trackside skyline pylons. | Add collision sparks and overdrive lane effects tied to simulation state. |
| Otterly Chaotic | Previously had a flat green field and mobile HUD consumed too much vertical space. | Added meadow patches, berms, pond/goal dressing, shrubs, and compact mobile HUD/camera framing. | Add bark shockwave visuals and goat intent indicators. |
| Primordial Ascent | Previously rendered but mobile was too dark/cropped to communicate the ascent route. | Aimed unlocked camera at anchor chain, opened lighting/fog, added route rings, and reduced tool occlusion. | Add clearer grapple target state and heat shimmer around rising lava. |
| Titan Mech | Solid cockpit/mech identity, but reads low contrast in mobile screenshots. | No immediate visual fix in this pass. | Brighten enemy/threat hierarchy and add damage/weapon feedback. |
| Voxel Realms | Previously faced a washed-out empty horizon with sparse debug-like blocks. | Re-aimed start view toward shoreline camp, beacon, resources, trees, terrain steps, and stronger block lighting. | Add biome silhouettes, resource pickup animation, and richer block material variation. |

## Test Contract

- Browser screenshots remain generated through Vitest Browser e2e flows.
- The release branch fix moved canvas sampling before PNG encoding to avoid CI screenshot stalls on heavy WebGL scenes.
- Future visual changes should keep desktop and mobile screenshot evidence in the same harness before merge.
