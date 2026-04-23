import type { ConstellationPattern, VoidZone } from "./constellations";

export interface StarSeed {
  id: string;
  x: number;
  y: number;
  energy: number;
  maxEnergy: number;
  growthStage: number;
  connections: string[];
  isPlanted: boolean;
}

export interface EnergyStream {
  id: string;
  fromId: string;
  toId: string;
  flowRate: number;
  active: boolean;
}

export interface PinballOrb {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  active: boolean;
  trail: Array<{ x: number; y: number; age: number }>;
}

export interface StarterGarden {
  completedPoints: Set<string>;
  starPointMatches: Map<string, string>;
  stars: StarSeed[];
}

export interface PinballStepOptions {
  delta: number;
  leftFlipper: boolean;
  rightFlipper: boolean;
}

export interface StarCollisionResult {
  hit: boolean;
  orb: PinballOrb;
}

export const COSMIC_ENERGY_CAPACITY = 500;
export const MAX_COSMIC_COLD = 100;
export const COMBO_WINDOW_MS = 2000;

const GRAVITY = 0.15;
const FRICTION = 0.995;
const BOUNCE_DAMPENING = 0.7;
const STAR_BOUNCE_FORCE = 1.2;
const FLIPPER_FORCE = 12;
const MAX_TRAIL_LENGTH = 15;

export function calculateGrowthStage(energy: number, maxEnergy: number): number {
  const percentage = energy / maxEnergy;
  if (percentage >= 0.9) return 3;
  if (percentage >= 0.6) return 2;
  if (percentage >= 0.3) return 1;
  return 0;
}

export function createStarId(index: number, x: number, y: number): string {
  return `star-${index}-${Math.round(x * 10)}-${Math.round(y * 10)}`;
}

export function createStarSeed({
  id,
  x,
  y,
  energy = 20,
  maxEnergy = 100,
}: {
  id: string;
  x: number;
  y: number;
  energy?: number;
  maxEnergy?: number;
}): StarSeed {
  return {
    connections: [],
    energy,
    growthStage: calculateGrowthStage(energy, maxEnergy),
    id,
    isPlanted: true,
    maxEnergy,
    x,
    y,
  };
}

export function createStarterGarden(pattern: ConstellationPattern, level: number): StarterGarden {
  const stars = pattern.points.map((point, index) =>
    createStarSeed({
      energy: Math.min(82, 34 + level * 4 + (index % 3) * 9),
      id: `nursery-${pattern.id}-${point.id}`,
      x: point.x,
      y: point.y,
    })
  );

  return {
    completedPoints: new Set(pattern.points.map((point) => point.id)),
    starPointMatches: new Map(stars.map((star, index) => [star.id, pattern.points[index].id])),
    stars,
  };
}

export function createEnergyStream(fromId: string, toId: string): EnergyStream {
  return {
    active: true,
    flowRate: 2,
    fromId,
    id: `${fromId}-${toId}`,
    toId,
  };
}

export function calculateComboMultiplier(
  lastHitTime: number,
  now: number,
  currentMultiplier: number
): number {
  if (lastHitTime > 0 && now - lastHitTime < COMBO_WINDOW_MS) {
    return Math.min(currentMultiplier + 0.5, 5);
  }

  return 1;
}

export function calculateStarHitScore(growthStage: number, multiplier: number): number {
  return Math.floor(100 * (growthStage + 1) * multiplier);
}

export function calculateResonanceBloomBonus(
  completedConnectionCount: number,
  multiplier: number
): number {
  const linkValue = Math.max(1, completedConnectionCount) * 250;
  return Math.floor(linkValue * Math.max(1, multiplier));
}

export function advanceEnergyNetwork(
  stars: Map<string, StarSeed>,
  streams: Map<string, EnergyStream>,
  deltaSeconds: number
): Map<string, StarSeed> {
  const next = new Map(stars);

  streams.forEach((stream) => {
    if (!stream.active) return;

    const fromStar = next.get(stream.fromId);
    const toStar = next.get(stream.toId);
    if (!fromStar || !toStar || fromStar.energy <= 10) return;

    const transferAmount = Math.min(stream.flowRate * deltaSeconds, fromStar.energy - 10);
    const received = Math.min(transferAmount, toStar.maxEnergy - toStar.energy);
    if (received <= 0) return;

    const fromEnergy = fromStar.energy - received;
    const toEnergy = toStar.energy + received;

    next.set(stream.fromId, {
      ...fromStar,
      energy: fromEnergy,
      growthStage: calculateGrowthStage(fromEnergy, fromStar.maxEnergy),
    });
    next.set(stream.toId, {
      ...toStar,
      energy: toEnergy,
      growthStage: calculateGrowthStage(toEnergy, toStar.maxEnergy),
    });
  });

  return next;
}

export function createDeterministicVoidZones(level: number): VoidZone[] {
  const count = Math.min(level, 4);

  return Array.from({ length: count }, (_, index) => ({
    drainRate: round(0.5 + level * 0.2, 2),
    radius: round(8 + normalizedHash(level, index, 41) * 6, 2),
    x: round(18 + normalizedHash(level, index, 67) * 64, 2),
    y: round(22 + normalizedHash(level + 3, index, 59) * 54, 2),
  }));
}

export function createPinballOrb(
  id: string,
  fromX: number,
  fromY: number,
  angle: number,
  power = 8
): PinballOrb {
  const radians = (angle * Math.PI) / 180;

  return {
    active: true,
    id,
    radius: 1.2,
    trail: [],
    vx: Math.cos(radians) * power,
    vy: Math.sin(radians) * power,
    x: fromX,
    y: fromY,
  };
}

export function advancePinballOrb(
  orb: PinballOrb,
  { delta, leftFlipper, rightFlipper }: PinballStepOptions
): { drained: boolean; orb: PinballOrb } {
  let vx = orb.vx * FRICTION;
  let vy = (orb.vy + GRAVITY * delta) * FRICTION;
  let x = orb.x + vx * delta;
  let y = orb.y + vy * delta;
  const trail = [...orb.trail, { age: 0, x, y }]
    .slice(-MAX_TRAIL_LENGTH)
    .map((point) => ({ ...point, age: point.age + 1 }));

  if (x < 3) {
    x = 3;
    vx = Math.abs(vx) * BOUNCE_DAMPENING;
  }
  if (x > 97) {
    x = 97;
    vx = -Math.abs(vx) * BOUNCE_DAMPENING;
  }
  if (y < 3) {
    y = 3;
    vy = Math.abs(vy) * BOUNCE_DAMPENING;
  }

  const flipperY = 88;
  const flipperWidth = 15;
  if (y > flipperY && y < 95) {
    if (leftFlipper && x > 25 - flipperWidth / 2 && x < 25 + flipperWidth / 2) {
      const hitPosition = (x - 25) / (flipperWidth / 2);
      vy = -FLIPPER_FORCE;
      vx = hitPosition * 5 + 3;
      y = flipperY - 1;
    }
    if (rightFlipper && x > 75 - flipperWidth / 2 && x < 75 + flipperWidth / 2) {
      const hitPosition = (x - 75) / (flipperWidth / 2);
      vy = -FLIPPER_FORCE;
      vx = hitPosition * 5 - 3;
      y = flipperY - 1;
    }
  }

  const drained = y > 100;

  return {
    drained,
    orb: {
      ...orb,
      active: !drained,
      trail,
      vx,
      vy,
      x,
      y,
    },
  };
}

export function resolveOrbStarCollision(
  orb: PinballOrb,
  star: Pick<StarSeed, "id" | "x" | "y" | "growthStage">
): StarCollisionResult {
  const dx = orb.x - star.x;
  const dy = orb.y - star.y;
  const distance = Math.hypot(dx, dy);
  const minDistance = orb.radius + 3 + star.growthStage * 0.5;

  if (distance >= minDistance || distance === 0) {
    return { hit: false, orb };
  }

  const nx = dx / distance;
  const ny = dy / distance;
  const relativeVelocity = orb.vx * nx + orb.vy * ny;
  if (relativeVelocity >= 0) {
    return { hit: false, orb };
  }

  return {
    hit: true,
    orb: {
      ...orb,
      vx: orb.vx - 2 * relativeVelocity * nx * STAR_BOUNCE_FORCE,
      vy: orb.vy - 2 * relativeVelocity * ny * STAR_BOUNCE_FORCE,
      x: star.x + nx * (minDistance + 0.5),
      y: star.y + ny * (minDistance + 0.5),
    },
  };
}

function normalizedHash(level: number, index: number, modulo: number): number {
  return ((level * 31 + index * 47 + 17) % modulo) / modulo;
}

function round(value: number, precision = 2): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}
