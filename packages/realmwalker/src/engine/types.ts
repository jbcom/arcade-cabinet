export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface RealmState {
  phase: "menu" | "playing" | "gameover";
  hp: number;
  maxHp: number;
  atk: number;
  zone: number;
  score: number;
  loot: string[];
}

export const CONFIG = {
  WORLD_SIZE: 100,
  PLAYER_MASS: 1.5,
  MOVE_SPEED: 12,
};
