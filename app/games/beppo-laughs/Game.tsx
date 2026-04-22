import { CartridgeStartScreen, GameOverScreen, GameViewport, OverlayButton } from "@app/shared";
import {
  advanceBeppoTime,
  BEPPO_ROOMS,
  createInitialBeppoState,
  getAvailableBeppoMoves,
  getBeppoRunSummary,
  getCurrentBeppoRoom,
  moveBeppo,
} from "@logic/games/beppo-laughs/engine/beppoSimulation";
import type { BeppoDirection, BeppoState } from "@logic/games/beppo-laughs/engine/types";
import type { SessionMode } from "@logic/shared";
import { useEffect, useMemo, useState } from "react";

const DIRECTION_LABELS: Record<BeppoDirection, string> = {
  east: "East",
  north: "North",
  south: "South",
  west: "West",
};

export default function Game() {
  const [state, setState] = useState<BeppoState>(() => createInitialBeppoState("standard", "menu"));

  useEffect(() => {
    if (state.phase !== "playing") return undefined;

    let frame = 0;
    let last = performance.now();
    const step = (now: number) => {
      const delta = now - last;
      last = now;
      setState((current) => advanceBeppoTime(current, delta));
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frame);
  }, [state.phase]);

  const start = (mode: SessionMode) => {
    setState(createInitialBeppoState(mode, "playing"));
  };

  const restart = () => {
    setState(createInitialBeppoState(state.sessionMode, "menu"));
  };

  const room = getCurrentBeppoRoom(state);
  const moves = useMemo(() => getAvailableBeppoMoves(state), [state]);
  const summary = getBeppoRunSummary(state);

  return (
    <GameViewport background="#130706" data-browser-screenshot-mode="page">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 12%, rgba(251,146,60,0.34), transparent 28%), linear-gradient(180deg, rgba(69,10,10,0.4), rgba(7,2,2,0.96)), repeating-linear-gradient(90deg, rgba(249,115,22,0.22) 0 7vw, rgba(153,27,27,0.22) 7vw 14vw)",
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
          <Hud state={state} />
          <section className="grid min-h-0 gap-3 md:grid-cols-[1fr_minmax(250px,0.54fr)]">
            <MazeMap state={state} />
            <div className="grid min-h-0 grid-rows-[auto_1fr_auto] gap-3 rounded-md border border-orange-200/20 bg-black/48 p-3 shadow-2xl">
              <div>
                <div className="font-mono text-[0.65rem] font-black uppercase tracking-[0.24em] text-orange-200/70">
                  Current Room
                </div>
                <h1 className="mt-1 text-3xl font-black uppercase text-white">{room.label}</h1>
                <p className="mt-2 text-sm font-semibold leading-snug text-orange-50/72">
                  {state.lastEvent}
                </p>
              </div>
              <div className="min-h-0 rounded-md border border-cyan-200/12 bg-cyan-950/18 p-3">
                <div className="font-mono text-[0.62rem] font-black uppercase tracking-[0.22em] text-cyan-100/62">
                  Objective
                </div>
                <p className="mt-2 text-sm font-bold leading-snug text-cyan-50">
                  {state.objective}
                </p>
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
              <nav className="grid grid-cols-2 gap-2">
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
            summary: `Escaped after mapping ${summary.roomsMapped} rooms`,
          }}
          title="Escaped"
          subtitle={`You left after mapping ${summary.roomsMapped}/${summary.routeMemoryTarget} rooms with ${summary.composure}% composure.`}
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
            summary: `Lost after mapping ${summary.roomsMapped} rooms`,
          }}
          title="The Laugh Wins"
          subtitle="Composure hit zero. Choose cleaner routes and breathe after a mistake."
          actions={<OverlayButton onClick={restart}>Try Again</OverlayButton>}
        />
      ) : null}
    </GameViewport>
  );
}

function Hud({ state }: { state: BeppoState }) {
  return (
    <header className="grid gap-2 rounded-md border border-orange-200/18 bg-black/48 p-3 shadow-2xl sm:grid-cols-4">
      <Metric label="Composure" value={`${Math.round(state.composure)}%`} accent="#22d3ee" />
      <Metric label="Fear" value={`${Math.round(state.fear)}%`} accent="#fb923c" />
      <Metric label="Despair" value={`${Math.round(state.despair)}%`} accent="#f87171" />
      <Metric label="Mode" value={state.sessionMode} accent="#facc15" />
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

function MazeMap({ state }: { state: BeppoState }) {
  return (
    <div className="relative min-h-[270px] overflow-hidden rounded-md border border-orange-200/20 bg-black/46 p-4 shadow-2xl">
      <div className="absolute inset-0 opacity-40">
        <div className="h-full w-full bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.06)_0_1px,transparent_1px_18px),repeating-linear-gradient(90deg,rgba(255,255,255,0.06)_0_1px,transparent_1px_18px)]" />
      </div>
      <div className="relative grid h-full min-h-[250px] grid-cols-3 auto-rows-fr gap-2 sm:grid-cols-4">
        {BEPPO_ROOMS.map((room, index) => {
          const visited = state.visitedRoomIds.includes(room.id);
          const current = room.id === state.currentRoomId;

          return (
            <div
              key={room.id}
              className="grid place-items-center rounded-md border p-2 text-center"
              style={{
                background: current
                  ? "rgba(34,211,238,0.22)"
                  : visited
                    ? "rgba(249,115,22,0.16)"
                    : "rgba(15,23,42,0.55)",
                borderColor: current ? "rgba(103,232,249,0.86)" : "rgba(251,146,60,0.2)",
                gridColumn: (index % 3) + 1,
                gridRow: Math.floor(index / 3) + 1,
              }}
            >
              <span className="text-xs font-black uppercase leading-tight text-white">
                {visited || current ? room.label : "Canvas Wall"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
