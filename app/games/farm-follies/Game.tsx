import {
  CartridgeStartScreen,
  GameOverScreen,
  GameViewport,
  isCabinetRuntimePaused,
  OverlayButton,
  useRunSnapshotAutosave,
} from "@app/shared";
import {
  bankFarmScore,
  createInitialFarmState,
  dropFarmAnimal,
  getFarmAnimalPoseCue,
  getFarmCollapseCue,
  getFarmModeTuning,
  getFarmRunSummary,
  getFarmStackCue,
  getFarmWobbleBand,
  getFarmWobbleRatio,
  tickFarmState,
} from "@logic/games/farm-follies/engine/farmSimulation";
import type {
  FarmAnimal,
  FarmCollapseCue,
  FarmState,
} from "@logic/games/farm-follies/engine/types";
import { DEFAULT_SESSION_MODE, type GameSaveSlot, type SessionMode } from "@logic/shared";
import { useEffect, useState } from "react";

const ANIMAL_COLORS: Record<FarmAnimal, string> = {
  chick: "#fde68a",
  cow: "#f8fafc",
  goat: "#d9f99d",
  horse: "#fdba74",
  pig: "#f9a8d4",
};

const ANIMAL_ACCENTS: Record<FarmAnimal, string> = {
  chick: "#f97316",
  cow: "#111827",
  goat: "#65a30d",
  horse: "#7c2d12",
  pig: "#be185d",
};

export default function Game() {
  const [state, setState] = useState<FarmState>(() =>
    createInitialFarmState(DEFAULT_SESSION_MODE, "menu")
  );

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

  const start = (mode: SessionMode, saveSlot?: GameSaveSlot) => {
    setState(resolveFarmStartState(mode, saveSlot));
  };

  const restart = () => {
    setState(createInitialFarmState(state.sessionMode, "menu"));
  };
  const summary = getFarmRunSummary(state);
  const farmCue = getFarmStackCue(state);
  const collapseCue = getFarmCollapseCue(state);

  useRunSnapshotAutosave({
    active: state.phase === "playing",
    progressSummary: `${state.dropCount} drops · ${state.score + state.bankedScore} score`,
    slug: "farm-follies",
    snapshot: state,
  });

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
            <BarnStack state={state} />
            <aside className="hidden min-h-0 grid-rows-[auto_auto_minmax(0,1fr)_auto] gap-3 rounded-md border border-lime-200/18 bg-black/42 p-3 shadow-2xl md:grid">
              <div>
                <div className="font-mono text-[0.62rem] font-black uppercase tracking-[0.22em] text-lime-100/52">
                  Next Drop
                </div>
                <div className="mt-2 rounded-md border border-amber-200/24 bg-amber-300/12 p-4 text-center">
                  <div className="grid place-items-center">
                    <AnimalToken animal={state.nextAnimal} tier={state.nextTier} size="large" />
                  </div>
                  <div className="mt-1 font-black uppercase text-amber-50">{state.nextAnimal}</div>
                </div>
              </div>
              {state.lastAbility ? (
                <div className="rounded-md border border-fuchsia-200/28 bg-fuchsia-300/10 p-3">
                  <div className="font-mono text-[0.58rem] font-black uppercase tracking-[0.2em] text-fuchsia-100/58">
                    Ability
                  </div>
                  <p className="mt-1 text-sm font-black uppercase text-fuchsia-50">
                    {state.lastAbility.ability.replace("-", " ")}
                  </p>
                  <p className="mt-1 text-xs font-semibold leading-snug text-fuchsia-100/72">
                    -{state.lastAbility.wobbleRecovery} wobble / +{state.lastAbility.scoreBonus} pts
                  </p>
                </div>
              ) : null}
              <div className="min-h-0 overflow-hidden rounded-md border border-white/12 bg-white/[0.05] p-3">
                <div className="font-mono text-[0.6rem] font-black uppercase tracking-[0.2em] text-white/48">
                  Objective
                </div>
                <p className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-white/82">
                  {state.objective}
                </p>
                <p className="mt-2 line-clamp-2 text-xs font-semibold uppercase tracking-[0.08em] text-amber-100/78">
                  {state.lastEvent}
                </p>
              </div>
              <button
                type="button"
                className="self-end rounded-md border border-amber-200/40 bg-amber-300/18 px-4 py-2 text-base font-black uppercase tracking-[0.12em] text-amber-50 shadow-2xl transition hover:-translate-y-0.5 focus:outline-none focus:ring-2"
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
              <div className="mt-1 flex items-center gap-2">
                <AnimalToken animal={state.nextAnimal} tier={state.nextTier} size="small" />
                <div className="min-w-0 truncate text-sm font-black uppercase text-white">
                  {state.nextAnimal} / Best {farmCue.recommendedLaneLabel}
                </div>
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
                style={{
                  background:
                    lane === farmCue.recommendedLane
                      ? "linear-gradient(135deg, rgba(250,204,21,0.26), rgba(132,204,22,0.22))"
                      : undefined,
                  borderColor:
                    lane === farmCue.recommendedLane ? "rgba(250,204,21,0.58)" : undefined,
                }}
                onClick={() => setState((current) => dropFarmAnimal(current, lane))}
              >
                Drop {lane < 0 ? "Left" : lane > 0 ? "Right" : "Center"}
              </button>
            ))}
          </nav>
        </main>
      ) : null}

      {state.phase === "collapsed" ? (
        <>
          <FarmCollapseBackdrop state={state} cue={collapseCue} />
          <GameOverScreen
            accent="#f59e0b"
            result={{
              mode: state.sessionMode,
              score: summary.bankedScore,
              slug: "farm-follies",
              stats: {
                bankedPercent: collapseCue.bankedPercent,
                scatterCount: collapseCue.scatterCount,
                severity: collapseCue.severity,
              },
              status: "failed",
              summary: `${collapseCue.title} after ${summary.dropCount} drops`,
            }}
            title={collapseCue.title}
            subtitle={`${collapseCue.message} Banked ${summary.bankedScore}/${summary.bankTarget} points. ${collapseCue.recoveryAdvice}`}
            actions={<OverlayButton onClick={restart}>Stack Again</OverlayButton>}
          />
        </>
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

function resolveFarmStartState(mode: SessionMode, saveSlot?: GameSaveSlot): FarmState {
  const snapshot = saveSlot?.snapshot;
  if (isFarmSnapshot(snapshot)) {
    const restored = snapshot as FarmState;
    return {
      ...restored,
      phase: "playing",
      sessionMode: mode,
    };
  }

  return createInitialFarmState(mode, "playing");
}

function isFarmSnapshot(snapshot: unknown): snapshot is FarmState {
  const value = snapshot as Partial<FarmState> | undefined;
  return Boolean(
    value &&
      typeof value === "object" &&
      typeof value.elapsedMs === "number" &&
      typeof value.score === "number" &&
      typeof value.bankedScore === "number" &&
      typeof value.nextAnimal === "string" &&
      Array.isArray(value.stack)
  );
}

function Hud({ state }: { state: FarmState }) {
  const cue = getFarmStackCue(state);

  return (
    <header className="grid grid-cols-3 gap-2 rounded-md border border-lime-200/18 bg-black/46 p-3 shadow-2xl sm:grid-cols-6">
      <Metric label="Score" value={`${state.score}`} accent="#fef08a" />
      <Metric label="Banked" value={`${state.bankedScore}`} accent="#f59e0b" />
      <Metric label="Lives" value={`${state.lives}`} accent="#86efac" />
      <Metric label="Wobble" value={`${Math.round(state.wobble)}%`} accent="#f9a8d4" />
      <Metric label="Bank Ready" value={`${cue.bankProgressPercent}%`} accent="#facc15" />
      <Metric label="Mode" value={state.sessionMode} accent="#84cc16" />
      <div className="col-span-3 rounded-md border border-white/12 bg-white/[0.04] p-2 sm:col-span-6">
        <div className="font-mono text-[0.58rem] font-black uppercase tracking-[0.2em] text-white/45">
          Best Lane · {cue.recommendedLaneLabel}
        </div>
        <div className="mt-1 text-sm font-black uppercase text-lime-50">
          {cue.recommendedAction}
        </div>
      </div>
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

function AnimalToken({
  animal,
  size = "normal",
  tier,
}: {
  animal: FarmAnimal;
  size?: "small" | "normal" | "large";
  tier: number;
}) {
  const tokenSize = size === "large" ? "h-20 w-24" : size === "small" ? "h-10 w-12" : "h-12 w-16";
  const eyeSize = size === "small" ? "h-1 w-1" : "h-1.5 w-1.5";
  const accent = ANIMAL_ACCENTS[animal];
  const pose = getFarmAnimalPoseCue(animal, tier);

  return (
    <div
      className={`relative ${tokenSize} overflow-hidden rounded-md border-2 shadow-[inset_0_-10px_16px_rgba(0,0,0,0.18),0_10px_22px_rgba(0,0,0,0.24)]`}
      style={{
        background: `linear-gradient(180deg, ${ANIMAL_COLORS[animal]}, color-mix(in srgb, ${ANIMAL_COLORS[animal]} 76%, #000 24%))`,
        borderColor: "rgba(255,255,255,0.72)",
      }}
    >
      {animal === "goat" ? (
        <>
          <span
            className="absolute left-2 top-0 h-5 w-2 -rotate-12 rounded-sm bg-stone-100"
            aria-hidden="true"
          />
          <span
            className="absolute right-2 top-0 h-5 w-2 rotate-12 rounded-sm bg-stone-100"
            aria-hidden="true"
          />
          <span
            className="absolute left-1/2 top-[48%] h-4 w-2 -translate-x-1/2 rounded-b-full bg-stone-700/80"
            aria-hidden="true"
          />
        </>
      ) : null}
      {animal === "cow" ? (
        <>
          <span className="absolute left-2 top-2 h-5 w-7 rounded-full bg-slate-900/82" />
          <span className="absolute bottom-2 right-3 h-4 w-6 rounded-full bg-slate-900/82" />
          <span
            className="absolute left-1/2 bottom-2 h-3 w-3 -translate-x-1/2 rounded-full border border-amber-950/40 bg-amber-300"
            aria-hidden="true"
          />
        </>
      ) : null}
      {animal === "horse" ? (
        <>
          <span className="absolute left-0 top-0 h-full w-4 bg-orange-950/72" aria-hidden="true" />
          <span
            className="absolute right-0 top-3 h-8 w-3 rounded-l-full bg-orange-950/60"
            aria-hidden="true"
          />
          <span
            className="absolute bottom-1 left-4 h-2 w-8 rounded-full bg-orange-950/54"
            aria-hidden="true"
          />
        </>
      ) : null}
      {pose.showMotionMarks ? (
        <span
          className="absolute right-1 top-1 h-5 w-5 rounded-full border-2 border-white/72 border-l-transparent border-b-transparent"
          aria-hidden="true"
        />
      ) : null}
      <span
        className={`absolute left-[32%] top-[34%] ${eyeSize} rounded-full bg-slate-950`}
        aria-hidden="true"
      />
      <span
        className={`absolute right-[32%] top-[34%] ${eyeSize} rounded-full bg-slate-950`}
        aria-hidden="true"
      />
      {animal === "pig" ? (
        <>
          <span
            className="absolute left-1 top-1 h-4 w-4 -rotate-12 rounded-sm bg-pink-200"
            aria-hidden="true"
          />
          <span
            className="absolute right-1 top-1 h-4 w-4 rotate-12 rounded-sm bg-pink-200"
            aria-hidden="true"
          />
          <span
            className="absolute left-1/2 top-[52%] h-4 w-8 -translate-x-1/2 rounded-full border border-pink-950/40 bg-pink-200"
            aria-hidden="true"
          />
        </>
      ) : null}
      {animal === "chick" ? (
        <>
          <span
            className="absolute left-1 top-[45%] h-4 w-5 rounded-full bg-yellow-200/78"
            aria-hidden="true"
          />
          <span
            className="absolute left-1/2 top-[52%] h-0 w-0 -translate-x-1/2 border-x-[6px] border-t-[8px] border-x-transparent border-t-orange-500"
            aria-hidden="true"
          />
        </>
      ) : null}
      {pose.showRibbon ? (
        <span
          className="absolute left-1 top-1 rounded-sm bg-rose-500 px-1 font-mono text-[0.45rem] font-black uppercase text-white"
          aria-hidden="true"
        >
          {pose.expression}
        </span>
      ) : null}
      <span
        className="absolute bottom-1 right-1 rounded-sm bg-black/42 px-1 font-mono text-[0.52rem] font-black text-white"
        style={{ color: animal === "cow" ? "#f8fafc" : "#ffffff" }}
      >
        T{tier + 1}
      </span>
      <span
        className="absolute bottom-1 left-1 h-1.5 w-7 rounded-full"
        style={{ background: accent }}
        aria-hidden="true"
      />
    </div>
  );
}

function FarmCollapseBackdrop({ cue, state }: { cue: FarmCollapseCue; state: FarmState }) {
  const animals =
    state.stack.length > 0
      ? state.stack.slice(-cue.scatterCount)
      : ([
          { animal: "chick", id: "fallback-chick", lane: -1, tier: 0 },
          { animal: "goat", id: "fallback-goat", lane: 0, tier: 1 },
          { animal: "pig", id: "fallback-pig", lane: 1, tier: 2 },
        ] as const);
  const direction = cue.spillDirection || 1;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        background:
          cue.severity === "auction-loss"
            ? "radial-gradient(circle at 50% 30%, rgba(250,204,21,0.24), transparent 32%), linear-gradient(180deg, rgba(68,26,7,0.74), rgba(15,23,42,0.92))"
            : "radial-gradient(circle at 50% 30%, rgba(251,113,133,0.22), transparent 32%), linear-gradient(180deg, rgba(68,26,7,0.74), rgba(15,23,42,0.92))",
      }}
    >
      <div className="absolute inset-x-[12%] bottom-24 h-5 -rotate-6 rounded-full bg-red-950 shadow-[0_0_22px_rgba(0,0,0,0.4)]" />
      <div className="absolute bottom-16 left-1/2 h-24 w-[min(70vw,34rem)] -translate-x-1/2 rounded-t-full border-t-8 border-amber-900/80 bg-amber-950/28" />
      {animals.map((animal, index) => {
        const x = 50 + direction * (10 + index * 5) + animal.lane * 8;
        const y = 64 - index * 4;
        const rotation = direction * (18 + index * 13);

        return (
          <div
            key={`collapse-${animal.id}`}
            className="absolute grid place-items-center"
            style={{
              left: `${Math.max(8, Math.min(88, x))}%`,
              top: `${Math.max(16, Math.min(78, y))}%`,
              transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
              opacity: 0.9,
            }}
          >
            <AnimalToken animal={animal.animal} tier={animal.tier} size="normal" />
          </div>
        );
      })}
      <div className="absolute left-1/2 top-[18%] -translate-x-1/2 rounded-md border border-amber-100/24 bg-black/36 px-4 py-2 font-mono text-[0.62rem] font-black uppercase tracking-[0.22em] text-amber-100/72">
        {cue.severity.replace("-", " ")} · {cue.bankedPercent}% banked
      </div>
    </div>
  );
}

function BarnStack({ state }: { state: FarmState }) {
  const cue = getFarmStackCue(state);
  const wobbleBand = getFarmWobbleBand(state);
  const wobbleRatio = getFarmWobbleRatio(state);
  const stack = state.stack;
  const wobble = state.wobble;
  const wobbleLimit = getFarmModeTuning(state.sessionMode).wobbleLimit;
  const warningColor =
    wobbleBand === "danger" ? "#fb7185" : wobbleBand === "sway" ? "#fbbf24" : "#84cc16";

  return (
    <div
      className="relative min-h-[300px] overflow-hidden rounded-md border bg-gradient-to-b from-sky-950/28 to-lime-950/72 shadow-2xl"
      style={{
        borderColor:
          wobbleBand === "danger"
            ? "rgba(251,113,133,0.58)"
            : wobbleBand === "sway"
              ? "rgba(251,191,36,0.42)"
              : "rgba(253,186,116,0.22)",
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            wobbleBand === "danger"
              ? "radial-gradient(circle at 50% 20%, rgba(251,113,133,0.18), transparent 34%)"
              : "radial-gradient(circle at 50% 18%, rgba(250,204,21,0.1), transparent 38%)",
          opacity: wobbleBand === "steady" ? 0.55 : 1,
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-lime-600/55 to-lime-900" />
      <div className="absolute inset-x-[12%] bottom-14 h-[70%] rounded-t-md border-x-8 border-t-8 border-red-900/76 bg-red-950/18" />
      {([-1, 0, 1] as const).map((lane) => {
        const isRecommended = lane === cue.recommendedLane;
        return (
          <div
            key={`lane-guide-${lane}`}
            aria-hidden="true"
            className="absolute bottom-14 top-20 w-24 -translate-x-1/2 rounded-t-md border-x"
            style={{
              background: isRecommended
                ? "linear-gradient(180deg, rgba(250,204,21,0.18), rgba(132,204,22,0.12))"
                : "rgba(255,255,255,0.025)",
              borderColor: isRecommended ? "rgba(250,204,21,0.48)" : "rgba(255,255,255,0.08)",
              left: `calc(50% + ${lane * 34}px)`,
              opacity: isRecommended ? 1 : 0.42,
            }}
          />
        );
      })}
      <div
        aria-hidden="true"
        className="absolute top-20 grid -translate-x-1/2 place-items-center"
        style={{
          left: `calc(50% + ${cue.recommendedLane * 34}px)`,
          opacity: cue.wobbleBand === "danger" ? 0.96 : 0.72,
          transform: `translateX(-50%) rotate(${(wobbleRatio - 0.5) * 4}deg)`,
        }}
      >
        <AnimalToken animal={state.nextAnimal} tier={state.nextTier} size="small" />
        <div className="mt-1 rounded-sm bg-black/64 px-2 py-1 font-mono text-[0.52rem] font-black uppercase tracking-[0.14em] text-amber-100">
          Best Drop
        </div>
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-x-[16%] bottom-14 h-[70%] rounded-t-md border-x-2 border-dashed"
        style={{
          borderColor: warningColor,
          opacity: wobbleBand === "steady" ? 0.18 : 0.55,
          transform: `skewX(${(wobbleRatio - 0.5) * 5}deg)`,
        }}
      />
      <div className="absolute bottom-14 left-1/2 h-[78%] w-[min(58vw,360px)] -translate-x-1/2">
        {stack.map((animal, index) => {
          const laneOffset = animal.lane * 34;
          const wobbleOffset = Math.sin(index * 1.7 + wobble * 0.08) * Math.min(18, wobble * 0.12);

          return (
            <div
              key={animal.id}
              className="absolute left-1/2 grid h-14 w-24 place-items-center rounded-md border-2 font-black uppercase shadow-xl"
              style={{
                borderColor: "rgba(255,255,255,0.7)",
                bottom: index * 42,
                transform: `translateX(calc(-50% + ${laneOffset + wobbleOffset}px)) rotate(${wobbleOffset * 0.28}deg)`,
              }}
            >
              <AnimalToken animal={animal.animal} tier={animal.tier} />
            </div>
          );
        })}
      </div>
      <div className="absolute left-4 top-4 rounded-md border border-white/12 bg-black/54 px-3 py-2 font-mono text-[0.62rem] font-black uppercase tracking-[0.18em] text-white/66">
        {cue.mergePreviewAnimal
          ? `Merge toward ${cue.mergePreviewAnimal}`
          : `Build ${cue.recommendedLaneLabel}`}
      </div>
      <div className="absolute right-4 top-4 grid w-28 gap-1 rounded-md border border-white/12 bg-black/54 p-2">
        <div className="flex items-center justify-between font-mono text-[0.55rem] font-black uppercase tracking-[0.16em] text-white/52">
          <span>Sway</span>
          <span>
            {Math.round(wobble)}/{wobbleLimit}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full"
            style={{
              background: warningColor,
              width: `${Math.round(wobbleRatio * 100)}%`,
            }}
          />
        </div>
        <div
          className="font-mono text-[0.56rem] font-black uppercase"
          style={{ color: warningColor }}
        >
          {wobbleBand === "danger" ? "Bank now" : wobbleBand === "sway" ? "Widen drops" : "Stable"}
        </div>
      </div>
    </div>
  );
}
