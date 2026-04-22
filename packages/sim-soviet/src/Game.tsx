import {
  createEventBus,
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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { BuildingTypeId } from "./engine/BuildingTypes";
import {
  createInitialState,
  placeBuilding,
  type SimSovietState,
  selectTool,
  tickSimulation,
} from "./engine/Simulation";
import { CityScene } from "./r3f/CityScene";
import { SimSovietTrait } from "./store/traits";
import { simSovietEntity, simSovietWorld } from "./store/world";
import { HUD } from "./ui/HUD";

interface SimEvents {
  "tool:selected": BuildingTypeId;
  "grid:click": { x: number; y: number };
}

function SimSovietApp() {
  const mountRef = useRef<HTMLDivElement>(null);
  const initialState = useMemo(() => createInitialState(), []);
  const phase = (useTrait(simSovietEntity, PhaseTrait) as { phase: string } | undefined) ?? {
    phase: "menu",
  };
  const score = (useTrait(simSovietEntity, ScoreTrait) as
    | { value: number; label: string }
    | undefined) ?? { value: 0, label: "QUOTA" };
  const timer = (useTrait(simSovietEntity, TimerTrait) as
    | { elapsedMs: number; remainingMs: number; label: string }
    | undefined) ?? { elapsedMs: 0, remainingMs: 0, label: "CALENDAR" };
  const state =
    (useTrait(simSovietEntity, SimSovietTrait) as SimSovietState | undefined) ?? initialState;
  type SimEventBus = {
    on(type: "tool:selected", handler: (event: BuildingTypeId) => void): void;
    on(type: "grid:click", handler: (event: { x: number; y: number }) => void): void;
    off(type: "tool:selected", handler: (event: BuildingTypeId) => void): void;
    off(type: "grid:click", handler: (event: { x: number; y: number }) => void): void;
    emit(type: "tool:selected", event: BuildingTypeId): void;
    emit(type: "grid:click", event: { x: number; y: number }): void;
  };
  const eventBus = useMemo(() => createEventBus<SimEvents>(), []) as unknown as SimEventBus;
  const [, setAccumulator] = useState(0);
  useContainerSize(mountRef);

  const readState = useCallback(
    () => (simSovietEntity.get(SimSovietTrait) as SimSovietState | undefined) ?? initialState,
    [initialState]
  );
  const writeState = useCallback((next: SimSovietState) => {
    simSovietEntity.set(SimSovietTrait, next);
  }, []);

  useEffect(() => {
    const handleTool = (tool: BuildingTypeId) => {
      writeState(selectTool(readState(), tool));
    };
    const handleGrid = ({ x, y }: { x: number; y: number }) => {
      const next = placeBuilding(readState(), x, y);
      writeState(next);
      simSovietEntity.set(ScoreTrait, { value: next.quotaProgress, label: "QUOTA" });
    };

    eventBus.on("tool:selected", handleTool);
    eventBus.on("grid:click", handleGrid);

    return () => {
      eventBus.off("tool:selected", handleTool);
      eventBus.off("grid:click", handleGrid);
    };
  }, [eventBus, readState, writeState]);

  useGameLoop(
    (deltaMs) => {
      if (phase.phase !== "playing") return;
      setAccumulator((current) => {
        const nextAccumulator = current + deltaMs;
        if (nextAccumulator < 1500) {
          simSovietEntity.set(TimerTrait, {
            elapsedMs: timer.elapsedMs + deltaMs,
            remainingMs: 0,
            label: "CALENDAR",
          });
          return nextAccumulator;
        }
        const next = tickSimulation(readState(), nextAccumulator);
        writeState(next);
        simSovietEntity.set(ScoreTrait, { value: next.quotaProgress, label: "QUOTA" });
        simSovietEntity.set(TimerTrait, {
          elapsedMs: timer.elapsedMs + nextAccumulator,
          remainingMs: 0,
          label: "CALENDAR",
        });
        if (next.quotaProgress >= 100) {
          simSovietEntity.set(PhaseTrait, { phase: "win" });
        }
        return 0;
      });
    },
    [phase.phase, timer.elapsedMs]
  );

  return (
    <GameViewport ref={mountRef} background="#020617">
      <CityScene state={state} onCellClick={(x, y) => eventBus.emit("grid:click", { x, y })} />
      {phase.phase === "menu" ? (
        <StartScreen
          accent="#ef4444"
          title="Sim Soviet 3000"
          subtitle="A 3D command-table take on the city-builder: place sectors, balance utilities, and hit the quota before the commissariat loses patience."
          primaryAction={
            <OverlayButton onClick={() => simSovietEntity.set(PhaseTrait, { phase: "playing" })}>
              Begin the Plan
            </OverlayButton>
          }
        />
      ) : null}
      {phase.phase === "playing" ? (
        <HUD state={state} onSelectTool={(tool) => eventBus.emit("tool:selected", tool)} />
      ) : null}
      {phase.phase === "win" ? (
        <GameOverScreen
          title="Quota Complete"
          subtitle={`You reached ${score.value}% quota progress in ${state.month.toString().padStart(2, "0")}/${state.year}.`}
          actions={<OverlayButton onClick={() => window.location.reload()}>Restart</OverlayButton>}
        />
      ) : null}
    </GameViewport>
  );
}

export default function Game() {
  return (
    <WorldProvider world={simSovietWorld}>
      <SimSovietApp />
    </WorldProvider>
  );
}
