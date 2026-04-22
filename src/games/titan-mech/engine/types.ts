export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface TitanControls {
  throttle: number;
  turn: number;
  fire: boolean;
  brace: boolean;
  extract: boolean;
}

export interface TitanPose {
  position: Vec3;
  heading: number;
  velocity: Vec3;
}

export interface TitanSystems {
  reactor: number;
  servos: number;
  targeting: number;
}

export type WeaponFeedbackState = "idle" | "firing" | "dry" | "overheated" | "cooling";
export type ExtractionFeedbackState = "idle" | "grinding" | "ejecting" | "blocked";

export interface TitanExtractionState {
  hopperLoad: number;
  hopperCapacity: number;
  credits: number;
  rareIsotopes: number;
  lastExtractionEventMs: number;
  feedback: ExtractionFeedbackState;
}

export interface TitanState {
  phase: "menu" | "playing" | "gameover" | "upgrade";
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  heat: number;
  maxHeat: number;
  coolantBurstMs: number;
  coolantCharge: number;
  scrap: number;
  score: number;
  lastWeaponEventMs: number;
  objective: string;
  objectiveProgress: number;
  controls: TitanControls;
  pose: TitanPose;
  systems: TitanSystems;
  weaponFeedback: WeaponFeedbackState;
  extraction: TitanExtractionState;
}

export type ArenaObstacleKind = "barricade" | "cover" | "gantry" | "pylon" | "reactor";

export interface ArenaObstacleData {
  id: string;
  kind: ArenaObstacleKind;
  position: [number, number, number];
  scale: [number, number, number];
  accent: string;
  threat: number;
}

export interface ArenaBeaconData {
  id: string;
  label: string;
  position: [number, number, number];
  radius: number;
  reward: number;
}

export interface ArenaLayout {
  obstacles: ArenaObstacleData[];
  beacons: ArenaBeaconData[];
}

export interface DriveForces {
  impulse: Vec3;
  torqueY: number;
  energyCost: number;
  heatGain: number;
}

export const CONFIG = {
  WORLD_SIZE: 120,
  PLAYER_MASS: 7.5,
  MOVE_SPEED: 44,
  REVERSE_MULTIPLIER: 0.46,
  TURN_SPEED: 6.6,
  ENERGY_REGEN_PER_SECOND: 16,
  THROTTLE_ENERGY_PER_SECOND: 11,
  TURN_ENERGY_PER_SECOND: 4,
  FIRE_ENERGY_PER_SECOND: 26,
  FIRE_HEAT_PER_SECOND: 34,
  EXTRACT_ENERGY_PER_SECOND: 18,
  EXTRACT_HEAT_PER_SECOND: 22,
  ORE_PER_SECOND: 28,
  ORE_CREDIT_VALUE: 6,
  HOPPER_CAPACITY: 100,
  COOLING_PER_SECOND: 24,
  OVERHEAT_THRESHOLD: 92,
};
