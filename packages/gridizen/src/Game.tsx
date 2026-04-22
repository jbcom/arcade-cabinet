import {
  GameOverScreen,
  OverlayButton,
  PhaseTrait,
  StartScreen,
  useGameLoop,
} from "@arcade-cabinet/shared";
import { useTrait, WorldProvider } from "koota/react";
import { useCallback, useMemo, useState } from "react";
import {
  createInitialState,
  handleInteraction,
  initMap,
  setTool,
  tickGame,
  toggleHeatmap,
} from "./engine/logic";
import type { GridizenState } from "./engine/types";
import { TICK_RATE_MS } from "./engine/types";
import { GridScene } from "./r3f/GridScene";
import { GridizenTrait } from "./store/traits";
import { gridEntity, gridWorld } from "./store/world";
import { ControlPanel } from "./ui/ControlPanel";
import { HUD } from "./ui/HUD";

function GridizenApp() {
  const initialState = useMemo(() => initMap(createInitialState()), []);
  const phase = (useTrait(gridEntity, PhaseTrait) as { phase: string } | undefined) ?? {
    phase: "menu",
  };
  const state = (useTrait(gridEntity, GridizenTrait) as GridizenState | undefined) ?? initialState;

  const readState = useCallback(
    () => (gridEntity.get(GridizenTrait) as GridizenState | undefined) ?? initialState,
    [initialState]
  );
  const writeState = useCallback((next: GridizenState) => {
    gridEntity.set(GridizenTrait, next as never);
  }, []);

  const [, setAccumulator] = useState(0);

  useGameLoop(
    (deltaMs) => {
      if (phase.phase !== "playing") return;
      setAccumulator((prev) => {
        const next = prev + deltaMs;
        if (next < TICK_RATE_MS) return next;
        const newState = tickGame(readState());
        writeState(newState);
        if (newState.milestone >= 4) {
          gridEntity.set(PhaseTrait, { phase: "win" });
        } else if (newState.funds < 0 && newState.population === 0) {
          gridEntity.set(PhaseTrait, { phase: "gameover" });
        }
        return next - TICK_RATE_MS;
      });
    },
    [phase.phase]
  );

  const handleTileInteraction = useCallback(
    (x: number, z: number) => {
      writeState(handleInteraction(readState(), x, z));
    },
    [readState, writeState]
  );

  const handleSetTool = useCallback(
    (tool: string) => {
      writeState(setTool(readState(), tool));
    },
    [readState, writeState]
  );

  const handleToggleHeatmap = useCallback(() => {
    writeState(toggleHeatmap(readState()));
  }, [readState, writeState]);

  const handleStart = useCallback(() => {
    writeState(initMap(readState()));
    gridEntity.set(PhaseTrait, { phase: "playing" });
  }, [readState, writeState]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 720,
        overflow: "hidden",
        background: "#1e293b",
        userSelect: "none",
        touchAction: "none",
        fontFamily: "sans-serif",
      }}
    >
      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
      <GridScene state={state} onInteraction={handleTileInteraction} />
      {phase.phase === "menu" ? (
        <StartScreen
          title="Gridizen"
          subtitle="A procedurally-generated city builder. Place roads, zones, and utilities to grow your settlement from a Camp to a City."
          primaryAction={
            <OverlayButton type="button" onClick={handleStart}>
              Found a Settlement
            </OverlayButton>
          }
        />
      ) : null}
      {phase.phase === "playing" ? (
        <>
          <HUD state={state} onToggleHeatmap={handleToggleHeatmap} />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
            }}
          >
            <ControlPanel state={state} onSetTool={handleSetTool} />
          </div>
        </>
      ) : null}
      {phase.phase === "win" ? (
        <GameOverScreen
          title="City Founded!"
          subtitle={`You grew your settlement to a City with ${state.population} residents and $${state.funds.toLocaleString()} in treasury.`}
          actions={
            <OverlayButton type="button" onClick={() => window.location.reload()}>
              Play Again
            </OverlayButton>
          }
        />
      ) : null}
      {phase.phase === "gameover" ? (
        <GameOverScreen
          title="Settlement Abandoned"
          subtitle="The treasury ran dry and the last residents left. Your settlement has been reclaimed by nature."
          actions={
            <OverlayButton type="button" onClick={() => window.location.reload()}>
              Try Again
            </OverlayButton>
          }
        />
      ) : null}
    </div>
  );
}

export default function Game() {
  return (
    <WorldProvider world={gridWorld}>
      <GridizenApp />
    </WorldProvider>
  );
}
