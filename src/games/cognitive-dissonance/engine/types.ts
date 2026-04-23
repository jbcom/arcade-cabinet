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

export type CognitiveShiftStage = "calibration" | "drift" | "rain" | "storm" | "stable";

export interface CognitiveShiftCue {
  stage: CognitiveShiftStage;
  stageLabel: string;
  instruction: string;
  activePattern: CognitivePattern;
  nextPattern: CognitivePattern;
  progressPercent: number;
  phaseLockPercent: number;
  phaseLockActive: boolean;
  urgency: "low" | "medium" | "high";
}

export type CognitiveEndingTone = "stable" | "shattered";

export interface CognitiveEndingCue {
  tone: CognitiveEndingTone;
  title: string;
  message: string;
  statusLabel: string;
  nextAction: string;
  accentPattern: CognitivePattern;
  ringCount: number;
  shardCount: number;
  intensity: number;
}

export type CognitiveFeedbackTone =
  | "danger"
  | "idle"
  | "match"
  | "phase-lock"
  | "shatter"
  | "stable";

export interface CognitiveFeedbackCue {
  tone: CognitiveFeedbackTone;
  eventKey: string;
  label: string;
  audioLabel: string;
  hapticPattern: number[];
  visualFallback: string;
  accentPattern: CognitivePattern;
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
  stableHoldMs: number;
  phaseLocks: number;
  phaseLockPulseMs: number;
  patterns: CognitiveEscapePattern[];
  lastEvent: string;
  objective: string;
}
