import { useEffect, useMemo, useRef, useState } from 'react';
import { WorldProvider, useTrait } from 'koota/react';
import { createEventBus, GameOverScreen, OverlayButton, StartScreen, useContainerSize, useGameLoop, PhaseTrait, ScoreTrait, TimerTrait } from '@arcade-cabinet/shared';
import { CityScene } from './r3f/CityScene';
import { HUD } from './ui/HUD';
import { placeBuilding, selectTool, tickSimulation } from './engine/Simulation';
import { simSovietEntity, simSovietWorld } from './store/world';
import { SimSovietTrait } from './store/traits';
import type { BuildingTypeId } from './engine/BuildingTypes';

interface SimEvents {
  'tool:selected': BuildingTypeId;
  'grid:click': { x: number; y: number };
}

function SimSovietApp() {
  const mountRef = useRef<HTMLDivElement>(null);
  const phase = useTrait(simSovietEntity, PhaseTrait);
  const score = useTrait(simSovietEntity, ScoreTrait);
  const timer = useTrait(simSovietEntity, TimerTrait);
  const state = useTrait(simSovietEntity, SimSovietTrait);
  const eventBus = useMemo(() => createEventBus<SimEvents>(), []);
  const [accumulator, setAccumulator] = useState(0);
  useContainerSize(mountRef);

  useEffect(() => {
    const offTool = eventBus.on('tool:selected', (tool) => {
      simSovietEntity.set(SimSovietTrait, selectTool(simSovietEntity.get(SimSovietTrait), tool));
    });
    const offGrid = eventBus.on('grid:click', ({ x, y }) => {
      const next = placeBuilding(simSovietEntity.get(SimSovietTrait), x, y);
      simSovietEntity.set(SimSovietTrait, next);
      simSovietEntity.set(ScoreTrait, { value: next.quotaProgress, label: 'QUOTA' });
    });
    return () => {
      offTool();
      offGrid();
    };
  }, [eventBus]);

  useGameLoop(
    (deltaMs) => {
      if (phase.phase !== 'playing') return;
      setAccumulator((current) => {
        const nextAccumulator = current + deltaMs;
        if (nextAccumulator < 1500) {
          simSovietEntity.set(TimerTrait, { elapsedMs: timer.elapsedMs + deltaMs, remainingMs: 0, label: 'CALENDAR' });
          return nextAccumulator;
        }
        const next = tickSimulation(simSovietEntity.get(SimSovietTrait), nextAccumulator);
        simSovietEntity.set(SimSovietTrait, next);
        simSovietEntity.set(ScoreTrait, { value: next.quotaProgress, label: 'QUOTA' });
        simSovietEntity.set(TimerTrait, { elapsedMs: timer.elapsedMs + nextAccumulator, remainingMs: 0, label: 'CALENDAR' });
        if (next.quotaProgress >= 100) {
          simSovietEntity.set(PhaseTrait, { phase: 'win' });
        }
        return 0;
      });
    },
    [phase.phase, timer.elapsedMs]
  );

  return (
    <div ref={mountRef} style={{ position: 'relative', width: '100%', height: '100%', minHeight: 720, overflow: 'hidden', background: '#020617' }}>
      <CityScene state={state} onCellClick={(x, y) => eventBus.emit('grid:click', { x, y })} />
      {phase.phase === 'menu' ? (
        <StartScreen
          title="Sim Soviet 3000"
          subtitle="A 3D command-table take on the city-builder: place sectors, balance utilities, and hit the quota before the commissariat loses patience."
          primaryAction={<OverlayButton onClick={() => simSovietEntity.set(PhaseTrait, { phase: 'playing' })}>Begin the Plan</OverlayButton>}
        />
      ) : null}
      {phase.phase === 'playing' ? <HUD state={state} onSelectTool={(tool) => eventBus.emit('tool:selected', tool)} /> : null}
      {phase.phase === 'win' ? (
        <GameOverScreen
          title="Quota Complete"
          subtitle={`You reached ${score.value}% quota progress in ${state.month.toString().padStart(2, '0')}/${state.year}.`}
          actions={<OverlayButton onClick={() => window.location.reload()}>Restart</OverlayButton>}
        />
      ) : null}
    </div>
  );
}

export default function Game() {
  return (
    <WorldProvider world={simSovietWorld}>
      <SimSovietApp />
    </WorldProvider>
  );
}
