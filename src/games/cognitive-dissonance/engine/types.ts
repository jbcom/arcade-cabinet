import type { SessionMode } from "@logic/shared";

export type CognitivePhase = "menu" | "playing" | "stable" | "shattered";
export type CognitivePattern = "violet" | "cyan" | "gold";

export interface CognitiveModeTuning {
  tensionRisePerSecond: number;
  coherenceDrainPerSecond: number;
  matchRecoveryPerSecond: number;
  shiftDurationMs: number;
}

export interface CognitiveEscapePattern {
  id: string;
  color: CognitivePattern;
  orbit: number;
  intensity: number;
}

export interface CognitiveState {
  phase: CognitivePhase;
  sessionMode: SessionMode;
  elapsedMs: number;
  coherence: number;
  tension: number;
  currentPattern: CognitivePattern;
  stableMatches: number;
  patterns: CognitiveEscapePattern[];
  lastEvent: string;
  objective: string;
}
