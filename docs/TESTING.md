---
title: Testing
updated: 2026-04-23
status: current
domain: quality
---

# Testing

This document owns the validation policy for the cabinet. It is intentionally
strict because most cabinet regressions are visual, responsive, or stateful.

## Canonical Validation Commands

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
pnpm exec cap sync android
cd android && ./gradlew assembleDebug
pnpm android:release:aab
```

## Test Ownership

### Unit and logic coverage

- Logic tests live beside deterministic systems in `src/games/*`.
- Shared runtime and save-model tests live in `src/shared/*`.
- These tests must cover mode tuning, replay determinism, recoverability, and
  end-of-run transitions.

### Browser integration and e2e coverage

- Canonical browser coverage lives in Vitest Browser.
- `e2e/cabinet.test.tsx` covers the cabinet shell.
- `e2e/game-landings.test.tsx` covers cartridge landings.
- `e2e/games.test.tsx` covers gameplay starts and screenshot evidence.
- Per-game browser tests in `app/games/*` cover start flow and critical route
  transitions.

### Direct Playwright

Direct Playwright may be used for local diagnosis when Vitest Browser cannot
surface a bug clearly enough. It is not the canonical acceptance path and must
not replace browser-harness screenshots or e2e coverage.

## Visual Acceptance Rules

- Every launch cartridge needs landing screenshots at desktop and mobile sizes.
- Every launch cartridge needs gameplay screenshots at desktop and mobile sizes.
- Cabinet home/gallery screenshots must remain current.
- Screenshot evidence must show that the scene is nonblank and the first
  interaction is readable.

## Responsive and Runtime Assertions

- Movement games must keep touch-anywhere joystick parity.
- Pointer/touch games must remain usable in portrait without hidden controls.
- Save/resume, pause, settings, and return-to-cabinet flows must stay intact.
- Android sync/build must keep passing after each meaningful merge.
