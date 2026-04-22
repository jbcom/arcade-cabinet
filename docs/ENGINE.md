---
title: Engineering Pillar
description: The core ECS and loop architecture for Arcade Cabinet games.
---

# Engineering Pillar: Koota ECS & Game Loops

Arcade Cabinet uses a unified **Entity Component System (ECS)** powered by `koota`.

## Philosophy
To ensure all games are predictable, performant, and easily testable, game state is strictly decoupled from React's rendering lifecycle. We do not use sprawling `useState` or `useContext` hooks to track high-frequency game variables (like player velocity or health).

## Koota Implementation
Every game initializes a `WorldProvider`. Inside the game, entities are spawned with specific `Traits` (components).

- **Traits**: Small, typed data structures (e.g., `PhaseTrait`, `ScoreTrait`, `OtterlyTrait`).
- **Systems**: Standard `useFrame` or `useGameLoop` hooks that read/write from Traits without triggering expensive React re-renders.

Example:
```typescript
// Updating state safely without React renders
useFrame((state, delta) => {
    const current = entity.get(ScoreTrait);
    entity.set(ScoreTrait, { value: current.value + 1 });
});
```
