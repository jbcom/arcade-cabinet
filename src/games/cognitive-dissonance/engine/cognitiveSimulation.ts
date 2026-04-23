import { normalizeSessionMode, type SessionMode } from "@logic/shared";
import type {
  CognitiveEndingCue,
  CognitiveFeedbackCue,
  CognitiveModeTuning,
  CognitivePattern,
  CognitiveShiftCue,
  CognitiveShiftStage,
  CognitiveState,
} from "./types";

const PATTERN_SEQUENCE: readonly CognitivePattern[] = [
  "violet",
  "cyan",
  "gold",
  "cyan",
  "violet",
  "gold",
];
const PHASE_LOCK_THRESHOLD_MS = 4_200;
const PHASE_LOCK_PULSE_MS = 1_800;

const MODE_TUNING: Record<SessionMode, CognitiveModeTuning> = {
  challenge: {
    coherenceDrainPerSecond: 0.42,
    matchRecoveryPerSecond: 5.2,
    shiftDurationMs: 480_000,
    tensionRisePerSecond: 2.25,
  },
  cozy: {
    coherenceDrainPerSecond: 0.12,
    matchRecoveryPerSecond: 8.5,
    shiftDurationMs: 900_000,
    tensionRisePerSecond: 0.72,
  },
  standard: {
    coherenceDrainPerSecond: 0.08,
    matchRecoveryPerSecond: 6.8,
    shiftDurationMs: 720_000,
    tensionRisePerSecond: 1.15,
  },
};

export function getCognitiveModeTuning(mode: string | null | undefined): CognitiveModeTuning {
  return MODE_TUNING[normalizeSessionMode(mode)];
}

export function createInitialCognitiveState(
  mode: string | null | undefined = "standard",
  phase: CognitiveState["phase"] = "menu"
): CognitiveState {
  const sessionMode = normalizeSessionMode(mode);

  return {
    coherence: 100,
    currentPattern: "violet",
    elapsedMs: 0,
    lastEvent: "The cabinet wakes with a violet pattern leaking through the glass.",
    objective: "Hold the matching rim control until coherence returns.",
    patterns: createPatterns(0),
    phase,
    phaseLockPulseMs: 0,
    phaseLocks: 0,
    sessionMode,
    stableHoldMs: 0,
    stableMatches: 0,
    tension: 18,
  };
}

export function advanceCognitiveState(
  state: CognitiveState,
  deltaMs: number,
  heldPattern: CognitivePattern | null
): CognitiveState {
  if (state.phase !== "playing") return state;

  const tuning = getCognitiveModeTuning(state.sessionMode);
  const seconds = Math.max(0, deltaMs) / 1000;
  const matched = heldPattern === state.currentPattern;
  const elapsedMs = state.elapsedMs + Math.max(0, deltaMs);
  const stableMatches = matched ? state.stableMatches + 1 : 0;
  let stableHoldMs = matched
    ? state.stableHoldMs + Math.max(0, deltaMs)
    : Math.max(0, state.stableHoldMs - Math.max(0, deltaMs) * 0.9);
  let phaseLocks = state.phaseLocks;
  let phaseLockPulseMs = Math.max(0, state.phaseLockPulseMs - Math.max(0, deltaMs));
  const triggeredPhaseLock = matched && stableHoldMs >= PHASE_LOCK_THRESHOLD_MS;
  if (triggeredPhaseLock) {
    stableHoldMs = 0;
    phaseLocks += 1;
    phaseLockPulseMs = PHASE_LOCK_PULSE_MS;
  }
  const tension = clamp(
    state.tension +
      (matched ? -tuning.matchRecoveryPerSecond : tuning.tensionRisePerSecond) * seconds,
    0,
    100
  );
  const coherence = clamp(
    state.coherence +
      (matched ? tuning.matchRecoveryPerSecond * 0.58 : -tuning.coherenceDrainPerSecond) * seconds -
      Math.max(0, tension - 70) * seconds * 0.02,
    0,
    100
  );
  const phaseLockTension = triggeredPhaseLock ? clamp(tension - 18, 0, 100) : tension;
  const phaseLockCoherence = triggeredPhaseLock ? clamp(coherence + 10, 0, 100) : coherence;
  const sequenceIndex = Math.floor(elapsedMs / 18_000) % PATTERN_SEQUENCE.length;
  const currentPattern = PATTERN_SEQUENCE[sequenceIndex] ?? "violet";
  const phase =
    phaseLockCoherence <= 0
      ? "shattered"
      : elapsedMs >= tuning.shiftDurationMs
        ? "stable"
        : "playing";

  return {
    ...state,
    coherence: phaseLockCoherence,
    currentPattern,
    elapsedMs,
    lastEvent: triggeredPhaseLock
      ? `${labelPattern(heldPattern)} phase lock vents the cabinet storm.`
      : matched
        ? `${labelPattern(heldPattern)} feedback stabilizes the glass.`
        : "Unmatched rain raises cabinet tension.",
    objective: describeObjective(
      phaseLockCoherence,
      phaseLockTension,
      currentPattern,
      stableHoldMs
    ),
    patterns: createPatterns(sequenceIndex, phaseLockTension, phaseLockPulseMs),
    phase,
    phaseLockPulseMs,
    phaseLocks,
    stableHoldMs,
    stableMatches,
    tension: phaseLockTension,
  };
}

export function recoverCognitiveAfterMistake(state: CognitiveState): CognitiveState {
  const tuning = getCognitiveModeTuning(state.sessionMode);

  return {
    ...state,
    coherence: clamp(state.coherence + tuning.matchRecoveryPerSecond, 0, 100),
    lastEvent: "The rim hums back into phase. Coherence loss is still reversible.",
    phaseLockPulseMs: PHASE_LOCK_PULSE_MS / 2,
    stableHoldMs: Math.min(PHASE_LOCK_THRESHOLD_MS * 0.45, state.stableHoldMs + 900),
    tension: clamp(state.tension - tuning.matchRecoveryPerSecond, 0, 100),
  };
}

export function getCognitiveRunSummary(state: CognitiveState) {
  const tuning = getCognitiveModeTuning(state.sessionMode);

  return {
    coherence: Math.round(state.coherence),
    elapsedSeconds: Math.round(state.elapsedMs / 1000),
    progressPercent: Math.min(100, Math.round((state.elapsedMs / tuning.shiftDurationMs) * 100)),
    phaseLocks: state.phaseLocks,
    phaseLockPercent: Math.min(
      100,
      Math.round((state.stableHoldMs / PHASE_LOCK_THRESHOLD_MS) * 100)
    ),
    stableMatches: state.stableMatches,
    targetSeconds: Math.round(tuning.shiftDurationMs / 1000),
    tension: Math.round(state.tension),
  };
}

export function getCognitiveShiftCue(state: CognitiveState): CognitiveShiftCue {
  const tuning = getCognitiveModeTuning(state.sessionMode);
  const progressPercent = Math.min(
    100,
    Math.round((state.elapsedMs / tuning.shiftDurationMs) * 100)
  );
  const nextPattern =
    PATTERN_SEQUENCE[(Math.floor(state.elapsedMs / 18_000) + 1) % PATTERN_SEQUENCE.length] ??
    "violet";
  const stage = getShiftStage(progressPercent, state.tension, state.phase);
  const phaseLockPercent = Math.min(
    100,
    Math.round((state.stableHoldMs / PHASE_LOCK_THRESHOLD_MS) * 100)
  );
  const urgency =
    state.coherence < 38 || state.tension > 76
      ? "high"
      : state.tension > 54 || state.coherence < 62
        ? "medium"
        : "low";

  return {
    activePattern: state.currentPattern,
    instruction: describeCueInstruction(stage, state.currentPattern, phaseLockPercent, urgency),
    nextPattern,
    phaseLockActive: state.phaseLockPulseMs > 0,
    phaseLockPercent,
    progressPercent,
    stage,
    stageLabel: labelShiftStage(stage),
    urgency,
  };
}

export function getCognitiveEndingCue(state: CognitiveState): CognitiveEndingCue {
  const summary = getCognitiveRunSummary(state);

  if (state.phase === "shattered") {
    const shardCount = Math.round(
      clamp(8 + state.tension / 8 + (100 - summary.progressPercent) / 22, 8, 22)
    );
    const intensity = clamp(0.66 + state.tension / 120 + (100 - state.coherence) / 180, 0.74, 1.62);

    return {
      accentPattern: state.currentPattern,
      intensity,
      message: `The glass fractured at ${summary.progressPercent}% shift progress. Rebuild earlier by holding ${labelPattern(state.currentPattern)} long enough to phase-lock before tension peaks.`,
      nextAction: "Reboot with earlier phase locks.",
      ringCount: 2,
      shardCount,
      statusLabel: "Shatter Trace",
      title: "Glass Shattered",
      tone: "shattered",
    };
  }

  const ringCount = Math.round(clamp(3 + state.phaseLocks, 3, 9));
  const intensity = clamp(0.58 + state.coherence / 130 + state.phaseLocks * 0.06, 0.72, 1.45);
  const statusLabel =
    summary.coherence >= 88
      ? "Clear Glass Lock"
      : summary.tension <= 38
        ? "Soft Glass Lock"
        : "Rough Glass Lock";

  return {
    accentPattern: state.currentPattern,
    intensity,
    message: `${statusLabel}: ${summary.targetSeconds}s held at ${summary.coherence}% coherence with ${summary.phaseLocks} phase locks and ${summary.tension}% residual tension.`,
    nextAction: "Replay for a cleaner lock.",
    ringCount,
    shardCount: 0,
    statusLabel,
    title: "Shift Stable",
    tone: "stable",
  };
}

export function getCognitiveFeedbackCue(state: CognitiveState): CognitiveFeedbackCue {
  if (state.phase === "stable") {
    const ending = getCognitiveEndingCue(state);
    return {
      accentPattern: ending.accentPattern,
      audioLabel: "soft glass chord",
      eventKey: `stable-${state.phaseLocks}-${Math.round(state.coherence)}`,
      hapticPattern: [26, 40, 26],
      intensity: ending.intensity,
      label: ending.statusLabel,
      tone: "stable",
      visualFallback: "Glass-lock rings carry the stable shift feedback.",
    };
  }

  if (state.phase === "shattered") {
    const ending = getCognitiveEndingCue(state);
    return {
      accentPattern: ending.accentPattern,
      audioLabel: "fracture snap",
      eventKey: `shatter-${Math.round(state.elapsedMs)}-${Math.round(state.tension)}`,
      hapticPattern: [55, 25, 90],
      intensity: ending.intensity,
      label: ending.statusLabel,
      tone: "shatter",
      visualFallback: "Fracture shards carry the failed shift feedback.",
    };
  }

  if (state.phaseLockPulseMs > 0) {
    return {
      accentPattern: state.currentPattern,
      audioLabel: "phase-lock chime",
      eventKey: `phase-lock-${state.phaseLocks}`,
      hapticPattern: [18, 28, 18],
      intensity: 0.78 + state.phaseLocks * 0.08,
      label: "Phase Lock",
      tone: "phase-lock",
      visualFallback: "Phase-lock halo and rim glow confirm the recovery pulse.",
    };
  }

  if (state.coherence < 38 || state.tension > 76) {
    return {
      accentPattern: state.currentPattern,
      audioLabel: "tension warning",
      eventKey: `danger-${Math.floor(state.elapsedMs / 2000)}-${state.currentPattern}`,
      hapticPattern: [30],
      intensity: clamp(0.62 + state.tension / 160, 0.68, 1.2),
      label: "Tension Warning",
      tone: "danger",
      visualFallback: "Red glass rails and pattern rain carry the warning feedback.",
    };
  }

  if (state.stableMatches > 0) {
    return {
      accentPattern: state.currentPattern,
      audioLabel: `${labelPattern(state.currentPattern)} match pulse`,
      eventKey: `match-${state.currentPattern}-${state.stableMatches}`,
      hapticPattern: [10],
      intensity: clamp(0.36 + state.stableHoldMs / PHASE_LOCK_THRESHOLD_MS, 0.38, 0.92),
      label: "Match Pulse",
      tone: "match",
      visualFallback: "Rim glow and phase-lock meter carry the match feedback.",
    };
  }

  return {
    accentPattern: state.currentPattern,
    audioLabel: "silent scan",
    eventKey: `idle-${state.currentPattern}`,
    hapticPattern: [],
    intensity: 0.28,
    label: "Listening",
    tone: "idle",
    visualFallback: "Pattern rain and rim labels carry idle feedback.",
  };
}

function createPatterns(sequenceIndex: number, tension = 18, phaseLockPulseMs = 0) {
  const pulseBoost = phaseLockPulseMs > 0 ? 0.18 : 0;
  return PATTERN_SEQUENCE.slice(0, 4).map((color, index) => ({
    color,
    id: `pattern-${sequenceIndex}-${index}`,
    intensity: clamp(0.35 + tension / 140 + index * 0.07 + pulseBoost, 0.2, 1),
    orbit: index * 0.9 + sequenceIndex * 0.42,
  }));
}

function describeObjective(
  coherence: number,
  tension: number,
  currentPattern: CognitivePattern,
  stableHoldMs: number
) {
  if (stableHoldMs > PHASE_LOCK_THRESHOLD_MS * 0.72)
    return `Keep holding ${labelPattern(currentPattern)} to trigger a phase lock.`;
  if (coherence < 35)
    return "Coherence is low. Hold the correct rim control until the sphere heals.";
  if (tension > 70) return `Tension wave rising. Match ${labelPattern(currentPattern)} now.`;
  return `Match ${labelPattern(currentPattern)} and keep the cabinet coherent.`;
}

function getShiftStage(
  progressPercent: number,
  tension: number,
  phase: CognitiveState["phase"]
): CognitiveShiftStage {
  if (phase === "stable") return "stable";
  if (tension > 78 || progressPercent >= 76) return "storm";
  if (tension > 54 || progressPercent >= 48) return "rain";
  if (progressPercent >= 20) return "drift";
  return "calibration";
}

function labelShiftStage(stage: CognitiveShiftStage) {
  if (stage === "calibration") return "Calibration";
  if (stage === "drift") return "Drift";
  if (stage === "rain") return "Pattern Rain";
  if (stage === "storm") return "Tension Storm";
  return "Stable Shift";
}

function describeCueInstruction(
  stage: CognitiveShiftStage,
  currentPattern: CognitivePattern,
  phaseLockPercent: number,
  urgency: CognitiveShiftCue["urgency"]
) {
  if (phaseLockPercent >= 74) return `Hold ${labelPattern(currentPattern)} for phase lock.`;
  if (urgency === "high") return `Match ${labelPattern(currentPattern)} now to recover.`;
  if (stage === "calibration") return `Find ${labelPattern(currentPattern)} on the rim.`;
  if (stage === "drift") return `Track ${labelPattern(currentPattern)} through the drift.`;
  if (stage === "rain") return `Hold ${labelPattern(currentPattern)} through pattern rain.`;
  if (stage === "storm") return `Stabilize ${labelPattern(currentPattern)} before shatter.`;
  return "Shift stable.";
}

function labelPattern(pattern: CognitivePattern | null) {
  if (pattern === "cyan") return "cyan";
  if (pattern === "gold") return "gold";
  return "violet";
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
