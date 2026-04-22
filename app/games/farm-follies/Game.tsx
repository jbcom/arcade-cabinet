import {
  CartridgeStartScreen,
  GameOverScreen,
  GameViewport,
  isCabinetRuntimePaused,
  OverlayButton,
} from "@app/shared";
import {
  bankFarmScore,
  createInitialFarmState,
  dropFarmAnimal,
  getFarmRunSummary,
  tickFarmState,
} from "@logic/games/farm-follies/engine/farmSimulation";
import type {
  FarmAnimal,
  FarmStackAnimal,
  FarmState,
} from "@logic/games/farm-follies/engine/types";
import type { SessionMode } from "@logic/shared";
import { useEffect, useState } from "react";

const ANIMAL_EMOJI: Record<FarmAnimal, string> = {
  chick: "CH",
  cow: "CW",
  goat: "GT",
  horse: "HR",
  pig: "PG",
};

const ANIMAL_COLORS: Record<FarmAnimal, string> = {
  chick: "#fde68a",
  cow: "#f8fafc",
  goat: "#d9f99d",
  horse: "#fdba74",
  pig: "#f9a8d4",
};

export default function Game() {
  const [state, setState] = useState<FarmState>(() => createInitialFarmState("standard", "menu"));

  useEffect(() => {
    if (state.phase !== "playing") return undefined;

    let frame = 0;
    let last = performance.now();
    const step = (now: number) => {
      const delta = now - last;
      last = now;
      if (!isCabinetRuntimePaused()) {
        setState((current) => tickFarmState(current, delta));
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frame);
  }, [state.phase]);

  const start = (mode: SessionMode) => {
    setState(createInitialFarmState(mode, "playing"));
  };

  const restart = () => {
    setState(createInitialFarmState(state.sessionMode, "menu"));
  };
  const summary = getFarmRunSummary(state);

  return (
    <GameViewport background="#16230f" data-browser-screenshot-mode="page">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 10%, rgba(250,204,21,0.24), transparent 30%), linear-gradient(180deg, rgba(20,83,45,0.82), rgba(54,24,7,0.96)), repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 46px)",
        }}
      />

      {state.phase === "menu" ? (
        <CartridgeStartScreen
          accent="#84cc16"
          cartridgeId="Slot 12"
          description="Drop animal blocks, merge matching farm tiers, and bank before the wobble eats the run."
          gameSlug="farm-follies"
          kicker="Farm Stacker Cartridge"
          motif="farm"
          onStart={start}
          rules={[
            "Tap a lane to drop the next animal onto the stack.",
            "Matching tiers in the same lane merge into a bigger farm friend.",
            "Standard mode spends recovery lives instead of ending on the first floor touch.",
          ]}
          secondaryAccent="#f59e0b"
          startLabel="Start Stacking"
          title="FARM FOLLIES"
        />
      ) : null}

      {state.phase === "playing" ? (
        <main className="relative z-10 grid h-full grid-rows-[auto_minmax(0,1fr)_auto] gap-3 p-3 sm:p-5">
          <Hud state={state} />
          <section className="grid min-h-0 gap-3 md:grid-cols-[minmax(0,1fr)_320px]">
            <BarnStack stack={state.stack} wobble={state.wobble} />
            <aside className="hidden min-h-0 grid-rows-[auto_auto_minmax(0,1fr)] gap-3 rounded-md border border-lime-200/18 bg-black/42 p-3 shadow-2xl md:grid">
              <div>
                <div className="font-mono text-[0.62rem] font-black uppercase tracking-[0.22em] text-lime-100/52">
                  Next Drop
                </div>
                <div className="mt-2 rounded-md border border-amber-200/24 bg-amber-300/12 p-4 text-center">
                  <div
                    className="text-4xl font-black"
                    style={{ color: ANIMAL_COLORS[state.nextAnimal] }}
                  >
                    {ANIMAL_EMOJI[state.nextAnimal]}
                  </div>
                  <div className="mt-1 font-black uppercase text-amber-50">{state.nextAnimal}</div>
                </div>
              </div>
              <div className="rounded-md border border-white/12 bg-white/[0.05] p-3">
                <div className="font-mono text-[0.6rem] font-black uppercase tracking-[0.2em] text-white/48">
                  Objective
                </div>
                <p className="mt-1 text-sm font-bold leading-snug text-white/82">
                  {state.objective}
                </p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-amber-100/78">
                  {state.lastEvent}
                </p>
              </div>
              <button
                type="button"
                className="self-end rounded-md border border-amber-200/40 bg-amber-300/18 px-4 py-4 text-lg font-black uppercase tracking-[0.12em] text-amber-50 shadow-2xl transition hover:-translate-y-0.5 focus:outline-none focus:ring-2"
                onClick={() => setState((current) => bankFarmScore(current))}
              >
                Bank Score
              </button>
            </aside>
          </section>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 rounded-md border border-lime-200/18 bg-black/44 p-2 md:hidden">
            <div className="min-w-0">
              <div className="font-mono text-[0.58rem] font-black uppercase tracking-[0.2em] text-lime-100/52">
                Next Drop
              </div>
              <div className="truncate text-sm font-black uppercase text-white">
                {state.nextAnimal} / {state.objective}
              </div>
            </div>
            <button
              type="button"
              className="rounded-md border border-amber-200/40 bg-amber-300/18 px-3 py-2 text-sm font-black uppercase tracking-[0.1em] text-amber-50"
              onClick={() => setState((current) => bankFarmScore(current))}
            >
              Bank
            </button>
          </div>
          <nav className="grid grid-cols-3 gap-2">
            {([-1, 0, 1] as const).map((lane) => (
              <button
                key={lane}
                type="button"
                className="min-h-16 rounded-md border border-lime-200/28 bg-lime-300/14 px-3 py-2 font-black uppercase tracking-[0.12em] text-lime-50 shadow-xl transition hover:-translate-y-0.5 focus:outline-none focus:ring-2"
                onClick={() => setState((current) => dropFarmAnimal(current, lane))}
              >
                Drop {lane < 0 ? "Left" : lane > 0 ? "Right" : "Center"}
              </button>
            ))}
          </nav>
        </main>
      ) : null}

      {state.phase === "collapsed" ? (
        <GameOverScreen
          accent="#f59e0b"
          result={{
            mode: state.sessionMode,
            score: summary.bankedScore,
            slug: "farm-follies",
            status: "failed",
            summary: `Tower collapsed after ${summary.dropCount} drops`,
          }}
          title="Tower Down"
          subtitle={`Banked ${summary.bankedScore}/${summary.bankTarget} points. Drop wider and bank before wobble peaks.`}
          actions={<OverlayButton onClick={restart}>Stack Again</OverlayButton>}
        />
      ) : null}

      {state.phase === "banked" ? (
        <GameOverScreen
          accent="#84cc16"
          result={{
            milestones: ["first-banked-barn"],
            mode: state.sessionMode,
            score: summary.bankedScore,
            slug: "farm-follies",
            status: "completed",
            summary: `Banked ${summary.bankedScore} points`,
          }}
          title="Barn Banked"
          subtitle={`${summary.bankedScore} points locked after ${summary.dropCount} drops and ${summary.elapsedSeconds}s. Replay for a cleaner tower and higher merges.`}
          actions={<OverlayButton onClick={restart}>Stack Again</OverlayButton>}
        />
      ) : null}
    </GameViewport>
  );
}

function Hud({ state }: { state: FarmState }) {
  return (
    <header className="grid gap-2 rounded-md border border-lime-200/18 bg-black/46 p-3 shadow-2xl sm:grid-cols-5">
      <Metric label="Score" value={`${state.score}`} accent="#fef08a" />
      <Metric label="Banked" value={`${state.bankedScore}`} accent="#f59e0b" />
      <Metric label="Lives" value={`${state.lives}`} accent="#86efac" />
      <Metric label="Wobble" value={`${Math.round(state.wobble)}%`} accent="#f9a8d4" />
      <Metric label="Mode" value={state.sessionMode} accent="#84cc16" />
    </header>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-md border border-white/12 bg-white/[0.04] p-2">
      <div className="font-mono text-[0.58rem] font-black uppercase tracking-[0.2em] text-white/45">
        {label}
      </div>
      <div className="mt-1 text-lg font-black uppercase" style={{ color: accent }}>
        {value}
      </div>
    </div>
  );
}

function BarnStack({ stack, wobble }: { stack: FarmStackAnimal[]; wobble: number }) {
  return (
    <div className="relative min-h-[300px] overflow-hidden rounded-md border border-amber-200/20 bg-gradient-to-b from-sky-950/28 to-lime-950/72 shadow-2xl">
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-lime-600/55 to-lime-900" />
      <div className="absolute inset-x-[12%] bottom-14 h-[70%] rounded-t-md border-x-8 border-t-8 border-red-900/76 bg-red-950/18" />
      <div className="absolute bottom-14 left-1/2 h-[78%] w-[min(58vw,360px)] -translate-x-1/2">
        {stack.map((animal, index) => {
          const laneOffset = animal.lane * 34;
          const wobbleOffset = Math.sin(index * 1.7 + wobble * 0.08) * Math.min(18, wobble * 0.12);

          return (
            <div
              key={animal.id}
              className="absolute left-1/2 grid h-12 w-24 place-items-center rounded-md border-2 font-black uppercase shadow-xl"
              style={{
                background: ANIMAL_COLORS[animal.animal],
                borderColor: "rgba(255,255,255,0.7)",
                bottom: index * 42,
                color: "#1f1307",
                transform: `translateX(calc(-50% + ${laneOffset + wobbleOffset}px)) rotate(${wobbleOffset * 0.28}deg)`,
              }}
            >
              {ANIMAL_EMOJI[animal.animal]} T{animal.tier + 1}
            </div>
          );
        })}
      </div>
      <div className="absolute left-4 top-4 rounded-md border border-white/12 bg-black/44 px-3 py-2 font-mono text-[0.62rem] font-black uppercase tracking-[0.18em] text-white/56">
        Merge same lane pairs
      </div>
    </div>
  );
}
