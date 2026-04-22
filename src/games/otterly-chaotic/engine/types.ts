import type { SessionMode } from "@logic/shared";

export interface Vec2 {
  x: number;
  y: number;
}

export interface GoatState {
  id: string;
  position: Vec2;
  speed: number;
  stunnedMs: number;
}

export interface OtterlyState {
  sessionMode: SessionMode;
  otter: Vec2;
  otterVelocity: Vec2;
  ball: Vec2;
  ballVelocity: Vec2;
  ballHealth: number;
  goats: GoatState[];
  goalRadius: number;
  elapsedMs: number;
  barkCooldownMs: number;
  lastBarkMs: number;
  lastBarkStunned: number;
  rallyMs: number;
  rescueStreak: number;
  objective: string;
}
