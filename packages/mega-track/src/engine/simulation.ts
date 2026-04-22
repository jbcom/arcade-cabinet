import type { MegaTrackState } from "./types";
import { CONFIG } from "./types";

export function createInitialState(): MegaTrackState {
  return {
    isPlaying: false,
    speed: 0,
    distance: 0,
    currentLane: 0,
    obstacles: [],
    elapsedMs: 0,
    milestone: 0,
    funds: 1000,
    population: 0,
  };
}

export function tick(
  state: MegaTrackState,
  deltaMs: number,
  input: { laneChange: number }
): MegaTrackState {
  if (!state.isPlaying) return state;

  const next = structuredClone(state) as MegaTrackState;
  next.elapsedMs += deltaMs;

  // Accelerate
  next.speed = Math.min(CONFIG.MAX_SPEED, next.speed + 0.001 * deltaMs);
  next.distance += next.speed * deltaMs;

  // Lane movement
  if (input.laneChange !== 0) {
    next.currentLane = Math.max(-1, Math.min(1, next.currentLane + input.laneChange));
  }

  // Obstacle spawning
  if (Math.random() < 0.02) {
    const lane = Math.floor(Math.random() * 3) - 1;
    next.obstacles.push({
      id: Math.random().toString(36).substr(2, 9),
      x: lane * CONFIG.LANE_WIDTH,
      z: next.distance + 800 + Math.random() * 400,
      type: Math.random() > 0.7 ? "barrier" : "cone",
    });
  }

  // Cleanup old obstacles
  next.obstacles = next.obstacles.filter((o) => o.z > next.distance - 100);

  // Collision detection
  const carX = next.currentLane * CONFIG.LANE_WIDTH;
  for (const obs of next.obstacles) {
    const dz = Math.abs(obs.z - next.distance);
    const dx = Math.abs(obs.x - carX);
    if (dz < 10 && dx < 10) {
      next.speed *= 0.5;
      // Remove obstacle on hit
      next.obstacles = next.obstacles.filter((o) => o.id !== obs.id);
      break;
    }
  }

  return next;
}
