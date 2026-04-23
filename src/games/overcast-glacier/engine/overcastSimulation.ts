import {
  getSessionPressureScale,
  getSessionRecoveryScale,
  normalizeSessionMode,
} from "@logic/shared";
import type {
  OvercastControls,
  OvercastEntity,
  OvercastFinishCue,
  OvercastSegmentCue,
  OvercastState,
  OvercastWeather,
} from "./types";
import { OVERCAST_CONFIG } from "./types";

const DEFAULT_CONTROLS: OvercastControls = {
  steer: 0,
  kick: false,
  photo: false,
};

const SEGMENT_LABELS = [
  "Hazard Ribbon",
  "Cocoa Switchback",
  "Snowman Parade",
  "Glitch Lens",
  "Blizzard Arcade",
  "Aurora Runout",
] as const;

const SEGMENT_WEATHER: readonly OvercastWeather[] = [
  "clear",
  "flurry",
  "flurry",
  "glitchfall",
  "blizzard",
  "clear",
];

const STANDARD_SEGMENT_INTERVALS = [2350, 2250, 2150, 2050, 1975, 1900] as const;
const CHALLENGE_SEGMENT_INTERVALS = [1950, 1825, 1700, 1575, 1475, 1375] as const;
const COZY_SEGMENT_INTERVALS = [2700, 2600, 2500, 2400, 2325, 2250] as const;

export function createInitialOvercastState(
  phase: OvercastState["phase"] = "menu",
  mode: string | null | undefined = "standard"
): OvercastState {
  const sessionMode = normalizeSessionMode(mode);
  const entities = createOpeningEntities();

  return {
    phase,
    sessionMode,
    timeMs: 0,
    playerLane: 0,
    warmth: 100,
    maxWarmth: 100,
    score: 0,
    scoreRemainder: 0,
    combo: 0,
    segmentIndex: 0,
    segmentProgress: 0,
    segmentsCleared: 0,
    photoCharges: 1,
    speed: OVERCAST_CONFIG.BASE_SPEED,
    entities,
    segmentCue: createOvercastSegmentCue({
      entities,
      playerLane: 0,
      segmentIndex: 0,
      segmentProgress: 0,
      warmth: 100,
    }),
    finishCue: null,
    lastEvent: "idle",
    lastEventMs: 0,
    objective: "Stay warm, kick snowmen, and photograph glitches.",
  };
}

export function normalizeOvercastControls(input: Partial<OvercastControls> = {}): OvercastControls {
  return {
    ...DEFAULT_CONTROLS,
    ...input,
    steer: clamp(input.steer ?? DEFAULT_CONTROLS.steer, -1, 1),
  };
}

export function advanceOvercastState(
  state: OvercastState,
  deltaMs: number,
  input: Partial<OvercastControls>
): OvercastState {
  if (state.phase !== "playing") {
    return state;
  }

  const controls = normalizeOvercastControls(input);
  const nextTime = state.timeMs + Math.max(0, deltaMs);
  const steerLane = controls.steer > 0.35 ? 1 : controls.steer < -0.35 ? -1 : 0;
  const playerLane = clampLane(state.playerLane + steerLane);
  const speed = OVERCAST_CONFIG.BASE_SPEED + Math.min(0.014, nextTime / 240_000);
  const advancedEntities = state.entities
    .map((entity) => ({
      ...entity,
      distance: entity.distance - speed * deltaMs,
    }))
    .filter((entity) => entity.distance > -12);

  const collision = advancedEntities.find(
    (entity) =>
      entity.lane === playerLane && Math.abs(entity.distance) <= OVERCAST_CONFIG.COLLISION_DISTANCE
  );
  const remainingEntities = collision
    ? advancedEntities.filter((entity) => entity.id !== collision.id)
    : advancedEntities;
  const pressureScale = getSessionPressureScale(state.sessionMode, {
    challenge: 1.4,
    cozy: 0.52,
    standard: 0.72,
  });
  const resolved = resolveCollision(state, controls, collision);
  const warmth = clamp(
    resolved.warmth - OVERCAST_CONFIG.WARMTH_DRAIN_PER_SECOND * pressureScale * (deltaMs / 1000),
    0,
    state.maxWarmth
  );
  const segmentIndex = Math.min(
    OVERCAST_CONFIG.TARGET_SEGMENTS - 1,
    Math.floor(nextTime / OVERCAST_CONFIG.SEGMENT_DURATION_MS)
  );
  const segmentsCleared = Math.min(
    OVERCAST_CONFIG.TARGET_SEGMENTS,
    Math.floor(nextTime / OVERCAST_CONFIG.SEGMENT_DURATION_MS)
  );
  const spawned = spawnEntities(remainingEntities, nextTime, state.sessionMode, warmth);
  const distanceScore = state.scoreRemainder + deltaMs * speed;
  const wholeDistanceScore = Math.floor(distanceScore);
  const phase =
    nextTime >= OVERCAST_CONFIG.RUN_TARGET_MS ? "finished" : warmth <= 0 ? "gameover" : "playing";
  const finishCue =
    phase === "finished"
      ? getOvercastFinishCue({
          ...state,
          phase,
          timeMs: nextTime,
          warmth,
          score: resolved.score + wholeDistanceScore,
          combo: resolved.combo,
          segmentsCleared,
        })
      : null;
  const finishScoreBonus = finishCue?.scoreBonus ?? 0;
  const segmentProgress =
    nextTime >= OVERCAST_CONFIG.RUN_TARGET_MS
      ? 1
      : (nextTime % OVERCAST_CONFIG.SEGMENT_DURATION_MS) / OVERCAST_CONFIG.SEGMENT_DURATION_MS;
  const segmentCue = createOvercastSegmentCue({
    entities: spawned,
    playerLane,
    segmentIndex,
    segmentProgress,
    warmth,
  });

  return {
    ...state,
    phase,
    timeMs: nextTime,
    playerLane,
    warmth,
    score: resolved.score + wholeDistanceScore + finishScoreBonus,
    scoreRemainder: distanceScore - wholeDistanceScore,
    combo: resolved.combo,
    segmentIndex,
    segmentProgress,
    segmentsCleared,
    photoCharges: resolved.photoCharges,
    speed,
    entities: spawned,
    segmentCue,
    finishCue,
    lastEvent: resolved.lastEvent,
    lastEventMs: resolved.lastEvent === "idle" ? state.lastEventMs : nextTime,
    objective: describeObjective(warmth, spawned, playerLane),
  };
}

export function getOvercastRunSummary(state: OvercastState) {
  return {
    combo: state.combo,
    elapsedSeconds: Math.round(state.timeMs / 1000),
    score: state.score,
    segment: Math.min(state.segmentIndex + 1, OVERCAST_CONFIG.TARGET_SEGMENTS),
    segmentsCleared: state.segmentsCleared,
    targetSegments: OVERCAST_CONFIG.TARGET_SEGMENTS,
    warmth: Math.round(state.warmth),
  };
}

export function getOvercastSpawnProfile(timeMs: number, mode = "standard") {
  const sessionMode = normalizeSessionMode(mode);
  const segmentIndex = Math.min(
    OVERCAST_CONFIG.TARGET_SEGMENTS - 1,
    Math.floor(Math.max(0, timeMs) / OVERCAST_CONFIG.SEGMENT_DURATION_MS)
  );
  const intervals =
    sessionMode === "challenge"
      ? CHALLENGE_SEGMENT_INTERVALS
      : sessionMode === "cozy"
        ? COZY_SEGMENT_INTERVALS
        : STANDARD_SEGMENT_INTERVALS;
  const baseMax = sessionMode === "challenge" ? 9 : sessionMode === "cozy" ? 5 : 7;

  return {
    intervalMs: intervals[segmentIndex] ?? intervals[intervals.length - 1],
    maxEntities: Math.min(baseMax, 4 + Math.ceil((segmentIndex + 1) / 2)),
    segmentIndex,
    spawnDistance: OVERCAST_CONFIG.SPAWN_DISTANCE + segmentIndex * 5,
    trafficLabel:
      segmentIndex >= 4 ? "storm traffic" : segmentIndex >= 2 ? "busy traffic" : "gentle traffic",
    trafficLevel:
      segmentIndex >= 4
        ? ("storm" as const)
        : segmentIndex >= 2
          ? ("busy" as const)
          : ("gentle" as const),
  };
}

export function getOvercastFinishCue(state: OvercastState): OvercastFinishCue {
  const warmth = Math.round(state.warmth);
  const scoreBonus = calculateOvercastFinishBonus(state);
  const warmthGrade = warmth >= 72 ? "warm" : warmth >= 38 ? "steady" : "shivering";
  const rating =
    warmthGrade === "warm"
      ? "Hot Cocoa Victory"
      : warmthGrade === "steady"
        ? "Clean Runout"
        : "Shivering Clear";

  return {
    title: "Aurora Runout Cleared",
    rating,
    message:
      warmthGrade === "warm"
        ? "Kicks hits the lodge lights with cocoa heat to spare."
        : warmthGrade === "steady"
          ? "The glacier is cleared with enough warmth to plan a cleaner replay."
          : "The route is open, but the last blizzard nearly took the run.",
    nextAction:
      warmthGrade === "warm"
        ? "Replay for a higher combo route."
        : "Replay and bank more cocoa before the final segment.",
    routeLights: clamp(state.segmentsCleared, 1, OVERCAST_CONFIG.TARGET_SEGMENTS),
    scoreBonus,
    warmthGrade,
  };
}

export function createOvercastSegmentCue({
  entities,
  playerLane,
  segmentIndex,
  segmentProgress,
  warmth,
}: {
  entities: OvercastEntity[];
  playerLane: -1 | 0 | 1;
  segmentIndex: number;
  segmentProgress: number;
  warmth: number;
}): OvercastSegmentCue {
  const nearest =
    entities
      .filter((entity) => entity.distance > -4)
      .sort((a, b) => Math.abs(a.distance) - Math.abs(b.distance))[0] ?? null;
  const segment = Math.min(segmentIndex, OVERCAST_CONFIG.TARGET_SEGMENTS - 1);
  const progressPercent = clamp(Math.round(segmentProgress * 100), 0, 100);
  const profile = getOvercastSpawnProfile(segment * OVERCAST_CONFIG.SEGMENT_DURATION_MS);

  return {
    label: SEGMENT_LABELS[segment] ?? "Glacier Run",
    weather: SEGMENT_WEATHER[segment] ?? "clear",
    progressLabel: `Segment ${segment + 1}/${OVERCAST_CONFIG.TARGET_SEGMENTS} ${progressPercent}%`,
    trafficLabel: profile.trafficLabel,
    trafficLevel: profile.trafficLevel,
    nearestKind: nearest?.kind ?? null,
    nearestLane: nearest?.lane ?? null,
    nearestDistance: nearest ? Math.round(nearest.distance) : null,
    warmthWarning:
      warmth < 32 || Boolean(nearest && nearest.lane === playerLane && nearest.distance < 36),
  };
}

function resolveCollision(
  state: OvercastState,
  controls: OvercastControls,
  collision: OvercastEntity | undefined
) {
  if (!collision) {
    return {
      warmth: state.warmth,
      score: state.score,
      combo: state.combo,
      photoCharges: state.photoCharges,
      lastEvent: "idle" as const,
    };
  }

  if (collision.kind === "cocoa") {
    const recoveryScale = getSessionRecoveryScale(state.sessionMode);
    return {
      warmth: clamp(state.warmth + 18 * recoveryScale, 0, state.maxWarmth),
      score: state.score + 80 + state.combo * 10,
      combo: state.combo + 1,
      photoCharges: Math.min(3, state.photoCharges + 1),
      lastEvent: "cocoa" as const,
    };
  }

  if (collision.kind === "glitch" && controls.photo && state.photoCharges > 0) {
    return {
      warmth: state.warmth,
      score: state.score + 260 + state.combo * 35,
      combo: state.combo + 2,
      photoCharges: state.photoCharges - 1,
      lastEvent: "photo" as const,
    };
  }

  if (collision.kind === "snowman" && controls.kick) {
    return {
      warmth: state.warmth,
      score: state.score + 180 + state.combo * 20,
      combo: state.combo + 1,
      photoCharges: state.photoCharges,
      lastEvent: "kick" as const,
    };
  }

  const pressureScale = getSessionPressureScale(state.sessionMode, {
    challenge: 1.3,
    cozy: 0.58,
    standard: 0.82,
  });

  return {
    warmth: clamp(
      state.warmth - (collision.kind === "glitch" ? 14 : 22) * pressureScale,
      0,
      state.maxWarmth
    ),
    score: state.score,
    combo: 0,
    photoCharges: state.photoCharges,
    lastEvent: collision.kind === "glitch" ? ("glitch" as const) : ("hit" as const),
  };
}

function spawnEntities(
  entities: OvercastEntity[],
  timeMs: number,
  mode: OvercastState["sessionMode"],
  warmth: number
) {
  const profile = getOvercastSpawnProfile(timeMs, mode);
  const next = [...entities];
  const spawnIndex = Math.floor(timeMs / profile.intervalMs);
  const shouldSpawn =
    next.length < Math.min(OVERCAST_CONFIG.MAX_ENTITIES, profile.maxEntities) &&
    !next.some((entity) => entity.id === `spawn-${spawnIndex}`);

  if (shouldSpawn) {
    next.push(createEntity(spawnIndex, profile.spawnDistance, profile.segmentIndex, warmth));
  }

  return next;
}

function createOpeningEntities(): OvercastEntity[] {
  return [
    { id: "opening-cocoa", kind: "cocoa", lane: 0, distance: 42 },
    { id: "opening-snowman", kind: "snowman", lane: -1, distance: 70 },
    { id: "opening-glitch", kind: "glitch", lane: 1, distance: 96 },
  ];
}

function createEntity(
  index: number,
  distance: number,
  segmentIndex: number,
  warmth: number
): OvercastEntity {
  const lane =
    OVERCAST_CONFIG.LANES[(index * 2 + segmentIndex + 1) % OVERCAST_CONFIG.LANES.length] ?? 0;
  const recoveryCocoa = warmth < 42 && index % 2 === 0;
  const kind = recoveryCocoa
    ? "cocoa"
    : (index + segmentIndex) % 7 === 0
      ? "glitch"
      : (index + segmentIndex) % 4 === 0
        ? "cocoa"
        : "snowman";

  return {
    id: `spawn-${index}`,
    kind,
    lane,
    distance,
  };
}

function calculateOvercastFinishBonus(state: OvercastState) {
  return Math.round(state.segmentsCleared * 140 + Math.max(0, state.warmth) * 6 + state.combo * 45);
}

function describeObjective(warmth: number, entities: OvercastEntity[], playerLane: -1 | 0 | 1) {
  const nearest = entities
    .filter((entity) => entity.distance > 0)
    .sort((a, b) => a.distance - b.distance)[0];

  if (warmth < 28) return "Warmth critical. Cut toward cocoa before the curse locks in.";
  if (!nearest) return "Slope clear. Build speed and watch the scanline horizon.";
  if (nearest.lane === playerLane && nearest.kind === "snowman")
    return "Snowman in lane. Kick or dodge.";
  if (nearest.lane === playerLane && nearest.kind === "glitch")
    return "Glitch dead ahead. Snap it or dodge.";
  if (nearest.kind === "cocoa") return "Cocoa ahead. Collect warmth and keep the combo alive.";
  return "Thread the lanes and keep Kicks warm.";
}

function clampLane(value: number): -1 | 0 | 1 {
  return value < 0 ? -1 : value > 0 ? 1 : 0;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
