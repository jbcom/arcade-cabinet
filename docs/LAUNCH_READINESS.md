---
title: Launch Readiness Checklist
updated: 2026-04-23
status: in-progress
domain: ops
---

# Launch Readiness

This is the manual release sweep for Arcade Cabinet 1.0.

## Product Scope

- [ ] Launch scope is still exactly 12 cartridges.
- [ ] Every cartridge still communicates a clear goal inside the first 15 seconds.
- [ ] No landing page reads like an internal spec sheet.
- [ ] Every cartridge has rules, mode selection, and a replay promise.

## Quality Gates

- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm test:e2e`
- [ ] `pnpm build`
- [ ] `pnpm exec cap sync android`
- [ ] `./gradlew assembleDebug`
- [ ] `pnpm android:release:aab`

## Visual Sweep

- [ ] Cabinet home/gallery screenshots regenerated and reviewed.
- [ ] Landing screenshots regenerated for all 12 cartridges.
- [ ] Gameplay screenshots regenerated for all 12 cartridges on desktop/mobile.
- [ ] No blank scenes, unreadable HUDs, or overlapping mobile controls remain.

## Android Sweep

- [ ] App launches from cold start on emulator/device.
- [ ] Rotate and resize preserve state cleanly.
- [ ] Save/resume survives pause and relaunch.
- [ ] Release AAB is generated and archived.

## Documentation Sweep

- [ ] `AGENTS.md` matches the real repo state.
- [ ] Root docs in `docs/` are current.
- [ ] Per-game docs match the current loop and remaining work.

## Signoff

| Role | Name | Date | Notes |
| --- | --- | --- | --- |
| Product |  |  |  |
| Engineering |  |  |  |
| Design |  |  |  |
| QA |  |  |  |
