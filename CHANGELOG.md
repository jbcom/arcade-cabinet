---
title: Changelog
description: Record of all major updates and migrations.
version: 1.0.0
---

# Changelog

## [0.3.0](https://github.com/jbcom/arcade-cabinet/compare/arcade-cabinet-v0.2.0...arcade-cabinet-v0.3.0) (2026-04-22)


### Features

* ship arcade cabinet monorepo ([fc48720](https://github.com/jbcom/arcade-cabinet/commit/fc48720ecf8273626fcb60d129b884ec9457d387))

## [1.0.0] - 2026-04-21

### Changed
- **Massive Monorepo Migration**: Completely dismantled the legacy `pending/` HTML monoliths.
- **Unified Tech Stack**: Migrated all games to React 19, Tailwind 4, and `@react-three/fiber`.
- **Physics Standardization**: Replaced legacy physics engines (Cannon, custom) with `@react-three/rapier` across the board for stable, deterministic collisions.
- **3D Modeling**: Upgraded placeholder primitive meshes (capsules, boxes) in games like *Otterly Chaotic* to composite 3D character groups for enhanced visual fidelity.
- **Viewport Layouts**: Standardized all game containers to `100svh` to prevent collapsed renders in mobile and test environments.

### Added
- **Browser Testing**: Established comprehensive `vitest-browser-react` suites for every game, verifying full gameplay rendering.
- **CI/CD Security**: Pinned all GitHub Actions workflows to explicit LATEST stable SHAs.
- **Documentation**: Introduced frontmatter-headed documentation system.
