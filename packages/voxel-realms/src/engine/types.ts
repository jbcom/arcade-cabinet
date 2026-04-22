export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface VoxelState {
  phase: "menu" | "playing" | "gameover";
  score: number;
  hp: number;
  maxHp: number;
  inventory: string[];
}

export const CONFIG = {
  CHUNK_SIZE: 16,
  WORLD_HEIGHT: 64,
  RENDER_DISTANCE: 2,
};
