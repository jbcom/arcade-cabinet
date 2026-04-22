export interface Vec2 {
  x: number;
  y: number;
}

export interface Obstacle {
  id: string;
  x: number;
  z: number;
  type: "cone" | "barrier" | "car";
}

export interface MegaTrackState {
  isPlaying: boolean;
  speed: number;
  distance: number;
  currentLane: number;
  obstacles: Obstacle[];
  elapsedMs: number;
  milestone: number;
  funds: number;
  population: number; // For consistency with other games if needed, or just remove
}

export const CONFIG = {
  MAX_SPEED: 4.0,
  GOAL_DISTANCE: 10000,
  LANE_WIDTH: 25,
  WORLD_SIZE: 120,
};
