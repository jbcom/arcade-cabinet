import { normalizeSessionMode, type SessionMode } from "@logic/shared";
import type { CognitiveModeTuning, CognitivePattern, CognitiveState } from "./types";

const PATTERN_SEQUENCE: readonly CognitivePattern[] = [
  "violet",
  "cyan",
  "gold",
  "cyan",
  "violet",
  "gold",
];

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
    sessionMode,
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
  const sequenceIndex = Math.floor(elapsedMs / 18_000) % PATTERN_SEQUENCE.length;
  const currentPattern = PATTERN_SEQUENCE[sequenceIndex] ?? "violet";
  const phase =
    coherence <= 0 ? "shattered" : elapsedMs >= tuning.shiftDurationMs ? "stable" : "playing";

  return {
    ...state,
    coherence,
    currentPattern,
    elapsedMs,
    lastEvent: matched
      ? `${labelPattern(heldPattern)} feedback stabilizes the glass.`
      : "Unmatched rain raises cabinet tension.",
    objective: describeObjective(coherence, tension, currentPattern),
    patterns: createPatterns(sequenceIndex, tension),
    phase,
    stableMatches,
    tension,
  };
}

export function recoverCognitiveAfterMistake(state: CognitiveState): CognitiveState {
  const tuning = getCognitiveModeTuning(state.sessionMode);

  return {
    ...state,
    coherence: clamp(state.coherence + tuning.matchRecoveryPerSecond, 0, 100),
    lastEvent: "The rim hums back into phase. Coherence loss is still reversible.",
    tension: clamp(state.tension - tuning.matchRecoveryPerSecond, 0, 100),
  };
}

function createPatterns(sequenceIndex: number, tension = 18) {
  return PATTERN_SEQUENCE.slice(0, 4).map((color, index) => ({
    color,
    id: `pattern-${sequenceIndex}-${index}`,
    intensity: clamp(0.35 + tension / 140 + index * 0.07, 0.2, 1),
    orbit: index * 0.9 + sequenceIndex * 0.42,
  }));
}

function describeObjective(coherence: number, tension: number, currentPattern: CognitivePattern) {
  if (coherence < 35)
    return "Coherence is low. Hold the correct rim control until the sphere heals.";
  if (tension > 70) return `Tension wave rising. Match ${labelPattern(currentPattern)} now.`;
  return `Match ${labelPattern(currentPattern)} and keep the cabinet coherent.`;
}

function labelPattern(pattern: CognitivePattern | null) {
  if (pattern === "cyan") return "cyan";
  if (pattern === "gold") return "gold";
  return "violet";
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
