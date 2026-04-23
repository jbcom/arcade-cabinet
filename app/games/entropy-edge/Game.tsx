import {
  CartridgeStartScreen,
  FloatingJoystick,
  GameOverScreen,
  GameViewport,
  OverlayButton,
  PhaseTrait,
  ScoreTrait,
  TimerTrait,
  useContainerSize,
  useGameLoop,
  useRunSnapshotAutosave,
} from "@app/shared";
import {
  createInitialState,
  didLose,
  didWin,
  getEntropyCompletionCue,
  getEntropyRunSummary,
  isRunComplete,
  nextLevel,
  restartGame,
  startGame,
  tick,
} from "@logic/games/entropy-edge/engine/simulation";
import type { EntropyState, Vec2 } from "@logic/games/entropy-edge/engine/types";
import { EntropyTrait } from "@logic/games/entropy-edge/store/traits";
import { entropyEntity, entropyWorld } from "@logic/games/entropy-edge/store/world";
import type { GameSaveSlot, SessionMode } from "@logic/shared";
import { useTrait, WorldProvider } from "koota/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EdgeScene } from "./r3f/EdgeScene";
import { HUD } from "./ui/HUD";

function useKeyboardMovementInput(): Vec2 {
  const [input, setInput] = useState<Vec2>({ x: 0, y: 0 });

  useEffect(() => {
    const pressed = new Set<string>();
    const update = () => {
      setInput({
        x:
          (pressed.has("arrowright") || pressed.has("d") ? 1 : 0) -
          (pressed.has("arrowleft") || pressed.has("a") ? 1 : 0),
        y:
          (pressed.has("arrowdown") || pressed.has("s") ? 1 : 0) -
          (pressed.has("arrowup") || pressed.has("w") ? 1 : 0),
      });
    };
    const handleDown = (event: KeyboardEvent) => {
      pressed.add(event.key.toLowerCase());
      update();
    };
    const handleUp = (event: KeyboardEvent) => {
      pressed.delete(event.key.toLowerCase());
      update();
    };
    window.addEventListener("keydown", handleDown);
    window.addEventListener("keyup", handleUp);
    return () => {
      window.removeEventListener("keydown", handleDown);
      window.removeEventListener("keyup", handleUp);
    };
  }, []);

  return input;
}

function EntropyApp() {
  const mountRef = useRef<HTMLDivElement>(null);
  const initialState = useMemo(() => createInitialState(), []);

  const phaseData = (useTrait(entropyEntity, PhaseTrait) as { phase: string } | undefined) ?? {
    phase: "menu",
  };
  const phase = phaseData.phase;

  const state = (useTrait(entropyEntity, EntropyTrait) as EntropyState | undefined) ?? initialState;

  const scoreData = (useTrait(entropyEntity, ScoreTrait) as
    | { value: number; label: string }
    | undefined) ?? { value: 0, label: "SCORE" };

  const keyboardMovement = useKeyboardMovementInput();
  const [touchMovement, setTouchMovement] = useState<Vec2>({ x: 0, y: 0 });
  const movement =
    touchMovement.x !== 0 || touchMovement.y !== 0 ? touchMovement : keyboardMovement;
  useContainerSize(mountRef);

  const readState = useCallback(
    () => (entropyEntity.get(EntropyTrait) as EntropyState | undefined) ?? initialState,
    [initialState]
  );

  const writeState = useCallback((next: EntropyState) => {
    entropyEntity.set(EntropyTrait, next);
  }, []);

  useGameLoop(
    (deltaMs) => {
      if (phase !== "playing") return;
      const current = readState();
      const next = tick(current, deltaMs, movement);
      writeState(next);

      entropyEntity.set(ScoreTrait, { value: next.score, label: "SCORE" });
      entropyEntity.set(TimerTrait, {
        elapsedMs: next.elapsedMs,
        remainingMs: next.timeMs,
        label: "STABILITY",
      });

      if (didLose(next)) {
        entropyEntity.set(PhaseTrait, { phase: "gameover" });
      } else if (didWin(next)) {
        entropyEntity.set(PhaseTrait, { phase: "win" });
      }
    },
    [phase, movement.x, movement.y]
  );

  const isPlaying = phase === "playing";
  const summary = getEntropyRunSummary(state);
  const runComplete = isRunComplete(state);
  const completionCue = getEntropyCompletionCue(state);

  useRunSnapshotAutosave({
    active: phase === "playing",
    progressSummary: `Sector ${summary.sector}/${summary.sectorsRequired} · ${summary.score} score`,
    slug: "entropy-edge",
    snapshot: state,
  });

  return (
    <GameViewport ref={mountRef} background="#060d1a" data-browser-screenshot-mode="page">
      <EdgeScene state={state} isPlaying={isPlaying} />

      {phase === "menu" ? (
        <CartridgeStartScreen
          accent="#38bdf8"
          cartridgeId="Slot 04"
          description="Hold a collapsing resonance field together at the edge of failure."
          gameSlug="entropy-edge"
          kicker="Resonance Cartridge"
          motif="entropy"
          onStart={(mode, saveSlot) => {
            const next = resolveEntropyStartState(mode, saveSlot, readState());
            writeState(next);
            entropyEntity.set(PhaseTrait, { phase: "playing" });
            entropyEntity.set(ScoreTrait, { value: next.score, label: "SCORE" });
            entropyEntity.set(TimerTrait, {
              elapsedMs: next.elapsedMs,
              remainingMs: next.timeMs,
              label: "STABILITY",
            });
          }}
          rules={[
            "Secure glowing anchors before stability runs out.",
            "Build resonance to trigger surge clears and bonus score.",
            "Read blocked cells, falling cells, and anchors as separate threats.",
          ]}
          secondaryAccent="#ff0055"
          startLabel="Initialize Link"
          title="Entropy's Edge"
        />
      ) : null}

      {phase === "playing" ? <HUD state={state} /> : null}
      {phase === "playing" ? (
        <FloatingJoystick
          accent="#67e8f9"
          label="Entropy movement joystick"
          onChange={(vector) => setTouchMovement({ x: vector.x, y: vector.y })}
        />
      ) : null}

      {phase === "win" ? (
        <GameOverScreen
          result={
            runComplete
              ? {
                  milestones: ["entropy-run-complete"],
                  mode: state.sessionMode,
                  score: summary.score,
                  slug: "entropy-edge",
                  status: "completed",
                  stats: {
                    anchors: summary.totalAnchors,
                    rating: completionCue.rating,
                    stabilitySeconds: completionCue.stabilityCarrySeconds,
                  },
                  summary: `${completionCue.rating}: stabilized ${summary.sectorsRequired} sectors`,
                }
              : undefined
          }
          title={completionCue.title}
          subtitle={
            runComplete
              ? `${completionCue.message} ${completionCue.rating}. Score: ${summary.score} pts.`
              : `${completionCue.message} ${completionCue.stabilityCarrySeconds}s reserve carried forward. ${completionCue.nextAction}`
          }
          actions={
            <OverlayButton
              type="button"
              onClick={() => {
                writeState(
                  runComplete ? restartGame(readState().sessionMode) : nextLevel(readState())
                );
                entropyEntity.set(PhaseTrait, { phase: "playing" });
              }}
            >
              {runComplete ? "Stabilize Again" : "Proceed to Next Sector"}
            </OverlayButton>
          }
        />
      ) : null}

      {phase === "gameover" ? (
        <GameOverScreen
          result={{
            mode: state.sessionMode,
            score: scoreData.value,
            slug: "entropy-edge",
            status: "failed",
            summary: `Collapsed in sector ${summary.sector}`,
          }}
          title="Sector Collapsed"
          subtitle={`Stability reached zero. Total score: ${scoreData.value} pts. Total anchors secured: ${state.totalAnchors}.`}
          actions={
            <OverlayButton
              type="button"
              onClick={() => {
                writeState(restartGame(readState().sessionMode));
                entropyEntity.set(PhaseTrait, { phase: "playing" });
              }}
            >
              Restart Simulation
            </OverlayButton>
          }
        />
      ) : null}
    </GameViewport>
  );
}

function resolveEntropyStartState(
  mode: SessionMode,
  saveSlot: GameSaveSlot | undefined,
  current: EntropyState
): EntropyState {
  const snapshot = saveSlot?.snapshot;
  if (isEntropySnapshot(snapshot)) {
    const restored = snapshot as EntropyState;
    return {
      ...restored,
      phase: "playing",
      sessionMode: mode,
    };
  }

  return startGame(current, mode);
}

function isEntropySnapshot(snapshot: unknown): snapshot is EntropyState {
  const value = snapshot as Partial<EntropyState> | undefined;
  return Boolean(
    value &&
      typeof value === "object" &&
      typeof value.level === "number" &&
      typeof value.playerGridX === "number" &&
      typeof value.playerGridZ === "number" &&
      typeof value.timeMs === "number" &&
      Array.isArray(value.fallingBlocks) &&
      Array.isArray(value.blockedCells)
  );
}

export default function Game() {
  return (
    <WorldProvider world={entropyWorld}>
      <EntropyApp />
    </WorldProvider>
  );
}
