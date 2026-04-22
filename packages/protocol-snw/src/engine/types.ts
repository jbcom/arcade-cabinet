export interface Vec2 {
  x: number;
  y: number;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface SNWControls {
  x: number;
  z: number;
  dash: boolean;
  fire: boolean;
}

export type SNWEnemyKind = "runner" | "brute" | "drone";

export interface SNWEnemy {
  id: string;
  kind: SNWEnemyKind;
  lane: number;
  position: Vec3;
  hp: number;
  maxHp: number;
  speed: number;
  score: number;
}

export interface PerimeterNode {
  id: string;
  angle: number;
  position: [number, number, number];
  color: string;
}

export interface CoverNode {
  id: string;
  position: [number, number, number];
  scale: [number, number, number];
  rotationY: number;
  color: string;
}

export interface TerrainNode {
  id: string;
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
}

export interface ProtocolArenaLayout {
  radius: number;
  rings: number[];
  perimeter: PerimeterNode[];
  cover: CoverNode[];
  terrain: TerrainNode[];
}

export interface SNWState {
  phase: "menu" | "playing" | "win" | "gameover" | "upgrade";
  score: number;
  level: number;
  xp: number;
  xpNeeded: number;
  hp: number;
  maxHp: number;
  wave: number;
  waveTime: number;
  kills: number;
  threat: number;
  dashCooldownMs: number;
  objective: string;
  controls: SNWControls;
  player: Vec3;
  enemies: SNWEnemy[];
}

export const CONFIG = {
  WORLD_SIZE: 120,
  ARENA_RADIUS: 34,
  DASH_COOLDOWN_MS: 1500,
  DASH_DURATION_MS: 200,
  PLAYER_SPEED: 13,
  DASH_SPEED: 28,
  MAGNET_RADIUS: 15,
  WAVE_SECONDS: 46,
};
