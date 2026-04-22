export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface MovementInput {
  x: number;
  z: number;
}

export interface RealmZonePalette {
  background: string;
  fog: string;
  floor: string;
  path: string;
  accent: string;
  secondary: string;
}

export interface RealmPillar {
  id: string;
  angle: number;
  radius: number;
  height: number;
}

export interface RealmPathSlab {
  id: string;
  z: number;
  width: number;
}

export interface RealmSigil {
  id: string;
  angle: number;
  radius: number;
  y: number;
}

export interface RealmRelic {
  id: string;
  name: string;
  position: [number, number, number];
  rarity: "common" | "rare" | "mythic";
}

export interface RealmSentinel {
  id: string;
  position: [number, number, number];
  scale: [number, number, number];
  patrolRadius: number;
}

export interface RealmLayout {
  pillars: RealmPillar[];
  runicRings: number[];
  pathSlabs: RealmPathSlab[];
  floatingSigils: RealmSigil[];
  relics: RealmRelic[];
  sentinels: RealmSentinel[];
  portal: [number, number, number];
}

export interface RealmState {
  phase: "menu" | "playing" | "gameover";
  hp: number;
  maxHp: number;
  atk: number;
  zone: number;
  score: number;
  loot: string[];
  objective: string;
  player: Vec3;
  movement: MovementInput;
}

export const CONFIG = {
  WORLD_SIZE: 100,
  PLAYER_MASS: 1.5,
  MOVE_SPEED: 12,
  PORTAL_RADIUS: 5,
  RELIC_RADIUS: 2.8,
};
