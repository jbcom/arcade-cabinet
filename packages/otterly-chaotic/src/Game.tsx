import { useEffect, useMemo, useRef, useState } from 'react';
import { WorldProvider, useTrait } from 'koota/react';
import { GameOverScreen, OverlayButton, PhaseTrait, ScoreTrait, StartScreen, TimerTrait, createEventBus, useContainerSize, useGameLoop } from '@arcade-cabinet/shared';
import { HUD } from './ui/HUD';
import { OtterScene } from './r3f/OtterScene';
import { createInitialState, didLose, didWin, tick } from './engine/simulation';
import { otterlyEntity, otterlyWorld } from './store/world';
import { OtterlyTrait } from './store/traits';

interface OtterEvents {
  bark: undefined;
}

function useMovementInput() {
  const [input, setInput] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const pressed = new Set<string>();
    const update = () => {
      setInput({
        x: (pressed.has('ArrowRight') || pressed.has('d') ? 1 : 0) - (pressed.has('ArrowLeft') || pressed.has('a') ? 1 : 0),
        y: (pressed.has('ArrowDown') || pressed.has('s') ? 1 : 0) - (pressed.has('ArrowUp') || pressed.has('w') ? 1 : 0),
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
    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
    };
  }, []);

  return input;
}

function OtterlyApp() {
  const mountRef = useRef<HTMLDivElement>(null);
  const phase = useTrait(otterlyEntity, PhaseTrait);
  const state = useTrait(otterlyEntity, OtterlyTrait);
  const score = useTrait(otterlyEntity, ScoreTrait);
  const timer = useTrait(otterlyEntity, TimerTrait);
  const movement = useMovementInput();
  const [barkQueued, setBarkQueued] = useState(false);
  const eventBus = useMemo(() => createEventBus<OtterEvents>(), []);
  useContainerSize(mountRef);

  useEffect(() => {
    return eventBus.on('bark', () => setBarkQueued(true));
  }, [eventBus]);

  useGameLoop(
    (deltaMs) => {
      if (phase.phase !== 'playing') return;
      const next = tick(otterlyEntity.get(OtterlyTrait), deltaMs, movement, barkQueued);
      otterlyEntity.set(OtterlyTrait, next);
      otterlyEntity.set(ScoreTrait, { value: Math.round(next.ballHealth), label: 'SALAD' });
      otterlyEntity.set(TimerTrait, { elapsedMs: timer.elapsedMs + deltaMs, remainingMs: next.barkCooldownMs, label: 'TIMER' });
      if (didWin(next)) {
        otterlyEntity.set(PhaseTrait, { phase: 'win' });
      } else if (didLose(next)) {
        otterlyEntity.set(PhaseTrait, { phase: 'gameover' });
      }
      if (barkQueued) {
        setBarkQueued(false);
      }
    },
    [phase.phase, movement.x, movement.y, barkQueued, timer.elapsedMs]
  );

  return (
    <div ref={mountRef} style={{ position: 'relative', width: '100%', height: '100%', minHeight: 720, overflow: 'hidden', background: '#082f49' }}>
      <OtterScene state={state} />
      {phase.phase === 'menu' ? (
        <StartScreen
          title="Otterly Chaotic"
          subtitle="The prototype is now a 3D chase: steer the otter with WASD or Arrow keys, bark to stun goats, and roll the Kudzu ball into the crater."
          primaryAction={<OverlayButton onClick={() => { otterlyEntity.set(OtterlyTrait, createInitialState()); otterlyEntity.set(PhaseTrait, { phase: 'playing' }); }}>Start Sprint</OverlayButton>}
        />
      ) : null}
      {phase.phase === 'playing' ? <HUD state={state} onBark={() => eventBus.emit('bark', undefined)} /> : null}
      {phase.phase === 'win' ? (
        <GameOverScreen
          title="Salad Saved"
          subtitle={`You delivered the Kudzu ball with ${score.value}% integrity after ${(state.elapsedMs / 1000).toFixed(1)} seconds.`}
          actions={<OverlayButton onClick={() => window.location.reload()}>Play Again</OverlayButton>}
        />
      ) : null}
      {phase.phase === 'gameover' ? (
        <GameOverScreen
          title="Munched"
          subtitle="The goats ate the entire ball. Bark earlier and keep the otter between them and the salad next run."
          actions={<OverlayButton onClick={() => window.location.reload()}>Retry</OverlayButton>}
        />
      ) : null}
    </div>
  );
}

export default function Game() {
  return (
    <WorldProvider world={otterlyWorld}>
      <OtterlyApp />
    </WorldProvider>
  );
}
