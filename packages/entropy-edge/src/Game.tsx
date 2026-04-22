import {
  GameOverScreen,
  GameViewport,
  OverlayButton,
  PhaseTrait,
  ScoreTrait,
  StartScreen,
  TimerTrait,
  useContainerSize,
  useGameLoop,
} from "@arcade-cabinet/shared";
import { useTrait, WorldProvider } from "koota/react";
import { type CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";
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

function DirectionIcon({ direction }: { direction: "up" | "right" | "down" | "left" }) {
  const rotations = {
    down: 90,
    left: 180,
    right: 0,
    up: -90,
  };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      style={{
        height: 24,
        transform: `rotate(${rotations[direction]}deg)`,
        width: 24,
      }}
    >
      <path
        d="M10 6 L23 16 L10 26"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
    </svg>
  );
}

function TouchMoveControls({ onChange }: { onChange: (next: Vec2) => void }) {
  const buttonStyle = {
    alignItems: "center",
    background: "rgba(6, 18, 30, 0.72)",
    border: "1px solid rgba(103, 232, 249, 0.28)",
    borderRadius: 999,
    color: "#67e8f9",
    display: "flex",
    height: 48,
    justifyContent: "center",
    width: 48,
  };
  const directions: Array<{
    label: string;
    direction: "up" | "right" | "down" | "left";
    value: Vec2;
    style: CSSProperties;
  }> = [
    {
      direction: "up",
      label: "Move north",
      style: { gridColumn: 2, gridRow: 1 },
      value: { x: 0, y: -1 },
    },
    {
      direction: "left",
      label: "Move west",
      style: { gridColumn: 1, gridRow: 2 },
      value: { x: -1, y: 0 },
    },
    {
      direction: "right",
      label: "Move east",
      style: { gridColumn: 3, gridRow: 2 },
      value: { x: 1, y: 0 },
    },
    {
      direction: "down",
      label: "Move south",
      style: { gridColumn: 2, gridRow: 3 },
      value: { x: 0, y: 1 },
    },
  ];

  return (
    <div
      className="absolute bottom-20 left-1/2 z-[80] grid -translate-x-1/2 grid-cols-3 grid-rows-3 gap-2 sm:hidden"
      style={{ touchAction: "none" }}
    >
      {directions.map((item) => (
        <button
          aria-label={item.label}
          key={item.direction}
          onPointerCancel={() => onChange({ x: 0, y: 0 })}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            onChange(item.value);
          }}
          onPointerLeave={() => onChange({ x: 0, y: 0 })}
          onPointerUp={() => onChange({ x: 0, y: 0 })}
          style={{ ...buttonStyle, ...item.style }}
          type="button"
        >
          <DirectionIcon direction={item.direction} />
        </button>
      ))}
    </div>
  );
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

  return (
    <GameViewport ref={mountRef} background="#060d1a" data-browser-screenshot-mode="page">
      <EdgeScene state={state} isPlaying={isPlaying} />

      {phase === "menu" ? (
        <StartScreen
          title="Entropy's Edge"
          subtitle="Reality is fracturing. Navigate the grid to reach glowing anchors before sector stability collapses. Secure anchors quickly to build Resonance for bonus points."
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
      {phase === "playing" ? <TouchMoveControls onChange={setTouchMovement} /> : null}

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
    </GameViewport>
  );
}

export default function Game() {
  return (
    <WorldProvider world={entropyWorld}>
      <EntropyApp />
    </WorldProvider>
  );
}
