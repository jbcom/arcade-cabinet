export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface PrimordialControls {
  forward: boolean;
  back: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  grapple: boolean;
}

export interface PrimordialTelemetry {
  position: Vec3;
  velocity: Vec3;
  lavaHeight: number;
  grappleDistance?: number | null;
}

export interface PrimordialState {
  phase: "menu" | "playing" | "gameover";
  altitude: number;
  maxAltitude: number;
  timeSurvived: number; // in milliseconds
  velocity: number;
  distToLava: number;
  isInGrappleRange: boolean;
  lavaHeight: number;
  objective: string;
  objectiveProgress: number;
}

export interface CavernAnchor {
  id: string;
  position: [number, number, number];
  radius: number;
  ringRadius: number;
  accent: string;
}

export interface CavernPlatform {
  id: string;
  position: [number, number, number];
  scale: [number, number, number];
  accent: string;
}

export interface CavernRib {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  accent: string;
}

export interface CavernLayout {
  anchors: CavernAnchor[];
  platforms: CavernPlatform[];
  ribs: CavernRib[];
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
  playerStartPosition: { x: 0, y: 10, z: 0 },

  // Pacing
  lavaStartHeight: -40,
  lavaBaseSpeed: 6.0,
  lavaAccel: 0.08,
  lavaSpeedScale: 0.1,
  lavaContactMargin: 0.6,
  escapeAltitude: 180,
  dangerDistance: 60,
};
