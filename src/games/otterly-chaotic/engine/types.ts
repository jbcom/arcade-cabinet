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

export type OtterPose = "guard" | "sprint" | "push" | "bark" | "rally";
export type GoatPose = "chase" | "alert" | "chew" | "stunned";

export interface OtterPoseCue {
  pose: OtterPose;
  label: string;
  leanX: number;
  leanY: number;
  tailLift: number;
  energy: number;
  accent: string;
}

export interface GoatPoseCue {
  goatId: string;
  pose: GoatPose;
  label: string;
  headPitch: number;
  hoofLift: number;
  energy: number;
  accent: string;
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
  rescuesCompleted: number;
  targetRescues: number;
  elapsedMs: number;
  barkCooldownMs: number;
  lastBarkMs: number;
  lastBarkStunned: number;
  lastRescueMs: number;
  rallyMs: number;
  rescueStreak: number;
  objective: string;
}
