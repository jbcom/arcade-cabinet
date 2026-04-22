---
title: Local Arcade Repo Audit
description: Docs-first triage of local arcade-cabinet organization game repos for cabinet fit, standalone fit, and archive review.
date: 2026-04-22
---

# Local Arcade Repo Audit: 2026-04-22

Source evidence: local clone documentation under `/Users/jbogaty/src/arcade-cabinet`, GitHub org metadata from `gh repo list arcade-cabinet`, package/runtime markers, existing test files, and existing screenshot artifacts. This pass intentionally did not run broad builds, tests, or live play sessions.

## Snapshot

- Local clone directories audited: 49
- GitHub org repositories visible: 53
- Active local clones by pushed-at cutoff (`2026-01-22`): 48
- Stale local clones by pushed-at cutoff: 1
- Recommendation counts: cabinet-candidate: 14, standalone: 25, hold-refactor: 4, archive-candidate: 3, non-game/tool: 3
- Excluded local worktree: `protocol-silent-night-prodmod` has a `.git` file and was not counted as one of the clone directories.
- Local naming mismatch: `toki-pona-tutor` points at `arcade-cabinet/poki-soweli`.
- Origin mismatch: `overheat-titan-extraction` still points at `arcade-cabinet/overheat-titan-extract`.

## Owner Decisions Update

The owner decision layer is recorded in `docs/org-game-consolidation-decisions-2026-04-22.md`. It supersedes the initial recommendation table below where conflicts exist.

Approved cabinet follow-up: Beppo Laughs, Cognitive Dissonance, Farm Follies, and Overcast: Glacier after scope reduction.

Confirmed standalone overrides: Grovekeeper, Marmalade Drops, Mean Streets, Midway Mayhem, Otter River Rush, petitio-principii, Pond Warfare, Stellar Descent, and Syntheteria.

Merge tracks to evaluate or implement in destination repos:

1. Merge Voxel Realms techniques into Bok, then reduce Bok scope for shipment.
2. Merge ideas from Aetheria, Aethermoor, and Dragon's Labyrinth into King's Road.
3. Evaluate Pond Warfare's engine concepts inside Otter Elite Force's identity, with Rivermarsh as biome/mechanics reference.
4. Treat Farm Follies as the active stacker merge of Sky Hats, Infinite Headaches, and the Psyduck stacker POC.
5. Merge the best Overheat: Titan extraction/heat/cockpit ideas into the current Titan Mech direction.
6. Merge pixels-pygame-palace and typescript-tutor into one jbcom-org product, and move wheres-ball-though to jbcom after explicit transfer execution.

## Reading Of The Portfolio

The local set is not mostly dead by recent push date. It is mostly over-scoped: RPGs, 4X games, city sims, education tools, Godot products, and long-form simulation projects are living beside short arcade loops. The central cabinet should not absorb those projects wholesale. It should use strict cartridge criteria: short-to-medium runs, immediate readable rules, mobile/touch-friendly input, web/Android viability, and a strong one-label identity.

Voxel Realms was the clearest mismatch inside the cabinet at audit time. It wants survival sandbox expectations: world scale, block material variety, biome discovery, persistence, and long-session exploration. That is a standalone promise, not a cabinet cartridge promise, so it has since been extracted.

## Highest-Confidence Next Actions With Owner Overrides

1. Superseded: the raw audit favored extracting Voxel Realms, but the owner decision is to merge its useful techniques into Bok instead.
2. Treat Farm Follies as the likely canonical stacker before preserving Infinite Headaches, Psyducks Infinite Headache, or Sky Hats as separate active products.
3. Keep RPG/sim/4X projects standalone unless a deliberately tiny cabinet spinoff is designed from one mechanic.
4. Back up archive candidates as git bundles before any org deletion or archive action.
5. Normalize local/origin naming for `poki-soweli` and `overheat-titan-extraction` before deeper automation.

## Cabinet Candidates

| Repo | Loop | Why It Fits | Next Action |
| --- | --- | --- | --- |
| Beppo-Laughs | Start run, navigate maze, manage sanity pressure, find escape. | A maze escape run can become a strong cabinet cartridge if input and landing identity are simplified. | Paper-playtest run length and mobile look controls before considering a one-app cabinet port. |
| cognitive-dissonance | Begin experience, read fragile state, intervene, survive or shatter the mind, restart. | It can fill a distinctive cabinet slot as an atmospheric skill/pressure cartridge. | Evaluate whether the player goal is legible in under 15 seconds, then define cartridge rules and fail/win language. |
| farm-follies | Catch/drop/stack objects, adapt to wind/tornado pressure, merge or survive until failure/goal. | This is exactly the scale and readability a cabinet cartridge wants. | Promote as the canonical stacker; compare against Infinite Headaches, Psyducks, and Sky Hats before preserving duplicates. |
| grovekeeper | Plant trees, tend growth, expand grove, collect gentle progression rewards. | It could broaden the cabinet with a low-stress, couch-friendly cartridge if progression is bounded. | Paper-playtest a 5-minute run and define what completion/replay means in a cabinet context. |
| marmalade-drops | Launch/flip/guide balls through fluid-driven pinball interactions, score, repeat. | It naturally presents as a cabinet cartridge and has an immediately legible play surface. | Prioritize as a future cabinet inclusion candidate after direct playtest/screenshots. |
| mean-streets | Draft/play simultaneous tactical card rounds, seize positions, resolve deterministic brawl outcomes. | It can add a non-action cabinet slot as a readable head-to-head tactics cartridge. | Verify a complete match duration and build a cabinet label/rules summary before port consideration. |
| midway-mayhem | Steer lanes, dodge hazards, collect tickets/boosts, keep crowd hype before sanity runs out. | This is a high-confidence cabinet archetype. | Use as canonical racer source when reconciling current Mega Track visuals and controls. |
| otter-river-rush | Run down river lanes, dodge hazards, collect, push score/mastery, restart. | The loop belongs in an arcade; the only question is whether it stays Godot standalone or gets a cabinet wrapper/link. | Treat as a top candidate for the broader arcade system, but do not port until engine/deployment policy is settled. |
| overcast-glacier | Ski forward, fight snowmen, collect warmth/cocoa, photograph glitches, defeat boss. | It has a clear moment-to-moment loop and strong cartridge premise. | Run visual/playability inspection later; define whether it is endless, level-based, or boss-rush. |
| overheat-titan-extraction | Harvest/extract resources, manage heat/energy/coolant, survive hazards, improve run economy. | It matches the current Titan Mech cabinet direction if combat/extraction is made short and legible. | Normalize repo naming, then compare against current Titan Mech implementation before importing more. |
| petitio-principii | Start a seeded argument, choose rooms/claims, accumulate traits, return to the premise. | A weird text cartridge could add contrast to the cabinet without heavy 3D cost. | Keep as candidate; make the cabinet label/rules carry the premise instantly. |
| pond-warfare | Gather resources, build/train, defend lodge, survive escalating waves or mission objectives. | If constrained to lodge defense, it can be a readable strategy cartridge. | Paper-playtest the one-mode version and reject full RTS sprawl for cabinet inclusion. |
| stellar-descent | Move/shoot/dodge through levels, collect upgrades, fight boss/alien waves, progress. | Shooter/action cartridge fits if level sessions are short and controls are simplified. | Inspect current playability and decide whether cabinet version is endless drop, level select, or boss rush. |
| syntheteria | Survey board, move/select units, salvage, avoid/defeat cult pressure, trigger win/defeat. | A tactical board can work as a slower cabinet cartridge if runs remain bounded. | Playtest for first-turn clarity and mobile tap targets before considering import. |

## Standalone Products

| Repo | Purpose | Why Standalone | Next Action |
| --- | --- | --- | --- |
| aetheria | Procedural mobile RPG about a risen skeleton exploring Gothic ruins with archetypes, loot, combat, and ECS simulation. | The loop is progression-heavy and mobile-native first, so forcing it into a cabinet cartridge would weaken it. | Keep outside the cabinet; audit separately as a standalone mobile RPG if it remains strategically important. |
| aethermoor | Mobile-first Ionic Angular and BabylonJS RPG with deterministic generation and large asset/pipeline surface. | Standalone RPG/product identity is stronger than a constrained arcade cartridge identity. | Keep standalone; do not import into the central cabinet except maybe as a launcher/deep link later. |
| ashworth-manor | Godot/Babylon haunted manor or narrative exploration project with substantial visual and test artifacts. | Manor exploration wants authored pacing, not short cabinet-loop constraints. | Treat as standalone; only reuse lessons/assets, not code, for cabinet cartridges. |
| bok | Roguelike island-hopping voxel adventure with sailing, bosses, Tome pages, permanent abilities, and hub rebuilding. | The hub and long-form unlock loop are standalone strengths. | Keep standalone; if cabinet needs a voxel action slot, use a smaller purpose-built cartridge. |
| cosmic-cults | Lovecraftian 4X/RTS about cult factions competing over a corrupted hex world. | A 4X game is not a natural cabinet cartridge unless cut down to one tactical scenario. | Keep standalone or split a small tactical prototype; audit tech direction before further investment. |
| dragons-labyrinth | Bevy/Rust/Python fantasy labyrinth project with extensive docs and tests. | Engine and content direction should stand alone instead of being forced into React cabinet structure. | Run a separate repo-level design audit to identify whether it has a playable vertical slice. |
| ebb-and-bloom | Procedural evolution sim where player touch pressures guide creatures, tools, culture, buildings, governance, and religion. | The fantasy is patience and emergence, which needs standalone room to breathe. | Keep standalone; optionally derive a small cabinet microgame from one evolution pressure mechanic. |
| goats-in-hell | DOOM-inspired roguelike FPS with goat combat, YUKA AI, and React Native/R3F mobile ambitions. | First-person roguelike FPS controls and content need standalone tuning, not one-app cabinet constraints. | Keep standalone; only consider a cabinet demo if it becomes a short arena score attack. |
| grailguard | Open-world chunk kingdom builder and auto-battler defense game about expanding territory and protecting the Grail. | The systems depth is a standalone strength and would bloat cabinet scope. | Keep standalone; extract only a single defense encounter if a cabinet spinoff is desired. |
| gridizen | Governance-first city-building simulation where the player sets policies/zones and AI development shapes the city. | It fails cabinet criteria because the interesting play is systemic and long-form. | Keep out of cabinet; use its standalone repo as the canonical home. |
| iron-frontier | Cross-platform steampunk frontier RPG with first-person/3D gameplay and mobile test flows. | A frontier RPG needs standalone pacing and UI, not arcade cabinet homogenization. | Keep standalone; only consider a tiny duel/mining/minigame cartridge if needed later. |
| kings-road | Config-driven 3D RPG about walking the Kings Road toward the Holy Grail. | Its value is as a content-rich standalone RPG. | Keep standalone; do not merge into cabinet except as a separate purchasable/deep-linked product. |
| mnemonic-realms | 16-bit JRPG about memory as creative vitality, with fog-of-war and memory fragments. | JRPG pacing and narrative progression are standalone, not cabinet-first. | Keep standalone and audit worktree sprawl separately before any org cleanup. |
| neo-tokyo-rival-academies | Futuristic 3D Action JRPG with rival factions, procedural districts, quests, combat, and saves. | It has enough product scope to remain independent. | Keep standalone; only a combat challenge spinoff would fit the cabinet. |
| otter-elite-force | Tactical otter squad combat and rescue operations with 16 mission designs. | Tactical mission content needs standalone campaign structure. | Keep standalone; optionally derive one arcade rescue challenge after mission loop is proven. |
| otter-empire | Mobile-optimized 4X strategy game with customizable otter units, hex map, city management, resources, and tech tree. | 4X strategy is structurally standalone. | Keep standalone; audit worktree hygiene before cleanup decisions. |
| otterblade-odyssey | Roguelike deckbuilder adventure built as Ionic/Angular/Babylon with Capacitor targets. | Deckbuilder progression and content are stronger as standalone. | Keep standalone; later evaluate a one-fight cabinet demo only if useful. |
| poki-soweli | Cozy creature-catching RPG whose world teaches toki pona diegetically through villages, parties, region masters, and final boss. | The learning RPG journey needs standalone pacing and content ownership. | Normalize local folder naming or document alias; do not fold into central cabinet. |
| protocol-silent-night | Godot roguelike survival arena/stealth-infiltration lineage around holidaypunk or bunker survival themes. | It was already explicitly removed from cabinet scope and should stay standalone. | Do not re-add to cabinet; audit standalone repo health separately if needed. |
| reach-for-the-sky | Solid/Pixi vertical cutaway skyscraper simulator with tenants, elevators, dirt/service loops, rent, and milestones. | Simulation depth is standalone, not cabinet. | Keep standalone and continue there; do not reimport. |
| realm-walker | Seed-phrase procedural RPG engine using Gemini to weave realms and a deterministic headless simulation. | AI-generated RPG engine does not fit cabinet simplicity criteria. | Keep out of cabinet; evaluate in its standalone repo after untracked files are triaged. |
| rivermarsh | Mobile-first 3D otter wetland exploration game with RPG combat, bosses, spells, and ecosystem traversal. | It is a foundational standalone world, not a short cabinet cartridge. | Keep standalone and use as source universe for smaller otter cabinet spinoffs. |
| rivers-of-reckoning | Procedurally generated 2.5D roguelike RPG with seeded worlds, shops, combat, and mobile-first flow. | Roguelike RPG depth wants standalone ownership. | Keep standalone; audit artifact hygiene before cleanup. |
| seeds-of-emin | Godot desert roguelite RPG generated from adjective-adjective-noun seed phrases. | It is content/progression heavy and better standalone. | Keep standalone; only extract seed-name UX ideas for cabinet if useful. |
| sim-soviet | Political city/society simulation about Soviet planning, quotas, and alternate history ideological systems. | The simulation premise is standalone and not arcade cabinet material. | Do not re-add to cabinet; keep or archive according to standalone repo strategy. |

## Hold Or Refactor Before Decision

| Repo | Issue | Rationale | Next Action |
| --- | --- | --- | --- |
| llamas-with-hats | Potentially compact, but IP/tone dependency and narrative RPG framing complicate app-store cabinet inclusion. | Mechanics may fit, but the branded fan-work premise is risky for a commercial arcade cabinet. | Originalize the premise and run length before deciding cabinet versus archive. |
| sky-hats | Excellent arcade loop, but overlaps with Farm Follies stacker family. | It should not be deleted blindly, but the cabinet probably needs one best stacker unless identities diverge sharply. | Compare against Farm Follies; either make it a distinct hat-balancing cartridge or archive as source history. |
| will-it-blow | Great cabinet-scale mechanics but currently tied to Ordinary Sausage tribute/branding. | Mechanics fit; commercial cabinet identity needs originalized branding and clear phase length. | Brand-scrub and paper-playtest a 5-10 minute run before inclusion. |
| winged-daemon | Strong arcade fantasy but potentially over-narrativized and systems-heavy. | It could become a cabinet shooter if narrowed to one readable flight/combat loop. | Define a one-screen objective and mobile flight controls before import or archive decisions. |

## Archive Candidates

| Repo | Reason | Preserve First |
| --- | --- | --- |
| echoes-of-beastlight | It overlaps with several stronger active RPG repos and is stale by the three-month cutoff. | Back up as a git bundle before any org deletion discussion; first check whether any unique generator code should be preserved. |
| infinite-headaches | The concept is valuable, but the repo may be redundant if Farm Follies is canonical. | Bundle/retain as source history, then compare assets/mechanics against Farm Follies before archive/delete. |
| psyducks-infinite-headache | Likely superseded by Farm Follies as canonical stacker unless the Psyduck theme is intentionally preserved. | Back up before deletion; compare unique mechanics against Farm Follies and remove if redundant. |

## Non-Game Or Tooling Repos

| Repo | Purpose | Recommendation |
| --- | --- | --- |
| pixels-pygame-palace | Educational platform teaching Python/JavaScript game building with a conversational game builder and 3D visualization. | Exclude from cabinet candidate pool; preserve separately as education product. |
| typescript-tutor | Educational TypeScript platform teaching game development through a mascot wizard, scene builder, curriculum, and gallery. | Exclude from game cleanup; manage with education/tooling repos. |
| wheres-ball-though | College sports discovery app for team schedules and viewing options. | Move or rename out of game audit scope later; do not include in cabinet candidate pool. |

## Voxel Realms Cabinet-Only Finding

| Game | Current Source | Recommendation | Rationale | Next Action |
| --- | --- | --- | --- | --- |
| voxel-realms | /Users/jbogaty/src/arcade-cabinet/voxel-realms | standalone | Voxel survival expects broad world fidelity, content pipelines, and long-session discovery; it stands out from the cabinet because it wants to be a full standalone sandbox. | Extracted to the public `arcade-cabinet/voxel-realms` repo; Bok should evaluate useful techniques later. |

## Per-Repo Manifest Summary

| Repo | Local Path | Recommendation | Activity | Runtime Signals | Evidence | Dirty |
| --- | --- | --- | --- | --- | --- | --- |
| aetheria | /Users/jbogaty/src/arcade-cabinet/aetheria | standalone | active-3mo | Expo, React, React Native | docs 21, tests 8, screenshots 72 | yes |
| aethermoor | /Users/jbogaty/src/arcade-cabinet/aethermoor | standalone | active-3mo | Babylon.js, Capacitor, Playwright | docs 74, tests 162, screenshots 54 | yes |
| ashworth-manor | /Users/jbogaty/src/arcade-cabinet/ashworth-manor | standalone | active-3mo | Babylon.js, Godot, React, Vite, Vitest | docs 91, tests 816, screenshots 5915 | no |
| Beppo-Laughs | /Users/jbogaty/src/arcade-cabinet/Beppo-Laughs | cabinet-candidate | active-3mo | not detected | docs 96, tests 75, screenshots 168 | yes |
| bok | /Users/jbogaty/src/arcade-cabinet/bok | standalone | active-3mo | Capacitor, Playwright, React, Three.js, Vite, Vitest, Vitest Browser | docs 25, tests 117, screenshots 79 | yes |
| cognitive-dissonance | /Users/jbogaty/src/arcade-cabinet/cognitive-dissonance | cabinet-candidate | active-3mo | Capacitor, Playwright, Three.js, Vite, Vitest, Vitest Browser | docs 25, tests 33, screenshots 88 | no |
| cosmic-cults | /Users/jbogaty/src/arcade-cabinet/cosmic-cults | standalone | active-3mo | not detected | docs 99, tests 15, screenshots 0 | yes |
| dragons-labyrinth | /Users/jbogaty/src/arcade-cabinet/dragons-labyrinth | standalone | active-3mo | Bevy, Python, Rust | docs 169, tests 171, screenshots 75 | yes |
| ebb-and-bloom | /Users/jbogaty/src/arcade-cabinet/ebb-and-bloom | standalone | active-3mo | Capacitor, React, React Three Fiber, Three.js | docs 101, tests 133, screenshots 37 | yes |
| echoes-of-beastlight | /Users/jbogaty/src/arcade-cabinet/echoes-of-beastlight | archive-candidate | stale-3mo | Rust | docs 126, tests 25, screenshots 5 | no |
| farm-follies | /Users/jbogaty/src/arcade-cabinet/farm-follies | cabinet-candidate | active-3mo | Capacitor, Playwright, React, React Three Fiber, Three.js, Vite, Vitest, Vitest Browser | docs 305, tests 194, screenshots 128 | yes |
| goats-in-hell | /Users/jbogaty/src/arcade-cabinet/goats-in-hell | standalone | active-3mo | Expo, Playwright, React, React Native, React Three Fiber, Three.js | docs 333, tests 56, screenshots 268 | yes |
| grailguard | /Users/jbogaty/src/arcade-cabinet/grailguard | standalone | active-3mo | Capacitor, Playwright, React, React Three Fiber, Three.js, Vite, Vitest, Vitest Browser | docs 126, tests 153, screenshots 161 | yes |
| gridizen | /Users/jbogaty/src/arcade-cabinet/gridizen | standalone | active-3mo | Capacitor, Playwright, React, React Three Fiber, Three.js, Vite, Vitest | docs 135, tests 70, screenshots 20 | no |
| grovekeeper | /Users/jbogaty/src/arcade-cabinet/grovekeeper | cabinet-candidate | active-3mo | Babylon.js, Capacitor, Playwright, Vite, Vitest, Vitest Browser | docs 66, tests 85, screenshots 55 | no |
| infinite-headaches | /Users/jbogaty/src/arcade-cabinet/infinite-headaches | archive-candidate | active-3mo | Babylon.js, Capacitor, Playwright, React, Vite, Vitest | docs 138, tests 59, screenshots 25 | yes |
| iron-frontier | /Users/jbogaty/src/arcade-cabinet/iron-frontier | standalone | active-3mo | Expo, Playwright, React, React Native, React Three Fiber, Three.js | docs 1026, tests 89, screenshots 139 | yes |
| kings-road | /Users/jbogaty/src/arcade-cabinet/kings-road | standalone | active-3mo | Capacitor, Playwright, React, React Three Fiber, Three.js, Vite, Vitest, Vitest Browser | docs 324, tests 860, screenshots 1441 | no |
| llamas-with-hats | /Users/jbogaty/src/arcade-cabinet/llamas-with-hats | hold-refactor | active-3mo | Babylon.js, Capacitor, Playwright, React, Vite, Vitest | docs 30, tests 17, screenshots 193 | yes |
| marmalade-drops | /Users/jbogaty/src/arcade-cabinet/marmalade-drops | cabinet-candidate | active-3mo | Capacitor, Playwright, React, React Three Fiber, Three.js, Vite, Vitest, Vitest Browser | docs 52, tests 32, screenshots 121 | no |
| mean-streets | /Users/jbogaty/src/arcade-cabinet/mean-streets | cabinet-candidate | active-3mo | Capacitor, Playwright, Python, React, Vite, Vitest | docs 39, tests 116, screenshots 480 | yes |
| midway-mayhem | /Users/jbogaty/src/arcade-cabinet/midway-mayhem | cabinet-candidate | active-3mo | Capacitor, Playwright, React, React Three Fiber, Three.js, Vite, Vitest, Vitest Browser | docs 123, tests 118, screenshots 175 | yes |
| mnemonic-realms | /Users/jbogaty/src/arcade-cabinet/mnemonic-realms | standalone | active-3mo | Expo, Playwright, React, React Native | docs 252, tests 883, screenshots 16758 | yes |
| neo-tokyo-rival-academies | /Users/jbogaty/src/arcade-cabinet/neo-tokyo-rival-academies | standalone | active-3mo | Babylon.js, Capacitor, Vite, Vitest | docs 1230, tests 479, screenshots 2188 | yes |
| otter-elite-force | /Users/jbogaty/src/arcade-cabinet/otter-elite-force | standalone | active-3mo | Capacitor, Playwright, Vite, Vitest, Vitest Browser | docs 60, tests 154, screenshots 835 | yes |
| otter-empire | /Users/jbogaty/src/arcade-cabinet/otter-empire | standalone | active-3mo | Playwright | docs 203, tests 248, screenshots 80 | yes |
| otter-river-rush | /Users/jbogaty/src/arcade-cabinet/otter-river-rush | cabinet-candidate | active-3mo | Godot | docs 709, tests 360, screenshots 1244 | yes |
| otterblade-odyssey | /Users/jbogaty/src/arcade-cabinet/otterblade-odyssey | standalone | active-3mo | Babylon.js, Capacitor, Playwright | docs 284, tests 64, screenshots 123 | yes |
| overcast-glacier | /Users/jbogaty/src/arcade-cabinet/overcast-glacier | cabinet-candidate | active-3mo | Playwright, Vitest | docs 27, tests 9, screenshots 43 | yes |
| overheat-titan-extraction | /Users/jbogaty/src/arcade-cabinet/overheat-titan-extraction | cabinet-candidate | active-3mo | Capacitor, Playwright, React, React Three Fiber, Three.js, Vite, Vitest, Vitest Browser | docs 24, tests 24, screenshots 65 | yes |
| petitio-principii | /Users/jbogaty/src/arcade-cabinet/petitio-principii | cabinet-candidate | active-3mo | Capacitor, Playwright, React, Vite, Vitest, Vitest Browser | docs 37, tests 26, screenshots 55 | yes |
| pixels-pygame-palace | /Users/jbogaty/src/arcade-cabinet/pixels-pygame-palace | non-game/tool | active-3mo | Playwright, Python, React, Vitest | docs 157, tests 41, screenshots 6896 | yes |
| poki-soweli | /Users/jbogaty/src/arcade-cabinet/toki-pona-tutor | standalone | active-3mo | Capacitor, Godot, Playwright, Vite, Vitest | docs 81, tests 351, screenshots 23738 | yes |
| pond-warfare | /Users/jbogaty/src/arcade-cabinet/pond-warfare | cabinet-candidate | active-3mo | Capacitor, Playwright, Vite, Vitest, Vitest Browser | docs 146, tests 290, screenshots 553 | no |
| protocol-silent-night | /Users/jbogaty/src/arcade-cabinet/protocol-silent-night | standalone | active-3mo | Godot | docs 54, tests 2639, screenshots 297 | yes |
| psyducks-infinite-headache | /Users/jbogaty/src/arcade-cabinet/psyducks-infinite-headache | archive-candidate | active-3mo | Capacitor, Playwright, Vitest | docs 17, tests 62, screenshots 4 | yes |
| reach-for-the-sky | /Users/jbogaty/src/arcade-cabinet/reach-for-the-sky | standalone | active-3mo | Capacitor, Three.js, Vite, Vitest | docs 7, tests 6, screenshots 3 | yes |
| realm-walker | /Users/jbogaty/src/arcade-cabinet/realm-walker | standalone | active-3mo | Expo, React, React Native | docs 22, tests 5, screenshots 7 | no |
| rivermarsh | /Users/jbogaty/src/arcade-cabinet/rivermarsh | standalone | active-3mo | not detected | docs 99, tests 62, screenshots 126 | yes |
| rivers-of-reckoning | /Users/jbogaty/src/arcade-cabinet/rivers-of-reckoning | standalone | active-3mo | Babylon.js, Capacitor, Playwright, Vitest | docs 5085, tests 4703, screenshots 2152 | yes |
| seeds-of-emin | /Users/jbogaty/src/arcade-cabinet/seeds-of-emin | standalone | active-3mo | Godot | docs 34, tests 320, screenshots 374 | yes |
| sim-soviet | /Users/jbogaty/src/arcade-cabinet/sim-soviet | standalone | active-3mo | Expo, Playwright, React, React Native, React Three Fiber, Three.js | docs 1426, tests 444, screenshots 481 | yes |
| sky-hats | /Users/jbogaty/src/arcade-cabinet/sky-hats | hold-refactor | active-3mo | Babylon.js, Capacitor, Playwright | docs 42, tests 42, screenshots 59 | yes |
| stellar-descent | /Users/jbogaty/src/arcade-cabinet/stellar-descent | cabinet-candidate | active-3mo | Babylon.js, Capacitor, Playwright, React, Vite, Vitest | docs 853, tests 204, screenshots 437 | yes |
| syntheteria | /Users/jbogaty/src/arcade-cabinet/syntheteria | cabinet-candidate | active-3mo | Babylon.js, Capacitor, Playwright, React, Vite, Vitest | docs 69, tests 101, screenshots 615 | yes |
| typescript-tutor | /Users/jbogaty/src/arcade-cabinet/typescript-tutor | non-game/tool | active-3mo | Playwright, Python, React, Vite, Vitest | docs 87, tests 31, screenshots 4209 | no |
| wheres-ball-though | /Users/jbogaty/src/arcade-cabinet/wheres-ball-though | non-game/tool | active-3mo | not detected | docs 24, tests 60, screenshots 55 | no |
| will-it-blow | /Users/jbogaty/src/arcade-cabinet/will-it-blow | hold-refactor | active-3mo | Capacitor, Playwright, React, React Three Fiber, Three.js, Vite, Vitest, Vitest Browser | docs 50, tests 94, screenshots 191 | no |
| winged-daemon | /Users/jbogaty/src/arcade-cabinet/winged-daemon | hold-refactor | active-3mo | Capacitor, Playwright, React, React Three Fiber, Three.js, Vite, Vitest | docs 120, tests 70, screenshots 18 | yes |

## Org Repos Not Detailed In This Pass

These were visible in the `arcade-cabinet` org metadata but were not part of the 49 local clone-directory audit surface.

| Repo | Activity | Last Push | Language | Description |
| --- | --- | --- | --- | --- |
| .github | stale-3mo | 2026-01-08T06:10:51Z | JavaScript | Organization-wide settings and defaults for arcade-cabinet |
| arcade-cabinet.github.io | stale-3mo | 2026-01-08T06:11:14Z | JavaScript | Documentation portal for Arcade Cabinet games |
| constellaball | active-3mo | 2026-04-11T20:02:52Z | TypeScript |  |
| syntheteria-3d | active-3mo | 2026-03-14T01:51:49Z | TypeScript | 3D experimental expansion of Syntheteria (Vite + React + Three.js) |

## Acceptance Notes

- This is documentation triage, not a playability verdict from fresh screenshots.
- Existing screenshots/tests are counted as evidence only; they were not re-run.
- Archive candidates are candidates for backup-and-review, not deletion commands.
- Cabinet candidates are candidates for future design/playtest passes, not automatic imports.
