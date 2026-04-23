import { getSessionPressureScale, normalizeSessionMode } from "@logic/shared";
import type {
  CavernLayout,
  GrappleTargetState,
  PrimordialControls,
  PrimordialGrappleFeedback,
  PrimordialGrappleGuideCue,
  PrimordialRouteCue,
  PrimordialState,
  PrimordialTelemetry,
  Vec3,
} from "./types";
import { CONFIG } from "./types";

const DEFAULT_OBJECTIVE = "Chain cyan anchors upward before the magma closes the shaft.";
const GRAPPLE_FEEDBACK_MS = 1_800;

const DEFAULT_CONTROLS: PrimordialControls = {
  forward: false,
  back: false,
  left: false,
  right: false,
  jump: false,
  grapple: false,
};

export function createInitialPrimordialState(
  phase: PrimordialState["phase"] = "menu",
  mode: string | null | undefined = "standard"
): PrimordialState {
  const sessionMode = normalizeSessionMode(mode);
  const altitude = calculateAltitude(CONFIG.playerStartPosition.y);
  const lavaHeight = CONFIG.lavaStartHeight;
  const distToLava = calculateDistanceToLava(CONFIG.playerStartPosition.y, lavaHeight);
  const routeCue = calculatePrimordialRouteCue(CONFIG.playerStartPosition, distToLava);
  const baseState = {
    phase,
    sessionMode,
    altitude,
    maxAltitude: altitude,
    timeSurvived: 0,
    velocity: 0,
    distToLava,
    isInGrappleRange: false,
    lavaHeight,
    thermalLift: calculateThermalLift(distToLava),
    grappleTargetState: "none" as const,
    grappleFeedback: "none" as const,
    grappleFeedbackMs: 0,
    routeCue,
    objective: DEFAULT_OBJECTIVE,
    objectiveProgress: calculateObjectiveProgress(altitude),
  };

  return {
    ...baseState,
    grappleGuideCue: calculatePrimordialGrappleGuideCue(baseState),
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
  const routeCue = calculatePrimordialRouteCue(telemetry.position, distToLava);
  const grappleTargetState = calculateGrappleTargetState(
    telemetry.grappleDistance,
    telemetry.grappleActive,
    telemetry.grappleTension
  );
  const grappleFeedback = calculateGrappleFeedback(state, elapsedDelta, telemetry);
  const nextPhase: PrimordialState["phase"] =
    telemetry.position.y <= telemetry.lavaHeight + CONFIG.lavaContactMargin
      ? "gameover"
      : objectiveProgress >= 100
        ? "complete"
        : state.phase;
  const nextState: PrimordialState = {
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
    grappleTargetState,
    grappleFeedback: grappleFeedback.kind,
    grappleFeedbackMs: grappleFeedback.remainingMs,
    routeCue,
    objective: describeObjective(objectiveProgress, distToLava, routeCue),
    objectiveProgress,
    grappleGuideCue: state.grappleGuideCue,
  };

  return {
    ...nextState,
    grappleGuideCue: calculatePrimordialGrappleGuideCue(nextState),
  };
}

export function getPrimordialRunSummary(state: PrimordialState) {
  return {
    elapsedSeconds: Math.round(state.timeSurvived / 1000),
    maxAltitude: Math.round(state.maxAltitude),
    objectiveProgress: state.objectiveProgress,
    finalDistanceToLava: Math.round(state.distToLava),
  };
}

export function advanceLavaHeight(
  currentHeight: number,
  elapsedMs: number,
  deltaMs: number,
  mode: string | null | undefined = "standard"
): number {
  const deltaSeconds = Math.max(0, deltaMs) / 1000;
  const elapsedSeconds = Math.max(0, elapsedMs) / 1000;
  const speed = CONFIG.lavaBaseSpeed + elapsedSeconds * CONFIG.lavaAccel;
  const pressureScale = getSessionPressureScale(mode, {
    challenge: 1.35,
    cozy: 0.55,
    standard: 0.78,
  });

  return round(currentHeight + speed * deltaSeconds * CONFIG.lavaSpeedScale * pressureScale, 3);
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

export function calculatePrimordialRouteCue(
  position: Vec3,
  distToLava: number
): PrimordialRouteCue {
  const layout = createCavernLayout();
  const nextAnchor = layout.anchors.find((anchor) => anchor.position[1] > position.y + 3) ?? null;
  const nextShelf =
    layout.platforms.find((platform) => platform.position[1] > position.y + 1) ?? null;
  const targetPosition = nextAnchor?.position ?? ([0, CONFIG.escapeAltitude, -178] as const);
  const distanceToAnchor = nextAnchor ? distanceTo(position, nextAnchor.position) : null;
  const distanceToShelf = nextShelf ? distanceTo(position, nextShelf.position) : null;
  const recoveryWindow =
    Boolean(nextShelf) &&
    distToLava < CONFIG.dangerDistance * 0.9 &&
    (distanceToShelf ?? Number.POSITIVE_INFINITY) <= 34;
  const bearing = normalize3({
    x: targetPosition[0] - position.x,
    y: targetPosition[1] - position.y,
    z: targetPosition[2] - position.z,
  });

  let kind: PrimordialRouteCue["kind"] = "anchor";
  let label = nextAnchor
    ? `Next anchor ${nextAnchor.id.replace("anchor-", "")}: climb ${Math.max(0, Math.round(nextAnchor.position[1] - position.y))}m.`
    : "Surface air ahead. Hold height through the last vents.";

  if (!nextAnchor || position.y >= CONFIG.escapeAltitude - 8) {
    kind = "escape";
    label = "Surface air ahead. Hold height through the last vents.";
  } else if (distToLava < CONFIG.dangerDistance * 0.42) {
    kind = "danger";
    label = `Lava wake close. Grip ${nextAnchor.id.replace("anchor-", "anchor ")} now.`;
  } else if (position.y < 24) {
    kind = "launch";
    label = "Jump, grip the first cyan ring, then drift toward green moss.";
  } else if (recoveryWindow && nextShelf) {
    kind = "recovery";
    label = `Moss shelf ${nextShelf.id.replace("moss-shelf-", "")} can reset your swing.`;
  }

  return {
    kind,
    label,
    nextAnchorId: nextAnchor?.id ?? null,
    nextAnchorPosition: nextAnchor?.position ?? null,
    nextShelfId: nextShelf?.id ?? null,
    nextShelfPosition: nextShelf?.position ?? null,
    targetAltitude: nextAnchor?.position[1] ?? CONFIG.escapeAltitude,
    distanceToAnchor: distanceToAnchor === null ? null : round(distanceToAnchor, 1),
    distanceToShelf: distanceToShelf === null ? null : round(distanceToShelf, 1),
    bearing,
    recoveryWindow,
  };
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
): GrappleTargetState {
  if (distance === null || distance === undefined) return "none";
  if (!canGrapple(distance)) return "missed";
  if (grappleActive && tension > 0.65) return "taut";
  if (grappleActive) return "locked";
  return "in-range";
}

export function calculatePrimordialGrappleGuideCue(
  state: Pick<
    PrimordialState,
    | "distToLava"
    | "grappleFeedback"
    | "grappleFeedbackMs"
    | "grappleTargetState"
    | "objectiveProgress"
    | "routeCue"
    | "timeSurvived"
  >
): PrimordialGrappleGuideCue {
  if (state.grappleFeedback === "missed" && state.grappleFeedbackMs > 0) {
    return {
      focus: "reticle",
      inputHint: "Aim center, then Grip",
      kind: "missed-grip",
      label: "Grip missed. Center a cyan ring before holding.",
      pulse: true,
      reticleScale: 1.28,
      urgency: "medium",
    };
  }

  if (state.grappleTargetState === "taut") {
    return {
      focus: "tether",
      inputHint: "Release toward beacon",
      kind: "tension-release",
      label: "Tether taut. Release into the next cyan beacon.",
      pulse: true,
      reticleScale: 1.08,
      urgency: "medium",
    };
  }

  if (state.grappleTargetState === "locked" || state.grappleFeedback === "locked") {
    return {
      focus: "tether",
      inputHint: "Hold Grip",
      kind: "tether-locked",
      label: "Tether locked. Hold until the swing climbs.",
      pulse: true,
      reticleScale: 1.16,
      urgency: "low",
    };
  }

  if (state.grappleTargetState === "in-range") {
    return {
      focus: "anchor",
      inputHint: "Hold Grip",
      kind: "ready-grip",
      label: "Cyan anchor is in range. Hold Grip now.",
      pulse: true,
      reticleScale: 1.22,
      urgency: "low",
    };
  }

  if (state.routeCue.kind === "danger" || state.distToLava < CONFIG.dangerDistance * 0.45) {
    return {
      focus: "lava",
      inputHint: "Jump, then Grip",
      kind: "lava-urgent",
      label: "Lava wake close. Jump and grip the next cyan ring.",
      pulse: true,
      reticleScale: 1.2,
      urgency: "high",
    };
  }

  if (state.routeCue.kind === "recovery") {
    return {
      focus: "shelf",
      inputHint: "Land on green moss",
      kind: "shelf-reset",
      label: "Green moss shelf can reset the next swing.",
      pulse: false,
      reticleScale: 1,
      urgency: "low",
    };
  }

  if (state.routeCue.kind === "escape" || state.objectiveProgress >= 94) {
    return {
      focus: "surface",
      inputHint: "Hold height",
      kind: "surface-run",
      label: "Surface air ahead. Keep height through the vents.",
      pulse: true,
      reticleScale: 1.08,
      urgency: "medium",
    };
  }

  if (state.timeSurvived < 28_000 || state.routeCue.kind === "launch") {
    return {
      focus: "reticle",
      inputHint: "Look at cyan, hold Grip",
      kind: "launch-aim",
      label: "First contact: center the cyan ring before holding Grip.",
      pulse: true,
      reticleScale: 1.18,
      urgency: "low",
    };
  }

  return {
    focus: "route",
    inputHint: "Follow cyan beacons",
    kind: "route-follow",
    label: "Follow cyan beacons upward and rest on green moss.",
    pulse: false,
    reticleScale: 1,
    urgency: "low",
  };
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

function calculateGrappleFeedback(
  state: PrimordialState,
  deltaMs: number,
  telemetry: PrimordialTelemetry
): { kind: PrimordialGrappleFeedback; remainingMs: number } {
  if (telemetry.grappleAttempted) {
    return {
      kind: canGrapple(telemetry.grappleDistance) ? "locked" : "missed",
      remainingMs: GRAPPLE_FEEDBACK_MS,
    };
  }

  const remainingMs = Math.max(0, state.grappleFeedbackMs - Math.max(0, deltaMs));

  return {
    kind: remainingMs > 0 ? state.grappleFeedback : "none",
    remainingMs,
  };
}

function describeObjective(
  progress: number,
  distToLava: number,
  routeCue?: PrimordialRouteCue
): string {
  if (distToLava < CONFIG.dangerDistance * 0.45) {
    return "Lava wake is closing. Burn momentum upward now.";
  }

  if (routeCue?.kind === "recovery") {
    return routeCue.label;
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

function distanceTo(origin: Vec3, target: readonly [number, number, number]): number {
  return Math.hypot(target[0] - origin.x, target[1] - origin.y, target[2] - origin.z);
}

function normalize3(vector: Vec3): Vec3 {
  const length = Math.hypot(vector.x, vector.y, vector.z);

  if (length <= Number.EPSILON) {
    return { x: 0, y: 0, z: 0 };
  }

  return {
    x: round(vector.x / length, 3),
    y: round(vector.y / length, 3),
    z: round(vector.z / length, 3),
  };
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
