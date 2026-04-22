export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface TitanState {
  phase: "menu" | "playing" | "gameover" | "upgrade";
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  scrap: number;
  score: number;
}

export const CONFIG = {
  WORLD_SIZE: 120,
  PLAYER_MASS: 2.0,
  MOVE_SPEED: 25,
  TURN_SPEED: 4,
};
