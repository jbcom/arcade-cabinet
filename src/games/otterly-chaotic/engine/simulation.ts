import type { OtterlyState, Vec2 } from "./types";

export const WATER_ZONE = { x: -2.5, y: -1.6, width: 2.8, height: 2.4 };
export const GOAL = { x: 3.6, y: 2.8 };
const GOAT_DAMAGE_PER_MS = {
  billy: 0.002,
  elder: 0.003,
} as const;

export function createInitialState(): OtterlyState {
  return {
    otter: { x: -3.8, y: -3.2 },
    otterVelocity: { x: 0, y: 0 },
    ball: { x: -1.2, y: -0.3 },
    ballVelocity: { x: 0, y: 0 },
    ballHealth: 100,
    goats: [
      { id: "billy", position: { x: 1.4, y: -1 }, speed: 0.00125, stunnedMs: 0 },
      { id: "elder", position: { x: 2.4, y: 1.8 }, speed: 0.001, stunnedMs: 0 },
    ],
    goalRadius: 0.9,
    elapsedMs: 0,
    barkCooldownMs: 0,
    lastBarkMs: -Infinity,
    lastBarkStunned: 0,
    rallyMs: 2500,
    rescueStreak: 0,
    objective: "Push the Kudzu ball into Elder Bleat's crater before the goats eat it.",
  };
}

export function tick(state: OtterlyState, deltaMs: number, input: Vec2, barkTriggered: boolean) {
  const next = structuredClone(state) as OtterlyState;
  next.elapsedMs += deltaMs;
  next.barkCooldownMs = Math.max(0, next.barkCooldownMs - deltaMs);
  next.rallyMs = Math.max(0, next.rallyMs - deltaMs);
  next.lastBarkStunned = 0;

  const speedMultiplier = isInsideWater(next.otter) ? 0.0046 : 0.0035;
  next.otterVelocity.x = damp(next.otterVelocity.x + input.x * speedMultiplier, 0.88);
  next.otterVelocity.y = damp(next.otterVelocity.y + input.y * speedMultiplier, 0.88);
  next.otter = clampPosition(add(next.otter, scale(next.otterVelocity, deltaMs)));

  const pushVector = subtract(next.ball, next.otter);
  const pushDistance = length(pushVector);
  if (pushDistance < 1.25) {
    const push = normalize(pushVector);
    next.ballVelocity.x = damp(next.ballVelocity.x + push.x * 0.0023, 0.93);
    next.ballVelocity.y = damp(next.ballVelocity.y + push.y * 0.0023, 0.93);
  } else {
    next.ballVelocity.x = damp(next.ballVelocity.x, 0.94);
    next.ballVelocity.y = damp(next.ballVelocity.y, 0.94);
  }
  next.ball = clampPosition(add(next.ball, scale(next.ballVelocity, deltaMs)));

  const barkRadius = 2.4;
  if (barkTriggered && next.barkCooldownMs === 0) {
    next.barkCooldownMs = 1500;
    next.lastBarkMs = next.elapsedMs;
    let stunnedCount = 0;
    for (const goat of next.goats) {
      if (distance(goat.position, next.otter) < barkRadius) {
        goat.stunnedMs = 1600;
        stunnedCount++;
      }
    }
    next.lastBarkStunned = stunnedCount;
    if (stunnedCount > 0) {
      next.rescueStreak += stunnedCount;
      next.ballHealth = Math.min(100, next.ballHealth + stunnedCount * 3);
      next.objective =
        stunnedCount >= 2
          ? "Double bark rally! Push hard while the goats scatter."
          : "Clean bark stun. Drive the salad toward the crater.";
      if (stunnedCount >= 2) {
        next.rallyMs = 1800;
      }
    } else {
      next.rescueStreak = 0;
    }
  }

  for (const goat of next.goats) {
    goat.stunnedMs = Math.max(0, goat.stunnedMs - deltaMs);
    if (goat.stunnedMs > 0) {
      continue;
    }
    const direction = normalize(subtract(next.ball, goat.position));
    goat.position = clampPosition(add(goat.position, scale(direction, goat.speed * deltaMs)));

    if (distance(goat.position, next.ball) < 0.95) {
      const rallyScale = next.rallyMs > 0 ? 0.45 : 1;
      const damageRate = goat.id === "elder" ? GOAT_DAMAGE_PER_MS.elder : GOAT_DAMAGE_PER_MS.billy;
      next.ballHealth = Math.max(0, next.ballHealth - damageRate * deltaMs * rallyScale);
      next.objective = "Goats are chewing! Bark to stun them and keep pushing.";
    }
  }

  if (distance(next.ball, GOAL) < next.goalRadius) {
    next.objective = "The salad reached the crater.";
  } else if (next.ballHealth > 35) {
    next.objective = "Move the otter, then bark to keep the goats away.";
  }

  return next;
}

export function didWin(state: OtterlyState) {
  return distance(state.ball, GOAL) < state.goalRadius && state.ballHealth > 20;
}

export function didLose(state: OtterlyState) {
  return state.ballHealth <= 0;
}

export function getGoatIntent(state: OtterlyState, goat: OtterlyState["goats"][number]) {
  const targetDistance = distance(goat.position, state.ball);
  const stateLabel = goat.stunnedMs > 0 ? "stunned" : targetDistance < 1.05 ? "chewing" : "chasing";

  return {
    alertLevel: stateLabel === "stunned" ? 0 : Math.max(0, Math.min(1, 1 - targetDistance / 6)),
    goatId: goat.id,
    state: stateLabel,
    targetDistance: Math.round(targetDistance * 100) / 100,
  };
}

function add(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

function subtract(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

function scale(a: Vec2, scalar: number): Vec2 {
  return { x: a.x * scalar, y: a.y * scalar };
}

function length(a: Vec2) {
  return Math.hypot(a.x, a.y);
}

function normalize(a: Vec2): Vec2 {
  const value = length(a);
  if (value === 0) {
    return { x: 0, y: 0 };
  }
  return { x: a.x / value, y: a.y / value };
}

function damp(value: number, factor: number) {
  return value * factor;
}

function clampPosition(position: Vec2): Vec2 {
  return {
    x: Math.max(-4.6, Math.min(4.6, position.x)),
    y: Math.max(-4.6, Math.min(4.6, position.y)),
  };
}

function distance(a: Vec2, b: Vec2) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function isInsideWater(position: Vec2) {
  return (
    position.x > WATER_ZONE.x &&
    position.x < WATER_ZONE.x + WATER_ZONE.width &&
    position.y > WATER_ZONE.y &&
    position.y < WATER_ZONE.y + WATER_ZONE.height
  );
}
