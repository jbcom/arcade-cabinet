---
title: Physics Pillar
description: Rigid body dynamics and collision handling in the monorepo.
---

# Physics Pillar: Rapier 3D

Arcade Cabinet standardizes entirely on **@react-three/rapier** for all physical interactions.

## Why Rapier?
Previous iterations of the cabinet relied on a mix of Cannon.js, Matter.js, or custom continuous collision detection. Rapier is written in Rust, runs in WASM, and provides deterministic, high-performance physics that works identically in both the browser and our Vitest JSDOM environment.

## Conventions
1. **Never use Cannon**.
2. **Deterministic WASM**: The Rapier WASM bundle must be explicitly exported or placed in the `public/` directory of target applications to avoid asynchronous loading failures during testing.
3. **Instancing**: For high-volume physics objects, use `<InstancedRigidBodies>` or a no-physics instanced fallback to prevent framerate collapse.
4. **Player Control**: Use `applyImpulse` or `setLinvel` rather than directly manipulating `position` for dynamic bodies to prevent clipping through terrain.
