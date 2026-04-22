import type { BuildingTypeId } from './BuildingTypes';

export interface CityCell {
  x: number;
  y: number;
  buildable: boolean;
  elevation: number;
  building?: BuildingTypeId;
}

export const GRID_SIZE = 10;

export function createInitialGrid() {
  const cells: CityCell[] = [];
  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const centerBias = Math.abs(x - GRID_SIZE / 2) + Math.abs(y - GRID_SIZE / 2);
      cells.push({
        x,
        y,
        buildable: true,
        elevation: Math.max(0, 0.15 - centerBias * 0.008),
      });
    }
  }
  return cells;
}
