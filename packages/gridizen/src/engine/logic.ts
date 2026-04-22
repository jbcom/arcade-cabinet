import {
  BUILDINGS,
  GRID_SIZE,
  type GridizenState,
  type GridTile,
  generateMap,
  MILESTONES,
  type WarningType,
} from "./types";

export const GRIDIZEN_MAP_SEED = 73421;
export const CIVIC_CENTER = {
  x: Math.floor(GRID_SIZE / 2),
  z: Math.floor(GRID_SIZE / 2),
} as const;

interface StarterLot {
  dx: number;
  dz: number;
  building: string;
  level: number;
  terrain?: GridTile["terrain"];
}

const STARTER_LOTS: StarterLot[] = [
  { dx: -4, dz: -4, building: "RESIDENTIAL", level: 1 },
  { dx: -4, dz: -3, building: "RESIDENTIAL", level: 1 },
  { dx: 4, dz: -4, building: "RESIDENTIAL", level: 1 },
  { dx: 4, dz: -3, building: "RESIDENTIAL", level: 1 },
  { dx: -2, dz: -4, building: "RESIDENTIAL", level: 1 },
  { dx: 2, dz: -4, building: "RESIDENTIAL", level: 1 },
  { dx: -4, dz: 3, building: "RESIDENTIAL", level: 1 },
  { dx: -4, dz: 4, building: "RESIDENTIAL", level: 1 },
  { dx: 4, dz: 3, building: "RESIDENTIAL", level: 1 },
  { dx: 4, dz: 4, building: "RESIDENTIAL", level: 1 },
  { dx: -2, dz: 4, building: "RESIDENTIAL", level: 1 },
  { dx: 2, dz: 4, building: "RESIDENTIAL", level: 1 },
  { dx: 0, dz: 4, building: "PARK", level: 1 },
  { dx: 1, dz: 4, building: "PARK", level: 1 },
  { dx: 7, dz: 0, building: "POWER", level: 1 },
  { dx: -7, dz: 0, building: "WATER_PUMP", level: 1, terrain: "WATER" },
];

const GROWTH_THRESHOLDS: Record<string, number> = {
  RESIDENTIAL: 0.2,
  COMMERCIAL: 0.16,
  INDUSTRIAL: 0.12,
};

const DECLINE_THRESHOLD = 0.12;

export function createInitialState(): GridizenState {
  return {
    grid: [],
    time: 8,
    funds: 25000,
    population: 0,
    jobs: 0,
    happiness: 100,
    powerUse: 0,
    powerMax: 0,
    waterUse: 0,
    waterMax: 0,
    milestone: 1,
    selectedTool: "INSPECT",
    inspectedTileIdx: null,
    heatmap: false,
  };
}

export function initMap(state: GridizenState): GridizenState {
  return refreshCityServices({
    ...state,
    grid: applyStarterSettlement(generateMap(GRIDIZEN_MAP_SEED)),
    inspectedTileIdx: null,
    selectedTool: "INSPECT",
    heatmap: false,
  });
}

export function setTool(state: GridizenState, tool: string): GridizenState {
  return {
    ...state,
    selectedTool: tool,
    inspectedTileIdx: tool !== "INSPECT" ? null : state.inspectedTileIdx,
  };
}

export function setInspectedTile(state: GridizenState, idx: number | null): GridizenState {
  return { ...state, inspectedTileIdx: idx };
}

export function toggleHeatmap(state: GridizenState): GridizenState {
  return { ...state, heatmap: !state.heatmap };
}

export function applyStarterSettlement(grid: GridTile[]): GridTile[] {
  const settled = grid.map((tile) => ({ ...tile }));
  const setTile = (
    x: number,
    z: number,
    patch: Partial<GridTile> & Pick<GridTile, "building">
  ): void => {
    if (x < 0 || x >= GRID_SIZE || z < 0 || z >= GRID_SIZE) return;
    const idx = z * GRID_SIZE + x;
    const tile = settled[idx];
    if (!tile) return;
    settled[idx] = {
      ...tile,
      terrain: patch.terrain ?? tile.terrain,
      building: patch.building,
      level: patch.level ?? 0,
      powered: false,
      watered: false,
      roadAccess: false,
      happiness: 70,
      warning: "NONE",
    };
  };

  for (let dz = -9; dz <= 9; dz++) {
    for (let dx = -10; dx <= 10; dx++) {
      const x = CIVIC_CENTER.x + dx;
      const z = CIVIC_CENTER.z + dz;
      const idx = z * GRID_SIZE + x;
      const tile = settled[idx];
      if (!tile) continue;

      const riverEdge = dx === -8 && Math.abs(dz) <= 7;
      const civicLawn = Math.abs(dx) <= 6 && Math.abs(dz) <= 6;
      settled[idx] = {
        ...tile,
        terrain: riverEdge
          ? "WATER"
          : civicLawn || tile.terrain === "FOREST"
            ? "GRASS"
            : tile.terrain,
        building: "NONE",
        level: 0,
        warning: "NONE",
      };
    }
  }

  for (let offset = -8; offset <= 8; offset++) {
    setTile(CIVIC_CENTER.x + offset, CIVIC_CENTER.z, { building: "ROAD", terrain: "GRASS" });
    setTile(CIVIC_CENTER.x, CIVIC_CENTER.z + offset, { building: "ROAD", terrain: "GRASS" });
  }

  for (let offset = -5; offset <= 5; offset++) {
    setTile(CIVIC_CENTER.x - 5, CIVIC_CENTER.z + offset, { building: "ROAD", terrain: "GRASS" });
    setTile(CIVIC_CENTER.x + 5, CIVIC_CENTER.z + offset, { building: "ROAD", terrain: "GRASS" });
  }

  for (let offset = -5; offset <= 5; offset++) {
    setTile(CIVIC_CENTER.x + offset, CIVIC_CENTER.z - 5, { building: "ROAD", terrain: "GRASS" });
    setTile(CIVIC_CENTER.x + offset, CIVIC_CENTER.z + 5, { building: "ROAD", terrain: "GRASS" });
  }

  for (const lot of STARTER_LOTS) {
    setTile(CIVIC_CENTER.x + lot.dx, CIVIC_CENTER.z + lot.dz, {
      building: lot.building,
      level: lot.level,
      terrain: lot.terrain ?? "GRASS",
    });
  }

  return settled;
}

export function handleInteraction(state: GridizenState, x: number, z: number): GridizenState {
  const { grid, funds, selectedTool } = state;
  if (x < 0 || x >= GRID_SIZE || z < 0 || z >= GRID_SIZE) return state;
  const idx = z * GRID_SIZE + x;
  const tile = grid[idx];
  if (!tile) return state;

  if (selectedTool === "INSPECT") {
    return setInspectedTile(state, idx);
  }
  if (selectedTool === "NONE") return state;

  if (selectedTool === "BULLDOZE") {
    if (tile.building !== "NONE") {
      const newGrid = [...grid];
      newGrid[idx] = {
        ...tile,
        building: "NONE",
        level: 0,
        warning: "NONE" as WarningType,
      };
      return { ...state, grid: newGrid, funds: funds - 5, inspectedTileIdx: null };
    }
    if (tile.terrain === "FOREST") {
      const newGrid = [...grid];
      newGrid[idx] = { ...tile, terrain: "GRASS" };
      return { ...state, grid: newGrid, funds: funds - 20, inspectedTileIdx: null };
    }
    return state;
  }

  if (tile.terrain === "WATER" && selectedTool !== "WATER_PUMP" && selectedTool !== "ROAD")
    return state;
  if (tile.terrain === "FOREST") return state;
  if (tile.building !== "NONE") return state;

  const buildingDef = BUILDINGS[selectedTool];
  if (!buildingDef) return state;
  const cost = buildingDef.cost;
  if (funds < cost) return state;

  const newGrid = [...grid];
  newGrid[idx] = { ...tile, building: selectedTool, level: 0 };
  return { ...state, grid: newGrid, funds: funds - cost, inspectedTileIdx: null };
}

export function tickGame(state: GridizenState): GridizenState {
  return evaluateCityState(state, { advanceClock: true, collectTaxes: true, growZones: true });
}

export function refreshCityServices(state: GridizenState): GridizenState {
  return evaluateCityState(state, { advanceClock: false, collectTaxes: false, growZones: false });
}

export function getGrowthSignal(tile: GridTile, time: number, population: number): number {
  const signal =
    Math.sin((tile.id + 1) * 12.9898 + time * 78.233 + population * 0.017) * 43758.5453;
  return signal - Math.floor(signal);
}

export function shouldGrowTile(tile: GridTile, time: number, population: number): boolean {
  const threshold = GROWTH_THRESHOLDS[tile.building] ?? 0;
  return threshold > 0 && getGrowthSignal(tile, time, population) < threshold;
}

export function shouldDeclineTile(tile: GridTile, time: number, population: number): boolean {
  return getGrowthSignal(tile, time + 11, population + 37) < DECLINE_THRESHOLD;
}

interface EvaluationOptions {
  advanceClock: boolean;
  collectTaxes: boolean;
  growZones: boolean;
}

function evaluateCityState(state: GridizenState, options: EvaluationOptions): GridizenState {
  const { grid } = state;
  if (grid.length === 0) return state;

  const newGrid: GridTile[] = grid.map((t) => ({ ...t }));
  const time = options.advanceClock ? (state.time + 1) % 24 : state.time;

  let pMax = 0;
  let pUse = 0;
  let wMax = 0;
  let wUse = 0;
  let pop = 0;
  let jobs = 0;
  let upkeep = 0;
  const powerSources: number[] = [];
  const waterSources: number[] = [];

  for (let i = 0; i < newGrid.length; i++) {
    const t = newGrid[i];
    if (!t) continue;
    if (t.building === "POWER") {
      pMax += 200;
      powerSources.push(i);
    }
    if (t.building === "WATER_PUMP") {
      wMax += 200;
      waterSources.push(i);
    }
    if (t.building !== "NONE" && t.building !== "ROAD") upkeep += 2;
  }

  const roadSet = new Set<number>();
  for (let i = 0; i < newGrid.length; i++) {
    if (newGrid[i]?.building === "ROAD") roadSet.add(i);
  }

  const runBFS = (sources: number[], resultSet: Set<number>): void => {
    const queue = [...sources];
    const visited = new Set<number>(sources);
    while (queue.length > 0) {
      const curr = queue.shift();
      if (curr === undefined) break;
      resultSet.add(curr);
      const cx = curr % GRID_SIZE;
      const cz = Math.floor(curr / GRID_SIZE);
      const neighbors: [number, number][] = [
        [cx + 1, cz],
        [cx - 1, cz],
        [cx, cz + 1],
        [cx, cz - 1],
      ];
      for (const [nx, nz] of neighbors) {
        if (nx >= 0 && nx < GRID_SIZE && nz >= 0 && nz < GRID_SIZE) {
          const nIdx = nz * GRID_SIZE + nx;
          const nTile = newGrid[nIdx];
          if (!visited.has(nIdx) && nTile && (roadSet.has(nIdx) || nTile.building !== "NONE")) {
            visited.add(nIdx);
            if (roadSet.has(nIdx)) queue.push(nIdx);
            resultSet.add(nIdx);
          }
        }
      }
    }
  };

  const poweredSet = new Set<number>();
  const wateredSet = new Set<number>();
  if (pMax > 0) runBFS(powerSources, poweredSet);
  if (wMax > 0) runBFS(waterSources, wateredSet);

  for (const tile of newGrid) {
    const demand = getTileDemand(tile);
    pUse += demand.power;
    wUse += demand.water;
  }

  const powerAvailable = pMax >= pUse;
  const waterAvailable = wMax >= wUse;
  let civicHappinessTotal = 0;
  let civicHappinessCount = 0;

  for (let i = 0; i < newGrid.length; i++) {
    const t = newGrid[i];
    if (!t) continue;
    let localHap = 62;
    const { x, z } = t;
    const neighbors: [number, number][] = [
      [x + 1, z],
      [x - 1, z],
      [x, z + 1],
      [x, z - 1],
      [x + 1, z + 1],
      [x + 1, z - 1],
      [x - 1, z + 1],
      [x - 1, z - 1],
    ];
    let hasRoad = false;
    for (const [nx, nz] of neighbors) {
      if (nx >= 0 && nx < GRID_SIZE && nz >= 0 && nz < GRID_SIZE) {
        const nTile = newGrid[nz * GRID_SIZE + nx];
        if (!nTile) continue;
        if (nTile.building === "ROAD") hasRoad = true;
        if (nTile.terrain === "FOREST" || nTile.terrain === "WATER") localHap += 5;
        if (nTile.building === "PARK") localHap += 15;
        if (nTile.building === "INDUSTRIAL") localHap -= 20;
      }
    }
    t.happiness = Math.max(0, Math.min(100, localHap));
    if (t.building === "NONE" || t.building === "ROAD") continue;
    t.roadAccess = hasRoad;
    t.powered = t.building === "POWER" || (poweredSet.has(i) && powerAvailable);
    t.watered = t.building === "WATER_PUMP" || (wateredSet.has(i) && waterAvailable);
    t.warning = "NONE";
    if (!t.roadAccess) t.warning = "NO_ROAD";
    else if (requiresPower(t) && !t.powered) t.warning = "NO_POWER";
    else if (requiresWater(t) && !t.watered) t.warning = "NO_WATER";
    if (
      t.building === "RESIDENTIAL" ||
      t.building === "COMMERCIAL" ||
      t.building === "INDUSTRIAL"
    ) {
      if (
        options.growZones &&
        t.roadAccess &&
        t.powered &&
        t.watered &&
        t.happiness > 40 &&
        shouldGrowTile(t, time, state.population) &&
        t.level < 5
      ) {
        t.level++;
      } else if (
        options.growZones &&
        (!t.roadAccess || !t.powered || !t.watered || t.happiness <= 40) &&
        shouldDeclineTile(t, time, state.population) &&
        t.level > 0
      ) {
        t.level--;
      }
    }

    if (t.building === "RESIDENTIAL" && t.level > 0) pop += t.level * 4;
    if ((t.building === "COMMERCIAL" || t.building === "INDUSTRIAL") && t.level > 0)
      jobs += t.level * 4;
    civicHappinessTotal += t.happiness;
    civicHappinessCount++;
  }

  let globalHap =
    civicHappinessCount > 0 ? Math.round(civicHappinessTotal / civicHappinessCount) : 100;
  if (pUse > pMax) globalHap -= 20;
  if (wUse > wMax) globalHap -= 20;

  let newMilestone = state.milestone;
  for (let i = MILESTONES.length - 1; i >= 0; i--) {
    const m = MILESTONES[i];
    if (m && pop >= m.popRequired) {
      newMilestone = m.tier;
      break;
    }
  }

  let funds = state.funds;
  if (options.collectTaxes && time === 0) {
    const taxes = pop * 5 + jobs * 8;
    funds += taxes - upkeep;
  }

  return {
    ...state,
    grid: newGrid,
    time,
    funds,
    population: pop,
    jobs,
    happiness: Math.max(0, globalHap),
    powerUse: pUse,
    powerMax: pMax,
    waterUse: wUse,
    waterMax: wMax,
    milestone: newMilestone,
  };
}

function getTileDemand(tile: GridTile): { power: number; water: number } {
  if (tile.building === "NONE" || tile.building === "ROAD") return { power: 0, water: 0 };
  const level = Math.max(1, tile.level);
  if (tile.building === "POWER" || tile.building === "WATER_PUMP") return { power: 0, water: 0 };
  if (tile.building === "PARK") return { power: 1, water: 2 };
  if (tile.building === "INDUSTRIAL") return { power: level * 5, water: level * 4 };
  if (tile.building === "COMMERCIAL") return { power: level * 3, water: level * 2 };
  return { power: level * 2, water: level * 2 };
}

function requiresPower(tile: GridTile): boolean {
  return (
    tile.building === "RESIDENTIAL" ||
    tile.building === "COMMERCIAL" ||
    tile.building === "INDUSTRIAL" ||
    tile.building === "PARK"
  );
}

function requiresWater(tile: GridTile): boolean {
  return (
    tile.building === "RESIDENTIAL" ||
    tile.building === "COMMERCIAL" ||
    tile.building === "INDUSTRIAL" ||
    tile.building === "PARK"
  );
}
