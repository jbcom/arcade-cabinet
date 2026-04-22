import type { RunePattern } from "../lib/runePatterns";

export type ForestPhase = "intro" | "tutorial" | "playing" | "victory" | "defeat";
export type RuneType = RunePattern["type"];

export interface TreePosition {
  id: string;
  x: number;
  y: number;
  canopyScale: number;
}

export interface GroveTreeState {
  health: number;
  maxHealth: number;
  isShielded: boolean;
}

export interface CorruptionShadow {
  id: number;
  x: number;
  y: number;
  targetTreeIndex: number;
  health: number;
  maxHealth: number;
  speed: number;
  size: number;
}

export interface PurifyZone {
  x: number;
  y: number;
  radius: number;
}

export interface ForestState {
  phase: ForestPhase;
  wave: number;
  mana: number;
  maxMana: number;
  trees: GroveTreeState[];
  shadows: CorruptionShadow[];
  lastRune: string | null;
  lastRuneType: RuneType | null;
  harmonyLevel: number;
  harmonySurgeActive: boolean;
  purifyZone: PurifyZone | null;
  healingTreeIndex: number | null;
  objective: string;
  threatLevel: number;
}

export interface SpawnWaveResult {
  shadows: CorruptionShadow[];
  nextShadowId: number;
}

export const MAX_WAVES = 5;
export const TREE_POSITIONS: TreePosition[] = [
  { id: "left-grove", x: 30, y: 73, canopyScale: 1.02 },
  { id: "heart-tree", x: 50, y: 77, canopyScale: 1.18 },
  { id: "right-grove", x: 64, y: 73, canopyScale: 1.02 },
];

const DEFAULT_OBJECTIVE = "Draw musical runes over the grove before corruption reaches the roots.";

export function createInitialForestState(phase: ForestPhase = "intro"): ForestState {
  return {
    phase,
    wave: 1,
    mana: 100,
    maxMana: 100,
    trees: createInitialTreeStates(),
    shadows: [],
    lastRune: null,
    lastRuneType: null,
    harmonyLevel: 0,
    harmonySurgeActive: false,
    purifyZone: null,
    healingTreeIndex: null,
    objective: DEFAULT_OBJECTIVE,
    threatLevel: 0,
  };
}

export function createInitialTreeStates(): GroveTreeState[] {
  return TREE_POSITIONS.map(() => ({ health: 100, maxHealth: 100, isShielded: false }));
}

export function createGroveLayout() {
  return {
    trees: TREE_POSITIONS,
    roots: [
      { id: "left-root", x: 34, y: 82, width: 28, rotate: -9 },
      { id: "heart-root", x: 50, y: 84, width: 36, rotate: 0 },
      { id: "right-root", x: 66, y: 82, width: 28, rotate: 9 },
    ],
    wardRings: [
      { id: "outer-ward", x: 50, y: 73, width: 72, height: 34, color: "#fbbf24" },
      { id: "inner-ward", x: 50, y: 73, width: 46, height: 20, color: "#a78bfa" },
    ],
    standingStones: [
      { id: "stone-left", x: 16, y: 77, height: 18, color: "#1f3f36" },
      { id: "stone-right", x: 84, y: 77, height: 18, color: "#1f3f36" },
      { id: "stone-crown", x: 50, y: 52, height: 12, color: "#26493f" },
    ],
  };
}

export function spawnCorruptionWave(wave: number, startingShadowId = 0): SpawnWaveResult {
  const count = wave * 3;
  const shadows = Array.from({ length: count }, (_, index): CorruptionShadow => {
    const targetTreeIndex = (index + wave) % TREE_POSITIONS.length;
    const target = TREE_POSITIONS[targetTreeIndex];
    const columnOffset = ((index % 3) - 1) * (7 + wave * 0.7);
    const row = Math.floor(index / 3);

    return {
      id: startingShadowId + index,
      x: clamp(target.x + columnOffset + wave * 1.3, 8, 92),
      y: -12 - row * 7 - wave * 2,
      targetTreeIndex,
      health: 20 + wave * 2,
      maxHealth: 20 + wave * 2,
      speed: round(0.56 + wave * 0.08 + (index % 2) * 0.04, 3),
      size: 30 + ((wave * 7 + index * 5) % 18),
    };
  });

  return {
    shadows,
    nextShadowId: startingShadowId + shadows.length,
  };
}

export function regenerateMana(state: ForestState, amount = 1): ForestState {
  if (state.phase !== "playing") return state;

  return {
    ...state,
    mana: clamp(state.mana + amount, 0, state.maxMana),
  };
}

export function canCastSpell(state: ForestState, spell: RunePattern): boolean {
  return state.phase === "playing" && state.mana >= getSpellManaCost(state, spell);
}

export function getSpellManaCost(state: ForestState, spell: RunePattern): number {
  const alternating = state.lastRuneType !== null && state.lastRuneType !== spell.type;
  const harmonyDiscount = alternating && state.harmonyLevel >= 2 ? 0.75 : 1;

  return Math.ceil(spell.manaCost * harmonyDiscount);
}

export function applySpellCast(state: ForestState, spell: RunePattern): ForestState {
  if (!canCastSpell(state, spell)) return state;

  const alternating = state.lastRuneType !== null && state.lastRuneType !== spell.type;
  const harmonyLevel = alternating ? Math.min(3, state.harmonyLevel + 1) : 1;
  const harmonySurgeActive = harmonyLevel >= 3;
  const mana = clamp(
    state.mana - getSpellManaCost(state, spell) + (harmonySurgeActive ? 6 : 0),
    0,
    state.maxMana
  );
  const base = {
    ...state,
    harmonyLevel,
    harmonySurgeActive,
    lastRuneType: spell.type,
    mana,
    lastRune: spell.name,
    objective: describeObjective(state, spell.type, harmonySurgeActive),
  };

  if (spell.type === "shield") {
    return {
      ...base,
      trees: state.trees.map((tree) => ({
        ...tree,
        health: harmonySurgeActive ? Math.min(tree.maxHealth, tree.health + 6) : tree.health,
        isShielded: true,
      })),
    };
  }

  if (spell.type === "heal") {
    const healAmount = harmonySurgeActive ? 35 : 20;
    return {
      ...base,
      trees: state.trees.map((tree) => ({
        ...tree,
        health: Math.min(tree.maxHealth, tree.health + healAmount),
      })),
      healingTreeIndex: findWeakestTreeIndex(state.trees),
    };
  }

  return {
    ...base,
    purifyZone: { x: 50, y: 50, radius: harmonySurgeActive ? 42 : 30 },
  };
}

export function clearRuneFeedback(state: ForestState): ForestState {
  return { ...state, harmonySurgeActive: false, lastRune: null };
}

export function clearShield(state: ForestState): ForestState {
  return {
    ...state,
    trees: state.trees.map((tree) => ({ ...tree, isShielded: false })),
  };
}

export function clearHealing(state: ForestState): ForestState {
  return { ...state, healingTreeIndex: null };
}

export function clearPurifyZone(state: ForestState): ForestState {
  return { ...state, purifyZone: null };
}

export function applyShadowHit(
  state: ForestState,
  shadowId: number,
  treeIndex: number
): ForestState {
  const nextTrees = state.trees.map((tree, index) => {
    if (index !== treeIndex || tree.isShielded) return tree;

    return {
      ...tree,
      health: Math.max(0, tree.health - 10),
    };
  });

  return updateThreat({
    ...state,
    trees: nextTrees,
    shadows: state.shadows.filter((shadow) => shadow.id !== shadowId),
  });
}

export function removePurifiedShadow(state: ForestState, shadowId: number): ForestState {
  return updateThreat({
    ...state,
    shadows: state.shadows.filter((shadow) => shadow.id !== shadowId),
  });
}

export function advanceShadowPosition(
  shadow: CorruptionShadow,
  treePosition: TreePosition,
  stepScale = 0.3
): { x: number; y: number; reached: boolean } {
  const dx = treePosition.x - shadow.x;
  const dy = treePosition.y - shadow.y;
  const distance = Math.hypot(dx, dy);

  if (distance < 3) {
    return { x: shadow.x, y: shadow.y, reached: true };
  }

  return {
    x: shadow.x + (dx / distance) * shadow.speed * stepScale,
    y: shadow.y + (dy / distance) * shadow.speed * stepScale,
    reached: false,
  };
}

export function getForestTransition(
  state: ForestState,
  maxWaves = MAX_WAVES
): { type: "none" | "next-wave" | "victory" | "defeat"; nextWave?: number } {
  if (state.phase !== "playing") return { type: "none" };

  if (state.trees.every((tree) => tree.health <= 0)) {
    return { type: "defeat" };
  }

  if (state.shadows.length === 0 && state.wave < maxWaves) {
    return { type: "next-wave", nextWave: state.wave + 1 };
  }

  if (state.shadows.length === 0 && state.wave === maxWaves) {
    return { type: "victory" };
  }

  return { type: "none" };
}

export function analyzeRuneGesture(points: { x: number; y: number }[]): RuneType | null {
  if (points.length < 20) return null;

  const minX = Math.min(...points.map((point) => point.x));
  const maxX = Math.max(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxY = Math.max(...points.map((point) => point.y));
  const width = maxX - minX;
  const height = maxY - minY;
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const distances = points.map((point) => Math.hypot(point.x - centerX, point.y - centerY));
  const avgDistance = distances.reduce((sum, distance) => sum + distance, 0) / distances.length;
  const distanceVariance =
    distances.reduce((sum, distance) => sum + (distance - avgDistance) ** 2, 0) / distances.length;
  const isCircular = distanceVariance < 0.003 && width > 0.15 && height > 0.15;
  const startY = points.slice(0, 5).reduce((sum, point) => sum + point.y, 0) / 5;
  const endY = points.slice(-5).reduce((sum, point) => sum + point.y, 0) / 5;
  const isUpward = startY - endY > 0.2 && height > 0.25;
  let directionChanges = 0;
  let verticalDirectionChanges = 0;
  let lastDirection = 0;
  let lastVerticalDirection = 0;
  let pathLength = 0;

  for (let index = 1; index < points.length; index++) {
    const previous = points[index - 1];
    const current = points[index];
    if (previous && current) {
      pathLength += Math.hypot(current.x - previous.x, current.y - previous.y);
    }
  }

  for (let index = 10; index < points.length; index += 5) {
    const previous = points[index - 10];
    const current = points[index];
    if (!previous || !current) continue;

    const dx = current.x - previous.x;
    const currentDirection = dx > 0.02 ? 1 : dx < -0.02 ? -1 : 0;
    if (currentDirection !== 0 && currentDirection !== lastDirection && lastDirection !== 0) {
      directionChanges++;
    }
    if (currentDirection !== 0) lastDirection = currentDirection;

    const dy = current.y - previous.y;
    const currentVerticalDirection = dy > 0.02 ? 1 : dy < -0.02 ? -1 : 0;
    if (
      currentVerticalDirection !== 0 &&
      currentVerticalDirection !== lastVerticalDirection &&
      lastVerticalDirection !== 0
    ) {
      verticalDirectionChanges++;
    }
    if (currentVerticalDirection !== 0) lastVerticalDirection = currentVerticalDirection;
  }

  const pathRatio = pathLength / Math.max(0.001, Math.hypot(width, height));
  const isZigzag =
    directionChanges + verticalDirectionChanges >= 2 && width > 0.2 && pathRatio > 2.4;

  if (isCircular) return "shield";
  if (isUpward) return "heal";
  if (isZigzag) return "purify";

  return null;
}

function updateThreat(state: ForestState): ForestState {
  const averageTreeHealth =
    state.trees.reduce((sum, tree) => sum + tree.health / tree.maxHealth, 0) / state.trees.length;
  const threatLevel = clamp(
    Math.round((state.shadows.length * 7 + (1 - averageTreeHealth) * 50) * 10) / 10,
    0,
    100
  );

  return {
    ...state,
    threatLevel,
    objective:
      threatLevel > 55
        ? "Corruption is breaking the ward line. Purify or shield now."
        : state.objective,
  };
}

function findWeakestTreeIndex(trees: GroveTreeState[]): number {
  return trees.reduce((weakestIndex, tree, index) => {
    const weakest = trees[weakestIndex];
    return tree.health / tree.maxHealth < weakest.health / weakest.maxHealth ? index : weakestIndex;
  }, 0);
}

function describeObjective(
  state: ForestState,
  spellType: RuneType,
  harmonySurgeActive = false
): string {
  if (harmonySurgeActive) {
    return "Harmony surge active. The grove echoes the spell with extra force.";
  }
  if (spellType === "shield") return "Shield chorus raised. Hold the line while mana returns.";
  if (spellType === "heal") return "Healing motif restored root light across the grove.";
  if (state.shadows.length > 0)
    return "Purification field active. Keep corruption inside the circle.";

  return DEFAULT_OBJECTIVE;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function round(value: number, precision: number) {
  const multiplier = 10 ** precision;
  return Math.round(value * multiplier) / multiplier;
}
