import {
  GameOverScreen,
  OverlayButton,
  PhaseTrait,
  ScoreTrait,
  StartScreen,
  TimerTrait,
  useGameLoop,
} from "@arcade-cabinet/shared";
import { useTrait, WorldProvider } from "koota/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createInitialState, tick } from "./engine/simulation";
import type { MegaTrackState } from "./engine/types";
import { TrackScene } from "./r3f/TrackScene";
import { MegaTrackTrait } from "./store/traits";
import { megaTrackEntity, megaTrackWorld } from "./store/world";
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

      if (next.distance >= 100000) {
        // Win at 10km
        megaTrackEntity.set(PhaseTrait, { phase: "win" });
      }
    },
    [phase.phase, laneChange]
  );

  const handleStart = () => {
    writeState(createInitialState());
    megaTrackEntity.set(PhaseTrait, { phase: "playing" });
    megaTrackEntity.set(MegaTrackTrait, { ...createInitialState(), isPlaying: true } as never);
  };

  return (
    <div
      ref={mountRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 720,
        overflow: "hidden",
        background: "#082f49",
      }}
    >
      <TrackScene state={state} />

      {phase.phase === "menu" ? (
        <StartScreen
          title="Mega Track"
          subtitle="Extreme racing on a procedural track. Use A/D or Arrow keys to change lanes and avoid obstacles."
          primaryAction={<OverlayButton onClick={handleStart}>Start Race</OverlayButton>}
        />
      ) : null}

      {phase.phase === "playing" ? <HUD state={state} /> : null}

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
    </div>
  );
}

export default function Game() {
  return (
    <WorldProvider world={megaTrackWorld}>
      <MegaTrackApp />
    </WorldProvider>
  );
}
