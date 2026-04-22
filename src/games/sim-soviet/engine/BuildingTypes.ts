export type BuildingTypeId = "housing" | "factory" | "farm" | "power" | "water" | "tower";

export interface BuildingDefinition {
  id: BuildingTypeId;
  label: string;
  color: string;
  height: number;
  cost: number;
  population?: number;
  income?: number;
  food?: number;
  power?: number;
  water?: number;
}

export const BUILDINGS: Record<BuildingTypeId, BuildingDefinition> = {
  housing: {
    id: "housing",
    label: "Worker Block",
    color: "#60a5fa",
    height: 0.7,
    cost: 20,
    population: 18,
  },
  factory: {
    id: "factory",
    label: "Steel Works",
    color: "#f97316",
    height: 1.0,
    cost: 35,
    income: 10,
    power: -6,
  },
  farm: {
    id: "farm",
    label: "Collective Farm",
    color: "#22c55e",
    height: 0.35,
    cost: 18,
    food: 14,
    water: -4,
  },
  power: { id: "power", label: "Power Plant", color: "#facc15", height: 1.3, cost: 45, power: 24 },
  water: { id: "water", label: "Water Pump", color: "#38bdf8", height: 0.85, cost: 24, water: 16 },
  tower: {
    id: "tower",
    label: "Propaganda Tower",
    color: "#ef4444",
    height: 1.8,
    cost: 42,
    income: 4,
  },
};

export const BUILDING_LIST = Object.values(BUILDINGS);
