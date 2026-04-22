import {
  GameOverScreen,
  OverlayButton,
  PhaseTrait,
  ScoreTrait,
  StartScreen,
  TimerTrait,
  useContainerSize,
  useGameLoop,
} from "@arcade-cabinet/shared";
import { useTrait, WorldProvider } from "koota/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createInitialState,
  didLose,
  didWin,
  nextLevel,
  restartGame,
  startGame,
  tick,
} from "./engine/simulation";
import type { EntropyState, Vec2 } from "./engine/types";
import { EdgeScene } from "./r3f/EdgeScene";
import { EntropyTrait } from "./store/traits";
import { entropyEntity, entropyWorld } from "./store/world";
import { HUD } from "./ui/HUD";

function useMovementInput(): Vec2 {
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

  const movement = useMovementInput();
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

  return (
    <div
      ref={mountRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 720,
        overflow: "hidden",
        background: "#060d1a",
      }}
    >
      <EdgeScene state={state} isPlaying={isPlaying} />

      {phase === "menu" ? (
        <StartScreen
          title="Entropy's Edge"
          subtitle="Reality is fracturing. Navigate the grid with WASD or Arrow keys to reach glowing Anchors before Sector Stability collapses. Secure anchors quickly to build Resonance for bonus points."
          primaryAction={
            <OverlayButton
              onClick={() => {
                writeState(startGame(readState()));
                entropyEntity.set(PhaseTrait, { phase: "playing" });
              }}
            >
              Initialize Link
            </OverlayButton>
          }
        />
      ) : null}

      {phase === "playing" ? <HUD state={state} /> : null}

      {phase === "win" ? (
        <GameOverScreen
          title="Sector Stabilized"
          subtitle={`Anchors secured: ${state.anchorsRequired}. Score: ${scoreData.value} pts. Prepare for the next sector.`}
          actions={
            <OverlayButton
              type="button"
              onClick={() => {
                writeState(nextLevel(readState()));
                entropyEntity.set(PhaseTrait, { phase: "playing" });
              }}
            >
              Proceed to Next Sector
            </OverlayButton>
          }
        />
      ) : null}

      {phase === "gameover" ? (
        <GameOverScreen
          title="Sector Collapsed"
          subtitle={`Stability reached zero. Total score: ${scoreData.value} pts. Total anchors secured: ${state.totalAnchors}.`}
          actions={
            <OverlayButton
              type="button"
              onClick={() => {
                writeState(restartGame());
                entropyEntity.set(PhaseTrait, { phase: "playing" });
              }}
            >
              Restart Simulation
            </OverlayButton>
          }
        />
      ) : null}
    </div>
  );
}

export default function Game() {
  return (
    <WorldProvider world={entropyWorld}>
      <EntropyApp />
    </WorldProvider>
  );
}
