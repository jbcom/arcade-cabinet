import { createWorld } from 'koota';
import { PhaseTrait, ScoreTrait, TimerTrait } from '@arcade-cabinet/shared';
import { createInitialState } from '../engine/Simulation';
import { SimSovietTrait } from './traits';

export const simSovietWorld = createWorld();
export const simSovietEntity = simSovietWorld.spawn(
  PhaseTrait({ phase: 'menu' }),
  ScoreTrait({ value: 8, label: 'QUOTA' }),
  TimerTrait({ elapsedMs: 0, remainingMs: 0, label: 'CALENDAR' }),
  SimSovietTrait(createInitialState())
);
