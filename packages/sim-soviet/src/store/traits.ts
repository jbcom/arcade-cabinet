import { trait } from 'koota';
import type { SimSovietState } from '../engine/Simulation';

export const SimSovietTrait = trait<SimSovietState>(() => ({
  grid: [],
  selectedTool: 'housing',
  funds: 0,
  food: 0,
  power: 0,
  water: 0,
  population: 0,
  quotaProgress: 0,
  month: 1,
  year: 1980,
}));
