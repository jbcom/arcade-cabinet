import { normalizeSessionMode, type SessionMode } from "@logic/shared";
import type {
  FarmAbilityEvent,
  FarmAnimal,
  FarmAnimalPoseCue,
  FarmCollapseCue,
  FarmLane,
  FarmModeTuning,
  FarmStackAnimal,
  FarmStackCue,
  FarmState,
  FarmWobbleBand,
} from "./types";

const ANIMALS: readonly FarmAnimal[] = ["chick", "goat", "pig", "cow", "horse"];
const STANDARD_DROP_SEQUENCE = [0, 0, 1, 1, 2, 0, 2, 2] as const;
const CHALLENGE_DROP_SEQUENCE = [0, 1, 1, 2, 0, 2, 1, 2] as const;
export const FARM_BANK_TARGET = 2_500;
export const FARM_MIN_RUN_MS = 8 * 60_000;

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
    lastAbility: null,
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
  const ability =
    merged.mergedTier !== null
      ? createFarmAbilityEvent(merged.mergedTier, state.dropCount + 1)
      : null;
  const mergeBonus = merged.didMerge ? (merged.stack.at(-1)?.tier ?? 0) * 120 : 0;
  const score = state.score + 40 + state.combo * 12 + mergeBonus + (ability?.scoreBonus ?? 0);
  const wobble =
    state.wobble +
    tuning.wobblePerDrop +
    Math.abs(lane) * 3 +
    Math.max(0, merged.stack.length - 7) * 2 -
    (merged.didMerge ? 9 : 0) -
    (ability?.wobbleRecovery ?? 0);
  const lives = wobble > tuning.wobbleLimit ? state.lives - 1 : state.lives;
  const recoveredWobble = wobble > tuning.wobbleLimit ? tuning.wobbleLimit * 0.58 : wobble;
  const phase = lives <= 0 ? "collapsed" : "playing";
  const nextTier = nextTierForDrop(state.dropCount + 1, state.sessionMode);
  const nextAnimal = ANIMALS[nextTier] ?? "horse";

  return {
    ...state,
    combo: merged.didMerge ? state.combo + 1 : Math.max(0, state.combo - 1),
    dropCount: state.dropCount + 1,
    lastAbility: ability,
    lastEvent: ability
      ? ability.message
      : merged.didMerge
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
  const bankReady = bankedScore >= FARM_BANK_TARGET && state.elapsedMs >= FARM_MIN_RUN_MS;

  return {
    ...state,
    bankedScore,
    lastEvent: bankReady
      ? "The auction bell rings. The barn crew banks the full score chase."
      : "Score banked. The barn crew braces the tower and the run continues.",
    objective: bankReady
      ? "Run banked. Start a new stack to chase a cleaner farm tower."
      : describeBankObjective(bankedScore, state.elapsedMs),
    phase: bankReady ? "banked" : state.phase,
    score: Math.ceil(state.score * 0.55),
    wobble: Math.max(0, state.wobble - tuning.recoveryPerBank),
  };
}

export function getFarmRunSummary(state: FarmState) {
  return {
    bankedScore: state.bankedScore,
    bankTarget: FARM_BANK_TARGET,
    dropCount: state.dropCount,
    elapsedSeconds: Math.round(state.elapsedMs / 1000),
    lives: state.lives,
    progressPercent: Math.min(100, Math.round((state.bankedScore / FARM_BANK_TARGET) * 100)),
    score: state.score,
    wobble: Math.round(state.wobble),
  };
}

export function getFarmStackCue(state: FarmState): FarmStackCue {
  const wobbleBand = getFarmWobbleBand(state);
  const collapseRiskPercent = Math.round(getFarmWobbleRatio(state) * 100);
  const projectedBank = state.bankedScore + Math.floor(state.score * 0.45);
  const bankProgressPercent = Math.min(100, Math.round((projectedBank / FARM_BANK_TARGET) * 100));
  const bankReady = projectedBank >= FARM_BANK_TARGET && state.elapsedMs >= FARM_MIN_RUN_MS;
  const laneHeights = getLaneHeights(state.stack);
  const mergeLane = findMergeLane(state);
  const recommendedLane =
    wobbleBand === "danger"
      ? getShortestLane(laneHeights)
      : (mergeLane ?? getShortestLane(laneHeights));
  const mergePreviewAnimal = mergeLane !== null ? nextAnimalForTier(state.nextTier + 1) : null;

  return {
    bankProgressPercent,
    bankReady,
    collapseRiskPercent,
    laneHeights,
    mergePreviewAnimal,
    recommendedAction: describeStackCueAction(
      state,
      recommendedLane,
      mergeLane,
      bankReady,
      wobbleBand
    ),
    recommendedLane,
    recommendedLaneLabel: laneLabel(recommendedLane),
    wobbleBand,
  };
}

export function getFarmCollapseCue(state: FarmState): FarmCollapseCue {
  const ratio = getFarmWobbleRatio(state);
  const bankedPercent = Math.min(100, Math.round((state.bankedScore / FARM_BANK_TARGET) * 100));
  const severity =
    bankedPercent >= 70 ? "auction-loss" : ratio >= 0.9 ? "spill" : ("tilt" as const);
  const spillDirection = getStackLeanDirection(state.stack);
  const scatterCount = Math.max(4, Math.min(10, state.stack.length + 2));

  return {
    bankedPercent,
    message:
      severity === "auction-loss"
        ? "The tower spills just shy of a very bankable auction load."
        : severity === "spill"
          ? "The barn rail snaps sideways and sends the top animals sliding."
          : "The stack tips before the crew can brace it.",
    recoveryAdvice:
      severity === "auction-loss"
        ? "Bank one merge earlier when the quota meter is already high."
        : "Widen the next tower and use banking as soon as danger sway appears.",
    scatterCount,
    severity,
    spillDirection,
    title: severity === "tilt" ? "Tower Tilted" : "Tower Down",
  };
}

export function getFarmAnimalPoseCue(animal: FarmAnimal, tier: number): FarmAnimalPoseCue {
  const poseByAnimal: Record<FarmAnimal, FarmAnimalPoseCue["pose"]> = {
    chick: "peck",
    cow: "brace",
    goat: "headbutt",
    horse: "gallop",
    pig: "snoot",
  };
  const expression =
    tier >= 4 ? "wild" : tier >= 2 ? "focused" : ("calm" as FarmAnimalPoseCue["expression"]);

  return {
    expression,
    label: `${labelAnimal(animal)} tier ${tier + 1}`,
    pose: poseByAnimal[animal],
    showMotionMarks: tier >= 2 || animal === "horse",
    showRibbon: tier >= 3,
  };
}

export function getFarmWobbleBand(state: FarmState): FarmWobbleBand {
  const ratio = getFarmWobbleRatio(state);
  if (ratio >= 0.78) return "danger";
  if (ratio >= 0.52) return "sway";
  return "steady";
}

function getStackLeanDirection(stack: FarmStackAnimal[]): FarmLane {
  const laneWeights = stack.reduce<Record<FarmLane, number>>(
    (weights, animal, index) => {
      weights[animal.lane] += index + 1;
      return weights;
    },
    { "-1": 0, 0: 0, 1: 0 }
  );
  const left = laneWeights[-1];
  const right = laneWeights[1];

  if (left > right + 1) return -1;
  if (right > left + 1) return 1;
  return 0;
}

function getLaneHeights(stack: FarmStackAnimal[]): Record<FarmLane, number> {
  return stack.reduce<Record<FarmLane, number>>(
    (heights, animal) => {
      heights[animal.lane] += 1;
      return heights;
    },
    { "-1": 0, 0: 0, 1: 0 }
  );
}

function findMergeLane(state: FarmState): FarmLane | null {
  const lanes: FarmLane[] = [-1, 0, 1];

  return (
    lanes.find((lane) => {
      const top = [...state.stack].reverse().find((animal) => animal.lane === lane);
      return top?.tier === state.nextTier;
    }) ?? null
  );
}

function getShortestLane(laneHeights: Record<FarmLane, number>): FarmLane {
  const lanes: FarmLane[] = [-1, 0, 1];
  return lanes.sort((a, b) => laneHeights[a] - laneHeights[b] || Math.abs(a) - Math.abs(b))[0] ?? 0;
}

function describeStackCueAction(
  state: FarmState,
  recommendedLane: FarmLane,
  mergeLane: FarmLane | null,
  bankReady: boolean,
  wobbleBand: FarmWobbleBand
) {
  if (bankReady) return "Bank now to lock the auction quota.";
  if (wobbleBand === "danger")
    return `Danger sway. Drop ${laneLabel(recommendedLane)} or bank before the next tilt.`;
  if (mergeLane !== null)
    return `Drop ${labelAnimal(state.nextAnimal)} ${laneLabel(mergeLane)} to merge into ${labelAnimal(nextAnimalForTier(state.nextTier + 1))}.`;
  return `Build the ${laneLabel(recommendedLane)} for a wider tower.`;
}

export function getFarmWobbleRatio(state: FarmState) {
  return Math.max(0, Math.min(1, state.wobble / getFarmModeTuning(state.sessionMode).wobbleLimit));
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
  let mergedTier: number | null = null;

  while (next.length >= 2) {
    const top = next[next.length - 1];
    const below = next[next.length - 2];
    if (!top || !below || top.tier !== below.tier || top.lane !== below.lane) break;

    mergedTier = Math.min(top.tier + 1, ANIMALS.length - 1);
    next.splice(next.length - 2, 2, {
      animal: nextAnimalForTier(mergedTier),
      id: `merge-${below.id}-${top.id}`,
      lane: top.lane,
      tier: mergedTier,
    });
    didMerge = true;
  }

  return { didMerge, mergedTier, stack: next };
}

function createFarmAbilityEvent(mergedTier: number, dropCount: number): FarmAbilityEvent {
  const animal = nextAnimalForTier(mergedTier);
  const abilityByAnimal: Record<
    FarmAnimal,
    Pick<FarmAbilityEvent, "ability" | "message" | "scoreBonus" | "wobbleRecovery">
  > = {
    chick: {
      ability: "chirp",
      message: "Chick chorus steadies the rail for the next drop.",
      scoreBonus: 35,
      wobbleRecovery: 3,
    },
    cow: {
      ability: "milk-brace",
      message: "Cow brace locks the barn beam and slows the sway.",
      scoreBonus: 170,
      wobbleRecovery: 11,
    },
    goat: {
      ability: "headbutt",
      message: "Goat headbutt knocks the stack back toward center.",
      scoreBonus: 80,
      wobbleRecovery: 5,
    },
    horse: {
      ability: "gallop-brace",
      message: "Horse gallop brace kicks the tower upright.",
      scoreBonus: 260,
      wobbleRecovery: 15,
    },
    pig: {
      ability: "mud-cushion",
      message: "Pig mud cushion absorbs the bad wobble.",
      scoreBonus: 120,
      wobbleRecovery: 8,
    },
  };

  return {
    animal,
    dropCount,
    ...abilityByAnimal[animal],
  };
}

function nextTierForDrop(dropCount: number, mode: SessionMode) {
  const sequence = mode === "challenge" ? CHALLENGE_DROP_SEQUENCE : STANDARD_DROP_SEQUENCE;
  return sequence[dropCount % sequence.length] ?? 0;
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

function describeBankObjective(bankedScore: number, elapsedMs: number) {
  const scoreRemaining = Math.max(0, FARM_BANK_TARGET - bankedScore);
  const secondsRemaining = Math.ceil(Math.max(0, FARM_MIN_RUN_MS - elapsedMs) / 1000);

  if (scoreRemaining === 0 && secondsRemaining > 0) {
    return `Quota met. Keep the tower alive ${secondsRemaining}s until the auction bell.`;
  }
  if (scoreRemaining > 0) {
    return `${scoreRemaining} banked points to the auction quota. Build another merge chain.`;
  }
  return "Auction quota is ready. Bank again to lock the run.";
}

function labelAnimal(animal: FarmAnimal) {
  return animal.replace("-", " ");
}

function laneLabel(lane: FarmLane) {
  if (lane < 0) return "left";
  if (lane > 0) return "right";
  return "center";
}
