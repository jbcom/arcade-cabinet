export interface Vec2 {
  x: number;
  y: number;
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
}

export const CONFIG = {
  WORLD_SIZE: 120,
  ARENA_RADIUS: 40,
  DASH_COOLDOWN: 1.5,
  DASH_DURATION: 0.2,
  MAGNET_RADIUS: 15,
};
