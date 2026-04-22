import { createDeterministicVoidZones } from "./cosmicGardenSimulation";

export interface ConstellationPoint {
  x: number;
  y: number;
  id: string;
}

export interface ConstellationConnection {
  from: string;
  to: string;
}

export interface ConstellationPattern {
  id: string;
  name: string;
  points: ConstellationPoint[];
  connections: ConstellationConnection[];
  requiredEnergy: number;
  difficulty: number;
}

export const CONSTELLATIONS: ConstellationPattern[] = [
  {
    id: "lyra",
    name: "Lyra",
    points: [
      { x: 50, y: 30, id: "l1" },
      { x: 40, y: 45, id: "l2" },
      { x: 60, y: 45, id: "l3" },
      { x: 35, y: 60, id: "l4" },
      { x: 65, y: 60, id: "l5" },
    ],
    connections: [
      { from: "l1", to: "l2" },
      { from: "l1", to: "l3" },
      { from: "l2", to: "l4" },
      { from: "l3", to: "l5" },
      { from: "l2", to: "l3" },
    ],
    requiredEnergy: 100,
    difficulty: 1,
  },
  {
    id: "corona",
    name: "Corona",
    points: [
      { x: 50, y: 25, id: "c1" },
      { x: 35, y: 35, id: "c2" },
      { x: 30, y: 55, id: "c3" },
      { x: 50, y: 70, id: "c4" },
      { x: 70, y: 55, id: "c5" },
      { x: 65, y: 35, id: "c6" },
    ],
    connections: [
      { from: "c1", to: "c2" },
      { from: "c2", to: "c3" },
      { from: "c3", to: "c4" },
      { from: "c4", to: "c5" },
      { from: "c5", to: "c6" },
      { from: "c6", to: "c1" },
    ],
    requiredEnergy: 150,
    difficulty: 2,
  },
  {
    id: "aquila",
    name: "Aquila",
    points: [
      { x: 50, y: 20, id: "a1" },
      { x: 40, y: 40, id: "a2" },
      { x: 60, y: 40, id: "a3" },
      { x: 50, y: 55, id: "a4" },
      { x: 30, y: 70, id: "a5" },
      { x: 70, y: 70, id: "a6" },
      { x: 50, y: 80, id: "a7" },
    ],
    connections: [
      { from: "a1", to: "a2" },
      { from: "a1", to: "a3" },
      { from: "a2", to: "a4" },
      { from: "a3", to: "a4" },
      { from: "a4", to: "a5" },
      { from: "a4", to: "a6" },
      { from: "a4", to: "a7" },
    ],
    requiredEnergy: 200,
    difficulty: 3,
  },
  {
    id: "cygnus",
    name: "Cygnus",
    points: [
      { x: 50, y: 15, id: "cy1" },
      { x: 50, y: 35, id: "cy2" },
      { x: 30, y: 45, id: "cy3" },
      { x: 70, y: 45, id: "cy4" },
      { x: 50, y: 55, id: "cy5" },
      { x: 50, y: 75, id: "cy6" },
      { x: 35, y: 85, id: "cy7" },
      { x: 65, y: 85, id: "cy8" },
    ],
    connections: [
      { from: "cy1", to: "cy2" },
      { from: "cy2", to: "cy3" },
      { from: "cy2", to: "cy4" },
      { from: "cy2", to: "cy5" },
      { from: "cy5", to: "cy6" },
      { from: "cy6", to: "cy7" },
      { from: "cy6", to: "cy8" },
    ],
    requiredEnergy: 250,
    difficulty: 4,
  },
  {
    id: "serpens",
    name: "Serpens",
    points: [
      { x: 25, y: 25, id: "s1" },
      { x: 35, y: 35, id: "s2" },
      { x: 45, y: 30, id: "s3" },
      { x: 55, y: 40, id: "s4" },
      { x: 50, y: 55, id: "s5" },
      { x: 60, y: 65, id: "s6" },
      { x: 70, y: 60, id: "s7" },
      { x: 75, y: 75, id: "s8" },
      { x: 65, y: 85, id: "s9" },
    ],
    connections: [
      { from: "s1", to: "s2" },
      { from: "s2", to: "s3" },
      { from: "s3", to: "s4" },
      { from: "s4", to: "s5" },
      { from: "s5", to: "s6" },
      { from: "s6", to: "s7" },
      { from: "s7", to: "s8" },
      { from: "s8", to: "s9" },
    ],
    requiredEnergy: 300,
    difficulty: 5,
  },
];

export interface VoidZone {
  x: number;
  y: number;
  radius: number;
  drainRate: number;
}

export function generateVoidZones(level: number): VoidZone[] {
  return createDeterministicVoidZones(level);
}

export function getConstellationForLevel(level: number): ConstellationPattern {
  const index = Math.min(level - 1, CONSTELLATIONS.length - 1);
  return CONSTELLATIONS[index];
}
