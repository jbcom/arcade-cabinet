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
  requiredVisitedCount?: number;
  exits: Partial<Record<BeppoDirection, string>>;
}

export interface BeppoModeTuning {
  fearPerNewRoom: number;
  despairPerBacktrack: number;
  recoveryPerItem: number;
  passiveFearPerMinute: number;
}

export type BeppoThreatLevel = "steady" | "uneasy" | "spiral";
export type BeppoRoomMood = "opening" | "item" | "gate" | "late-maze" | "exit" | "spiral";
export type BeppoStageMotif =
  | "ring"
  | "ticket"
  | "mirror"
  | "key"
  | "gate"
  | "wax"
  | "bridge"
  | "props"
  | "arcade"
  | "drum"
  | "calliope"
  | "exit";

export interface BeppoRoomCue {
  mood: BeppoRoomMood;
  motif: BeppoStageMotif;
  accent: string;
  secondaryAccent: string;
  lightingBeat: string;
  roomDetail: string;
  spotlightCount: number;
  dangerPulse: boolean;
}

export interface BeppoRouteCue {
  label: string;
  threatLevel: BeppoThreatLevel;
  routeMemoryRemaining: number;
  requiredItemsRemaining: BeppoItem[];
  recommendedDirections: BeppoDirection[];
}

export type BeppoEndingTone = "escape" | "lost";
export type BeppoEndingVariant = "clean-route" | "panic-exit" | "loop-collapse" | "laughing-spiral";

export interface BeppoEndingCue {
  tone: BeppoEndingTone;
  variant: BeppoEndingVariant;
  title: string;
  subtitle: string;
  statusLabel: string;
  accent: string;
  secondaryAccent: string;
  ringCount: number;
  propCount: number;
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
