import { normalizeSessionMode, type SessionMode } from "@logic/shared";
import type {
  BeppoDirection,
  BeppoEndingCue,
  BeppoItem,
  BeppoModeTuning,
  BeppoRoom,
  BeppoRoomCue,
  BeppoRouteCue,
  BeppoStageMotif,
  BeppoState,
} from "./types";

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
const REQUIRED_BEPPO_ITEMS = [
  "ticket",
  "mirror",
  "red-key",
] as const satisfies readonly BeppoItem[];
const ROOM_PRESENTATION: Record<
  string,
  {
    accent: string;
    detail: string;
    motif: BeppoStageMotif;
    secondaryAccent: string;
  }
> = {
  "calliope-tunnel": {
    accent: "#facc15",
    detail: "A wheezing organ repeats the path you just forgot.",
    motif: "calliope",
    secondaryAccent: "#f97316",
  },
  "center-ring": {
    accent: "#fb923c",
    detail: "The first spotlight waits for a clean choice.",
    motif: "ring",
    secondaryAccent: "#22d3ee",
  },
  "clown-car": {
    accent: "#f43f5e",
    detail: "A red key hangs from a tiny chrome ignition.",
    motif: "key",
    secondaryAccent: "#facc15",
  },
  "drum-tunnel": {
    accent: "#f97316",
    detail: "Canvas drums mark every step toward the exit flap.",
    motif: "drum",
    secondaryAccent: "#22d3ee",
  },
  "exit-flap": {
    accent: "#7dd3fc",
    detail: "Cold outside air cuts a blue line through the tent.",
    motif: "exit",
    secondaryAccent: "#facc15",
  },
  "fortune-hall": {
    accent: "#a78bfa",
    detail: "A locked fortune machine blinks when the mirror is raised.",
    motif: "gate",
    secondaryAccent: "#22d3ee",
  },
  "laughing-gate": {
    accent: "#f97316",
    detail: "The brass ticket makes the laughing gate blink open.",
    motif: "gate",
    secondaryAccent: "#f43f5e",
  },
  "mirror-midway": {
    accent: "#22d3ee",
    detail: "Mirrors bend the tent into three almost-true exits.",
    motif: "mirror",
    secondaryAccent: "#a78bfa",
  },
  "prize-arcade": {
    accent: "#facc15",
    detail: "Prize lights stutter over the path back to the prop room.",
    motif: "arcade",
    secondaryAccent: "#f43f5e",
  },
  "prop-room": {
    accent: "#fb923c",
    detail: "Painted props point toward the route you have not mapped.",
    motif: "props",
    secondaryAccent: "#22d3ee",
  },
  "rope-bridge": {
    accent: "#38bdf8",
    detail: "A rope bridge swings over the dark part of the maze.",
    motif: "bridge",
    secondaryAccent: "#facc15",
  },
  "shadow-stalls": {
    accent: "#c084fc",
    detail: "The stalls keep their prizes turned away from you.",
    motif: "props",
    secondaryAccent: "#f97316",
  },
  "ticket-booth": {
    accent: "#facc15",
    detail: "A brass ticket rattles inside the glass booth.",
    motif: "ticket",
    secondaryAccent: "#fb923c",
  },
  "wax-gallery": {
    accent: "#e879f9",
    detail: "Wax faces lean toward whichever curtain you avoid.",
    motif: "wax",
    secondaryAccent: "#22d3ee",
  },
};

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

export function getBeppoRouteCue(state: BeppoState): BeppoRouteCue {
  const moves = getAvailableBeppoMoves(state);
  const accessibleMoves = moves.filter((move) => !move.lockedBy && !move.lockedByRouteMemory);
  const unvisitedMoves = accessibleMoves.filter(
    (move) => !state.visitedRoomIds.includes(move.room.id)
  );
  const recommendedDirections = (unvisitedMoves.length > 0 ? unvisitedMoves : accessibleMoves).map(
    (move) => move.direction
  );
  const routeMemoryRemaining = Math.max(0, BEPPO_ESCAPE_VISIT_TARGET - state.visitedRoomIds.length);
  const requiredItemsRemaining = getRequiredItemsRemaining(state.inventory);
  const threatLevel =
    state.composure < 36
      ? "spiral"
      : state.composure < 68 || state.despair > 22
        ? "uneasy"
        : "steady";

  let label = "Follow an unvisited lit curtain and keep the route clean.";
  if (state.currentRoomId === "exit-flap") {
    label = "Exit flap found. Leave before the laugh catches up.";
  } else if (requiredItemsRemaining.length > 0 && state.visitedRoomIds.length > 5) {
    label = `Still need ${requiredItemsRemaining.map(formatItem).join(", ")}.`;
  } else if (routeMemoryRemaining > 0) {
    label = `Map ${routeMemoryRemaining} more room${routeMemoryRemaining === 1 ? "" : "s"} before the exit holds.`;
  } else if (recommendedDirections.length === 0) {
    label = "Every curtain loops back. Breathe, then choose the least familiar door.";
  }

  return {
    label,
    threatLevel,
    routeMemoryRemaining,
    requiredItemsRemaining,
    recommendedDirections,
  };
}

export function getBeppoRoomCue(state: BeppoState): BeppoRoomCue {
  const room = getCurrentBeppoRoom(state);
  const routeCue = getBeppoRouteCue(state);
  const presentation = ROOM_PRESENTATION[room.id] ?? ROOM_PRESENTATION["center-ring"];
  const lateMaze = state.visitedRoomIds.length >= BEPPO_ESCAPE_VISIT_TARGET - 1;
  const mood =
    routeCue.threatLevel === "spiral"
      ? "spiral"
      : room.kind === "exit"
        ? "exit"
        : lateMaze
          ? "late-maze"
          : room.kind === "gate"
            ? "gate"
            : room.kind === "item"
              ? "item"
              : "opening";
  const spotlightCount = clamp(
    2 + state.inventory.length + Math.floor(state.visitedRoomIds.length / 4),
    2,
    7
  );

  return {
    accent: presentation.accent,
    dangerPulse: routeCue.threatLevel === "spiral" || state.composure < 34,
    lightingBeat: describeRoomLightingBeat(mood, room.label, routeCue.routeMemoryRemaining),
    mood,
    motif: presentation.motif,
    roomDetail: presentation.detail,
    secondaryAccent: presentation.secondaryAccent,
    spotlightCount,
  };
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

export function getBeppoEndingCue(state: BeppoState): BeppoEndingCue {
  const summary = getBeppoRunSummary(state);

  if (state.phase === "escaped") {
    const cleanRoute = state.composure >= 68 && state.despair < 18;

    return {
      accent: cleanRoute ? "#7dd3fc" : "#facc15",
      propCount: cleanRoute ? 3 : 6,
      ringCount: cleanRoute ? 5 : 8,
      secondaryAccent: cleanRoute ? "#facc15" : "#fb923c",
      statusLabel: cleanRoute ? "Clean Route" : "Panic Exit",
      subtitle: cleanRoute
        ? `You left through cold air after mapping ${summary.roomsMapped} rooms with ${summary.composure}% composure.`
        : `You forced the flap open after ${summary.roomsMapped} rooms with ${summary.composure}% composure still flickering.`,
      title: cleanRoute ? "Cold Air Applause" : "Panic Exit",
      tone: "escape",
      variant: cleanRoute ? "clean-route" : "panic-exit",
    };
  }

  const loopCollapse = state.despair >= state.fear;

  return {
    accent: loopCollapse ? "#fb923c" : "#f43f5e",
    propCount: loopCollapse ? 8 : 10,
    ringCount: loopCollapse ? 6 : 9,
    secondaryAccent: loopCollapse ? "#22d3ee" : "#a78bfa",
    statusLabel: loopCollapse ? "Loop Collapse" : "Laughing Spiral",
    subtitle: loopCollapse
      ? `Backtracking folded the route after ${summary.roomsMapped} mapped rooms. Breathe, then commit to a cleaner curtain chain.`
      : `Fear drowned the music after ${summary.roomsMapped} mapped rooms. Recover with item routes before forcing gates.`,
    title: loopCollapse ? "The Route Folds" : "The Laugh Wins",
    tone: "lost",
    variant: loopCollapse ? "loop-collapse" : "laughing-spiral",
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

function describeRoomLightingBeat(
  mood: BeppoRoomCue["mood"],
  roomLabel: string,
  routeMemoryRemaining: number
) {
  if (mood === "spiral") return `${roomLabel} strobes faster than your route memory.`;
  if (mood === "exit") return "Blue light leaks through the flap; the tent finally has an edge.";
  if (mood === "late-maze")
    return routeMemoryRemaining > 0
      ? `${roomLabel} holds the last map beats before the exit listens.`
      : `${roomLabel} lights a clean route toward the exit flap.`;
  if (mood === "gate") return `${roomLabel} throws a hard shadow over the required item.`;
  if (mood === "item") return `${roomLabel} warms when a blockade item is close.`;
  return `${roomLabel} keeps the center spotlight steady.`;
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

function getRequiredItemsRemaining(inventory: BeppoItem[]): BeppoItem[] {
  return REQUIRED_BEPPO_ITEMS.filter((item) => !inventory.includes(item));
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
