import type { SessionMode } from "@logic/shared";

export type OvercastPhase = "menu" | "playing" | "gameover" | "finished";
export type OvercastEntityKind = "snowman" | "cocoa" | "glitch";
export type OvercastEvent = "idle" | "kick" | "photo" | "cocoa" | "hit" | "glitch";
export type OvercastWeather = "clear" | "flurry" | "blizzard" | "glitchfall";

export interface OvercastControls {
  steer: number;
  kick: boolean;
  photo: boolean;
}

export interface OvercastEntity {
  id: string;
  kind: OvercastEntityKind;
  lane: -1 | 0 | 1;
  distance: number;
}

export interface OvercastSegmentCue {
  label: string;
  weather: OvercastWeather;
  progressLabel: string;
  trafficLabel: string;
  trafficLevel: "gentle" | "busy" | "storm";
  nearestKind: OvercastEntityKind | null;
  nearestLane: -1 | 0 | 1 | null;
  nearestDistance: number | null;
  warmthWarning: boolean;
}

export interface OvercastFinishCue {
  title: string;
  rating: string;
  message: string;
  nextAction: string;
  routeLights: number;
  scoreBonus: number;
  warmthGrade: "warm" | "steady" | "shivering";
}

export interface OvercastState {
  phase: OvercastPhase;
  sessionMode: SessionMode;
  timeMs: number;
  playerLane: -1 | 0 | 1;
  warmth: number;
  maxWarmth: number;
  score: number;
  scoreRemainder: number;
  combo: number;
  segmentIndex: number;
  segmentProgress: number;
  segmentsCleared: number;
  photoCharges: number;
  speed: number;
  entities: OvercastEntity[];
  segmentCue: OvercastSegmentCue;
  finishCue: OvercastFinishCue | null;
  lastEvent: OvercastEvent;
  lastEventMs: number;
  objective: string;
}

export const OVERCAST_CONFIG = {
  LANES: [-1, 0, 1] as const,
  BASE_SPEED: 0.018,
  WARMTH_DRAIN_PER_SECOND: 1.1,
  COLLISION_DISTANCE: 7,
  SPAWN_DISTANCE: 118,
  MAX_ENTITIES: 8,
  SEGMENT_DURATION_MS: 90_000,
  TARGET_SEGMENTS: 6,
  RUN_TARGET_MS: 540_000,
};
