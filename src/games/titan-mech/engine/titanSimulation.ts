import {
  getSessionPressureScale,
  getSessionRecoveryScale,
  normalizeSessionMode,
} from "@logic/shared";
import type {
  ArenaLayout,
  ArenaObstacleData,
  DriveForces,
  ExtractionFeedbackState,
  TitanContractCue,
  TitanControls,
  TitanDeliveryCue,
  TitanExtractionState,
  TitanPose,
  TitanState,
  TitanThreatCue,
  Vec3,
} from "./types";
import { CONFIG } from "./types";

const DEFAULT_CONTROLS: TitanControls = {
  throttle: 0,
  turn: 0,
  fire: false,
  brace: false,
  extract: false,
};

export function createInitialTitanState(
  phase: TitanState["phase"] = "menu",
  mode: string | null | undefined = "standard"
): TitanState {
  const pose: TitanPose = {
    position: { x: 0, y: 5.4, z: 0 },
    heading: 0,
    velocity: { x: 0, y: 0, z: 0 },
  };
  const extraction: TitanExtractionState = {
    hopperLoad: 0,
    hopperCapacity: CONFIG.HOPPER_CAPACITY,
    credits: 0,
    rareIsotopes: 0,
    lastExtractionEventMs: 0,
    lastPayoutMs: 0,
    feedback: "idle",
  };
  const contractCue = calculateTitanContractCue({
    extraction,
    heat: 0,
    objectiveProgress: 0,
    position: pose.position,
  });

  return {
    phase,
    sessionMode: normalizeSessionMode(mode),
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
    objective: "Survey ore pylons, grind the vein, and keep the chassis inside thermal limits.",
    objectiveProgress: 0,
    controls: { ...DEFAULT_CONTROLS },
    pose,
    systems: {
      reactor: 100,
      servos: 100,
      targeting: 100,
    },
    weaponFeedback: "idle",
    contractCue,
    deliveryCue: calculateTitanDeliveryCue({
      extraction,
      phase,
    }),
    threatCue: calculateTitanThreatCue(pose.position),
    extraction,
  };
}

export function normalizeTitanControls(input: Partial<TitanControls> = {}): TitanControls {
  return {
    throttle: clamp(input.throttle ?? 0, -1, 1),
    turn: clamp(input.turn ?? 0, -1, 1),
    fire: input.fire ?? false,
    brace: input.brace ?? false,
    extract: input.extract ?? false,
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
  const coolantRequested = controls.brace && state.coolantCharge >= 100 && state.heat > 30;
  const coolantBurstMs = coolantRequested ? 1800 : Math.max(0, state.coolantBurstMs - deltaMs);
  const coolantActive = coolantBurstMs > 0;
  const finalWeaponFeedback = getWeaponFeedbackState({
    coolantActive,
    energy: state.energy,
    firingAllowed,
    heat: state.heat,
    requestedFire: controls.fire,
  });
  const energySpend =
    drive.energyCost + (firingAllowed ? CONFIG.FIRE_ENERGY_PER_SECOND * deltaSeconds : 0);
  const energyRegen =
    controls.throttle === 0 && !firingAllowed
      ? CONFIG.ENERGY_REGEN_PER_SECOND * (controls.brace ? 1.35 : 1) * deltaSeconds
      : 0;
  const heatGain =
    drive.heatGain + (firingAllowed ? CONFIG.FIRE_HEAT_PER_SECOND * deltaSeconds : 0);
  const heatPressureScale = getSessionPressureScale(state.sessionMode, {
    challenge: 1.28,
    cozy: 0.56,
    standard: 0.78,
  });
  const coolingRecoveryScale = getSessionRecoveryScale(state.sessionMode, {
    challenge: 0.74,
    cozy: 1.36,
    standard: 1.1,
  });
  const position = telemetry.position ?? state.pose.position;
  const velocity = telemetry.velocity ?? state.pose.velocity;
  const heading = telemetry.heading ?? state.pose.heading;
  const distanceScore = Math.floor(Math.hypot(position.x, position.z));
  const objectiveProgress = calculateObjectiveProgress(position, createArenaLayout());
  const stressed = state.heat + heatGain > CONFIG.OVERHEAT_THRESHOLD;
  const extraction = advanceExtractionState({
    deltaMs,
    deltaSeconds,
    energy: state.energy,
    heat: state.heat,
    input: controls,
    objectiveProgress,
    previous: state.extraction,
  });
  const extracting = extraction.heatGain > 0;
  const cooling =
    ((controls.throttle === 0 && !firingAllowed && !extracting
      ? CONFIG.COOLING_PER_SECOND * deltaSeconds
      : 0) +
      (coolantActive ? CONFIG.COOLING_PER_SECOND * 1.45 * deltaSeconds : 0)) *
    coolingRecoveryScale;
  const heat = clamp(
    state.heat + (heatGain + extraction.heatGain) * heatPressureScale - cooling,
    0,
    state.maxHeat
  );
  const overheatDamage =
    heat >= CONFIG.OVERHEAT_THRESHOLD
      ? (heat - CONFIG.OVERHEAT_THRESHOLD) * CONFIG.OVERHEAT_DAMAGE_PER_SECOND * deltaSeconds
      : 0;
  const hp = clamp(state.hp - overheatDamage, 0, state.maxHp);
  const phase =
    hp <= 0
      ? "gameover"
      : extraction.next.credits >= CONFIG.CONTRACT_CREDITS_TARGET
        ? "upgrade"
        : state.phase;
  const contractCue = calculateTitanContractCue({
    extraction: extraction.next,
    heat,
    objectiveProgress,
    position,
  });
  const threatCue = calculateTitanThreatCue(position);
  const deliveryCue = calculateTitanDeliveryCue({
    extraction: extraction.next,
    phase,
  });

  return {
    ...state,
    phase,
    controls: { ...controls, fire: firingAllowed },
    coolantBurstMs,
    coolantCharge: coolantRequested
      ? 0
      : clamp(state.coolantCharge + (controls.brace ? 18 : 8) * deltaSeconds, 0, 100),
    energy: clamp(
      state.energy - energySpend - extraction.energyCost + energyRegen,
      0,
      state.maxEnergy
    ),
    heat,
    hp,
    lastWeaponEventMs: finalWeaponFeedback === "idle" ? 0 : state.lastWeaponEventMs + deltaMs,
    scrap: state.scrap + extraction.scrapGain,
    score: Math.max(state.score, distanceScore + extraction.next.credits),
    objectiveProgress,
    objective: describeTitanObjective(
      contractCue,
      coolantActive,
      extraction.next.feedback,
      stressed
    ),
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
    contractCue,
    deliveryCue,
    threatCue,
    extraction: extraction.next,
  };
}

export function getTitanRunSummary(state: TitanState) {
  return {
    contractCreditsTarget: CONFIG.CONTRACT_CREDITS_TARGET,
    credits: state.extraction.credits,
    heat: Math.round(state.heat),
    hopperLoad: Math.round(state.extraction.hopperLoad),
    hp: Math.round(state.hp),
    rareIsotopes: state.extraction.rareIsotopes,
    scrap: state.scrap,
    score: state.score,
  };
}

export function advanceExtractionState({
  deltaMs,
  deltaSeconds,
  energy,
  heat,
  input,
  objectiveProgress,
  previous,
}: {
  deltaMs: number;
  deltaSeconds: number;
  energy: number;
  heat: number;
  input: TitanControls;
  objectiveProgress: number;
  previous: TitanState["extraction"];
}) {
  const inOreRing = objectiveProgress > 0;
  const canExtract =
    input.extract &&
    inOreRing &&
    energy > CONFIG.EXTRACT_ENERGY_PER_SECOND * 0.22 &&
    heat < CONFIG.OVERHEAT_THRESHOLD;
  const extractionScale = objectiveProgress / 100;
  const oreGain = canExtract
    ? CONFIG.ORE_PER_SECOND * deltaSeconds * Math.max(0.25, extractionScale)
    : 0;
  const loaded = clamp(previous.hopperLoad + oreGain, 0, previous.hopperCapacity);
  const hopperFull = loaded >= previous.hopperCapacity;
  const scrapGain = hopperFull ? Math.round(previous.hopperCapacity * 0.24) : 0;
  const rareGain = hopperFull && previous.credits % 4 === 0 ? 1 : 0;
  const credits = hopperFull
    ? previous.credits + Math.round(previous.hopperCapacity * CONFIG.ORE_CREDIT_VALUE)
    : previous.credits;
  const feedback: ExtractionFeedbackState = hopperFull
    ? "ejecting"
    : canExtract
      ? "grinding"
      : input.extract
        ? "blocked"
        : "idle";

  return {
    energyCost: canExtract ? CONFIG.EXTRACT_ENERGY_PER_SECOND * deltaSeconds : 0,
    heatGain: canExtract ? CONFIG.EXTRACT_HEAT_PER_SECOND * deltaSeconds : 0,
    scrapGain,
    next: {
      ...previous,
      hopperLoad: hopperFull ? 0 : loaded,
      credits,
      rareIsotopes: previous.rareIsotopes + rareGain,
      lastExtractionEventMs:
        canExtract || hopperFull ? previous.lastExtractionEventMs + deltaMs : 0,
      lastPayoutMs: hopperFull
        ? Math.max(1, deltaMs)
        : previous.lastPayoutMs > 0
          ? Math.min(previous.lastPayoutMs + deltaMs, 5000)
          : 0,
      feedback,
    },
  };
}

export function calculateTitanDeliveryCue({
  extraction,
  phase,
}: {
  extraction: TitanExtractionState;
  phase: TitanState["phase"];
}): TitanDeliveryCue {
  const hopperProgress = Math.round((extraction.hopperLoad / extraction.hopperCapacity) * 100);
  const creditProgress = Math.round(
    (Math.min(extraction.credits, CONFIG.CONTRACT_CREDITS_TARGET) /
      CONFIG.CONTRACT_CREDITS_TARGET) *
      100
  );
  const payoutIsVisible = extraction.lastPayoutMs > 0 && extraction.lastPayoutMs <= 1800;

  if (phase === "upgrade" || extraction.credits >= CONFIG.CONTRACT_CREDITS_TARGET) {
    return {
      state: "complete",
      label: "Contract target banked. Extraction complete.",
      progress: 100,
      lastEventMs: extraction.lastPayoutMs,
    };
  }

  if (extraction.feedback === "ejecting" || payoutIsVisible) {
    return {
      state: "ejecting",
      label: "Ore cube ejecting to contract bank.",
      progress: creditProgress,
      lastEventMs: extraction.lastPayoutMs,
    };
  }

  if (extraction.feedback === "grinding") {
    return {
      state: "grinding",
      label: `Grinding ore. Hopper ${hopperProgress}%.`,
      progress: hopperProgress,
      lastEventMs: extraction.lastPayoutMs,
    };
  }

  if (extraction.lastPayoutMs > 1800 && extraction.lastPayoutMs <= 3200) {
    return {
      state: "banked",
      label: `Cube banked. Credits ${extraction.credits}/${CONFIG.CONTRACT_CREDITS_TARGET}.`,
      progress: creditProgress,
      lastEventMs: extraction.lastPayoutMs,
    };
  }

  return {
    state: "idle",
    label: `Hopper ${hopperProgress}%. Contract ${creditProgress}%.`,
    progress: Math.max(hopperProgress, creditProgress),
    lastEventMs: extraction.lastPayoutMs,
  };
}

export function calculateTitanThreatCue(position: Vec3): TitanThreatCue {
  const nearest = createArenaLayout()
    .obstacles.filter((obstacle) => obstacle.threat > 1)
    .map((obstacle) => ({
      obstacle,
      distance: Math.hypot(position.x - obstacle.position[0], position.z - obstacle.position[2]),
    }))
    .sort((a, b) => a.distance - b.distance)[0];

  if (!nearest) {
    return {
      level: "clear",
      label: "Threat grid clear.",
      sourceId: null,
      sourceKind: null,
      sourcePosition: null,
      distance: null,
      bearing: { x: 0, y: 0, z: 0 },
      warningRadius: 0,
    };
  }

  const warningRadius = 18 + nearest.obstacle.threat * 5.5;
  const impactRadius = 6 + nearest.obstacle.threat * 3.5;
  const trackingRadius = warningRadius * 1.7;
  const bearing = normalize2({
    x: nearest.obstacle.position[0] - position.x,
    y: 0,
    z: nearest.obstacle.position[2] - position.z,
  });
  const level: TitanThreatCue["level"] =
    nearest.distance <= impactRadius
      ? "impact"
      : nearest.distance <= warningRadius
        ? "warning"
        : nearest.distance <= trackingRadius
          ? "tracking"
          : "clear";
  const label =
    level === "clear"
      ? `Nearest threat ${Math.round(nearest.distance)}m.`
      : level === "tracking"
        ? `${nearest.obstacle.kind} tracking at ${Math.round(nearest.distance)}m.`
        : level === "warning"
          ? `${nearest.obstacle.kind} attack lane armed. Brace or break line.`
          : `${nearest.obstacle.kind} impact zone. Move now.`;

  return {
    level,
    label,
    sourceId: nearest.obstacle.id,
    sourceKind: nearest.obstacle.kind,
    sourcePosition: nearest.obstacle.position,
    distance: round(nearest.distance),
    bearing,
    warningRadius,
  };
}

export function calculateTitanContractCue({
  extraction,
  heat,
  objectiveProgress,
  position,
}: {
  extraction: TitanExtractionState;
  heat: number;
  objectiveProgress: number;
  position: Vec3;
}): TitanContractCue {
  const layout = createArenaLayout();
  const nearest = layout.beacons
    .map((beacon) => ({
      beacon,
      distance: Math.hypot(position.x - beacon.position[0], position.z - beacon.position[2]),
    }))
    .sort((a, b) => a.distance - b.distance)[0];
  const distance = nearest?.distance ?? null;
  const inRing = nearest ? distance !== null && distance <= nearest.beacon.radius : false;
  const extractorReady = inRing && objectiveProgress >= 72;
  const heatWarning = heat >= CONFIG.OVERHEAT_THRESHOLD * 0.78;
  const bearing = nearest
    ? normalize2({
        x: nearest.beacon.position[0] - position.x,
        y: 0,
        z: nearest.beacon.position[2] - position.z,
      })
    : { x: 0, y: 0, z: 0 };

  let stage: TitanContractCue["stage"] = "survey";
  let label = nearest
    ? `Route to ${nearest.beacon.label} pylon, ${Math.round(distance ?? 0)}m.`
    : "Contract complete. Return to the cabinet telemetry frame.";

  if (extraction.credits >= CONFIG.CONTRACT_CREDITS_TARGET) {
    stage = "complete";
    label = "Contract target met. Bank the run and choose the next extraction.";
  } else if (heatWarning) {
    stage = "cool";
    label = "Heat spike. Brace coolant before pushing the extractor.";
  } else if (extraction.feedback === "ejecting") {
    stage = "eject";
    label = "Ore cube ejected. Sweep to the next pylon route.";
  } else if (extractorReady) {
    stage = "extract";
    label = "Pylon lock strong. Hold extractor and watch heat.";
  } else if (inRing || objectiveProgress > 0) {
    stage = "align";
    label = `Align inside ${nearest?.beacon.label ?? "pylon"} ring until lock reaches 100%.`;
  }

  return {
    stage,
    label,
    nextBeaconId: nearest?.beacon.id ?? null,
    nextBeaconLabel: nearest?.beacon.label ?? null,
    distanceToBeacon: distance === null ? null : round(distance),
    inRing,
    extractorReady,
    heatWarning,
    bearing,
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
  if (firingAllowed) return "firing";
  if (coolantActive) return "cooling";
  if (!requestedFire) return "idle";
  if (heat >= CONFIG.OVERHEAT_THRESHOLD) return "overheated";
  if (energy <= CONFIG.FIRE_ENERGY_PER_SECOND * 0.18) return "dry";
  return "idle";
}

function describeTitanObjective(
  contractCue: TitanContractCue,
  coolantActive: boolean,
  extractionFeedback: ExtractionFeedbackState,
  stressed: boolean
) {
  if (coolantActive) {
    return "Coolant burst venting. Keep braced until the thermal spike breaks.";
  }

  if (extractionFeedback === "grinding") {
    return "Extractor grinding. Heat climbs while the hopper fills.";
  }

  if (extractionFeedback === "blocked") {
    return "Extractor blocked. Move into a pylon ring and manage heat.";
  }

  if (stressed || contractCue.stage === "cool") {
    return "Thermal pressure rising. Brace and let coolant cycles recover.";
  }

  return contractCue.label;
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

function normalize2(vector: Vec3): Vec3 {
  const length = Math.hypot(vector.x, vector.z);

  if (length <= Number.EPSILON) {
    return { x: 0, y: 0, z: 0 };
  }

  return {
    x: round(vector.x / length),
    y: 0,
    z: round(vector.z / length),
  };
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
