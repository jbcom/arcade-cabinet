import {
  CartridgeStartScreen,
  createEventBus,
  GameOverScreen,
  GameViewport,
  OverlayButton,
  PhaseTrait,
  ScoreTrait,
  TimerTrait,
  useContainerSize,
  useGameLoop,
} from "@app/shared";
import {
  createInitialState,
  didLose,
  didWin,
  getOtterlyRunSummary,
  tick,
} from "@logic/games/otterly-chaotic/engine/simulation";
import type { OtterlyState, Vec2 } from "@logic/games/otterly-chaotic/engine/types";
import { OtterlyTrait } from "@logic/games/otterly-chaotic/store/traits";
import { otterlyEntity, otterlyWorld } from "@logic/games/otterly-chaotic/store/world";
import type { SessionMode } from "@logic/shared";
import { useTrait, WorldProvider } from "koota/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { OtterScene } from "./r3f/OtterScene";
import { HUD } from "./ui/HUD";

interface OtterEvents {
  bark: undefined;
}

function useMovementInput() {
  const [input, setInput] = useState({ x: 0, y: 0 });

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

function OtterlyApp() {
  const mountRef = useRef<HTMLDivElement>(null);
  const initialState = useMemo(() => createInitialState(), []);
  const phase = (useTrait(otterlyEntity, PhaseTrait) as { phase: string } | undefined) ?? {
    phase: "menu",
  };
  const state = (useTrait(otterlyEntity, OtterlyTrait) as OtterlyState | undefined) ?? initialState;
  const timer = (useTrait(otterlyEntity, TimerTrait) as
    | { elapsedMs: number; remainingMs: number; label: string }
    | undefined) ?? { elapsedMs: 0, remainingMs: 0, label: "TIMER" };
  const keyboardMovement = useMovementInput();
  const [touchMovement, setTouchMovement] = useState<Vec2>({ x: 0, y: 0 });
  const movement = useMemo(
    () => ({
      x: Math.max(-1, Math.min(1, keyboardMovement.x + touchMovement.x)),
      y: Math.max(-1, Math.min(1, keyboardMovement.y + touchMovement.y)),
    }),
    [keyboardMovement.x, keyboardMovement.y, touchMovement.x, touchMovement.y]
  );
  const [barkQueued, setBarkQueued] = useState(false);
  const eventBus = useMemo(() => createEventBus<OtterEvents>(), []);
  useContainerSize(mountRef);

  const readState = useCallback(
    () => (otterlyEntity.get(OtterlyTrait) as OtterlyState | undefined) ?? initialState,
    [initialState]
  );
  const writeState = useCallback((next: OtterlyState) => {
    otterlyEntity.set(OtterlyTrait, next as never);
  }, []);
  const startRun = useCallback(
    (mode: SessionMode = state.sessionMode) => {
      writeState(createInitialState(mode));
      otterlyEntity.set(PhaseTrait, { phase: "playing" });
      otterlyEntity.set(ScoreTrait, { value: 100, label: "SALAD" });
      otterlyEntity.set(TimerTrait, { elapsedMs: 0, remainingMs: 0, label: "BARK" });
    },
    [state.sessionMode, writeState]
  );
  const summary = getOtterlyRunSummary(state);

  useEffect(() => {
    const handleBark = () => setBarkQueued(true);
    eventBus.on("bark", handleBark);
    return () => eventBus.off("bark", handleBark);
  }, [eventBus]);

  useGameLoop(
    (deltaMs) => {
      if (phase.phase !== "playing") return;
      const currentTimer = (otterlyEntity.get(TimerTrait) as typeof timer | undefined) ?? timer;
      const next = tick(readState(), deltaMs, movement, barkQueued);
      writeState(next);
      otterlyEntity.set(ScoreTrait, { value: Math.round(next.ballHealth), label: "SALAD" });
      otterlyEntity.set(TimerTrait, {
        elapsedMs: currentTimer.elapsedMs + deltaMs,
        remainingMs: next.barkCooldownMs,
        label: "TIMER",
      });
      if (didWin(next)) {
        otterlyEntity.set(PhaseTrait, { phase: "win" });
      } else if (didLose(next)) {
        otterlyEntity.set(PhaseTrait, { phase: "gameover" });
      }
      if (barkQueued) {
        setBarkQueued(false);
      }
    },
    [phase.phase, movement.x, movement.y, barkQueued]
  );

  return (
    <GameViewport ref={mountRef} background="#082f49" data-browser-screenshot-mode="page">
      <OtterScene state={state} />
      {phase.phase === "menu" ? (
        <CartridgeStartScreen
          accent="#0ea5e9"
          cartridgeId="Slot 06"
          description="Keep the salad rolling while goats try to turn the rescue into lunch."
          gameSlug="otterly-chaotic"
          kicker="Pasture Panic Cartridge"
          motif="otter"
          onStart={startRun}
          rules={[
            "Save five salad pieces, not just one fast delivery.",
            "Stay between goats and the salad to protect its health.",
            "Bark to stun nearby goats and open a rescue window.",
            "Each crater rescue launches a new piece with goats reset for the next round.",
          ]}
          secondaryAccent="#84cc16"
          startLabel="Start Sprint"
          title="Otterly Chaotic"
        />
      ) : null}
      {phase.phase === "playing" ? (
        <HUD
          state={state}
          onBark={() => eventBus.emit("bark", undefined)}
          onMove={setTouchMovement}
        />
      ) : null}
      {phase.phase === "win" ? (
        <GameOverScreen
          title="Salad Saved"
          subtitle={`${summary.rescuesCompleted}/${summary.targetRescues} pieces rescued with ${summary.health}% integrity after ${summary.elapsedSeconds}s.`}
          actions={
            <OverlayButton onClick={() => startRun(state.sessionMode)}>Play Again</OverlayButton>
          }
        />
      ) : null}
      {phase.phase === "gameover" ? (
        <GameOverScreen
          title="Munched"
          subtitle={`${summary.rescuesCompleted}/${summary.targetRescues} pieces rescued. Bark earlier and keep the otter between goats and salad next run.`}
          actions={<OverlayButton onClick={() => startRun(state.sessionMode)}>Retry</OverlayButton>}
        />
      ) : null}
    </GameViewport>
  );
}

export default function Game() {
  return (
    <WorldProvider world={otterlyWorld}>
      <OtterlyApp />
    </WorldProvider>
  );
}
