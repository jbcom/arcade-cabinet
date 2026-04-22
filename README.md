---
title: Arcade Cabinet
description: A modular collection of high-fidelity 3D and 2D games.
author: Arcade Cabinet Team
last_updated: 2026-04-21
---

# 🕹️ Arcade Cabinet

![Arcade Cabinet Hero](apps/docs/public/hero.png)

Welcome to the **Arcade Cabinet** monorepo. This repository houses a collection of modular, browser-based games engineered with React Three Fiber, Rapier, and standard web technologies.

## Architecture

This project is structured as a `pnpm` workspace separating game logic into standalone packages and deployment targets into applications:

- **`/apps`**: Contains the standalone Vite/Capacitor application shells and the documentation site.
- **`/packages`**: Contains the core game packages, each exporting an isolated game container, alongside shared UI and physics layers.

## Technology Stack

- **Framework**: React 19 + TypeScript
- **3D Engine**: `@react-three/fiber` & `@react-three/drei`
- **Physics**: `@react-three/rapier` (deterministic WASM physics)
- **Styling**: Tailwind CSS v4
- **State**: Koota (ECS architecture)
- **Tooling**: Vite, Vitest, Biome

## Development

```bash
# Install dependencies
pnpm install

# Start the development server for all apps
pnpm dev

# Run the unified test suite
pnpm test
```
