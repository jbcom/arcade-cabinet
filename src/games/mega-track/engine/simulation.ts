import {
  getSessionPressureScale,
  getSessionRecoveryScale,
  normalizeSessionMode,
} from "@logic/shared";
import type { MegaTrackState } from "./types";
import { CONFIG, type Obstacle } from "./types";

const LANE_PATTERN: (-1 | 0 | 1)[] = [-1, 1, -1, 1, -1, 1, -1, 1, 0, -1, 1, 0];
const TYPE_PATTERN: Obstacle["type"][] = [
  "cone",
  "barrier",
  "cone",
  "pace-car",
  "cone",
  "barrier",
  "cone",
  "cone",
];

export function createInitialState(mode: string | null | undefined = "standard"): MegaTrackState {
  const obstacles = createObstacleRun(0, CONFIG.OBSTACLE_LOOKAHEAD);
  return {
    sessionMode: normalizeSessionMode(mode),
    isPlaying: false,
    speed: 0,
    distance: 0,
    currentLane: 0,
    obstacles,
    nextObstacleIndex: obstacles.length,
    integrity: 100,
    impactCount: 0,
    lastImpactMs: -Infinity,
    lastImpactType: null,
    lastCleanPassMs: -Infinity,
    lastOverdriveStartMs: -Infinity,
    elapsedMs: 0,
    milestone: 0,
    boostCharge: 0,
    cleanPassStreak: 0,
    overdriveMs: 0,
  };
}

export function createObstacle(index: number): Obstacle {
  const lane = LANE_PATTERN[index % LANE_PATTERN.length] ?? 0;
  const type = TYPE_PATTERN[(index * 5 + 3) % TYPE_PATTERN.length] ?? "cone";
  const z = 430 + index * 290 + ((index * 37) % 90);

  return {
    id: `obstacle-${index}`,
    lane,
    x: lane * CONFIG.LANE_WIDTH,
    z,
    type,
  };
}

export function createObstacleRun(distance: number, lookahead: number): Obstacle[] {
  const obstacles: Obstacle[] = [];
  let index = 0;
  let obstacle = createObstacle(index);
  while (obstacle.z < distance + lookahead) {
    obstacles.push(obstacle);
    index++;
    obstacle = createObstacle(index);
  }
  return obstacles;
}

export function tick(
  state: MegaTrackState,
  deltaMs: number,
  input: { laneChange: number }
): MegaTrackState {
  if (!state.isPlaying) return state;

  const next = structuredClone(state) as MegaTrackState;
  next.elapsedMs += deltaMs;
  next.overdriveMs = Math.max(0, next.overdriveMs - deltaMs);

  const seconds = deltaMs / 1000;
  const previousDistance = next.distance;
  const maxSpeed = next.overdriveMs > 0 ? CONFIG.MAX_SPEED * 1.32 : CONFIG.MAX_SPEED;
  const acceleration = next.overdriveMs > 0 ? 1.35 : 0.9;
  next.speed = Math.min(maxSpeed, next.speed + acceleration * seconds);
  next.distance += next.speed * deltaMs;
  next.boostCharge = Math.min(100, next.boostCharge + seconds * (next.currentLane === 0 ? 8 : 5));
  next.integrity = Math.min(
    100,
    next.integrity +
      seconds *
        getSessionRecoveryScale(next.sessionMode, {
          challenge: 0.2,
          cozy: 2.4,
          standard: 1.1,
        })
  );

  if (input.laneChange !== 0) {
    next.currentLane = Math.max(-1, Math.min(1, next.currentLane + input.laneChange));
  }

  while (next.nextObstacleIndex < 200) {
    const obstacle = createObstacle(next.nextObstacleIndex);
    if (obstacle.z >= next.distance + CONFIG.OBSTACLE_LOOKAHEAD) break;
    next.obstacles.push(obstacle);
    next.nextObstacleIndex++;
  }

  next.obstacles = next.obstacles.filter(
    (obstacle) => obstacle.z > next.distance - CONFIG.OBSTACLE_CLEANUP_DISTANCE
  );

  const carX = next.currentLane * CONFIG.LANE_WIDTH;
  let cleanPasses = 0;
  for (const obs of next.obstacles) {
    const dz = Math.abs(obs.z - next.distance);
    const dx = Math.abs(obs.x - carX);
    const crossed =
      obs.z >= previousDistance - CONFIG.COLLISION_DEPTH &&
      obs.z <= next.distance + CONFIG.COLLISION_DEPTH;
    if (
      (dz < CONFIG.COLLISION_DEPTH || crossed) &&
      dx < getObstacleHalfWidth(obs) + CONFIG.CAR_HALF_WIDTH
    ) {
      next.speed *= obs.type === "pace-car" ? 0.38 : 0.5;
      next.integrity = Math.max(
        0,
        next.integrity -
          getObstacleDamage(obs) *
            getSessionPressureScale(next.sessionMode, {
              challenge: 1.2,
              cozy: 0.42,
              standard: 0.62,
            })
      );
      next.impactCount++;
      next.lastImpactMs = next.elapsedMs;
      next.lastImpactType = obs.type;
      next.boostCharge = Math.max(0, next.boostCharge - 30);
      next.cleanPassStreak = 0;
      next.obstacles = next.obstacles.filter((o) => o.id !== obs.id);
      break;
    }
    if (crossed) {
      cleanPasses++;
    }
  }

  if (cleanPasses > 0) {
    next.cleanPassStreak += cleanPasses;
    next.lastCleanPassMs = next.elapsedMs;
    next.boostCharge = Math.min(100, next.boostCharge + cleanPasses * 9);
  }

  if (next.overdriveMs === 0 && next.boostCharge >= 100 && next.cleanPassStreak >= 4) {
    next.overdriveMs = 2400;
    next.lastOverdriveStartMs = next.elapsedMs;
    next.boostCharge = 0;
  }

  return next;
}

function getObstacleHalfWidth(obstacle: Obstacle): number {
  if (obstacle.type === "barrier") return 8;
  if (obstacle.type === "pace-car") return 6;
  return 4;
}

function getObstacleDamage(obstacle: Obstacle): number {
  if (obstacle.type === "barrier") return 28;
  if (obstacle.type === "pace-car") return 36;
  return 16;
}
