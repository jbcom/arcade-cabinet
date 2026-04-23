import type { SessionMode } from "@logic/shared";

export interface Vec2 {
  x: number;
  y: number;
}

export interface Obstacle {
  id: string;
  lane: -1 | 0 | 1;
  x: number;
  z: number;
  type: "cone" | "barrier" | "pace-car";
}

export interface MegaTrackState {
  sessionMode: SessionMode;
  isPlaying: boolean;
  speed: number;
  distance: number;
  currentLane: number;
  obstacles: Obstacle[];
  nextObstacleIndex: number;
  integrity: number;
  impactCount: number;
  lastImpactMs: number;
  lastImpactType: Obstacle["type"] | null;
  lastCleanPassMs: number;
  lastOverdriveStartMs: number;
  elapsedMs: number;
  milestone: number;
  boostCharge: number;
  cleanPassStreak: number;
  overdriveMs: number;
  checkpointRepairs: number;
  lastCheckpointMs: number;
  lastCheckpointLeg: number;
}

export interface MegaTrackRaceCue {
  legLabel: string;
  sceneryBand: MegaTrackSceneryCue["band"];
  sceneryLabel: string;
  sceneryAccent: string;
  nextHazardType: Obstacle["type"] | null;
  nextHazardLane: Obstacle["lane"] | null;
  nextHazardDistance: number | null;
  recommendedLane: Obstacle["lane"];
  recommendedLaneLabel: string;
  checkpointProgressPercent: number;
  checkpointDistance: number;
  checkpointRepairActive: boolean;
  pressure: "clear" | "closing" | "danger";
}

export interface MegaTrackSceneryCue {
  band: "harbor-switchback" | "service-canyon" | "finish-fairway";
  label: string;
  banner: string;
  accent: string;
  secondaryAccent: string;
  skylineColor: string;
  fogColor: string;
  roadsideDensity: number;
}

export const CONFIG = {
  MAX_SPEED: 4.0,
  GOAL_DISTANCE: 100000,
  DISTANCE_PER_SPEED_MS: 0.04,
  LANE_WIDTH: 25,
  WORLD_SIZE: 120,
  OBSTACLE_LOOKAHEAD: 2100,
  OBSTACLE_CLEANUP_DISTANCE: 160,
  CAR_HALF_WIDTH: 5.4,
  COLLISION_DEPTH: 13,
  MAX_OBSTACLE_INDEX: 420,
};
