import type {
  ProtocolArenaLayout,
  SNWControls,
  SNWEnemy,
  SNWEnemyKind,
  SNWState,
  Vec3,
} from "./types";
import { CONFIG } from "./types";

const DEFAULT_CONTROLS: SNWControls = {
  x: 0,
  z: 0,
  dash: false,
  fire: false,
};

const ENEMY_STATS: Record<SNWEnemyKind, { hp: number; speed: number; score: number }> = {
  runner: { hp: 1, speed: 5.4, score: 80 },
  drone: { hp: 2, speed: 3.8, score: 125 },
  brute: { hp: 4, speed: 2.45, score: 210 },
};

export function createInitialSNWState(phase: SNWState["phase"] = "menu"): SNWState {
  const enemies = phase === "playing" ? createWaveEnemies(1) : [];

  return {
    phase,
    score: 0,
    level: 1,
    xp: 0,
    xpNeeded: 5,
    hp: 100,
    maxHp: 100,
    wave: 1,
    waveTime: CONFIG.WAVE_SECONDS,
    kills: 0,
    threat: calculateThreatPressure(enemies, { x: 0, y: 0, z: 0 }),
    dashCooldownMs: 0,
    objective: "Hold the signal ring and erase hostile constructs before they breach.",
    controls: { ...DEFAULT_CONTROLS },
    player: { x: 0, y: 1, z: 0 },
    enemies,
  };
}

export function createProtocolArenaLayout(): ProtocolArenaLayout {
  return {
    radius: CONFIG.ARENA_RADIUS,
    rings: [8, 16, 24, CONFIG.ARENA_RADIUS],
    perimeter: Array.from({ length: 12 }, (_, index) => {
      const angle = (index / 12) * Math.PI * 2;
      return {
        id: `node-${index + 1}`,
        angle,
        position: [round(Math.cos(angle) * 30), -1.34, round(Math.sin(angle) * 30)],
        color: index % 3 === 0 ? "#f43f5e" : "#2dd4bf",
      };
    }),
    cover: Array.from({ length: 8 }, (_, index) => {
      const angle = (index / 8) * Math.PI * 2 + 0.18;
      const radius = index % 2 === 0 ? 12 : 21;
      return {
        id: `signal-baffle-${index + 1}`,
        position: [round(Math.cos(angle) * radius), -1.7, round(Math.sin(angle) * radius)],
        scale: index % 2 === 0 ? [5.8, 1.2, 1] : [1.2, 1.6, 5.2],
        rotationY: -angle,
        color: index % 2 === 0 ? "#0f766e" : "#334155",
      };
    }),
    terrain: createOuterTerrain(),
  };
}

export function createWaveEnemies(wave: number): SNWEnemy[] {
  const count = Math.min(14, 6 + wave * 2);

  return Array.from({ length: count }, (_, index) => {
    const kind = chooseEnemyKind(wave, index);
    const stats = ENEMY_STATS[kind];
    const lane = (index * 5 + wave * 2) % 12;
    const angle = (lane / 12) * Math.PI * 2 + wave * 0.045;
    const radius = CONFIG.ARENA_RADIUS - 7 + (index % 3) * 2.4;

    return {
      id: `w${wave}-${kind}-${index + 1}`,
      kind,
      lane,
      position: {
        x: round(Math.cos(angle) * radius),
        y: 1,
        z: round(Math.sin(angle) * radius),
      },
      hp: stats.hp,
      maxHp: stats.hp,
      speed: stats.speed + wave * 0.12,
      score: stats.score,
    };
  });
}

export function normalizeSNWControls(input: Partial<SNWControls> = {}): SNWControls {
  return {
    x: clamp(input.x ?? 0, -1, 1),
    z: clamp(input.z ?? 0, -1, 1),
    dash: input.dash ?? false,
    fire: input.fire ?? false,
  };
}

export function calculatePlayerVelocity(controls: SNWControls, dashReady: boolean): Vec3 {
  const length = Math.hypot(controls.x, controls.z) || 1;
  const speed = controls.dash && dashReady ? CONFIG.DASH_SPEED : CONFIG.PLAYER_SPEED;

  return {
    x: (controls.x / length) * speed,
    y: 0,
    z: (controls.z / length) * speed,
  };
}

export function advanceSNWState(
  state: SNWState,
  deltaMs: number,
  telemetry: Partial<{ player: Vec3; controls: Partial<SNWControls> }> = {}
): SNWState {
  if (state.phase !== "playing") {
    return state;
  }

  const deltaSeconds = Math.max(0, deltaMs) / 1000;
  const controls = normalizeSNWControls({ ...state.controls, ...telemetry.controls });
  const player = telemetry.player ?? state.player;
  const enemies = state.enemies
    .map((enemy) => advanceEnemy(enemy, player, deltaSeconds))
    .filter((enemy) => distance(enemy.position, player) > 1.8);
  const breaches = state.enemies.length - enemies.length;
  const nextHp = clamp(state.hp - breaches * 7, 0, state.maxHp);
  const nextWaveTime = Math.max(0, state.waveTime - deltaSeconds);
  const shouldSpawn = enemies.length === 0 || nextWaveTime === 0;
  const wave = shouldSpawn ? state.wave + 1 : state.wave;
  const nextEnemies = shouldSpawn ? [...enemies, ...createWaveEnemies(wave)] : enemies;
  const threat = calculateThreatPressure(nextEnemies, player);

  return {
    ...state,
    phase: nextHp <= 0 ? "gameover" : "playing",
    hp: nextHp,
    wave,
    waveTime: shouldSpawn ? CONFIG.WAVE_SECONDS + Math.min(wave * 3, 18) : nextWaveTime,
    dashCooldownMs: controls.dash
      ? CONFIG.DASH_COOLDOWN_MS
      : Math.max(0, state.dashCooldownMs - deltaMs),
    objective:
      threat > 72
        ? "Threat lanes converging. Dash through the gap and clear close constructs."
        : `Wave ${wave}: maintain perimeter lock and prevent a silent breach.`,
    controls: { ...controls, dash: false },
    player: { ...player },
    enemies: nextEnemies,
    threat,
  };
}

export function resolveEnemyHit(state: SNWState, enemyId: string, damage = 1): SNWState {
  if (state.phase !== "playing") {
    return state;
  }

  const target = state.enemies.find((enemy) => enemy.id === enemyId);
  if (!target) {
    return state;
  }

  const damaged = { ...target, hp: target.hp - damage };
  if (damaged.hp > 0) {
    return {
      ...state,
      enemies: state.enemies.map((enemy) => (enemy.id === enemyId ? damaged : enemy)),
    };
  }

  const xp = state.xp + 1;
  const leveled = xp >= state.xpNeeded;
  const enemies = state.enemies.filter((enemy) => enemy.id !== enemyId);

  return {
    ...state,
    score: state.score + target.score,
    kills: state.kills + 1,
    xp: leveled ? xp - state.xpNeeded : xp,
    xpNeeded: leveled ? state.xpNeeded + 3 : state.xpNeeded,
    level: leveled ? state.level + 1 : state.level,
    enemies,
    threat: calculateThreatPressure(enemies, state.player),
  };
}

export function calculateThreatPressure(enemies: SNWEnemy[], player: Vec3): number {
  const raw = enemies.reduce((total, enemy) => {
    const closeness =
      1 - clamp(distance(enemy.position, player) / (CONFIG.ARENA_RADIUS + 12), 0, 1);
    const weight = enemy.kind === "brute" ? 1.4 : enemy.kind === "drone" ? 1.15 : 1;
    return total + closeness * weight * 14;
  }, 0);

  return Math.round(clamp(raw, 0, 100));
}

function advanceEnemy(enemy: SNWEnemy, player: Vec3, deltaSeconds: number): SNWEnemy {
  const direction = normalize({
    x: player.x - enemy.position.x,
    y: 0,
    z: player.z - enemy.position.z,
  });

  return {
    ...enemy,
    position: {
      x: round(enemy.position.x + direction.x * enemy.speed * deltaSeconds),
      y: enemy.position.y,
      z: round(enemy.position.z + direction.z * enemy.speed * deltaSeconds),
    },
  };
}

function createOuterTerrain() {
  const blocks = [];
  let id = 0;

  for (const ring of [44, 54, 64]) {
    const count = ring === 44 ? 18 : ring === 54 ? 22 : 26;
    for (let index = 0; index < count; index++) {
      if ((index + ring) % 4 === 0) {
        continue;
      }

      const angle = (index / count) * Math.PI * 2;
      const height = 1.4 + ((index + ring) % 5) * 0.7;
      blocks.push({
        id: `void-rise-${++id}`,
        position: [
          round(Math.cos(angle) * ring),
          -3.1 + height * 0.5,
          round(Math.sin(angle) * ring),
        ] as [number, number, number],
        scale: [2.2 + (index % 3) * 0.8, height, 2.2 + ((index + 1) % 3) * 0.8] as [
          number,
          number,
          number,
        ],
        color: index % 3 === 0 ? "#0f172a" : "#111827",
      });
    }
  }

  return blocks;
}

function chooseEnemyKind(wave: number, index: number): SNWEnemyKind {
  if ((index + wave) % 7 === 0) {
    return "brute";
  }
  if ((index + wave) % 3 === 0) {
    return "drone";
  }
  return "runner";
}

function normalize(vector: Vec3): Vec3 {
  const length = Math.hypot(vector.x, vector.z);
  if (length === 0) {
    return { x: 0, y: 0, z: 0 };
  }

  return { x: vector.x / length, y: 0, z: vector.z / length };
}

function distance(a: Vec3, b: Vec3) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
