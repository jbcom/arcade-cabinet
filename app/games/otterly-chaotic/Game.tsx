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
  tick,
} from "@logic/games/otterly-chaotic/engine/simulation";
import type { OtterlyState, Vec2 } from "@logic/games/otterly-chaotic/engine/types";
import { OtterlyTrait } from "@logic/games/otterly-chaotic/store/traits";
import { otterlyEntity, otterlyWorld } from "@logic/games/otterly-chaotic/store/world";
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
  const score = (useTrait(otterlyEntity, ScoreTrait) as
    | { value: number; label: string }
    | undefined) ?? { value: 100, label: "SALAD" };
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
          kicker="Pasture Panic Cartridge"
          motif="otter"
          onStart={() => {
            writeState(createInitialState());
            otterlyEntity.set(PhaseTrait, { phase: "playing" });
          }}
          rules={[
            "Stay between goats and the salad to protect its health.",
            "Bark to stun nearby goats and open a rescue window.",
            "Push the salad toward the crater before the chase collapses.",
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
          subtitle={`You delivered the Kudzu ball with ${score.value}% integrity after ${(state.elapsedMs / 1000).toFixed(1)} seconds.`}
          actions={
            <OverlayButton onClick={() => window.location.reload()}>Play Again</OverlayButton>
          }
        />
      ) : null}
      {phase.phase === "gameover" ? (
        <GameOverScreen
          title="Munched"
          subtitle="The goats ate the entire ball. Bark earlier and keep the otter between them and the salad next run."
          actions={<OverlayButton onClick={() => window.location.reload()}>Retry</OverlayButton>}
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
