import { normalizeSessionMode, type SessionMode } from "@logic/shared";
import type { BeppoDirection, BeppoItem, BeppoModeTuning, BeppoRoom, BeppoState } from "./types";

export const BEPPO_ROOMS: readonly BeppoRoom[] = [
  {
    exits: { east: "mirror-midway", north: "ticket-booth", west: "calliope-tunnel" },
    id: "center-ring",
    kind: "start",
    label: "Center Ring",
  },
  {
    exits: { east: "laughing-gate", south: "center-ring" },
    id: "ticket-booth",
    item: "ticket",
    kind: "item",
    label: "Ticket Booth",
  },
  {
    exits: { east: "wax-gallery", north: "laughing-gate", south: "clown-car", west: "center-ring" },
    id: "mirror-midway",
    item: "mirror",
    kind: "item",
    label: "Mirror Midway",
  },
  {
    exits: { north: "mirror-midway", west: "prize-arcade" },
    id: "clown-car",
    item: "red-key",
    kind: "item",
    label: "Clown Car",
  },
  {
    exits: { east: "laughing-gate", south: "prize-arcade" },
    id: "shadow-stalls",
    kind: "junction",
    label: "Shadow Stalls",
  },
  {
    exits: { east: "wax-gallery", south: "mirror-midway", west: "ticket-booth" },
    id: "laughing-gate",
    kind: "gate",
    label: "Laughing Gate",
    requiredItem: "ticket",
  },
  {
    exits: { north: "fortune-hall", west: "mirror-midway" },
    id: "wax-gallery",
    kind: "junction",
    label: "Wax Gallery",
  },
  {
    exits: { east: "rope-bridge", south: "wax-gallery", west: "laughing-gate" },
    id: "fortune-hall",
    kind: "gate",
    label: "Fortune Hall",
    requiredItem: "mirror",
  },
  {
    exits: { south: "prop-room", west: "fortune-hall" },
    id: "rope-bridge",
    kind: "junction",
    label: "Rope Bridge",
  },
  {
    exits: { east: "prize-arcade", north: "rope-bridge", west: "drum-tunnel" },
    id: "prop-room",
    kind: "junction",
    label: "Prop Room",
  },
  {
    exits: { east: "clown-car", north: "shadow-stalls", west: "prop-room" },
    id: "prize-arcade",
    kind: "junction",
    label: "Prize Arcade",
  },
  {
    exits: { east: "prop-room", north: "exit-flap" },
    id: "drum-tunnel",
    kind: "junction",
    label: "Drum Tunnel",
  },
  {
    exits: { east: "center-ring", west: "drum-tunnel" },
    id: "calliope-tunnel",
    kind: "junction",
    label: "Calliope Tunnel",
  },
  {
    exits: { south: "drum-tunnel" },
    id: "exit-flap",
    kind: "exit",
    label: "Exit Flap",
    requiredItem: "red-key",
    requiredVisitedCount: 10,
  },
] as const;

export const BEPPO_ESCAPE_VISIT_TARGET = 10;

const MODE_TUNING: Record<SessionMode, BeppoModeTuning> = {
  challenge: {
    despairPerBacktrack: 3.2,
    fearPerNewRoom: 6.5,
    passiveFearPerMinute: 4.8,
    recoveryPerItem: 4,
  },
  cozy: {
    despairPerBacktrack: 0.8,
    fearPerNewRoom: 2.4,
    passiveFearPerMinute: 0.7,
    recoveryPerItem: 10,
  },
  standard: {
    despairPerBacktrack: 1.6,
    fearPerNewRoom: 4,
    passiveFearPerMinute: 1.6,
    recoveryPerItem: 7,
  },
};

export function getBeppoModeTuning(mode: string | null | undefined): BeppoModeTuning {
  return MODE_TUNING[normalizeSessionMode(mode)];
}

export function createInitialBeppoState(
  mode: string | null | undefined = "standard",
  phase: BeppoState["phase"] = "menu"
): BeppoState {
  const sessionMode = normalizeSessionMode(mode);

  return {
    composure: 100,
    currentRoomId: "center-ring",
    despair: 0,
    elapsedMs: 0,
    fear: 0,
    inventory: [],
    lastEvent: "The tent breathes. Pick a route and keep composure.",
    objective: "Find blockade items, unlock the exit flap, and leave the tent.",
    phase,
    sessionMode,
    visitedRoomIds: ["center-ring"],
  };
}

export function getCurrentBeppoRoom(state: BeppoState): BeppoRoom {
  return findRoom(state.currentRoomId);
}

export function getAvailableBeppoMoves(state: BeppoState) {
  const room = getCurrentBeppoRoom(state);

  return Object.entries(room.exits).map(([direction, roomId]) => ({
    direction: direction as BeppoDirection,
    lockedBy: getLockedItem(roomId, state.inventory),
    lockedByRouteMemory: getRouteMemoryLock(roomId, state.visitedRoomIds.length),
    room: findRoom(roomId),
  }));
}

export function advanceBeppoTime(state: BeppoState, deltaMs: number): BeppoState {
  if (state.phase !== "playing") return state;

  const tuning = getBeppoModeTuning(state.sessionMode);
  const fear = clamp(state.fear + tuning.passiveFearPerMinute * (deltaMs / 60_000), 0, 100);

  return finalizeState({
    ...state,
    elapsedMs: state.elapsedMs + Math.max(0, deltaMs),
    fear,
  });
}

export function moveBeppo(state: BeppoState, direction: BeppoDirection): BeppoState {
  if (state.phase !== "playing") return state;

  const room = getCurrentBeppoRoom(state);
  const nextRoomId = room.exits[direction];
  if (!nextRoomId) {
    return {
      ...state,
      lastEvent: "Canvas walls fold back on themselves. Choose a lit junction.",
    };
  }

  const lockedBy = getLockedItem(nextRoomId, state.inventory);
  if (lockedBy) {
    return finalizeState({
      ...state,
      despair: clamp(state.despair + 1, 0, 100),
      lastEvent: `The blockade wants ${formatItem(lockedBy)} before it moves.`,
      objective: `Find ${formatItem(lockedBy)} before forcing this gate.`,
    });
  }
  const routeMemoryLock = getRouteMemoryLock(nextRoomId, state.visitedRoomIds.length);
  if (routeMemoryLock > 0) {
    return finalizeState({
      ...state,
      despair: clamp(state.despair + 1, 0, 100),
      lastEvent: `The exit flap will not hold. Map ${routeMemoryLock} more room${routeMemoryLock === 1 ? "" : "s"} before leaving.`,
      objective: "Build route memory through the tent before forcing the final flap.",
    });
  }

  const tuning = getBeppoModeTuning(state.sessionMode);
  const alreadyVisited = state.visitedRoomIds.includes(nextRoomId);
  const nextRoom = findRoom(nextRoomId);
  const collectedItem =
    nextRoom.item && !state.inventory.includes(nextRoom.item) ? nextRoom.item : undefined;
  const inventory = collectedItem ? [...state.inventory, collectedItem] : state.inventory;
  const fear = alreadyVisited ? state.fear : state.fear + tuning.fearPerNewRoom;
  const despair = alreadyVisited ? state.despair + tuning.despairPerBacktrack : state.despair;
  const recoveredFear = collectedItem ? Math.max(0, fear - tuning.recoveryPerItem) : fear;
  const visitedRoomIds = alreadyVisited
    ? state.visitedRoomIds
    : [...state.visitedRoomIds, nextRoomId];
  const phase = nextRoom.kind === "exit" ? "escaped" : "playing";

  return finalizeState({
    ...state,
    currentRoomId: nextRoomId,
    despair,
    fear: recoveredFear,
    inventory,
    lastEvent: describeRoomArrival(nextRoom, collectedItem),
    objective:
      phase === "escaped"
        ? "You found the cold air outside the tent."
        : describeObjective(nextRoom),
    phase,
    visitedRoomIds,
  });
}

export function getBeppoRunSummary(state: BeppoState) {
  return {
    composure: Math.round(state.composure),
    elapsedSeconds: Math.round(state.elapsedMs / 1000),
    fear: Math.round(state.fear),
    inventoryCount: state.inventory.length,
    roomsMapped: state.visitedRoomIds.length,
    routeMemoryTarget: BEPPO_ESCAPE_VISIT_TARGET,
  };
}

export function recoverBeppoAfterMistake(state: BeppoState): BeppoState {
  const tuning = getBeppoModeTuning(state.sessionMode);

  return finalizeState({
    ...state,
    despair: clamp(state.despair - tuning.recoveryPerItem * 0.5, 0, 100),
    fear: clamp(state.fear - tuning.recoveryPerItem, 0, 100),
    lastEvent: "You count the tent poles and breathe until the laughter thins.",
  });
}

function finalizeState(state: BeppoState): BeppoState {
  const composure = clamp(100 - state.fear - state.despair, 0, 100);

  return {
    ...state,
    composure,
    phase: composure <= 0 && state.phase === "playing" ? "lost" : state.phase,
  };
}

function findRoom(id: string): BeppoRoom {
  const room = BEPPO_ROOMS.find((candidate) => candidate.id === id);
  if (!room) throw new Error(`Unknown Beppo room: ${id}`);
  return room;
}

function getLockedItem(roomId: string | undefined, inventory: BeppoItem[]): BeppoItem | null {
  if (!roomId) return null;
  const requiredItem = findRoom(roomId).requiredItem;
  return requiredItem && !inventory.includes(requiredItem) ? requiredItem : null;
}

function getRouteMemoryLock(roomId: string | undefined, visitedCount: number): number {
  if (!roomId) return 0;
  const requiredVisitedCount = findRoom(roomId).requiredVisitedCount ?? 0;
  return Math.max(0, requiredVisitedCount - visitedCount);
}

function describeRoomArrival(room: BeppoRoom, item: BeppoItem | undefined) {
  if (item) return `You pocket ${formatItem(item)}. The route feels less impossible.`;
  if (room.kind === "exit") return "The tent flap opens. Beppo laughs somewhere behind you.";
  if (room.kind === "gate") return "The gate clicks open and the calliope skips a beat.";
  return `${room.label} reveals another crooked choice.`;
}

function describeObjective(room: BeppoRoom) {
  if (room.kind === "gate") return "The exit is closer. Check each junction before fear stacks up.";
  if (room.item) return "Item secured. Route toward the locked laughter.";
  return "Pick a junction, avoid spiraling, and keep composure above zero.";
}

function formatItem(item: BeppoItem) {
  switch (item) {
    case "mirror":
      return "the midway mirror";
    case "red-key":
      return "the red clown-car key";
    case "ticket":
      return "the brass ticket";
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
