---
title: Claude Instructions
description: Project-specific directives for Claude models.
---

# Claude Operating Directives

## Codebase Context
- **Stack**: React 19, Vite, Vitest (Browser), Tailwind 4, Koota ECS, React Three Fiber, Rapier.
- **Structure**: `pnpm` workspace (`apps/` for shells, `packages/` for logic).

## Directives
- **Verification**: Never assume a port is successful. Always use the Vitest browser testing suite to capture and verify a screenshot of the Canvas before moving on.
- **Layouts**: Always use `100svh` for full-screen game wrappers to avoid collapsed renders in test/mobile contexts.
- **State**: Centralize state into `Koota` traits. Avoid massive `useFrame` > `useState` waterfalls that cause `Maximum update depth exceeded` errors. Read positions via refs or pass them down safely.
- **CI**: Never use unpinned GitHub Actions. Always lookup and use the exact `LATEST` stable SHA for the action's specific major version tag.
