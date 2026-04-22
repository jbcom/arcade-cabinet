import { normalizeSessionMode, type SessionMode } from "@logic/shared";
import type { FarmAnimal, FarmModeTuning, FarmStackAnimal, FarmState } from "./types";

const ANIMALS: readonly FarmAnimal[] = ["chick", "goat", "pig", "cow", "horse"];

const MODE_TUNING: Record<SessionMode, FarmModeTuning> = {
  challenge: {
    lives: 1,
    recoveryPerBank: 12,
    wobbleLimit: 82,
    wobblePerDrop: 10,
  },
  cozy: {
    lives: 4,
    recoveryPerBank: 32,
    wobbleLimit: 130,
    wobblePerDrop: 5,
  },
  standard: {
    lives: 3,
    recoveryPerBank: 22,
    wobbleLimit: 104,
    wobblePerDrop: 7,
  },
};

export function getFarmModeTuning(mode: string | null | undefined): FarmModeTuning {
  return MODE_TUNING[normalizeSessionMode(mode)];
}

export function createInitialFarmState(
  mode: string | null | undefined = "standard",
  phase: FarmState["phase"] = "menu"
): FarmState {
  const sessionMode = normalizeSessionMode(mode);

  return {
    bankedScore: 0,
    combo: 0,
    dropCount: 0,
    elapsedMs: 0,
    lastEvent: "The barn rail is steady. Drop the first animal when the lane feels right.",
    lives: getFarmModeTuning(sessionMode).lives,
    nextAnimal: "chick",
    nextTier: 0,
    objective: "Drop, stack, merge, then bank before the tower wobbles too far.",
    phase,
    score: 0,
    sessionMode,
    stack: [],
    wobble: 0,
  };
}

export function tickFarmState(state: FarmState, deltaMs: number): FarmState {
  if (state.phase !== "playing") return state;

  return {
    ...state,
    elapsedMs: state.elapsedMs + Math.max(0, deltaMs),
    wobble: Math.max(0, state.wobble - deltaMs * 0.0014),
  };
}

export function dropFarmAnimal(state: FarmState, lane: -1 | 0 | 1): FarmState {
  if (state.phase !== "playing") return state;

  const tuning = getFarmModeTuning(state.sessionMode);
  const incoming: FarmStackAnimal = {
    animal: state.nextAnimal,
    id: `animal-${state.dropCount}-${state.nextAnimal}`,
    lane,
    tier: state.nextTier,
  };
  const stack = [...state.stack, incoming];
  const merged = mergeStackTop(stack);
  const mergeBonus = merged.didMerge ? (merged.stack.at(-1)?.tier ?? 0) * 120 : 0;
  const score = state.score + 40 + state.combo * 12 + mergeBonus;
  const wobble =
    state.wobble +
    tuning.wobblePerDrop +
    Math.abs(lane) * 3 +
    Math.max(0, merged.stack.length - 7) * 2 -
    (merged.didMerge ? 9 : 0);
  const lives = wobble > tuning.wobbleLimit ? state.lives - 1 : state.lives;
  const recoveredWobble = wobble > tuning.wobbleLimit ? tuning.wobbleLimit * 0.58 : wobble;
  const phase = lives <= 0 ? "collapsed" : "playing";
  const nextTier = nextTierForDrop(state.dropCount + 1, state.sessionMode);
  const nextAnimal = ANIMALS[nextTier] ?? "horse";

  return {
    ...state,
    combo: merged.didMerge ? state.combo + 1 : Math.max(0, state.combo - 1),
    dropCount: state.dropCount + 1,
    lastEvent: merged.didMerge
      ? `${labelAnimal(incoming.animal)} pair merged into ${labelAnimal(nextAnimalForTier(incoming.tier + 1))}.`
      : `${labelAnimal(incoming.animal)} lands in lane ${laneLabel(lane)}.`,
    lives,
    nextAnimal,
    nextTier,
    objective:
      phase === "collapsed"
        ? "The tower collapsed. Bank earlier or build wider next run."
        : describeFarmObjective(recoveredWobble, tuning.wobbleLimit, lives),
    phase,
    score,
    stack: merged.stack,
    wobble: recoveredWobble,
  };
}

export function bankFarmScore(state: FarmState): FarmState {
  if (state.phase !== "playing") return state;

  const tuning = getFarmModeTuning(state.sessionMode);
  const bankedScore = state.bankedScore + Math.floor(state.score * 0.45);

  return {
    ...state,
    bankedScore,
    lastEvent: "Score banked. The barn crew braces the tower and the run continues.",
    objective: "Banked safely. Start building the next merge chain.",
    score: Math.ceil(state.score * 0.55),
    wobble: Math.max(0, state.wobble - tuning.recoveryPerBank),
  };
}

export function recoverFarmAfterMistake(state: FarmState): FarmState {
  return bankFarmScore({
    ...state,
    phase: state.phase === "collapsed" && state.lives > 0 ? "playing" : state.phase,
  });
}

function mergeStackTop(stack: FarmStackAnimal[]) {
  const next = [...stack];
  let didMerge = false;

  while (next.length >= 2) {
    const top = next[next.length - 1];
    const below = next[next.length - 2];
    if (!top || !below || top.tier !== below.tier || top.lane !== below.lane) break;

    const mergedTier = Math.min(top.tier + 1, ANIMALS.length - 1);
    next.splice(next.length - 2, 2, {
      animal: nextAnimalForTier(mergedTier),
      id: `merge-${below.id}-${top.id}`,
      lane: top.lane,
      tier: mergedTier,
    });
    didMerge = true;
  }

  return { didMerge, stack: next };
}

function nextTierForDrop(dropCount: number, mode: SessionMode) {
  const offset = mode === "challenge" ? 1 : 0;
  return (dropCount * 2 + offset) % 3;
}

function nextAnimalForTier(tier: number): FarmAnimal {
  return ANIMALS[Math.max(0, Math.min(ANIMALS.length - 1, tier))] ?? "horse";
}

function describeFarmObjective(wobble: number, limit: number, lives: number) {
  if (wobble > limit * 0.8)
    return `Tower swaying. Bank now or spend one of ${lives} recovery lives.`;
  if (wobble > limit * 0.56) return "Wobble building. Drop wider or bank the current score.";
  return "Build pairs in the same lane to merge into bigger farm tiers.";
}

function labelAnimal(animal: FarmAnimal) {
  return animal.replace("-", " ");
}

function laneLabel(lane: -1 | 0 | 1) {
  if (lane < 0) return "left";
  if (lane > 0) return "right";
  return "center";
}
