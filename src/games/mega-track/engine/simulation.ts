import {
  getSessionPressureScale,
  getSessionRecoveryScale,
  normalizeSessionMode,
} from "@logic/shared";
import type { MegaTrackRaceCue, MegaTrackState } from "./types";
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

export const CUP_LEG_COUNT = 3;
const CHECKPOINT_REPAIR_BASE = 18;

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
    checkpointRepairs: 0,
    lastCheckpointLeg: 1,
    lastCheckpointMs: -Infinity,
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
  next.distance += next.speed * deltaMs * CONFIG.DISTANCE_PER_SPEED_MS;
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

  const previousLeg = getLegForDistance(previousDistance);
  const currentLeg = getLegForDistance(next.distance);
  if (currentLeg > previousLeg && previousLeg < CUP_LEG_COUNT) {
    const repairAmount =
      CHECKPOINT_REPAIR_BASE *
      getSessionRecoveryScale(next.sessionMode, {
        challenge: 0.7,
        cozy: 1.45,
        standard: 1,
      });
    next.integrity = Math.min(100, next.integrity + repairAmount);
    next.boostCharge = Math.min(100, next.boostCharge + 24);
    next.checkpointRepairs += 1;
    next.lastCheckpointLeg = currentLeg;
    next.lastCheckpointMs = next.elapsedMs;
  }

  if (input.laneChange !== 0) {
    next.currentLane = Math.max(-1, Math.min(1, next.currentLane + input.laneChange));
  }

  while (next.nextObstacleIndex < CONFIG.MAX_OBSTACLE_INDEX) {
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

export function didFinishCup(state: MegaTrackState): boolean {
  return state.distance >= CONFIG.GOAL_DISTANCE;
}

export function getCupLegProgress(state: MegaTrackState) {
  const clampedDistance = Math.min(CONFIG.GOAL_DISTANCE, Math.max(0, state.distance));
  const legLength = CONFIG.GOAL_DISTANCE / CUP_LEG_COUNT;
  const leg = getLegForDistance(clampedDistance);
  const legStart = (leg - 1) * legLength;

  return {
    leg,
    legRemainingDistance: Math.max(0, legLength - (clampedDistance - legStart)),
    legProgress: Math.min(1, (clampedDistance - legStart) / legLength),
    overallProgress: clampedDistance / CONFIG.GOAL_DISTANCE,
    remainingDistance: Math.max(0, CONFIG.GOAL_DISTANCE - clampedDistance),
  };
}

export function getMegaTrackRaceCue(state: MegaTrackState): MegaTrackRaceCue {
  const cup = getCupLegProgress(state);
  const nextHazard = getNextHazard(state);
  const nextHazardDistance = nextHazard
    ? Math.max(0, Math.round((nextHazard.z - state.distance) / 10))
    : null;
  const recommendedLane = getRecommendedLane(state, nextHazard);
  const checkpointRepairAge = state.elapsedMs - state.lastCheckpointMs;
  const checkpointRepairActive =
    Number.isFinite(checkpointRepairAge) && checkpointRepairAge >= 0 && checkpointRepairAge < 1500;
  let pressure: MegaTrackRaceCue["pressure"] = "clear";

  if (
    nextHazardDistance !== null &&
    nextHazard?.lane === state.currentLane &&
    nextHazardDistance < 28
  ) {
    pressure = "danger";
  } else if (nextHazardDistance !== null && nextHazardDistance < 58) {
    pressure = "closing";
  }

  return {
    checkpointDistance: Math.max(0, Math.round(cup.legRemainingDistance / 10)),
    checkpointProgressPercent: Math.round(cup.legProgress * 100),
    checkpointRepairActive,
    legLabel: `Leg ${cup.leg}/${CUP_LEG_COUNT}`,
    nextHazardDistance,
    nextHazardLane: nextHazard?.lane ?? null,
    nextHazardType: nextHazard?.type ?? null,
    pressure,
    recommendedLane,
    recommendedLaneLabel: labelLane(recommendedLane),
  };
}

export function getMegaTrackRunSummary(state: MegaTrackState) {
  const cup = getCupLegProgress(state);

  return {
    checkpointRepairs: state.checkpointRepairs,
    cupLeg: cup.leg,
    cupLegCount: CUP_LEG_COUNT,
    distanceMeters: Math.floor(Math.min(state.distance, CONFIG.GOAL_DISTANCE) / 10),
    elapsedSeconds: Math.round(state.elapsedMs / 1000),
    impactCount: state.impactCount,
    integrity: Math.round(state.integrity),
    overdrives: state.lastOverdriveStartMs > Number.NEGATIVE_INFINITY ? 1 : 0,
    progressPercent: Math.round(cup.overallProgress * 100),
  };
}

function getLegForDistance(distance: number): number {
  const clampedDistance = Math.min(CONFIG.GOAL_DISTANCE, Math.max(0, distance));
  const legLength = CONFIG.GOAL_DISTANCE / CUP_LEG_COUNT;
  return Math.min(CUP_LEG_COUNT, Math.floor(clampedDistance / legLength) + 1);
}

function getNextHazard(state: MegaTrackState): Obstacle | null {
  return (
    state.obstacles
      .filter((obstacle) => obstacle.z > state.distance)
      .sort((a, b) => a.z - b.z)[0] ?? null
  );
}

function getRecommendedLane(state: MegaTrackState, nextHazard: Obstacle | null): Obstacle["lane"] {
  const lanes: Obstacle["lane"][] = [-1, 0, 1];
  if (!nextHazard || nextHazard.lane !== state.currentLane) {
    return clampLane(state.currentLane);
  }

  return (
    lanes
      .filter((lane) => lane !== nextHazard.lane)
      .sort((a, b) => Math.abs(a - state.currentLane) - Math.abs(b - state.currentLane))[0] ?? 0
  );
}

function clampLane(lane: number): Obstacle["lane"] {
  if (lane < 0) return -1;
  if (lane > 0) return 1;
  return 0;
}

function labelLane(lane: Obstacle["lane"]): string {
  if (lane < 0) return "left lane";
  if (lane > 0) return "right lane";
  return "center lane";
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
