import { fbm, noise2D } from "../lib/perlin";

export type CreatureType = "jellyfish" | "plankton" | "fish";

export interface ViewportDimensions {
  width: number;
  height: number;
}

export interface DiveInput {
  x: number;
  y: number;
  isActive: boolean;
}

export interface Creature {
  id: string;
  type: CreatureType;
  x: number;
  y: number;
  size: number;
  color: string;
  glowColor: string;
  glowIntensity: number;
  noiseOffsetX: number;
  noiseOffsetY: number;
  speed: number;
  pulsePhase: number;
}

export interface Predator {
  id: string;
  x: number;
  y: number;
  size: number;
  speed: number;
  noiseOffset: number;
  angle: number;
}

export interface Pirate {
  id: string;
  x: number;
  y: number;
  angle: number;
  speed: number;
  noiseOffset: number;
  lanternPhase: number;
}

export interface Particle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  drift: number;
  seed: number;
}

export interface Player {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  angle: number;
  glowIntensity: number;
}

export interface SceneState {
  creatures: Creature[];
  particles: Particle[];
  pirates: Pirate[];
  player: Player;
  predators: Predator[];
}

export interface CreatureCollectionResult {
  collected: Creature[];
  creatures: Creature[];
  lastCollectTime: number;
  multiplier: number;
  scoreDelta: number;
}

export interface DiveTelemetry {
  beaconBearingRadians: number | null;
  collectionRatio: number;
  depthMeters: number;
  nearestBeaconDistance: number;
  nearestThreatDistance: number;
  objective: string;
  oxygenRatio: number;
  pressureLabel: string;
}

export interface SceneAdvanceResult {
  collection: CreatureCollectionResult;
  collidedWithPredator: boolean;
  scene: SceneState;
  telemetry: DiveTelemetry;
}

export const GAME_DURATION = 60;
export const MAX_CHAIN_MULTIPLIER = 5;
export const STREAK_WINDOW_SECONDS = 2;
export const CREATURE_TYPES: CreatureType[] = ["jellyfish", "plankton", "fish"];
export const CREATURE_COLORS: Record<CreatureType, { color: string; glow: string }> = {
  fish: { color: "#c4b5fd", glow: "#8b5cf6" },
  jellyfish: { color: "#7dd3fc", glow: "#0ea5e9" },
  plankton: { color: "#a5f3fc", glow: "#22d3ee" },
};
export const CREATURE_POINTS: Record<CreatureType, number> = {
  fish: 50,
  jellyfish: 30,
  plankton: 10,
};

interface CreatureAnchor {
  type: CreatureType;
  x: number;
  y: number;
  size: number;
}

const CREATURE_ANCHORS: CreatureAnchor[] = [
  { type: "plankton", x: 0.16, y: 0.2, size: 0.038 },
  { type: "jellyfish", x: 0.35, y: 0.18, size: 0.061 },
  { type: "fish", x: 0.7, y: 0.22, size: 0.051 },
  { type: "plankton", x: 0.85, y: 0.34, size: 0.035 },
  { type: "fish", x: 0.58, y: 0.36, size: 0.049 },
  { type: "jellyfish", x: 0.23, y: 0.42, size: 0.058 },
  { type: "plankton", x: 0.45, y: 0.5, size: 0.034 },
  { type: "fish", x: 0.78, y: 0.55, size: 0.047 },
  { type: "jellyfish", x: 0.12, y: 0.64, size: 0.062 },
  { type: "plankton", x: 0.32, y: 0.72, size: 0.036 },
  { type: "fish", x: 0.54, y: 0.7, size: 0.052 },
  { type: "jellyfish", x: 0.88, y: 0.76, size: 0.06 },
  { type: "plankton", x: 0.67, y: 0.84, size: 0.034 },
  { type: "fish", x: 0.18, y: 0.86, size: 0.049 },
  { type: "jellyfish", x: 0.47, y: 0.27, size: 0.056 },
  { type: "plankton", x: 0.74, y: 0.44, size: 0.033 },
  { type: "fish", x: 0.28, y: 0.57, size: 0.05 },
  { type: "jellyfish", x: 0.62, y: 0.62, size: 0.057 },
];

const PARTICLE_COUNT = 130;
export const TOTAL_BEACONS = CREATURE_ANCHORS.length;

export function createInitialScene(dimensions: ViewportDimensions): SceneState {
  return {
    creatures: createInitialCreatures(dimensions),
    particles: createInitialParticles(dimensions),
    pirates: createInitialPirates(dimensions),
    player: createInitialPlayer(dimensions),
    predators: createInitialPredators(dimensions),
  };
}

export function createInitialPlayer({ width, height }: ViewportDimensions): Player {
  const x = width * 0.5;
  const y = height * 0.54;

  return {
    angle: -Math.PI / 18,
    glowIntensity: 1,
    targetX: x,
    targetY: y,
    x,
    y,
  };
}

export function createInitialCreatures({ width, height }: ViewportDimensions): Creature[] {
  const minDimension = Math.min(width, height);

  return CREATURE_ANCHORS.map((anchor, index) => {
    const colors = CREATURE_COLORS[anchor.type];
    const laneOffset = ((index % 3) - 1) * Math.min(18, minDimension * 0.025);

    return {
      color: colors.color,
      glowColor: colors.glow,
      glowIntensity: round(0.68 + (index % 5) * 0.055),
      id: `beacon-${index + 1}`,
      noiseOffsetX: 120 + index * 19,
      noiseOffsetY: 430 + index * 23,
      pulsePhase: (index * Math.PI) / 5,
      size: round(clamp(minDimension * anchor.size, 14, 36), 2),
      speed: round(0.2 + (index % 4) * 0.075, 3),
      type: anchor.type,
      x: round(clamp(width * anchor.x + laneOffset, 20, width - 20), 2),
      y: round(clamp(height * anchor.y - laneOffset * 0.35, 24, height - 24), 2),
    };
  });
}

export function createInitialPredators({ width, height }: ViewportDimensions): Predator[] {
  const minDimension = Math.min(width, height);
  const baseSize = clamp(minDimension * 0.14, 54, 94);

  return [
    {
      angle: -0.18,
      id: "angler-left",
      noiseOffset: 200,
      size: round(baseSize, 2),
      speed: 0.55,
      x: round(width * 0.14, 2),
      y: round(height * 0.74, 2),
    },
    {
      angle: Math.PI - 0.22,
      id: "eel-right",
      noiseOffset: 640,
      size: round(baseSize * 0.92, 2),
      speed: 0.64,
      x: round(width * 0.86, 2),
      y: round(height * 0.31, 2),
    },
  ];
}

export function createInitialPirates({ width, height }: ViewportDimensions): Pirate[] {
  return [
    {
      angle: 0.08,
      id: "lantern-skiff-port",
      lanternPhase: 0.4,
      noiseOffset: 120,
      speed: 0.76,
      x: round(width * 0.08, 2),
      y: round(height * 0.28, 2),
    },
    {
      angle: Math.PI - 0.12,
      id: "lantern-skiff-starboard",
      lanternPhase: 2.2,
      noiseOffset: 520,
      speed: 0.82,
      x: round(width * 0.92, 2),
      y: round(height * 0.68, 2),
    },
  ];
}

export function createInitialParticles({ width, height }: ViewportDimensions): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, index) => {
    const horizontal = normalizedHash(index, 37, 127);
    const vertical = normalizedHash(index, 53, 131);

    return {
      drift: round(index * 0.71, 3),
      opacity: round(0.08 + normalizedHash(index, 17, 97) * 0.22, 3),
      seed: index + 1,
      size: round(0.8 + normalizedHash(index, 29, 89) * 2.6, 2),
      speed: round(0.18 + normalizedHash(index, 31, 83) * 0.52, 3),
      x: round(horizontal * width, 2),
      y: round(vertical * height, 2),
    };
  });
}

export function advanceScene(
  scene: SceneState,
  input: DiveInput,
  dimensions: ViewportDimensions,
  totalTime: number,
  deltaTime: number,
  lastCollectTime: number,
  multiplier: number,
  timeLeft = GAME_DURATION
): SceneAdvanceResult {
  const player = advancePlayer(scene.player, input, dimensions, totalTime, deltaTime);
  const creatures = scene.creatures.map((creature) =>
    advanceCreature(creature, dimensions, totalTime, deltaTime)
  );
  const predators = scene.predators.map((predator) =>
    advancePredator(predator, player, dimensions, totalTime, deltaTime)
  );
  const pirates = scene.pirates.map((pirate) =>
    advancePirate(pirate, player, dimensions, totalTime, deltaTime)
  );
  const particles = scene.particles.map((particle) =>
    advanceParticle(particle, dimensions, totalTime, deltaTime)
  );
  const collection = collectCreatures(creatures, player, totalTime, lastCollectTime, multiplier);
  const nextScene = {
    creatures: collection.creatures,
    particles,
    pirates,
    player,
    predators,
  };

  return {
    collection,
    collidedWithPredator: hasPredatorCollision(player, predators),
    scene: nextScene,
    telemetry: getDiveTelemetry(nextScene, timeLeft),
  };
}

export function advancePlayer(
  player: Player,
  input: DiveInput,
  { width, height }: ViewportDimensions,
  totalTime: number,
  deltaTime: number
): Player {
  const targetX = input.isActive ? clamp(input.x, 0, width) : player.targetX;
  const targetY = input.isActive ? clamp(input.y, 0, height) : player.targetY;
  const dx = targetX - player.x;
  const dy = targetY - player.y;
  const distance = Math.hypot(dx, dy);
  const frameScale = getFrameScale(deltaTime);

  if (distance <= 1) {
    return {
      ...player,
      glowIntensity: round(0.72 + Math.sin(totalTime * 3) * 0.26, 3),
      targetX,
      targetY,
    };
  }

  const speed = Math.min(distance * 0.08, 8) * frameScale;

  return {
    angle: Math.atan2(dy, dx),
    glowIntensity: round(0.72 + Math.sin(totalTime * 3) * 0.26, 3),
    targetX,
    targetY,
    x: clamp(player.x + (dx / distance) * speed, 0, width),
    y: clamp(player.y + (dy / distance) * speed, 0, height),
  };
}

export function advanceCreature(
  creature: Creature,
  { width, height }: ViewportDimensions,
  totalTime: number,
  deltaTime: number
): Creature {
  const frameScale = getFrameScale(deltaTime);
  const noiseX = noise2D(creature.noiseOffsetX + totalTime * creature.speed, creature.noiseOffsetY);
  const noiseY = noise2D(creature.noiseOffsetX, creature.noiseOffsetY + totalTime * creature.speed);
  const pulsePhase = creature.pulsePhase + deltaTime * 2;

  return {
    ...creature,
    glowIntensity: round(0.62 + Math.sin(pulsePhase) * 0.28, 3),
    pulsePhase,
    x: wrapCoordinate(creature.x + noiseX * 2 * frameScale, width, creature.size),
    y: wrapCoordinate(creature.y + noiseY * 2 * frameScale, height, creature.size),
  };
}

export function advancePredator(
  predator: Predator,
  player: Player,
  { width, height }: ViewportDimensions,
  totalTime: number,
  deltaTime: number
): Predator {
  const dx = player.x - predator.x;
  const dy = player.y - predator.y;
  const distance = Math.hypot(dx, dy);
  const frameScale = getFrameScale(deltaTime);

  if (distance === 0) {
    return predator;
  }

  const noiseAngle = fbm(predator.noiseOffset + totalTime * 0.3, totalTime * 0.2);
  const closingBoost = distance < 150 ? 1.52 : 0.88;
  const speed = predator.speed * closingBoost * frameScale;
  const drift = distance < 150 ? 0 : 0.5 * frameScale;

  return {
    ...predator,
    angle: Math.atan2(dy, dx),
    x: clamp(
      predator.x + (dx / distance) * speed + Math.cos(noiseAngle * Math.PI * 2) * drift,
      0,
      width
    ),
    y: clamp(
      predator.y + (dy / distance) * speed + Math.sin(noiseAngle * Math.PI * 2) * drift,
      0,
      height
    ),
  };
}

export function advancePirate(
  pirate: Pirate,
  player: Player,
  { width, height }: ViewportDimensions,
  totalTime: number,
  deltaTime: number
): Pirate {
  const dx = player.x - pirate.x;
  const dy = player.y - pirate.y;
  const distance = Math.hypot(dx, dy);
  const frameScale = getFrameScale(deltaTime);
  const noiseY = noise2D(pirate.noiseOffset, totalTime * 0.5) * 2 * frameScale;
  let angle = pirate.angle;
  let x = pirate.x;
  let y = pirate.y;

  if (distance < 300 && distance > 0) {
    const targetAngle = Math.atan2(dy, dx);
    angle = interpolateAngle(pirate.angle, targetAngle, 0.05 * frameScale);
    x += Math.cos(angle) * pirate.speed * 1.2 * frameScale;
    y += Math.sin(angle) * pirate.speed * 1.2 * frameScale + noiseY * 0.5;
  } else {
    x += Math.cos(angle) * pirate.speed * 0.5 * frameScale;
    y += noiseY;
  }

  if (x < -100) {
    x = -100;
    angle = 0;
  }

  if (x > width + 100) {
    x = width + 100;
    angle = Math.PI;
  }

  return {
    ...pirate,
    angle,
    lanternPhase: pirate.lanternPhase + deltaTime * 5,
    x,
    y: clamp(y, 50, Math.max(50, height - 50)),
  };
}

export function advanceParticle(
  particle: Particle,
  { width, height }: ViewportDimensions,
  totalTime: number,
  deltaTime: number
): Particle {
  const frameScale = getFrameScale(deltaTime);
  let y = particle.y - particle.speed * frameScale;
  let x = particle.x + Math.sin(particle.drift + totalTime) * 0.3 * frameScale;

  if (y < -particle.size) {
    y = height + particle.size;
    x = getDeterministicWrapX(particle.seed, totalTime, width);
  }

  return {
    ...particle,
    opacity: round(0.1 + Math.sin(totalTime * 2 + particle.drift) * 0.1, 3),
    x,
    y,
  };
}

export function collectCreatures(
  creatures: Creature[],
  player: Player,
  totalTime: number,
  lastCollectTime: number,
  currentMultiplier: number
): CreatureCollectionResult {
  const collected: Creature[] = [];
  const remaining: Creature[] = [];
  let multiplier = currentMultiplier;
  let scoreDelta = 0;
  let nextLastCollectTime = lastCollectTime;

  for (const creature of creatures) {
    const distance = Math.hypot(creature.x - player.x, creature.y - player.y);

    if (distance < creature.size * 0.56 + 30) {
      multiplier = calculateMultiplier(nextLastCollectTime, totalTime, multiplier);
      scoreDelta += CREATURE_POINTS[creature.type] * multiplier;
      nextLastCollectTime = totalTime;
      collected.push(creature);
    } else {
      remaining.push(creature);
    }
  }

  return {
    collected,
    creatures: remaining,
    lastCollectTime: nextLastCollectTime,
    multiplier,
    scoreDelta,
  };
}

export function calculateMultiplier(
  lastCollectTime: number,
  totalTime: number,
  currentMultiplier: number
): number {
  const hasPreviousCollection = lastCollectTime > 0;
  const stillInChain =
    hasPreviousCollection && totalTime - lastCollectTime <= STREAK_WINDOW_SECONDS;

  if (!stillInChain) return 1;

  return Math.min(currentMultiplier + 1, MAX_CHAIN_MULTIPLIER);
}

export function hasPredatorCollision(player: Player, predators: Predator[]): boolean {
  return predators.some((predator) => {
    const distance = Math.hypot(predator.x - player.x, predator.y - player.y);
    return distance < predator.size * 0.4 + 25;
  });
}

export function findNearestThreatDistance(
  player: Player,
  predators: Predator[],
  pirates: Pirate[] = []
): number {
  const predatorDistances = predators.map(
    (predator) => Math.hypot(predator.x - player.x, predator.y - player.y) - predator.size * 0.4
  );
  const pirateDistances = pirates.map(
    (pirate) => Math.hypot(pirate.x - player.x, pirate.y - player.y) - 34
  );
  const nearest = Math.min(...predatorDistances, ...pirateDistances);

  return Number.isFinite(nearest) ? Math.max(0, round(nearest, 2)) : Number.POSITIVE_INFINITY;
}

export function findNearestBeaconVector(
  player: Player,
  creatures: Creature[]
): { bearingRadians: number | null; distance: number } {
  if (creatures.length === 0) {
    return { bearingRadians: null, distance: 0 };
  }

  const nearest = creatures.reduce(
    (best, creature) => {
      const dx = creature.x - player.x;
      const dy = creature.y - player.y;
      const distance = Math.hypot(dx, dy);
      return distance < best.distance ? { bearingRadians: Math.atan2(dy, dx), distance } : best;
    },
    { bearingRadians: null as number | null, distance: Number.POSITIVE_INFINITY }
  );

  return {
    bearingRadians: nearest.bearingRadians,
    distance: Number.isFinite(nearest.distance) ? round(nearest.distance, 2) : 0,
  };
}

export function getDiveTelemetry(scene: SceneState, timeLeft: number): DiveTelemetry {
  const nearestThreatDistance = findNearestThreatDistance(
    scene.player,
    scene.predators,
    scene.pirates
  );
  const nearestBeacon = findNearestBeaconVector(scene.player, scene.creatures);
  const collectionRatio = clamp((TOTAL_BEACONS - scene.creatures.length) / TOTAL_BEACONS, 0, 1);
  const oxygenRatio = clamp(timeLeft / GAME_DURATION, 0, 1);

  return {
    beaconBearingRadians: nearestBeacon.bearingRadians,
    collectionRatio,
    depthMeters: Math.round(2200 + collectionRatio * 850 + (1 - oxygenRatio) * 350),
    nearestBeaconDistance: nearestBeacon.distance,
    nearestThreatDistance,
    objective: describeDiveObjective(
      scene.creatures.length,
      timeLeft,
      nearestThreatDistance,
      nearestBeacon.distance
    ),
    oxygenRatio,
    pressureLabel: getPressureLabel(oxygenRatio, nearestThreatDistance),
  };
}

export function describeDiveObjective(
  remainingCreatures: number,
  timeLeft: number,
  nearestThreatDistance: number,
  nearestBeaconDistance = Number.POSITIVE_INFINITY
): string {
  if (remainingCreatures === 0) return "All beacons charted. Surface with the living map.";
  if (nearestThreatDistance < 120) return "Predator silhouette closing. Glide out of its cone.";
  if (nearestBeaconDistance < 95) return "Sonar ping is tight. Sweep the lamp through this bloom.";
  if (timeLeft <= 15) return "Oxygen low. Chain the brightest beacons before ascent.";

  return "Collect luminous life while reading silhouettes at the edge of the light.";
}

export function getPressureLabel(oxygenRatio: number, nearestThreatDistance: number): string {
  if (nearestThreatDistance < 85) return "Critical";
  if (oxygenRatio < 0.25) return "Ascent";
  if (nearestThreatDistance < 160) return "Hunted";

  return "Calm";
}

export function getDeterministicWrapX(seed: number, totalTime: number, width: number): number {
  const timeBucket = Math.floor(totalTime * 10);
  const value = ((seed * 37 + timeBucket * 53) % 997) / 997;

  return round(value * width, 3);
}

function wrapCoordinate(value: number, max: number, padding: number): number {
  if (value < -padding) return max + padding;
  if (value > max + padding) return -padding;

  return value;
}

function interpolateAngle(current: number, target: number, amount: number): number {
  const delta = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + delta * clamp(amount, 0, 1);
}

function normalizedHash(index: number, step: number, modulo: number): number {
  return ((index * step + step * 0.5) % modulo) / modulo;
}

function getFrameScale(deltaTime: number): number {
  return clamp(deltaTime * 60, 0, 3);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, precision = 2): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}
