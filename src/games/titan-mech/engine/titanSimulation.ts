import type {
  ArenaLayout,
  ArenaObstacleData,
  DriveForces,
  TitanControls,
  TitanState,
  Vec3,
} from "./types";
import { CONFIG } from "./types";

const DEFAULT_CONTROLS: TitanControls = {
  throttle: 0,
  turn: 0,
  fire: false,
  brace: false,
};

export function createInitialTitanState(phase: TitanState["phase"] = "menu"): TitanState {
  return {
    phase,
    hp: 200,
    maxHp: 200,
    energy: 100,
    maxEnergy: 100,
    heat: 0,
    maxHeat: 100,
    coolantBurstMs: 0,
    coolantCharge: 100,
    scrap: 0,
    score: 0,
    lastWeaponEventMs: 0,
    objective: "Secure reactor pylons and keep the chassis inside thermal limits.",
    objectiveProgress: 0,
    controls: { ...DEFAULT_CONTROLS },
    pose: {
      position: { x: 0, y: 5.4, z: 0 },
      heading: 0,
      velocity: { x: 0, y: 0, z: 0 },
    },
    systems: {
      reactor: 100,
      servos: 100,
      targeting: 100,
    },
    weaponFeedback: "idle",
  };
}

export function normalizeTitanControls(input: Partial<TitanControls> = {}): TitanControls {
  return {
    throttle: clamp(input.throttle ?? 0, -1, 1),
    turn: clamp(input.turn ?? 0, -1, 1),
    fire: input.fire ?? false,
    brace: input.brace ?? false,
  };
}

export function calculateDriveForces(
  controls: TitanControls,
  heading: number,
  deltaSeconds: number
): DriveForces {
  const reverseScale = controls.throttle < 0 ? CONFIG.REVERSE_MULTIPLIER : 1;
  const braceScale = controls.brace ? 0.44 : 1;
  const drive = controls.throttle * CONFIG.MOVE_SPEED * deltaSeconds * reverseScale * braceScale;

  return {
    impulse: {
      x: Math.sin(heading) * drive,
      y: 0,
      z: Math.cos(heading) * drive,
    },
    torqueY: -controls.turn * CONFIG.TURN_SPEED * deltaSeconds * braceScale,
    energyCost:
      Math.abs(controls.throttle) * CONFIG.THROTTLE_ENERGY_PER_SECOND * deltaSeconds +
      Math.abs(controls.turn) * CONFIG.TURN_ENERGY_PER_SECOND * deltaSeconds,
    heatGain: Math.abs(controls.throttle) * 3.4 * deltaSeconds,
  };
}

export function advanceTitanSystems(
  state: TitanState,
  deltaMs: number,
  input: Partial<TitanControls>,
  telemetry: Partial<TitanState["pose"]> = {}
): TitanState {
  if (state.phase !== "playing") {
    return state;
  }

  const controls = normalizeTitanControls(input);
  const deltaSeconds = Math.max(0, deltaMs) / 1000;
  const drive = calculateDriveForces(
    controls,
    telemetry.heading ?? state.pose.heading,
    deltaSeconds
  );
  const firingAllowed =
    controls.fire &&
    state.energy > CONFIG.FIRE_ENERGY_PER_SECOND * 0.18 &&
    state.heat < CONFIG.OVERHEAT_THRESHOLD;
  const weaponFeedback = getWeaponFeedbackState({
    coolantActive: false,
    energy: state.energy,
    firingAllowed,
    heat: state.heat,
    requestedFire: controls.fire,
  });

  const energySpend =
    drive.energyCost + (firingAllowed ? CONFIG.FIRE_ENERGY_PER_SECOND * deltaSeconds : 0);
  const coolantRequested = controls.brace && state.coolantCharge >= 100 && state.heat > 30;
  const coolantBurstMs = coolantRequested ? 1800 : Math.max(0, state.coolantBurstMs - deltaMs);
  const coolantActive = coolantBurstMs > 0;
  const finalWeaponFeedback = coolantActive && !firingAllowed ? "cooling" : weaponFeedback;
  const energyRegen =
    controls.throttle === 0 && !firingAllowed
      ? CONFIG.ENERGY_REGEN_PER_SECOND * (controls.brace ? 1.35 : 1) * deltaSeconds
      : 0;
  const heatGain =
    drive.heatGain + (firingAllowed ? CONFIG.FIRE_HEAT_PER_SECOND * deltaSeconds : 0);
  const cooling =
    (controls.throttle === 0 && !firingAllowed ? CONFIG.COOLING_PER_SECOND * deltaSeconds : 0) +
    (coolantActive ? CONFIG.COOLING_PER_SECOND * 1.45 * deltaSeconds : 0);

  const position = telemetry.position ?? state.pose.position;
  const velocity = telemetry.velocity ?? state.pose.velocity;
  const heading = telemetry.heading ?? state.pose.heading;
  const distanceScore = Math.floor(Math.hypot(position.x, position.z));
  const objectiveProgress = calculateObjectiveProgress(position, createArenaLayout());
  const stressed = state.heat + heatGain > CONFIG.OVERHEAT_THRESHOLD;

  return {
    ...state,
    controls: { ...controls, fire: firingAllowed },
    coolantBurstMs,
    coolantCharge: coolantRequested
      ? 0
      : clamp(state.coolantCharge + (controls.brace ? 18 : 8) * deltaSeconds, 0, 100),
    energy: clamp(state.energy - energySpend + energyRegen, 0, state.maxEnergy),
    heat: clamp(state.heat + heatGain - cooling, 0, state.maxHeat),
    lastWeaponEventMs:
      finalWeaponFeedback !== "idle" ? state.lastWeaponEventMs + deltaMs : state.lastWeaponEventMs,
    score: Math.max(state.score, distanceScore),
    objectiveProgress,
    objective:
      objectiveProgress >= 100
        ? "Reactor pylon secured. Sweep the outer ring for scrap caches."
        : coolantActive
          ? "Coolant burst venting. Keep braced until the thermal spike breaks."
          : stressed
            ? "Thermal pressure rising. Brace and let coolant cycles recover."
            : "Secure reactor pylons and keep the chassis inside thermal limits.",
    pose: {
      position: { ...position },
      heading,
      velocity: { ...velocity },
    },
    systems: {
      reactor: clamp(state.systems.reactor + (controls.brace ? 2.5 * deltaSeconds : 0), 0, 100),
      servos: clamp(state.systems.servos - Math.abs(controls.turn) * 0.7 * deltaSeconds, 72, 100),
      targeting: clamp(
        state.systems.targeting + (firingAllowed ? -2.2 * deltaSeconds : 1.8 * deltaSeconds),
        58,
        100
      ),
    },
    weaponFeedback: finalWeaponFeedback,
  };
}

export function getWeaponFeedbackState({
  coolantActive,
  energy,
  firingAllowed,
  heat,
  requestedFire,
}: {
  coolantActive: boolean;
  energy: number;
  firingAllowed: boolean;
  heat: number;
  requestedFire: boolean;
}) {
  if (coolantActive) return "cooling";
  if (firingAllowed) return "firing";
  if (!requestedFire) return "idle";
  if (heat >= CONFIG.OVERHEAT_THRESHOLD) return "overheated";
  if (energy <= CONFIG.FIRE_ENERGY_PER_SECOND * 0.18) return "dry";
  return "idle";
}

export function createArenaLayout(): ArenaLayout {
  const barricades: ArenaObstacleData[] = Array.from({ length: 16 }, (_, index) => {
    const ring = index % 2 === 0 ? 33 : 58;
    const angle = index * 0.72 + (index % 4) * 0.13;
    const longAxis = index % 3 === 0;

    return {
      id: `barricade-${index + 1}`,
      kind: longAxis ? "cover" : "barricade",
      position: [round(Math.sin(angle) * ring), 2.1, round(Math.cos(angle) * ring)],
      scale: longAxis ? [10, 4.2, 3.2] : [4.6, 5.4, 4.6],
      accent: index % 2 === 0 ? "#f59e0b" : "#2dd4bf",
      threat: index % 5 === 0 ? 2 : 1,
    };
  });

  return {
    obstacles: [
      ...barricades,
      {
        id: "north-gantry",
        kind: "gantry",
        position: [0, 7, 74],
        scale: [28, 14, 5],
        accent: "#f43f5e",
        threat: 3,
      },
      {
        id: "south-gantry",
        kind: "gantry",
        position: [0, 7, -74],
        scale: [28, 14, 5],
        accent: "#f43f5e",
        threat: 3,
      },
      {
        id: "west-reactor",
        kind: "reactor",
        position: [-72, 6, -14],
        scale: [10, 12, 10],
        accent: "#a3e635",
        threat: 2,
      },
      {
        id: "east-reactor",
        kind: "reactor",
        position: [72, 6, 16],
        scale: [10, 12, 10],
        accent: "#a3e635",
        threat: 2,
      },
      {
        id: "central-pylon",
        kind: "pylon",
        position: [18, 7, 30],
        scale: [5, 14, 5],
        accent: "#38bdf8",
        threat: 1,
      },
    ],
    beacons: [
      {
        id: "pylon-alpha",
        label: "ALPHA",
        position: [44, 0.2, 44],
        radius: 10,
        reward: 75,
      },
      {
        id: "pylon-beta",
        label: "BETA",
        position: [-46, 0.2, 38],
        radius: 10,
        reward: 75,
      },
      {
        id: "pylon-gamma",
        label: "GAMMA",
        position: [8, 0.2, -62],
        radius: 12,
        reward: 110,
      },
    ],
  };
}

export function calculateObjectiveProgress(position: Vec3, layout: ArenaLayout): number {
  const nearestBeacon = layout.beacons.reduce((nearest, beacon) => {
    const distance = Math.hypot(position.x - beacon.position[0], position.z - beacon.position[2]);
    return Math.min(nearest, distance / beacon.radius);
  }, Number.POSITIVE_INFINITY);

  return clamp(Math.round((1 - Math.min(nearestBeacon, 1)) * 100), 0, 100);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
