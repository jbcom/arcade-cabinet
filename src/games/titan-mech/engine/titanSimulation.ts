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
  TitanEnemyBehavior,
  TitanExtractionState,
  TitanPose,
  TitanState,
  TitanThreatCue,
  TitanUpgradeId,
  TitanUpgradeOption,
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

export const TITAN_UPGRADE_LIBRARY: Record<TitanUpgradeId, TitanUpgradeOption> = {
  "coolant-loop": {
    accent: "#67e8f9",
    effects: ["Coolant charges faster", "Braced cooling lasts longer"],
    id: "coolant-loop",
    summary: "Recover thermal mistakes without turning the chassis into a stop-and-wait machine.",
    title: "Closed Coolant Loop",
  },
  "heat-sinks": {
    accent: "#f97316",
    effects: ["Higher heat ceiling", "Extractor creates less heat"],
    id: "heat-sinks",
    summary: "Let heavy extraction runs stay tense while keeping standard mode recoverable.",
    title: "Ceramic Heat Sinks",
  },
  "targeting-rig": {
    accent: "#f43f5e",
    effects: ["Weapons spend less heat", "Energy recovers faster while idle"],
    id: "targeting-rig",
    summary: "Turn enemy pressure into a readable counterplay loop instead of passive damage.",
    title: "Targeting Rig",
  },
  "wide-hopper": {
    accent: "#f59e0b",
    effects: ["Larger hopper", "Extractor loads ore faster"],
    id: "wide-hopper",
    summary: "Stretch the next contract around bigger bank moments and cleaner payout timing.",
    title: "Wide Hopper",
  },
};

const TITAN_UPGRADE_ORDER: TitanUpgradeId[] = [
  "heat-sinks",
  "coolant-loop",
  "wide-hopper",
  "targeting-rig",
];

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
    elapsedMs: 0,
    contractNumber: 1,
    upgrades: [],
    pendingUpgrades: [],
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
    lastThreatEventMs: 0,
    contractCue,
    deliveryCue: calculateTitanDeliveryCue({
      extraction,
      phase,
    }),
    threatCue: calculateTitanThreatCue(pose.position, 0),
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
  const elapsedMs = state.elapsedMs + Math.max(0, deltaMs);
  const upgradeSet = new Set(state.upgrades);
  const fireHeatMultiplier = upgradeSet.has("targeting-rig") ? 0.82 : 1;
  const idleEnergyMultiplier = upgradeSet.has("targeting-rig") ? 1.18 : 1;
  const overheatThreshold = CONFIG.OVERHEAT_THRESHOLD + (upgradeSet.has("heat-sinks") ? 8 : 0);
  const extractHeatMultiplier = upgradeSet.has("heat-sinks") ? 0.84 : 1;
  const oreMultiplier = upgradeSet.has("wide-hopper") ? 1.12 : 1;
  const coolantMultiplier = upgradeSet.has("coolant-loop") ? 1.24 : 1;
  const drive = calculateDriveForces(
    controls,
    telemetry.heading ?? state.pose.heading,
    deltaSeconds
  );
  const firingAllowed =
    controls.fire &&
    state.energy > CONFIG.FIRE_ENERGY_PER_SECOND * 0.18 &&
    state.heat < overheatThreshold;
  const coolantRequested = controls.brace && state.coolantCharge >= 100 && state.heat > 30;
  const coolantBurstMs = coolantRequested ? 1800 : Math.max(0, state.coolantBurstMs - deltaMs);
  const coolantActive = coolantBurstMs > 0;
  const finalWeaponFeedback = getWeaponFeedbackState({
    coolantActive,
    energy: state.energy,
    firingAllowed,
    heat: state.heat,
    overheatThreshold,
    requestedFire: controls.fire,
  });
  const energySpend =
    drive.energyCost + (firingAllowed ? CONFIG.FIRE_ENERGY_PER_SECOND * deltaSeconds : 0);
  const energyRegen =
    controls.throttle === 0 && !firingAllowed
      ? CONFIG.ENERGY_REGEN_PER_SECOND *
        idleEnergyMultiplier *
        (controls.brace ? 1.35 : 1) *
        deltaSeconds
      : 0;
  const heatGain =
    drive.heatGain +
    (firingAllowed ? CONFIG.FIRE_HEAT_PER_SECOND * fireHeatMultiplier * deltaSeconds : 0);
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
  const threatCue = calculateTitanThreatCue(position, elapsedMs);
  const threatPressure = calculateTitanThreatPressure({
    braced: controls.brace,
    coolantActive,
    cue: threatCue,
    deltaSeconds,
    sessionMode: state.sessionMode,
  });
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
    extractHeatMultiplier,
    oreMultiplier,
    overheatThreshold,
    previous: state.extraction,
  });
  const extracting = extraction.heatGain > 0;
  const cooling =
    ((controls.throttle === 0 && !firingAllowed && !extracting
      ? CONFIG.COOLING_PER_SECOND * deltaSeconds
      : 0) +
      (coolantActive ? CONFIG.COOLING_PER_SECOND * 1.45 * coolantMultiplier * deltaSeconds : 0)) *
    coolingRecoveryScale;
  const heat = clamp(
    state.heat +
      (heatGain + extraction.heatGain + threatPressure.heatGain) * heatPressureScale -
      cooling,
    0,
    state.maxHeat
  );
  const overheatDamage =
    heat >= overheatThreshold
      ? (heat - overheatThreshold) * CONFIG.OVERHEAT_DAMAGE_PER_SECOND * deltaSeconds
      : 0;
  const hp = clamp(state.hp - overheatDamage - threatPressure.hpDamage, 0, state.maxHp);
  const phase =
    hp <= 0
      ? "gameover"
      : extraction.next.credits >= CONFIG.CONTRACT_CREDITS_TARGET
        ? "upgrade"
        : state.phase;
  const pendingUpgrades =
    phase === "upgrade"
      ? getTitanUpgradeOptions({ contractNumber: state.contractNumber, upgrades: state.upgrades })
      : [];
  const contractCue = calculateTitanContractCue({
    extraction: extraction.next,
    heat,
    objectiveProgress,
    overheatThreshold,
    position,
  });
  const deliveryCue = calculateTitanDeliveryCue({
    extraction: extraction.next,
    phase,
  });

  return {
    ...state,
    phase,
    elapsedMs,
    controls: { ...controls, fire: firingAllowed },
    coolantBurstMs,
    coolantCharge: coolantRequested
      ? 0
      : clamp(state.coolantCharge + (controls.brace ? 18 : 8) * deltaSeconds, 0, 100),
    energy: clamp(
      state.energy - energySpend - extraction.energyCost - threatPressure.energyDrain + energyRegen,
      0,
      state.maxEnergy
    ),
    heat,
    hp,
    lastWeaponEventMs: finalWeaponFeedback === "idle" ? 0 : state.lastWeaponEventMs + deltaMs,
    lastThreatEventMs: threatPressure.active ? state.lastThreatEventMs + deltaMs : 0,
    pendingUpgrades,
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
    contractNumber: state.contractNumber,
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

export function getTitanUpgradeOptions({
  contractNumber,
  upgrades,
}: {
  contractNumber: number;
  upgrades: readonly TitanUpgradeId[];
}) {
  const owned = new Set(upgrades);
  const rotated = TITAN_UPGRADE_ORDER.map(
    (_, index) => TITAN_UPGRADE_ORDER[(index + contractNumber - 1) % TITAN_UPGRADE_ORDER.length]
  );

  return rotated
    .filter((id) => !owned.has(id))
    .slice(0, 3)
    .map((id) => TITAN_UPGRADE_LIBRARY[id]);
}

export function applyTitanUpgrade(state: TitanState, upgradeId: TitanUpgradeId): TitanState {
  const upgrades = normalizeTitanUpgrades([...state.upgrades, upgradeId]);
  const heatSinkCount = upgrades.includes("heat-sinks") ? 1 : 0;
  const hopperCount = upgrades.includes("wide-hopper") ? 1 : 0;
  const coolantCount = upgrades.includes("coolant-loop") ? 1 : 0;
  const targetingCount = upgrades.includes("targeting-rig") ? 1 : 0;
  const next = createInitialTitanState("playing", state.sessionMode);
  const hopperCapacity = CONFIG.HOPPER_CAPACITY + hopperCount * 34;
  const maxHeat = 100 + heatSinkCount * 10;
  const maxEnergy = 100 + targetingCount * 12;
  const maxHp = 200 + coolantCount * 16;

  return {
    ...next,
    contractNumber: state.contractNumber + 1,
    coolantCharge: 100,
    elapsedMs: state.elapsedMs,
    energy: maxEnergy,
    extraction: {
      ...next.extraction,
      hopperCapacity,
    },
    heat: 0,
    hp: maxHp,
    maxEnergy,
    maxHeat,
    maxHp,
    pendingUpgrades: [],
    score: Math.max(state.score, state.extraction.credits + state.scrap),
    scrap: state.scrap,
    sessionMode: state.sessionMode,
    upgrades,
  };
}

export function advanceExtractionState({
  deltaMs,
  deltaSeconds,
  energy,
  extractHeatMultiplier = 1,
  heat,
  input,
  objectiveProgress,
  oreMultiplier = 1,
  overheatThreshold = CONFIG.OVERHEAT_THRESHOLD,
  previous,
}: {
  deltaMs: number;
  deltaSeconds: number;
  energy: number;
  extractHeatMultiplier?: number;
  heat: number;
  input: TitanControls;
  objectiveProgress: number;
  oreMultiplier?: number;
  overheatThreshold?: number;
  previous: TitanState["extraction"];
}) {
  const inOreRing = objectiveProgress > 0;
  const canExtract =
    input.extract &&
    inOreRing &&
    energy > CONFIG.EXTRACT_ENERGY_PER_SECOND * 0.22 &&
    heat < overheatThreshold;
  const extractionScale = objectiveProgress / 100;
  const oreGain = canExtract
    ? CONFIG.ORE_PER_SECOND * oreMultiplier * deltaSeconds * Math.max(0.25, extractionScale)
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
    heatGain: canExtract
      ? CONFIG.EXTRACT_HEAT_PER_SECOND * extractHeatMultiplier * deltaSeconds
      : 0,
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

export function calculateTitanThreatCue(position: Vec3, elapsedMs = 0): TitanThreatCue {
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
      behavior: "sentinel-scan",
      behaviorLabel: "Sentinel scan idle.",
      behaviorIntensity: 0,
      counter: "Keep routing toward the next pylon.",
      sourceId: null,
      sourceKind: null,
      sourcePosition: null,
      distance: null,
      bearing: { x: 0, y: 0, z: 0 },
      warningRadius: 0,
      cycleMs: 0,
    };
  }

  const behavior = resolveEnemyBehavior(nearest.obstacle.kind);
  const cycleMs = 5200 + nearest.obstacle.threat * 850;
  const pulsePhase =
    ((elapsedMs + hashId(nearest.obstacle.id) * 137) % cycleMs) / Math.max(1, cycleMs);
  const pulse = 0.5 + Math.sin(pulsePhase * Math.PI * 2) * 0.5;
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
  const levelIntensity =
    level === "impact" ? 1 : level === "warning" ? 0.68 : level === "tracking" ? 0.34 : 0;
  const behaviorIntensity = round(levelIntensity * (0.68 + pulse * 0.32));
  const behaviorCopy = describeEnemyBehavior(behavior, level, nearest.obstacle.kind);
  const label =
    level === "clear"
      ? `Nearest ${behaviorCopy.shortName} ${Math.round(nearest.distance)}m.`
      : level === "tracking"
        ? `${behaviorCopy.shortName} tracking at ${Math.round(nearest.distance)}m.`
        : level === "warning"
          ? `${behaviorCopy.warning} Attack lane armed. Brace or break line.`
          : `${behaviorCopy.impact} Move now.`;

  return {
    level,
    label,
    behavior,
    behaviorLabel: behaviorCopy.label,
    behaviorIntensity,
    counter: behaviorCopy.counter,
    sourceId: nearest.obstacle.id,
    sourceKind: nearest.obstacle.kind,
    sourcePosition: nearest.obstacle.position,
    distance: round(nearest.distance),
    bearing,
    warningRadius,
    cycleMs,
  };
}

export function calculateTitanThreatPressure({
  braced,
  coolantActive,
  cue,
  deltaSeconds,
  sessionMode,
}: {
  braced: boolean;
  coolantActive: boolean;
  cue: TitanThreatCue;
  deltaSeconds: number;
  sessionMode: TitanState["sessionMode"];
}) {
  if (cue.level === "clear" || cue.level === "tracking") {
    return { active: false, energyDrain: 0, heatGain: 0, hpDamage: 0 };
  }

  const pressureScale = getSessionPressureScale(sessionMode, {
    challenge: 1.18,
    cozy: 0.28,
    standard: 0.54,
  });
  const braceScale = braced ? 0.34 : 1;
  const coolantScale = coolantActive ? 0.58 : 1;
  const levelScale = cue.level === "impact" ? 1 : 0.38;
  const intensity = Math.max(0.25, cue.behaviorIntensity);
  const base =
    cue.behavior === "rail-volley"
      ? { energyDrain: 2, heatGain: 1.6, hpDamage: 8.5 }
      : cue.behavior === "reactor-pulse"
        ? { energyDrain: 0, heatGain: 13, hpDamage: 2.4 }
        : cue.behavior === "mine-lock"
          ? { energyDrain: 10, heatGain: 2, hpDamage: 3.2 }
          : { energyDrain: 4, heatGain: 0.8, hpDamage: 2 };

  return {
    active: true,
    energyDrain: round(base.energyDrain * levelScale * intensity * pressureScale * deltaSeconds),
    heatGain: round(
      base.heatGain * levelScale * intensity * pressureScale * coolantScale * deltaSeconds
    ),
    hpDamage: round(
      base.hpDamage * levelScale * intensity * pressureScale * braceScale * deltaSeconds
    ),
  };
}

export function calculateTitanContractCue({
  extraction,
  heat,
  objectiveProgress,
  overheatThreshold = CONFIG.OVERHEAT_THRESHOLD,
  position,
}: {
  extraction: TitanExtractionState;
  heat: number;
  objectiveProgress: number;
  overheatThreshold?: number;
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
  const heatWarning = heat >= overheatThreshold * 0.78;
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
  overheatThreshold = CONFIG.OVERHEAT_THRESHOLD,
  requestedFire,
}: {
  coolantActive: boolean;
  energy: number;
  firingAllowed: boolean;
  heat: number;
  overheatThreshold?: number;
  requestedFire: boolean;
}) {
  if (firingAllowed) return "firing";
  if (coolantActive) return "cooling";
  if (!requestedFire) return "idle";
  if (heat >= overheatThreshold) return "overheated";
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

function normalizeTitanUpgrades(input: readonly TitanUpgradeId[]) {
  return TITAN_UPGRADE_ORDER.filter((id) => input.includes(id));
}

function resolveEnemyBehavior(kind: ArenaObstacleData["kind"]): TitanEnemyBehavior {
  if (kind === "gantry") return "rail-volley";
  if (kind === "reactor") return "reactor-pulse";
  if (kind === "cover" || kind === "barricade") return "mine-lock";
  return "sentinel-scan";
}

function describeEnemyBehavior(
  behavior: TitanEnemyBehavior,
  level: TitanThreatCue["level"],
  kind: ArenaObstacleData["kind"]
) {
  const prefix = kind.replace("-", " ");

  if (behavior === "rail-volley") {
    return {
      counter: "Sidestep the rail line or brace through the hit.",
      impact: `${prefix} rail volley is crossing the chassis.`,
      label: level === "impact" ? "Rail volley firing" : "Rail volley charging",
      shortName: "rail volley",
      warning: `${prefix} rail volley armed.`,
    };
  }

  if (behavior === "reactor-pulse") {
    return {
      counter: "Brace coolant or leave the reactor halo.",
      impact: `${prefix} thermal pulse is venting into the hull.`,
      label: level === "impact" ? "Reactor pulse venting" : "Reactor pulse spooling",
      shortName: "reactor pulse",
      warning: `${prefix} thermal pulse spooling.`,
    };
  }

  if (behavior === "mine-lock") {
    return {
      counter: "Break the lock with lateral movement before impact.",
      impact: `${prefix} mine lock is draining chassis reserves.`,
      label: level === "impact" ? "Mine lock latched" : "Mine lock reading vector",
      shortName: "mine lock",
      warning: `${prefix} mine lock armed.`,
    };
  }

  return {
    counter: "Keep moving toward the next pylon.",
    impact: `${prefix} sentinel scan is too close.`,
    label: "Sentinel scan",
    shortName: "sentinel scan",
    warning: `${prefix} sentinel scan armed.`,
  };
}

function hashId(id: string) {
  return Array.from(id).reduce((total, char) => total + char.charCodeAt(0), 0);
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
