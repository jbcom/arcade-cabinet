import type { EntropyState, FallingBlock, GridNode, Shockwave, Vec2 } from "./types";

export const GRID_HALF = 5;
const COMBO_WINDOW_MS = 800;
const MOVE_COOLDOWN_MS = 200;
const BLOCK_SPAWN_HEIGHT = 18;
const TIME_BONUS_PER_ANCHOR_MS = 15_000;

let _idCounter = 0;
function nextId(): string {
  _idCounter += 1;
  return _idCounter.toString(36);
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function generateNode(excludedKeys: string[], fromX: number, fromZ: number): GridNode {
  const minDist = 3;
  let attempts = 0;
  while (attempts < 60) {
    const x = Math.floor(Math.random() * (GRID_HALF * 2 + 1)) - GRID_HALF;
    const z = Math.floor(Math.random() * (GRID_HALF * 2 + 1)) - GRID_HALF;
    const dist = Math.abs(x - fromX) + Math.abs(z - fromZ);
    if (dist >= minDist && !excludedKeys.includes(`${x},${z}`)) {
      return { id: `node-${nextId()}`, gridX: x, gridZ: z };
    }
    attempts += 1;
  }
  return { id: `node-fb-${nextId()}`, gridX: -GRID_HALF, gridZ: -GRID_HALF };
}

function buildPlayingState(
  level: number,
  anchorsRequired: number,
  score: number,
  totalAnchors: number
): EntropyState {
  const node = generateNode(["0,0"], 0, 0);
  return {
    phase: "playing",
    level,
    playerGridX: 0,
    playerGridZ: 0,
    targetNode: node,
    anchorsRequired,
    anchorsSecuredThisLevel: 0,
    totalAnchors,
    fallingBlocks: [],
    blockedCells: [],
    shockwaves: [],
    timeMs: Math.max(10_000, 20_000 - (level - 1) * 1_500),
    score,
    resonance: 0,
    isResonanceMax: false,
    lastAnchorTimeMs: 0,
    blockSpawnCooldownMs: 3_000,
    moveCooldownMs: 0,
    elapsedMs: 0,
    cameraShake: 0,
  };
}

export function createInitialState(): EntropyState {
  return { ...buildPlayingState(1, 3, 0, 0), phase: "menu" };
}

export function startGame(_prev: EntropyState): EntropyState {
  return buildPlayingState(1, 3, 0, 0);
}

export function nextLevel(prev: EntropyState): EntropyState {
  return buildPlayingState(prev.level + 1, prev.anchorsRequired + 1, prev.score, prev.totalAnchors);
}

export function restartGame(): EntropyState {
  return buildPlayingState(1, 3, 0, 0);
}

function secureNode(s: EntropyState): void {
  if (!s.targetNode) return;

  s.totalAnchors += 1;
  s.anchorsSecuredThisLevel += 1;

  const multiplier = s.isResonanceMax ? 2 : 1;
  s.timeMs += TIME_BONUS_PER_ANCHOR_MS * multiplier;
  s.score += 1_000 * s.anchorsSecuredThisLevel * multiplier;
  s.cameraShake = 0.5;

  const timeSinceLast = s.elapsedMs - s.lastAnchorTimeMs;
  if (s.lastAnchorTimeMs > 0 && timeSinceLast < COMBO_WINDOW_MS * 6) {
    s.resonance = Math.min(1.0, s.resonance + 0.3);
  } else {
    s.resonance = 0.15;
  }
  if (s.resonance >= 1.0) s.isResonanceMax = true;
  s.lastAnchorTimeMs = s.elapsedMs;

  const nodeKey = `${s.targetNode.gridX},${s.targetNode.gridZ}`;
  s.blockedCells = s.blockedCells.filter((k) => k !== nodeKey);

  const nodeX = s.targetNode.gridX;
  const nodeZ = s.targetNode.gridZ;
  s.fallingBlocks = s.fallingBlocks.filter((b) => !(b.gridX === nodeX && b.gridZ === nodeZ));

  const sw: Shockwave = {
    id: `sw-${nextId()}`,
    x: s.targetNode.gridX,
    z: s.targetNode.gridZ,
    scale: 0.1,
    life: 1.5,
  };
  s.shockwaves.push(sw);

  if (s.anchorsSecuredThisLevel >= s.anchorsRequired) {
    s.phase = "levelcomplete";
    s.targetNode = null;
  } else {
    const excluded = [...s.blockedCells, `${s.playerGridX},${s.playerGridZ}`];
    s.targetNode = generateNode(excluded, s.playerGridX, s.playerGridZ);
  }
}

function trySpawnBlock(s: EntropyState): void {
  const excluded = new Set<string>([
    ...s.blockedCells,
    `${s.playerGridX},${s.playerGridZ}`,
    ...(s.targetNode ? [`${s.targetNode.gridX},${s.targetNode.gridZ}`] : []),
    ...s.fallingBlocks.map((b) => `${b.gridX},${b.gridZ}`),
  ]);

  const candidates: Array<[number, number]> = [];
  for (let x = -GRID_HALF; x <= GRID_HALF; x++) {
    for (let z = -GRID_HALF; z <= GRID_HALF; z++) {
      if (!excluded.has(`${x},${z}`)) {
        candidates.push([x, z]);
      }
    }
  }

  if (candidates.length === 0) return;

  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  const block: FallingBlock = {
    id: `blk-${nextId()}`,
    gridX: pick[0],
    gridZ: pick[1],
    worldY: BLOCK_SPAWN_HEIGHT,
    velocity: 0,
  };
  s.fallingBlocks.push(block);
}

export function tick(state: EntropyState, deltaMs: number, input: Vec2): EntropyState {
  if (state.phase !== "playing") return state;

  const s = structuredClone(state) as EntropyState;

  s.elapsedMs += deltaMs;
  s.timeMs = Math.max(0, s.timeMs - deltaMs);
  s.cameraShake = Math.max(0, s.cameraShake - deltaMs * 0.003);

  // Movement
  s.moveCooldownMs = Math.max(0, s.moveCooldownMs - deltaMs);
  if (s.moveCooldownMs === 0 && (input.x !== 0 || input.y !== 0)) {
    const dx = input.x > 0 ? 1 : input.x < 0 ? -1 : 0;
    const dz = input.y > 0 ? 1 : input.y < 0 ? -1 : 0;
    const newX = clamp(s.playerGridX + dx, -GRID_HALF, GRID_HALF);
    const newZ = clamp(s.playerGridZ + dz, -GRID_HALF, GRID_HALF);
    const cellKey = `${newX},${newZ}`;
    if (!s.blockedCells.includes(cellKey)) {
      s.playerGridX = newX;
      s.playerGridZ = newZ;
      s.moveCooldownMs = MOVE_COOLDOWN_MS;
    }
  }

  // Check if player reached the target node
  if (
    s.targetNode &&
    s.playerGridX === s.targetNode.gridX &&
    s.playerGridZ === s.targetNode.gridZ
  ) {
    secureNode(s);
  }

  // Spawn falling blocks
  s.blockSpawnCooldownMs -= deltaMs;
  if (s.blockSpawnCooldownMs <= 0 && s.phase === "playing") {
    const interval = Math.max(1_200, 3_000 - s.level * 300);
    s.blockSpawnCooldownMs = interval;
    trySpawnBlock(s);
  }

  // Update falling blocks
  for (const block of s.fallingBlocks) {
    block.velocity = Math.min(block.velocity + deltaMs * 0.04, 25);
    block.worldY -= block.velocity * deltaMs * 0.001;
  }

  // Land blocks
  for (let i = s.fallingBlocks.length - 1; i >= 0; i--) {
    const block = s.fallingBlocks[i];
    if (block.worldY <= 0) {
      const key = `${block.gridX},${block.gridZ}`;
      if (!s.blockedCells.includes(key)) {
        s.blockedCells.push(key);
        s.shockwaves.push({
          id: `sw-land-${nextId()}`,
          x: block.gridX,
          z: block.gridZ,
          scale: 0.1,
          life: 1.0,
        });
      }
      s.fallingBlocks.splice(i, 1);
    }
  }

  // Update shockwaves
  for (let i = s.shockwaves.length - 1; i >= 0; i--) {
    s.shockwaves[i].life -= deltaMs * 0.002;
    s.shockwaves[i].scale += deltaMs * 0.05;
    if (s.shockwaves[i].life <= 0) {
      s.shockwaves.splice(i, 1);
    }
  }

  // Resonance decay outside combo window
  const timeSinceAnchor = s.elapsedMs - s.lastAnchorTimeMs;
  if (s.lastAnchorTimeMs > 0 && timeSinceAnchor > COMBO_WINDOW_MS * 6) {
    s.resonance = Math.max(0, s.resonance - deltaMs * 0.0005);
  }
  if (s.resonance < 1.0) s.isResonanceMax = false;

  return s;
}

export function didLose(state: EntropyState): boolean {
  return state.timeMs <= 0 && state.phase === "playing";
}

export function didWin(state: EntropyState): boolean {
  return state.phase === "levelcomplete";
}
