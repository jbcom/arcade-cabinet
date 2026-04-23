import {
  CartridgeStartScreen,
  GameOverScreen,
  GameViewport,
  isCabinetRuntimePaused,
  OverlayButton,
  useRunSnapshotAutosave,
} from "@app/shared";
import {
  advanceBeppoTime,
  BEPPO_ESCAPE_VISIT_TARGET,
  BEPPO_ROOMS,
  createInitialBeppoState,
  getAvailableBeppoMoves,
  getBeppoEndingCue,
  getBeppoRoomCue,
  getBeppoRouteCue,
  getBeppoRunSummary,
  getCurrentBeppoRoom,
  moveBeppo,
} from "@logic/games/beppo-laughs/engine/beppoSimulation";
import type {
  BeppoDirection,
  BeppoEndingCue,
  BeppoRoomCue,
  BeppoRouteCue,
  BeppoState,
} from "@logic/games/beppo-laughs/engine/types";
import { DEFAULT_SESSION_MODE, type GameSaveSlot, type SessionMode } from "@logic/shared";
import { useEffect, useMemo, useState } from "react";

const DIRECTION_LABELS: Record<BeppoDirection, string> = {
  east: "East",
  north: "North",
  south: "South",
  west: "West",
};

export default function Game() {
  const [state, setState] = useState<BeppoState>(() =>
    createInitialBeppoState(DEFAULT_SESSION_MODE, "menu")
  );

  useEffect(() => {
    if (state.phase !== "playing") return undefined;

    let frame = 0;
    let last = performance.now();
    const step = (now: number) => {
      const delta = now - last;
      last = now;
      if (!isCabinetRuntimePaused()) {
        setState((current) => advanceBeppoTime(current, delta));
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frame);
  }, [state.phase]);

  const start = (mode: SessionMode, saveSlot?: GameSaveSlot) => {
    setState(resolveBeppoStartState(mode, saveSlot));
  };

  const restart = () => {
    setState(createInitialBeppoState(state.sessionMode, "menu"));
  };

  const room = getCurrentBeppoRoom(state);
  const moves = useMemo(() => getAvailableBeppoMoves(state), [state]);
  const routeCue = useMemo(() => getBeppoRouteCue(state), [state]);
  const roomCue = useMemo(() => getBeppoRoomCue(state), [state]);
  const summary = getBeppoRunSummary(state);
  const endingCue =
    state.phase === "escaped" || state.phase === "lost" ? getBeppoEndingCue(state) : undefined;

  useRunSnapshotAutosave({
    active: state.phase === "playing",
    progressSummary: `${room.label} · ${Math.round(state.composure)}% composure`,
    slug: "beppo-laughs",
    snapshot: state,
  });

  return (
    <GameViewport background="#130706" data-browser-screenshot-mode="page">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 12%, ${roomCue.accent}55, transparent 28%), linear-gradient(180deg, rgba(69,10,10,0.4), rgba(7,2,2,0.96)), repeating-linear-gradient(90deg, ${roomCue.accent}33 0 7vw, rgba(153,27,27,0.22) 7vw 14vw)`,
        }}
      />
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-[14%] h-[72%] w-[min(84vw,820px)] -translate-x-1/2 rounded-[50%] border border-orange-200/18"
        style={{
          background:
            "radial-gradient(circle at 50% 38%, rgba(34,211,238,0.08), transparent 34%), radial-gradient(circle at 50% 50%, rgba(0,0,0,0.32), rgba(0,0,0,0.75))",
          boxShadow: "inset 0 0 80px rgba(0,0,0,0.72), 0 0 45px rgba(249,115,22,0.24)",
        }}
      />

      {state.phase === "menu" ? (
        <CartridgeStartScreen
          accent="#f97316"
          cartridgeId="Slot 10"
          description="Make junction choices, collect blockade items, and keep composure until the exit flap opens."
          gameSlug="beppo-laughs"
          kicker="Nightmare Circus Cartridge"
          motif="circus"
          onStart={start}
          rules={[
            "New rooms raise fear, but item discoveries restore composure.",
            "Backtracking raises despair, so learn a clean route through the tent.",
            "Standard mode keeps sanity loss recoverable for an 8-15 minute maze.",
          ]}
          secondaryAccent="#22d3ee"
          startLabel="Enter Tent"
          title="BEPPO LAUGHS"
        />
      ) : null}

      {state.phase === "playing" ? (
        <main className="relative z-10 grid h-full grid-rows-[auto_minmax(0,1fr)_auto] gap-3 p-3 sm:p-5">
          <Hud state={state} routeCue={routeCue} />
          <section className="grid min-h-0 gap-3 md:grid-cols-[1fr_minmax(250px,0.54fr)]">
            <CircusStage
              moves={moves}
              onMove={(direction) => setState((current) => moveBeppo(current, direction))}
              roomCue={roomCue}
              routeCue={routeCue}
              state={state}
            />
            <div
              className="grid min-h-0 grid-rows-[auto_auto_auto] gap-3 rounded-md border bg-black/48 p-3 shadow-2xl"
              style={{ borderColor: `${roomCue.accent}44` }}
            >
              <div>
                <div className="font-mono text-[0.65rem] font-black uppercase tracking-[0.24em] text-orange-200/70">
                  Current Room
                </div>
                <h1 className="mt-1 text-3xl font-black uppercase text-white">{room.label}</h1>
                <p className="mt-2 text-sm font-semibold leading-snug text-orange-50/72">
                  {state.lastEvent}
                </p>
                <div
                  className="mt-3 rounded-md border p-2 text-xs font-black uppercase leading-snug text-white"
                  style={{
                    background: `${roomCue.accent}18`,
                    borderColor: `${roomCue.accent}55`,
                    color: roomCue.secondaryAccent,
                  }}
                >
                  Room Beat: {roomCue.lightingBeat}
                </div>
              </div>
              <div className="min-h-0 rounded-md border border-cyan-200/12 bg-cyan-950/18 p-3">
                <div className="font-mono text-[0.62rem] font-black uppercase tracking-[0.22em] text-cyan-100/62">
                  Objective
                </div>
                <p className="mt-2 text-sm font-bold leading-snug text-cyan-50">
                  {state.objective}
                </p>
                <p className="mt-2 text-xs font-semibold leading-snug text-cyan-50/72">
                  {roomCue.roomDetail}
                </p>
                <div className="mt-3 rounded-md border border-orange-200/22 bg-orange-500/10 p-2 text-xs font-black uppercase leading-snug text-orange-50">
                  Route Cue: {routeCue.label}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {state.inventory.length === 0 ? (
                    <span className="rounded-md border border-white/12 bg-white/6 px-2 py-1 text-xs font-bold uppercase text-white/58">
                      No items
                    </span>
                  ) : (
                    state.inventory.map((item) => (
                      <span
                        key={item}
                        className="rounded-md border border-cyan-200/30 bg-cyan-300/12 px-2 py-1 text-xs font-black uppercase text-cyan-100"
                      >
                        {item.replace("-", " ")}
                      </span>
                    ))
                  )}
                </div>
              </div>
              <nav className="hidden grid-cols-2 gap-2 md:grid">
                {moves.map((move) => (
                  <button
                    key={`${move.direction}-${move.room.id}`}
                    type="button"
                    className="rounded-md border px-3 py-3 text-left transition hover:-translate-y-0.5 focus:outline-none focus:ring-2"
                    style={{
                      background:
                        move.lockedBy || move.lockedByRouteMemory
                          ? "rgba(127,29,29,0.48)"
                          : "linear-gradient(135deg, rgba(249,115,22,0.24), rgba(34,211,238,0.12))",
                      borderColor:
                        move.lockedBy || move.lockedByRouteMemory
                          ? "rgba(252,165,165,0.42)"
                          : "rgba(251,146,60,0.42)",
                    }}
                    onClick={() => setState((current) => moveBeppo(current, move.direction))}
                  >
                    <span className="block font-mono text-[0.62rem] font-black uppercase tracking-[0.2em] text-white/54">
                      {DIRECTION_LABELS[move.direction]}
                    </span>
                    <span className="mt-1 block text-base font-black uppercase text-white">
                      {move.room.label}
                    </span>
                    {move.lockedBy ? (
                      <span className="mt-1 block text-xs font-bold uppercase text-red-100">
                        Needs {move.lockedBy.replace("-", " ")}
                      </span>
                    ) : null}
                    {move.lockedByRouteMemory ? (
                      <span className="mt-1 block text-xs font-bold uppercase text-cyan-100">
                        Map {move.lockedByRouteMemory} more
                      </span>
                    ) : null}
                  </button>
                ))}
              </nav>
            </div>
          </section>
        </main>
      ) : null}

      {state.phase === "escaped" ? (
        <GameOverScreen
          accent="#22d3ee"
          result={{
            milestones: ["beppo-escaped"],
            mode: state.sessionMode,
            score: summary.roomsMapped * 100 + summary.composure,
            slug: "beppo-laughs",
            status: "completed",
            summary: endingCue?.statusLabel ?? `Escaped after mapping ${summary.roomsMapped} rooms`,
          }}
          title={endingCue?.title ?? "Escaped"}
          subtitle={
            endingCue?.subtitle ??
            `You left after mapping ${summary.roomsMapped}/${summary.routeMemoryTarget} rooms with ${summary.composure}% composure.`
          }
          actions={<OverlayButton onClick={restart}>Run Again</OverlayButton>}
        />
      ) : null}

      {state.phase === "lost" ? (
        <GameOverScreen
          accent="#f97316"
          result={{
            mode: state.sessionMode,
            score: summary.roomsMapped * 50,
            slug: "beppo-laughs",
            status: "failed",
            summary: endingCue?.statusLabel ?? `Lost after mapping ${summary.roomsMapped} rooms`,
          }}
          title={endingCue?.title ?? "The Laugh Wins"}
          subtitle={
            endingCue?.subtitle ??
            "Composure hit zero. Choose cleaner routes and breathe after a mistake."
          }
          actions={<OverlayButton onClick={restart}>Try Again</OverlayButton>}
        />
      ) : null}

      {endingCue ? <BeppoEndingBackdrop cue={endingCue} /> : null}
    </GameViewport>
  );
}

function resolveBeppoStartState(mode: SessionMode, saveSlot?: GameSaveSlot): BeppoState {
  const snapshot = saveSlot?.snapshot;
  if (isBeppoSnapshot(snapshot)) {
    const restored = snapshot as BeppoState;
    return {
      ...restored,
      phase: "playing",
      sessionMode: mode,
    };
  }

  return createInitialBeppoState(mode, "playing");
}

function isBeppoSnapshot(snapshot: unknown): snapshot is BeppoState {
  const value = snapshot as Partial<BeppoState> | undefined;
  return Boolean(
    value &&
      typeof value === "object" &&
      typeof value.currentRoomId === "string" &&
      Array.isArray(value.visitedRoomIds) &&
      Array.isArray(value.inventory) &&
      typeof value.elapsedMs === "number" &&
      typeof value.composure === "number"
  );
}

function Hud({ state, routeCue }: { state: BeppoState; routeCue: BeppoRouteCue }) {
  return (
    <header className="grid grid-cols-2 gap-2 rounded-md border border-orange-200/18 bg-black/48 p-3 shadow-2xl sm:grid-cols-4">
      <Metric label="Composure" value={`${Math.round(state.composure)}%`} accent="#22d3ee" />
      <Metric label="Fear" value={`${Math.round(state.fear)}%`} accent="#fb923c" />
      <Metric label="Despair" value={`${Math.round(state.despair)}%`} accent="#f87171" />
      <Metric
        label="Memory"
        value={`${BEPPO_ESCAPE_VISIT_TARGET - routeCue.routeMemoryRemaining}/${BEPPO_ESCAPE_VISIT_TARGET}`}
        accent="#facc15"
      />
    </header>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.04] p-2">
      <div className="font-mono text-[0.6rem] font-black uppercase tracking-[0.22em] text-white/45">
        {label}
      </div>
      <div className="mt-1 text-xl font-black uppercase" style={{ color: accent }}>
        {value}
      </div>
    </div>
  );
}

function CircusStage({
  moves,
  onMove,
  roomCue,
  routeCue,
  state,
}: {
  moves: ReturnType<typeof getAvailableBeppoMoves>;
  onMove: (direction: BeppoDirection) => void;
  roomCue: BeppoRoomCue;
  routeCue: BeppoRouteCue;
  state: BeppoState;
}) {
  const room = getCurrentBeppoRoom(state);
  const moveByDirection = Object.fromEntries(
    moves.map((move) => [move.direction, move])
  ) as Partial<Record<BeppoDirection, (typeof moves)[number]>>;
  const threatAccent =
    routeCue.threatLevel === "spiral"
      ? "#f87171"
      : routeCue.threatLevel === "uneasy"
        ? "#fb923c"
        : "#22d3ee";

  return (
    <section
      className="relative min-h-[350px] overflow-hidden rounded-md border border-orange-200/20 bg-black/54 shadow-2xl"
      aria-label="Beppo circus maze stage"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 42%, ${roomCue.secondaryAccent}2b, transparent 32%), radial-gradient(circle at 50% 62%, ${roomCue.accent}2f, transparent 28%), repeating-linear-gradient(90deg, rgba(127,29,29,0.42) 0 8%, rgba(30,41,59,0.34) 8% 16%)`,
        }}
      />
      <RoomIdentityMotif cue={roomCue} />
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-orange-100/20"
        style={{
          boxShadow: `inset 0 0 52px rgba(0,0,0,0.72), 0 0 36px ${roomCue.dangerPulse ? "#f87171" : threatAccent}55`,
        }}
      />
      <div
        className="absolute left-1/2 top-1/2 grid h-[42%] w-[min(58%,25rem)] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[50%] border bg-cyan-950/36 p-4 text-center"
        style={{ borderColor: `${roomCue.secondaryAccent}88` }}
      >
        <div>
          <div className="font-mono text-[0.62rem] font-black uppercase tracking-[0.24em] text-cyan-100/62">
            {roomCue.mood} · {room.kind} room
          </div>
          <h2 className="mt-1 text-3xl font-black uppercase text-white">{room.label}</h2>
          <p className="mx-auto mt-2 max-w-[18rem] text-xs font-bold leading-snug text-cyan-50/78">
            {routeCue.label}
          </p>
        </div>
      </div>

      {(["north", "east", "south", "west"] as const).map((direction) => (
        <PortalButton
          direction={direction}
          key={direction}
          move={moveByDirection[direction]}
          onMove={onMove}
          recommended={routeCue.recommendedDirections.includes(direction)}
        />
      ))}

      <RouteMemoryMap state={state} />
    </section>
  );
}

function RoomIdentityMotif({ cue }: { cue: BeppoRoomCue }) {
  const spotlights = Array.from({ length: cue.spotlightCount }, (_, index) => ({
    id: `room-spotlight-${index + 1}`,
    left: 14 + ((index * 17) % 72),
    opacity: 0.18 + (index % 3) * 0.08,
    rotate: -20 + index * 8,
  }));
  const props = Array.from({ length: cue.spotlightCount + 2 }, (_, index) => ({
    id: `room-prop-${cue.motif}-${index + 1}`,
    left: 8 + ((index * 19) % 82),
    size: 18 + (index % 3) * 8,
    top: 14 + ((index * 23) % 68),
  }));

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      {spotlights.map((spotlight) => (
        <div
          key={spotlight.id}
          className="absolute top-0 h-[55%] w-16 origin-top rounded-b-full"
          style={{
            background: `linear-gradient(180deg, ${cue.accent}66, transparent)`,
            left: `${spotlight.left}%`,
            opacity: spotlight.opacity,
            transform: `rotate(${spotlight.rotate}deg)`,
          }}
        />
      ))}
      {props.map((prop) => (
        <div
          key={prop.id}
          className="absolute border"
          style={{
            background:
              cue.motif === "mirror"
                ? `linear-gradient(135deg, ${cue.secondaryAccent}55, rgba(255,255,255,0.18))`
                : `${cue.accent}30`,
            borderColor: `${cue.secondaryAccent}66`,
            borderRadius:
              cue.motif === "ticket" || cue.motif === "arcade"
                ? "4px"
                : cue.motif === "key" || cue.motif === "drum"
                  ? "999px"
                  : "50%",
            height: cue.motif === "bridge" ? 6 : prop.size,
            left: `${prop.left}%`,
            opacity: 0.24,
            top: `${prop.top}%`,
            transform:
              cue.motif === "bridge" ? "skewX(-18deg)" : `rotate(${prop.left - prop.top}deg)`,
            width: cue.motif === "bridge" ? prop.size * 3 : prop.size,
          }}
        />
      ))}
    </div>
  );
}

function PortalButton({
  direction,
  move,
  onMove,
  recommended,
}: {
  direction: BeppoDirection;
  move: ReturnType<typeof getAvailableBeppoMoves>[number] | undefined;
  onMove: (direction: BeppoDirection) => void;
  recommended: boolean;
}) {
  const locked = Boolean(move?.lockedBy || move?.lockedByRouteMemory);
  const positionClass: Record<BeppoDirection, string> = {
    east: "right-3 top-1/2 -translate-y-1/2",
    north: "left-1/2 top-3 -translate-x-1/2",
    south: "bottom-3 left-1/2 -translate-x-1/2",
    west: "left-3 top-1/2 -translate-y-1/2",
  };

  return (
    <button
      aria-label={`${DIRECTION_LABELS[direction]} curtain`}
      className={`absolute ${positionClass[direction]} min-w-[7.2rem] rounded-md border px-3 py-2 text-left shadow-2xl transition hover:-translate-y-0.5 focus:outline-none focus:ring-2`}
      onClick={() => onMove(direction)}
      type="button"
      style={{
        background: locked
          ? "rgba(127,29,29,0.7)"
          : recommended
            ? "linear-gradient(135deg, rgba(34,211,238,0.34), rgba(249,115,22,0.28))"
            : "rgba(15,23,42,0.72)",
        borderColor: locked
          ? "rgba(252,165,165,0.55)"
          : recommended
            ? "rgba(103,232,249,0.78)"
            : "rgba(251,146,60,0.35)",
        boxShadow: recommended ? "0 0 26px rgba(34,211,238,0.26)" : undefined,
      }}
    >
      <span className="block font-mono text-[0.58rem] font-black uppercase tracking-[0.2em] text-white/54">
        {DIRECTION_LABELS[direction]}
      </span>
      <span className="mt-1 block text-sm font-black uppercase text-white">
        {move ? move.room.label : "Canvas Wall"}
      </span>
      {move?.lockedBy ? (
        <span className="mt-1 block text-[0.62rem] font-bold uppercase text-red-100">
          Needs {move.lockedBy.replace("-", " ")}
        </span>
      ) : null}
      {move?.lockedByRouteMemory ? (
        <span className="mt-1 block text-[0.62rem] font-bold uppercase text-cyan-100">
          Map {move.lockedByRouteMemory} more
        </span>
      ) : null}
    </button>
  );
}

function BeppoEndingBackdrop({ cue }: { cue: BeppoEndingCue }) {
  const rings = Array.from({ length: cue.ringCount }, (_, index) => ({
    id: `beppo-ending-ring-${index + 1}`,
    inset: 10 + index * 4,
    opacity: Math.max(0.12, 0.38 - index * 0.032),
  }));
  const props = Array.from({ length: cue.propCount }, (_, index) => ({
    id: `beppo-ending-prop-${index + 1}`,
    left: 8 + ((index * 23) % 84),
    rotate: -28 + index * 19,
    top: 10 + ((index * 31) % 76),
  }));

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      data-beppo-ending={cue.variant}
      style={{
        background:
          cue.tone === "escape"
            ? `radial-gradient(circle at 50% 36%, ${cue.accent}33, transparent 38%), radial-gradient(circle at 50% 82%, ${cue.secondaryAccent}22, transparent 30%)`
            : `radial-gradient(circle at 50% 38%, ${cue.accent}3d, transparent 36%), repeating-linear-gradient(90deg, rgba(127,29,29,0.16) 0 5vw, transparent 5vw 10vw)`,
      }}
    >
      {rings.map((ring) => (
        <div
          key={ring.id}
          className="absolute rounded-full border"
          style={{
            borderColor: cue.accent,
            boxShadow: `0 0 22px ${cue.accent}`,
            inset: `${ring.inset}%`,
            opacity: ring.opacity,
          }}
        />
      ))}
      {props.map((prop) => (
        <div
          key={prop.id}
          className="absolute h-12 w-7 rounded-sm border"
          style={{
            background: `${cue.secondaryAccent}22`,
            borderColor: `${cue.secondaryAccent}88`,
            left: `${prop.left}%`,
            opacity: 0.24,
            top: `${prop.top}%`,
            transform: `rotate(${prop.rotate}deg)`,
          }}
        />
      ))}
      <div className="absolute bottom-[16%] left-1/2 -translate-x-1/2 rounded-md border border-white/16 bg-black/48 px-4 py-2 text-center font-mono text-[0.62rem] font-black uppercase tracking-[0.24em] text-white/58 backdrop-blur">
        {cue.statusLabel}
      </div>
    </div>
  );
}

function RouteMemoryMap({ state }: { state: BeppoState }) {
  return (
    <div className="absolute bottom-3 left-3 right-3 overflow-hidden rounded-md border border-orange-200/18 bg-black/54 p-2">
      <div className="absolute inset-0 opacity-40">
        <div className="h-full w-full bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.06)_0_1px,transparent_1px_18px),repeating-linear-gradient(90deg,rgba(255,255,255,0.06)_0_1px,transparent_1px_18px)]" />
      </div>
      <div className="relative grid grid-cols-7 gap-1">
        {BEPPO_ROOMS.map((room) => {
          const visited = state.visitedRoomIds.includes(room.id);
          const current = room.id === state.currentRoomId;

          return (
            <div
              key={room.id}
              className="h-4 rounded-sm border"
              title={room.label}
              style={{
                background: current
                  ? "rgba(34,211,238,0.22)"
                  : visited
                    ? "rgba(249,115,22,0.16)"
                    : "rgba(15,23,42,0.55)",
                borderColor: current ? "rgba(103,232,249,0.86)" : "rgba(251,146,60,0.2)",
                opacity: visited || current ? 1 : 0.52,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
