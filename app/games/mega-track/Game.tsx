import {
  CartridgeStartScreen,
  GameOverScreen,
  GameViewport,
  OverlayButton,
  PhaseTrait,
  ScoreTrait,
  TimerTrait,
  useGameLoop,
  useRunSnapshotAutosave,
} from "@app/shared";
import {
  createInitialState,
  didFinishCup,
  getMegaTrackRunSummary,
  tick,
} from "@logic/games/mega-track/engine/simulation";
import type { MegaTrackState } from "@logic/games/mega-track/engine/types";
import { MegaTrackTrait } from "@logic/games/mega-track/store/traits";
import { megaTrackEntity, megaTrackWorld } from "@logic/games/mega-track/store/world";
import type { GameSaveSlot, SessionMode } from "@logic/shared";
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
      } else if (didFinishCup(next)) {
        megaTrackEntity.set(PhaseTrait, { phase: "win" });
      }
    },
    [phase.phase, laneChange]
  );

  const handleStart = (mode: SessionMode, saveSlot?: GameSaveSlot) => {
    const next = resolveMegaTrackStartState(mode, saveSlot);
    writeState(next);
    megaTrackEntity.set(PhaseTrait, { phase: "playing" });
    megaTrackEntity.set(ScoreTrait, { value: Math.floor(next.distance / 10), label: "METERS" });
    megaTrackEntity.set(TimerTrait, {
      elapsedMs: next.elapsedMs,
      remainingMs: 0,
      label: "SPEED",
    });
  };

  const summary = getMegaTrackRunSummary(state);

  useRunSnapshotAutosave({
    active: phase.phase === "playing",
    progressSummary: `Leg ${summary.cupLeg}/${summary.cupLegCount} · ${summary.integrity}% integrity`,
    slug: "mega-track",
    snapshot: state,
  });

  const handleLaneControl = useCallback((direction: number) => {
    setLaneChange(direction);
  }, []);

  return (
    <GameViewport ref={mountRef} background="#07111f" data-browser-screenshot-mode="page">
      <TrackScene state={state} />

      {phase.phase === "menu" ? (
        <CartridgeStartScreen
          accent="#fb7185"
          cartridgeId="Slot 05"
          description="Thread a high-speed machine through a deterministic hazard ribbon."
          gameSlug="mega-track"
          kicker="Race Cartridge"
          motif="track"
          onStart={handleStart}
          rules={[
            "Shift lanes early and keep the car centered through hazard gates.",
            "Clean passes build overdrive, sparks, and speed-line feedback.",
            "Impacts cost integrity and briefly mark the hazard type.",
          ]}
          secondaryAccent="#facc15"
          startLabel="Start Race"
          title="Mega Track"
        />
      ) : null}

      {phase.phase === "playing" ? <HUD state={state} onLaneControl={handleLaneControl} /> : null}

      {phase.phase === "win" ? (
        <GameOverScreen
          result={{
            milestones: ["first-cup"],
            mode: state.sessionMode,
            score: summary.distanceMeters + summary.integrity * 10,
            slug: "mega-track",
            status: "completed",
            summary: `Cup complete in ${summary.elapsedSeconds}s`,
          }}
          title="Cup Complete"
          subtitle={`Three legs cleared in ${summary.elapsedSeconds}s with ${summary.integrity}% integrity and ${summary.impactCount} impacts.`}
          actions={
            <OverlayButton onClick={() => handleStart(state.sessionMode)}>
              Run the Cup Again
            </OverlayButton>
          }
        />
      ) : null}

      {phase.phase === "gameover" ? (
        <GameOverScreen
          result={{
            mode: state.sessionMode,
            score: summary.distanceMeters,
            slug: "mega-track",
            status: "failed",
            summary: `Wrecked at ${summary.progressPercent}% cup progress`,
          }}
          title="Wrecked"
          subtitle={`Leg ${summary.cupLeg}/${summary.cupLegCount}, ${summary.progressPercent}% of the cup complete. Chain clean passes to rebuild overdrive before hazards close in.`}
          actions={
            <OverlayButton onClick={() => handleStart(state.sessionMode)}>Try Again</OverlayButton>
          }
        />
      ) : null}
    </GameViewport>
  );
}

function resolveMegaTrackStartState(mode: SessionMode, saveSlot?: GameSaveSlot): MegaTrackState {
  const snapshot = saveSlot?.snapshot;
  if (isMegaTrackSnapshot(snapshot)) {
    const restored = snapshot as MegaTrackState;
    return {
      ...restored,
      isPlaying: true,
      sessionMode: mode,
    };
  }

  return { ...createInitialState(mode), isPlaying: true };
}

function isMegaTrackSnapshot(snapshot: unknown): snapshot is MegaTrackState {
  const value = snapshot as Partial<MegaTrackState> | undefined;
  return Boolean(
    value &&
      typeof value === "object" &&
      typeof value.distance === "number" &&
      typeof value.integrity === "number" &&
      typeof value.elapsedMs === "number" &&
      Array.isArray(value.obstacles)
  );
}

export default function Game() {
  return (
    <WorldProvider world={megaTrackWorld}>
      <MegaTrackApp />
    </WorldProvider>
  );
}
