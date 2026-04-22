import {
  GameOverScreen,
  GameViewport,
  OverlayButton,
  PhaseTrait,
  ScoreTrait,
  StartScreen,
  TimerTrait,
  useGameLoop,
} from "@app/shared";
import { createInitialState, tick } from "@logic/games/mega-track/engine/simulation";
import type { MegaTrackState } from "@logic/games/mega-track/engine/types";
import { CONFIG } from "@logic/games/mega-track/engine/types";
import { MegaTrackTrait } from "@logic/games/mega-track/store/traits";
import { megaTrackEntity, megaTrackWorld } from "@logic/games/mega-track/store/world";
import { useTrait, WorldProvider } from "koota/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { TrackScene } from "./r3f/TrackScene";
import { HUD } from "./ui/HUD";

function MegaTrackApp() {
  const mountRef = useRef<HTMLDivElement>(null);
  const phase = (useTrait(megaTrackEntity, PhaseTrait) as { phase: string } | undefined) ?? {
    phase: "menu",
  };
  const state =
    (useTrait(megaTrackEntity, MegaTrackTrait) as MegaTrackState | undefined) ??
    createInitialState();

  const [laneChange, setLaneChange] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") setLaneChange(-1);
      if (e.key === "ArrowRight" || e.key === "d") setLaneChange(1);
    };
    const handleKeyUp = () => setLaneChange(0);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const readState = useCallback(
    () =>
      (megaTrackEntity.get(MegaTrackTrait) as MegaTrackState | undefined) ?? createInitialState(),
    []
  );

  const writeState = useCallback((next: MegaTrackState) => {
    megaTrackEntity.set(MegaTrackTrait, next as never);
  }, []);

  useGameLoop(
    (deltaMs) => {
      if (phase.phase !== "playing") return;
      const next = tick(readState(), deltaMs, { laneChange });
      writeState(next);

      megaTrackEntity.set(ScoreTrait, { value: Math.floor(next.distance / 10), label: "METERS" });
      megaTrackEntity.set(TimerTrait, {
        elapsedMs: next.elapsedMs,
        remainingMs: 0,
        label: "SPEED",
      });

      if (next.integrity <= 0) {
        megaTrackEntity.set(PhaseTrait, { phase: "gameover" });
      } else if (next.distance >= CONFIG.GOAL_DISTANCE) {
        megaTrackEntity.set(PhaseTrait, { phase: "win" });
      }
    },
    [phase.phase, laneChange]
  );

  const handleStart = () => {
    const next = { ...createInitialState(), isPlaying: true };
    writeState(next);
    megaTrackEntity.set(PhaseTrait, { phase: "playing" });
  };

  const handleLaneControl = useCallback((direction: number) => {
    setLaneChange(direction);
  }, []);

  return (
    <GameViewport ref={mountRef} background="#07111f" data-browser-screenshot-mode="page">
      <TrackScene state={state} />

      {phase.phase === "menu" ? (
        <StartScreen
          accent="#fb7185"
          title="Mega Track"
          subtitle="Arcade racing on a deterministic hazard ribbon. Use A/D, Arrow keys, or a touch-anywhere lane joystick to thread the safe line."
          primaryAction={<OverlayButton onClick={handleStart}>Start Race</OverlayButton>}
        />
      ) : null}

      {phase.phase === "playing" ? <HUD state={state} onLaneControl={handleLaneControl} /> : null}

      {phase.phase === "win" ? (
        <GameOverScreen
          title="Victory!"
          subtitle={`You completed the track in ${(state.elapsedMs / 1000).toFixed(1)} seconds.`}
          actions={
            <OverlayButton onClick={() => window.location.reload()}>Play Again</OverlayButton>
          }
        />
      ) : null}

      {phase.phase === "gameover" ? (
        <GameOverScreen
          title="Wrecked"
          subtitle="Your car couldn't handle the impact."
          actions={
            <OverlayButton onClick={() => window.location.reload()}>Try Again</OverlayButton>
          }
        />
      ) : null}
    </GameViewport>
  );
}

export default function Game() {
  return (
    <WorldProvider world={megaTrackWorld}>
      <MegaTrackApp />
    </WorldProvider>
  );
}
