---
title: Arcade Cabinet
description: Archived monorepo — each game now lives as a standalone repository under arcade-cabinet/*.
last_updated: 2026-04-23
status: archived
---

# Arcade Cabinet — Archived

> **This repository is no longer maintained.** Every game that once lived here
> has been extracted into its own standalone repository under the
> [`arcade-cabinet` GitHub organization](https://github.com/arcade-cabinet).
> Each standalone has its own CI, release-please, dependabot, Capacitor Android
> debug APK, and Pages deployment. Please open new issues and PRs there.

## Standalone cartridges

| Game | Repository |
| --- | --- |
| Beppo Laughs | [arcade-cabinet/Beppo-Laughs](https://github.com/arcade-cabinet/Beppo-Laughs) |
| Bioluminescent Sea | [arcade-cabinet/bioluminescent-sea](https://github.com/arcade-cabinet/bioluminescent-sea) |
| Cognitive Dissonance | [arcade-cabinet/cognitive-dissonance](https://github.com/arcade-cabinet/cognitive-dissonance) |
| Cosmic Gardener | [arcade-cabinet/cosmic-gardener](https://github.com/arcade-cabinet/cosmic-gardener) |
| Enchanted Forest | [arcade-cabinet/enchanted-forest](https://github.com/arcade-cabinet/enchanted-forest) |
| Entropy Edge | [arcade-cabinet/entropy-edge](https://github.com/arcade-cabinet/entropy-edge) |
| Farm Follies | [arcade-cabinet/farm-follies](https://github.com/arcade-cabinet/farm-follies) |
| Midway Mayhem | [arcade-cabinet/midway-mayhem](https://github.com/arcade-cabinet/midway-mayhem) |
| Otterly Chaotic | [arcade-cabinet/otterly-chaotic](https://github.com/arcade-cabinet/otterly-chaotic) |
| Overcast Glacier | [arcade-cabinet/grovekeeper](https://github.com/arcade-cabinet/grovekeeper) |
| Overheat Titan Extraction | [arcade-cabinet/overheat-titan-extraction](https://github.com/arcade-cabinet/overheat-titan-extraction) |
| Primordial Ascent | [arcade-cabinet/primordial-ascent](https://github.com/arcade-cabinet/primordial-ascent) |

## Why it was archived

The cabinet model (one Vite app hosting every game) made it hard for each
game to carry its own release cadence, mobile icon pack, Capacitor
configuration, and CI matrix. Extraction into per-game repositories is what
enabled:

- Independent release-please versioning per cartridge.
- A per-game Android debug APK produced by each PR's CI.
- Per-game design docs (CLAUDE.md, AGENTS.md, STANDARDS.md, docs/*) that
  don't mix cartridge identities.
- Different engine stacks per game (PixiJS for bioluminescent-sea, three
  for primordial-ascent, JollyPixel for entropy-edge, etc.).

The git history here is preserved so blame trails still work across
extraction points.

## License

MIT. See [LICENSE](./LICENSE).
