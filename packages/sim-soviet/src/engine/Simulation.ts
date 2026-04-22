import { BUILDINGS, type BuildingTypeId } from './BuildingTypes';
import { createInitialGrid, type CityCell } from './Grid';

export interface SimSovietState {
  grid: CityCell[];
  selectedTool: BuildingTypeId;
  funds: number;
  food: number;
  power: number;
  water: number;
  population: number;
  quotaProgress: number;
  month: number;
  year: number;
}

export function createInitialState(): SimSovietState {
  return {
    grid: createInitialGrid(),
    selectedTool: 'housing',
    funds: 120,
    food: 40,
    power: 0,
    water: 0,
    population: 12,
    quotaProgress: 8,
    month: 1,
    year: 1980,
  };
}

export function placeBuilding(state: SimSovietState, x: number, y: number) {
  const next = structuredClone(state) as SimSovietState;
  const cell = next.grid.find((entry) => entry.x === x && entry.y === y);
  const tool = BUILDINGS[next.selectedTool];
  if (!cell || cell.building || next.funds < tool.cost) {
    return state;
  }
  cell.building = next.selectedTool;
  next.funds -= tool.cost;
  return recompute(next);
}

export function selectTool(state: SimSovietState, selectedTool: BuildingTypeId) {
  return { ...state, selectedTool };
}

export function tickSimulation(state: SimSovietState, deltaMs: number) {
  const monthsAdvanced = Math.floor(deltaMs / 1500);
  if (monthsAdvanced < 1) {
    return state;
  }

  let next = structuredClone(state) as SimSovietState;
  for (let index = 0; index < monthsAdvanced; index += 1) {
    next = recompute(next);
    next.month += 1;
    next.quotaProgress = Math.min(100, next.quotaProgress + 4);
    if (next.month > 12) {
      next.month = 1;
      next.year += 1;
    }
    next.funds += 6;
    if (next.food <= 0) {
      next.population = Math.max(0, next.population - 2);
    }
  }
  return next;
}

function recompute(state: SimSovietState) {
  const next = { ...state, grid: state.grid.map((cell) => ({ ...cell })) };
  let food = 0;
  let power = 0;
  let water = 0;
  let income = 0;
  let population = 0;

  for (const cell of next.grid) {
    if (!cell.building) continue;
    const definition = BUILDINGS[cell.building];
    food += definition.food ?? 0;
    power += definition.power ?? 0;
    water += definition.water ?? 0;
    income += definition.income ?? 0;
    population += definition.population ?? 0;
  }

  next.food = Math.max(0, next.food + food - Math.max(6, Math.floor(population / 8)));
  next.power = power;
  next.water = water;
  next.population = population;
  next.funds = Math.max(0, next.funds + income);
  return next;
}
