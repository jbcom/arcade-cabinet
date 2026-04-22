import type { SessionMode } from "@logic/shared";

export type BeppoPhase = "menu" | "playing" | "escaped" | "lost";
export type BeppoDirection = "north" | "east" | "south" | "west";
export type BeppoItem = "red-key" | "mirror" | "ticket";
export type BeppoRoomKind = "start" | "junction" | "item" | "gate" | "exit";

export interface BeppoRoom {
  id: string;
  label: string;
  kind: BeppoRoomKind;
  item?: BeppoItem;
  requiredItem?: BeppoItem;
  exits: Partial<Record<BeppoDirection, string>>;
}

export interface BeppoModeTuning {
  fearPerNewRoom: number;
  despairPerBacktrack: number;
  recoveryPerItem: number;
  passiveFearPerMinute: number;
}

export interface BeppoState {
  phase: BeppoPhase;
  sessionMode: SessionMode;
  elapsedMs: number;
  currentRoomId: string;
  visitedRoomIds: string[];
  inventory: BeppoItem[];
  fear: number;
  despair: number;
  composure: number;
  lastEvent: string;
  objective: string;
}
