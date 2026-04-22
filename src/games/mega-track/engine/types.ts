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
}

export const CONFIG = {
  MAX_SPEED: 4.0,
  GOAL_DISTANCE: 10000,
  LANE_WIDTH: 25,
  WORLD_SIZE: 120,
  OBSTACLE_LOOKAHEAD: 2100,
  OBSTACLE_CLEANUP_DISTANCE: 160,
  CAR_HALF_WIDTH: 5.4,
  COLLISION_DEPTH: 13,
};
