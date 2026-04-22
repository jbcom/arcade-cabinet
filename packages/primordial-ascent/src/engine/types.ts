export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface PrimordialState {
  phase: "menu" | "playing" | "gameover";
  altitude: number;
  maxAltitude: number;
  timeSurvived: number; // in milliseconds
  velocity: number;
  distToLava: number;
  isInGrappleRange: boolean;
}

export const CONFIG = {
  // World Gen
  chunkSize: 16,
  voxelSize: 4.5,
  isoLevel: 0.15,
  noiseScale: 0.04,
  renderDistanceY: 3,
  renderDistanceXZ: 2,

  // Physics
  gravity: -22,
  playerMass: 1.2,
  tetherStrength: 90,
  tetherDamping: 6,
  tetherRestLength: 1,
  maxTetherDist: 120,
  airControl: 20,
  jumpForce: 25,

  // Pacing
  lavaStartHeight: -40,
  lavaBaseSpeed: 6.0,
  lavaAccel: 0.08,
};
