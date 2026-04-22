import type { OvercastControls, OvercastEntity, OvercastState } from "./types";
import { OVERCAST_CONFIG } from "./types";

const DEFAULT_CONTROLS: OvercastControls = {
  steer: 0,
  kick: false,
  photo: false,
};

export function createInitialOvercastState(phase: OvercastState["phase"] = "menu"): OvercastState {
  return {
    phase,
    timeMs: 0,
    playerLane: 0,
    warmth: 100,
    maxWarmth: 100,
    score: 0,
    combo: 0,
    photoCharges: 1,
    speed: OVERCAST_CONFIG.BASE_SPEED,
    entities: createOpeningEntities(),
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
  const resolved = resolveCollision(state, controls, collision);
  const spawned = spawnEntities(remainingEntities, nextTime);
  const warmth = clamp(
    resolved.warmth - OVERCAST_CONFIG.WARMTH_DRAIN_PER_SECOND * (deltaMs / 1000),
    0,
    state.maxWarmth
  );

  return {
    ...state,
    phase: warmth <= 0 ? "gameover" : "playing",
    timeMs: nextTime,
    playerLane,
    warmth,
    score: resolved.score + Math.floor(deltaMs * speed),
    combo: resolved.combo,
    photoCharges: resolved.photoCharges,
    speed,
    entities: spawned,
    lastEvent: resolved.lastEvent,
    lastEventMs: resolved.lastEvent === "idle" ? state.lastEventMs : nextTime,
    objective: describeObjective(warmth, spawned, playerLane),
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
    return {
      warmth: clamp(state.warmth + 18, 0, state.maxWarmth),
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

  return {
    warmth: clamp(state.warmth - (collision.kind === "glitch" ? 14 : 22), 0, state.maxWarmth),
    score: state.score,
    combo: 0,
    photoCharges: state.photoCharges,
    lastEvent: collision.kind === "glitch" ? ("glitch" as const) : ("hit" as const),
  };
}

function spawnEntities(entities: OvercastEntity[], timeMs: number) {
  const next = [...entities];
  const spawnIndex = Math.floor(timeMs / 1800);
  const shouldSpawn =
    next.length < OVERCAST_CONFIG.MAX_ENTITIES &&
    !next.some((entity) => entity.id === `spawn-${spawnIndex}`);

  if (shouldSpawn) {
    next.push(createEntity(spawnIndex, OVERCAST_CONFIG.SPAWN_DISTANCE));
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

function createEntity(index: number, distance: number): OvercastEntity {
  const lane = OVERCAST_CONFIG.LANES[(index * 2 + 1) % OVERCAST_CONFIG.LANES.length] ?? 0;
  const kind = index % 5 === 0 ? "glitch" : index % 3 === 0 ? "cocoa" : "snowman";

  return {
    id: `spawn-${index}`,
    kind,
    lane,
    distance,
  };
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
