export const GRID_SIZE = 64;
export const TICK_RATE_MS = 1000;

export interface Milestone {
  tier: number;
  name: string;
  popRequired: number;
  unlocks: string[];
}

export const MILESTONES: Milestone[] = [
  {
    tier: 1,
    name: "Camp",
    popRequired: 0,
    unlocks: ["ROAD", "RESIDENTIAL", "POWER", "WATER_PUMP", "PARK"],
  },
  { tier: 2, name: "Village", popRequired: 50, unlocks: ["COMMERCIAL"] },
  { tier: 3, name: "Town", popRequired: 200, unlocks: ["INDUSTRIAL"] },
  { tier: 4, name: "City", popRequired: 1000, unlocks: [] },
];

export interface BuildingDef {
  cost: number;
  color: string;
  type: string;
  name: string;
}

export const BUILDINGS: Record<string, BuildingDef> = {
  NONE: { cost: 0, color: "#000", type: "infra", name: "None" },
  ROAD: { cost: 10, color: "#475569", type: "infra", name: "Road" },
  RESIDENTIAL: { cost: 50, color: "#7dd3a8", type: "zone", name: "Residential" },
  COMMERCIAL: { cost: 100, color: "#60a5fa", type: "zone", name: "Commercial" },
  INDUSTRIAL: { cost: 150, color: "#d8913d", type: "zone", name: "Industrial" },
  POWER: { cost: 500, color: "#c7534b", type: "util", name: "Power Plant" },
  WATER_PUMP: { cost: 300, color: "#69b7d8", type: "util", name: "Water Pump" },
  PARK: { cost: 200, color: "#4d8a43", type: "serv", name: "Park" },
};

export const PALETTE: Record<string, string> = {
  GRASS: "#6ea35f",
  WATER: "#347ca3",
  SAND: "#d7bd73",
  FOREST: "#2e5a3d",
};

export type TerrainType = "GRASS" | "WATER" | "SAND" | "FOREST";
export type WarningType = "NONE" | "NO_ROAD" | "NO_POWER" | "NO_WATER";

export interface GridTile {
  id: number;
  x: number;
  z: number;
  terrain: TerrainType;
  building: string;
  level: number;
  powered: boolean;
  watered: boolean;
  roadAccess: boolean;
  happiness: number;
  warning: WarningType;
}

export interface GridizenState {
  grid: GridTile[];
  time: number;
  funds: number;
  population: number;
  jobs: number;
  happiness: number;
  powerUse: number;
  powerMax: number;
  waterUse: number;
  waterMax: number;
  milestone: number;
  selectedTool: string;
  inspectedTileIdx: number | null;
  heatmap: boolean;
}

const noiseP = new Uint8Array(512);

function noiseInit(seed: number): void {
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const r = Math.floor((seed * (i + 1) * 1234.5678) % (i + 1));
    const tmp = p[i];
    p[i] = p[r] ?? 0;
    p[r] = tmp;
  }
  for (let i = 0; i < 512; i++) noiseP[i] = p[i & 255] ?? 0;
}

function noiseFade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function noiseLerp(t: number, a: number, b: number): number {
  return a + t * (b - a);
}

function noiseGrad(hash: number, x: number, y: number): number {
  const h = hash & 15;
  const u = h < 8 ? x : y;
  const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

function noiseGet(x: number, y: number): number {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);
  const u = noiseFade(xf);
  const v = noiseFade(yf);
  const A = (noiseP[X] ?? 0) + Y;
  const B = (noiseP[X + 1] ?? 0) + Y;
  return noiseLerp(
    v,
    noiseLerp(u, noiseGrad(noiseP[A] ?? 0, xf, yf), noiseGrad(noiseP[B] ?? 0, xf - 1, yf)),
    noiseLerp(
      u,
      noiseGrad(noiseP[A + 1] ?? 0, xf, yf - 1),
      noiseGrad(noiseP[B + 1] ?? 0, xf - 1, yf - 1)
    )
  );
}

export function generateMap(seed = 73421): GridTile[] {
  noiseInit(seed);
  const grid: GridTile[] = [];
  for (let z = 0; z < GRID_SIZE; z++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const height = noiseGet(x * 0.05, z * 0.05);
      const moisture = noiseGet(x * 0.1 + 100, z * 0.1 + 100);
      let terrain: TerrainType = "GRASS";
      if (height < -0.2) terrain = "WATER";
      else if (height < -0.1) terrain = "SAND";
      else if (moisture > 0.3) terrain = "FOREST";
      grid.push({
        id: z * GRID_SIZE + x,
        x,
        z,
        terrain,
        building: "NONE",
        level: 0,
        powered: false,
        watered: false,
        roadAccess: false,
        happiness: 100,
        warning: "NONE",
      });
    }
  }
  return grid;
}
