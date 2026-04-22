import {
  BUILDINGS,
  GRID_SIZE,
  type GridizenState,
  type GridTile,
  generateMap,
  MILESTONES,
  type WarningType,
} from "./types";

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
  return { ...state, grid: generateMap() };
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
  const { grid } = state;
  if (grid.length === 0) return state;

  const newGrid: GridTile[] = grid.map((t) => ({ ...t }));
  const time = (state.time + 1) % 24;

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
    if (t.building === "RESIDENTIAL" && t.level > 0) pop += t.level * 4;
    if ((t.building === "COMMERCIAL" || t.building === "INDUSTRIAL") && t.level > 0)
      jobs += t.level * 4;
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

  let globalHap = 100;
  if (pUse > pMax) globalHap -= 20;
  if (wUse > wMax) globalHap -= 20;

  for (let i = 0; i < newGrid.length; i++) {
    const t = newGrid[i];
    if (!t) continue;
    let localHap = 50;
    const { x, z } = t;
    const neighbors: [number, number][] = [
      [x + 1, z],
      [x - 1, z],
      [x, z + 1],
      [x, z - 1],
      [x + 1, z + 1],
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
    t.powered = poweredSet.has(i) && pMax > pUse;
    t.watered = wateredSet.has(i) && wMax > wUse;
    pUse += (t.level || 1) * 2;
    wUse += (t.level || 1) * 2;
    t.warning = "NONE";
    if (!t.roadAccess) t.warning = "NO_ROAD";
    else if (!t.powered && t.building !== "PARK") t.warning = "NO_POWER";
    else if (!t.watered && t.building !== "PARK") t.warning = "NO_WATER";
    if (
      t.building === "RESIDENTIAL" ||
      t.building === "COMMERCIAL" ||
      t.building === "INDUSTRIAL"
    ) {
      if (t.roadAccess && t.powered && t.watered && t.happiness > 40) {
        if (Math.random() < 0.1 && t.level < 5) t.level++;
      } else if (Math.random() < 0.05 && t.level > 0) {
        t.level--;
      }
    }
  }

  let newMilestone = state.milestone;
  for (let i = MILESTONES.length - 1; i >= 0; i--) {
    const m = MILESTONES[i];
    if (m && pop >= m.popRequired) {
      newMilestone = m.tier;
      break;
    }
  }

  let funds = state.funds;
  if (time === 0) {
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
