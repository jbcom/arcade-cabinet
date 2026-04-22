import type {
  CavernLayout,
  PrimordialControls,
  PrimordialState,
  PrimordialTelemetry,
  Vec3,
} from "./types";
import { CONFIG } from "./types";

const DEFAULT_OBJECTIVE = "Chain cyan anchors upward before the magma closes the shaft.";

const DEFAULT_CONTROLS: PrimordialControls = {
  forward: false,
  back: false,
  left: false,
  right: false,
  jump: false,
  grapple: false,
};

export function createInitialPrimordialState(
  phase: PrimordialState["phase"] = "menu"
): PrimordialState {
  const altitude = calculateAltitude(CONFIG.playerStartPosition.y);
  const lavaHeight = CONFIG.lavaStartHeight;

  return {
    phase,
    altitude,
    maxAltitude: altitude,
    timeSurvived: 0,
    velocity: 0,
    distToLava: calculateDistanceToLava(CONFIG.playerStartPosition.y, lavaHeight),
    isInGrappleRange: false,
    lavaHeight,
    thermalLift: calculateThermalLift(
      calculateDistanceToLava(CONFIG.playerStartPosition.y, lavaHeight)
    ),
    grappleTargetState: "none",
    objective: DEFAULT_OBJECTIVE,
    objectiveProgress: calculateObjectiveProgress(altitude),
  };
}

export function normalizePrimordialControls(
  input: Partial<PrimordialControls> = {}
): PrimordialControls {
  return {
    ...DEFAULT_CONTROLS,
    ...input,
  };
}

export function createCavernLayout(): CavernLayout {
  const anchors = [
    [0, 18, -24],
    [9, 35, -42],
    [-8, 55, -64],
    [12, 76, -88],
    [-10, 100, -110],
    [6, 126, -132],
    [0, 154, -156],
  ].map(([x, y, z], index) => ({
    id: `anchor-${index + 1}`,
    position: [x, y, z] as [number, number, number],
    radius: index % 2 === 0 ? 3.8 : 3.2,
    ringRadius: index % 2 === 0 ? 5.8 : 5.2,
    accent: index % 3 === 1 ? "#2dd4bf" : "#00e5ff",
  }));

  const platforms = [
    [-10, 13, -18, 10, 1.2, 7],
    [11, 29, -35, 8, 1.1, 6],
    [-13, 49, -56, 9, 1.2, 6.5],
    [14, 70, -78, 7, 1.1, 5.5],
    [-9, 94, -101, 8.5, 1.2, 7],
    [9, 121, -126, 7, 1.1, 5.8],
  ].map(([x, y, z, sx, sy, sz], index) => ({
    id: `moss-shelf-${index + 1}`,
    position: [x, y, z] as [number, number, number],
    scale: [sx, sy, sz] as [number, number, number],
    accent: index % 2 === 0 ? "#35d07f" : "#8bd450",
  }));

  const ribs = Array.from({ length: 10 }, (_, index) => {
    const y = 8 + index * 16;
    const z = -18 - index * 16;
    const angle = index * 0.47;

    return {
      id: `basalt-rib-${index + 1}`,
      position: [Math.sin(angle) * 2, y, z] as [number, number, number],
      rotation: [Math.PI / 2, angle, index % 2 === 0 ? 0.14 : -0.18] as [number, number, number],
      scale: [1.0 + index * 0.035, 1, 1] as [number, number, number],
      accent: index % 3 === 0 ? "#334155" : "#1f2937",
    };
  });

  return { anchors, platforms, ribs };
}

export function advancePrimordialState(
  state: PrimordialState,
  deltaMs: number,
  telemetry: PrimordialTelemetry
): PrimordialState {
  if (state.phase !== "playing") {
    return state;
  }

  const elapsedDelta = Math.max(0, deltaMs);
  const altitude = calculateAltitude(telemetry.position.y);
  const velocity = calculatePlayerSpeed(telemetry.velocity);
  const distToLava = calculateDistanceToLava(telemetry.position.y, telemetry.lavaHeight);
  const objectiveProgress = calculateObjectiveProgress(altitude);
  const thermalLift = calculateThermalLift(distToLava);
  const nextPhase =
    telemetry.position.y <= telemetry.lavaHeight + CONFIG.lavaContactMargin
      ? "gameover"
      : state.phase;

  return {
    ...state,
    phase: nextPhase,
    altitude,
    maxAltitude: Math.max(state.maxAltitude, altitude),
    timeSurvived: state.timeSurvived + elapsedDelta,
    velocity,
    distToLava,
    lavaHeight: telemetry.lavaHeight,
    thermalLift,
    isInGrappleRange: canGrapple(telemetry.grappleDistance),
    grappleTargetState: calculateGrappleTargetState(
      telemetry.grappleDistance,
      telemetry.grappleActive,
      telemetry.grappleTension
    ),
    objective: describeObjective(objectiveProgress, distToLava),
    objectiveProgress,
  };
}

export function advanceLavaHeight(
  currentHeight: number,
  elapsedMs: number,
  deltaMs: number
): number {
  const deltaSeconds = Math.max(0, deltaMs) / 1000;
  const elapsedSeconds = Math.max(0, elapsedMs) / 1000;
  const speed = CONFIG.lavaBaseSpeed + elapsedSeconds * CONFIG.lavaAccel;

  return round(currentHeight + speed * deltaSeconds * CONFIG.lavaSpeedScale, 3);
}

export function calculateAltitude(positionY: number): number {
  return Math.max(0, Math.floor(positionY));
}

export function calculateDistanceToLava(positionY: number, lavaHeight: number): number {
  return Math.max(0, Math.floor(positionY - lavaHeight));
}

export function calculatePlayerSpeed(velocity: Vec3): number {
  return Math.floor(Math.hypot(velocity.x, velocity.y, velocity.z));
}

export function calculateObjectiveProgress(altitude: number): number {
  return clamp(Math.round((altitude / CONFIG.escapeAltitude) * 100), 0, 100);
}

export function calculateThermalLift(distToLava: number): number {
  const dangerStart = CONFIG.dangerDistance;
  const safeFloor = CONFIG.dangerDistance * 0.22;
  if (distToLava <= safeFloor || distToLava >= dangerStart) {
    return 0;
  }

  const normalized = 1 - (distToLava - safeFloor) / (dangerStart - safeFloor);
  return round(clamp(normalized, 0, 1) * 18, 2);
}

export function canGrapple(distance: number | null | undefined): boolean {
  return distance !== null && distance !== undefined && distance <= CONFIG.maxTetherDist;
}

export function calculateGrappleTargetState(
  distance: number | null | undefined,
  grappleActive = false,
  tension = 0
) {
  if (distance === null || distance === undefined) return "none";
  if (!canGrapple(distance)) return "missed";
  if (grappleActive && tension > 0.65) return "taut";
  if (grappleActive) return "locked";
  return "in-range";
}

export function calculateAirControlImpulse(
  input: Partial<PrimordialControls>,
  cameraForward: Vec3,
  deltaSeconds: number
): Vec3 {
  const controls = normalizePrimordialControls(input);
  const forward = normalizeFlat(cameraForward);
  const right = normalizeFlat({ x: -forward.z, y: 0, z: forward.x });
  const move = { x: 0, y: 0, z: 0 };

  if (controls.forward) addTo(move, forward, 1);
  if (controls.back) addTo(move, forward, -1);
  if (controls.right) addTo(move, right, 1);
  if (controls.left) addTo(move, right, -1);

  const normalized = normalizeFlat(move);
  const scale = CONFIG.airControl * Math.max(0, deltaSeconds);

  return {
    x: round(normalized.x * scale, 4),
    y: 0,
    z: round(normalized.z * scale, 4),
  };
}

export function calculateJumpImpulse(): Vec3 {
  return {
    x: 0,
    y: CONFIG.jumpForce * CONFIG.playerMass,
    z: 0,
  };
}

export function calculateTetherImpulse(
  position: Vec3,
  velocity: Vec3,
  target: Vec3,
  deltaSeconds: number
): { impulse: Vec3; distance: number; tension: number } {
  const offset = {
    x: target.x - position.x,
    y: target.y - position.y,
    z: target.z - position.z,
  };
  const distance = Math.hypot(offset.x, offset.y, offset.z);

  if (distance <= CONFIG.tetherRestLength) {
    return {
      impulse: { x: 0, y: 0, z: 0 },
      distance,
      tension: 0,
    };
  }

  const direction = {
    x: offset.x / distance,
    y: offset.y / distance,
    z: offset.z / distance,
  };
  const clampedDelta = Math.max(0, deltaSeconds);
  const tension = (distance - CONFIG.tetherRestLength) * CONFIG.tetherStrength * clampedDelta;

  return {
    impulse: {
      x: round(direction.x * tension - velocity.x * CONFIG.tetherDamping * clampedDelta, 4),
      y: round(direction.y * tension - velocity.y * CONFIG.tetherDamping * clampedDelta, 4),
      z: round(direction.z * tension - velocity.z * CONFIG.tetherDamping * clampedDelta, 4),
    },
    distance,
    tension,
  };
}

function describeObjective(progress: number, distToLava: number): string {
  if (distToLava < CONFIG.dangerDistance * 0.45) {
    return "Lava wake is closing. Burn momentum upward now.";
  }

  if (progress >= 100) {
    return "Surface threshold reached. Hold altitude and clear the last vents.";
  }

  if (progress >= 65) {
    return "Upper shaft in sight. Chain anchors without losing height.";
  }

  if (progress >= 32) {
    return "Mid-shaft draft rising. Use moss shelves to reset momentum.";
  }

  return DEFAULT_OBJECTIVE;
}

function normalizeFlat(vector: Vec3): Vec3 {
  const length = Math.hypot(vector.x, vector.z);

  if (length <= Number.EPSILON) {
    return { x: 0, y: 0, z: 0 };
  }

  return {
    x: vector.x / length,
    y: 0,
    z: vector.z / length,
  };
}

function addTo(target: Vec3, vector: Vec3, scalar: number) {
  target.x += vector.x * scalar;
  target.z += vector.z * scalar;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function round(value: number, precision: number) {
  const multiplier = 10 ** precision;
  return Math.round(value * multiplier) / multiplier;
}
