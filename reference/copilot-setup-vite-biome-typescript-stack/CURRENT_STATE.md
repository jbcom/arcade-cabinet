---
title: Archived Workspace Snapshot
updated: 2026-04-23
status: reference
domain: archive
---

# Archived Workspace Snapshot

This directory is a copied source snapshot from the old
`copilot/setup-vite-biome-typescript-stack` branch.

It is retained so future agents can recover package-era code, Astro cabinet
source, per-game Capacitor shells, old tests, and removed game implementations
without relying on branch history still existing.

## What Is Here

- `apps/`: old Astro docs app plus per-game shell wrappers and Android projects
- `packages/`: package-era game implementations and shared package code
- `docs/`, `e2e/`, `src/`: historical shared docs and test harness files
- `pending/`: historical POC and in-flight concept work from that branch
- `.github/`: historical workflow definitions and automation context
- root workspace manifests: `package.json`, `pnpm-workspace.yaml`,
  `tsconfig.json`, `vitest.config.ts`, release config, and related files

## What Was Intentionally Removed

- generated `dist-app/` folders have been stripped from the archived apps
  because they were build output, not source of truth

## How To Use This Snapshot

- Treat it as reference only.
- Do not patch this tree as if it were live runtime code.
- If you need to revive an old implementation, copy the relevant logic or assets
  into the live `app/`, `src/`, and `public/assets/` trees and document the move.
- Cross-check with `docs/REPOSITORY_MAP.md` before doing salvage work.
