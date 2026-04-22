import { trait } from 'koota';
import type { OtterlyState } from '../engine/types';

export const OtterlyTrait = trait<OtterlyState>(() => ({
  otter: { x: 0, y: 0 },
  otterVelocity: { x: 0, y: 0 },
  ball: { x: 0, y: 0 },
  ballVelocity: { x: 0, y: 0 },
  ballHealth: 100,
  goats: [],
  goalRadius: 1,
  elapsedMs: 0,
  barkCooldownMs: 0,
  objective: '',
}));
