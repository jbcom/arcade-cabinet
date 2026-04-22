import {
  browserTestCanvasGlOptions,
  GameOverScreen,
  GameViewport,
  OverlayButton,
  PhaseTrait,
} from "@arcade-cabinet/shared";
import { Canvas } from "@react-three/fiber";
import { useTrait, WorldProvider } from "koota/react";
import { World } from "./r3f/World";
import { TitanTrait } from "./store/traits";
import { titanEntity, titanWorld } from "./store/world";
import { HUD } from "./ui/HUD";

function TitanApp() {
  const state = useTrait(titanEntity, TitanTrait);
  const phase =
    (useTrait(titanEntity, PhaseTrait) as { phase: string } | undefined)?.phase ?? "menu";

  const handleStart = () => {
    titanEntity.set(PhaseTrait, { phase: "playing" });
    titanEntity.set(TitanTrait, {
      phase: "playing",
      hp: 200,
      maxHp: 200,
      energy: 100,
      maxEnergy: 100,
      scrap: 0,
      score: 0,
    });
  };

  return (
    <GameViewport background="#020617">
      <Canvas shadows camera={{ fov: 60 }} gl={browserTestCanvasGlOptions}>
        {phase === "playing" && <World />}
      </Canvas>

      {phase === "menu" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#020617]/90 backdrop-blur-md z-20 text-[#00ffcc] font-mono">
          <h1
            className="text-5xl md:text-7xl font-black uppercase tracking-[10px] mb-8 text-center"
            style={{ textShadow: "0 0 20px rgba(0,255,204,0.5)" }}
          >
            TITAN MECH OS
          </h1>
          <div className="bg-black/60 p-8 rounded border border-[#00ffcc]/30 max-w-xl text-left leading-relaxed mb-10">
            <div className="text-xs opacity-50 mb-4 tracking-widest">
              BOOT SEQUENCE INITIALIZED...
            </div>
            [W][A][S][D] - Pilot the chassis
            <br />
            [MOUSE] - Target acquisition
            <br />
            [LEFT CLICK] - Discharge ordinance
            <br />
            [ESC] - System pause
            <br />
            <br />
            <span className="text-amber-400 font-bold">OBJECTIVE:</span> Neutralize hostile
            constructs. Accumulate scrap for hardware iterations.
          </div>
          <button
            type="button"
            onClick={handleStart}
            className="px-12 py-4 text-2xl font-bold uppercase tracking-[5px] bg-[#00ffcc]/10 border-2 border-[#00ffcc] hover:bg-[#00ffcc] hover:text-black transition-all duration-300"
            style={{ boxShadow: "0 0 20px rgba(0,255,204,0.2)" }}
          >
            Engage Chassis
          </button>
        </div>
      )}

      {phase === "playing" && <HUD />}

      {phase === "gameover" && (
        <GameOverScreen
          title="CHASSIS DESTROYED"
          subtitle={`Final Scrap: ${state.scrap}`}
          actions={<OverlayButton onClick={handleStart}>Reboot OS</OverlayButton>}
        />
      )}
    </GameViewport>
  );
}

export default function Game() {
  return (
    <WorldProvider world={titanWorld}>
      <TitanApp />
    </WorldProvider>
  );
}
