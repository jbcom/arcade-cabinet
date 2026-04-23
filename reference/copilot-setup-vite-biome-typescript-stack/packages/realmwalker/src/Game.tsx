import {
  browserTestCanvasGlOptions,
  GameOverScreen,
  GameViewport,
  OverlayButton,
  PhaseTrait,
} from "@arcade-cabinet/shared";
import { Canvas } from "@react-three/fiber";
import { useTrait, WorldProvider } from "koota/react";
import { createInitialRealmState } from "./engine/realmSimulation";
import { World } from "./r3f/World";
import { MovementTrait, RealmTrait } from "./store/traits";
import { realmEntity, realmWorld } from "./store/world";
import { HUD } from "./ui/HUD";

function RealmApp() {
  const state = useTrait(realmEntity, RealmTrait);
  const phase =
    (useTrait(realmEntity, PhaseTrait) as { phase: string } | undefined)?.phase ?? "menu";

  const handleStart = () => {
    realmEntity.set(PhaseTrait, { phase: "playing" });
    realmEntity.set(MovementTrait, { x: 0, z: 0 });
    realmEntity.set(RealmTrait, createInitialRealmState("playing"));
  };

  return (
    <GameViewport background="#08111d">
      <Canvas shadows camera={{ fov: 42, position: [0, 14, 24] }} gl={browserTestCanvasGlOptions}>
        {phase === "playing" && <World />}
      </Canvas>

      {phase === "menu" && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#050505]/95 px-4 text-[#e2e8f0] font-serif backdrop-blur-lg">
          <h1
            className="mb-8 bg-gradient-to-b from-[#c084fc] to-[#7c3aed] bg-clip-text text-center text-6xl font-black uppercase text-transparent md:text-8xl"
            style={{
              letterSpacing: "0.14em",
              filter: "drop-shadow(0 0 20px rgba(124, 58, 237, 0.4))",
            }}
          >
            REALMWALKER
          </h1>
          <div className="relative mb-12 max-w-2xl overflow-hidden rounded-lg border border-[#c084fc]/30 bg-[#1e1b4b]/40 p-7 text-center leading-relaxed sm:p-10">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#c084fc]/50 to-transparent" />
            <p className="text-xl italic mb-6 text-slate-300">
              "The realms shift, the shadows deepen. Will you walk the light or be consumed by the
              void?"
            </p>
            <div className="text-left space-y-2 text-slate-400">
              • <b>Navigate</b> with [W][A][S][D]
              <br />• <b>Strike</b> hostiles with [LEFT CLICK]
              <br />• <b>Venture</b> deeper to find rare relics
              <br />• <b>Maintain</b> your vitality or perish in the shifting mist
            </div>
          </div>
          <button
            type="button"
            onClick={handleStart}
            className="group relative px-16 py-5 text-2xl font-bold uppercase tracking-[6px] overflow-hidden rounded-lg transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#7c3aed] to-[#c084fc] transition-transform group-hover:scale-105" />
            <span className="relative z-10 text-white">Enter the Shifting Realm</span>
          </button>
        </div>
      )}

      {phase === "playing" && <HUD />}

      {phase === "gameover" && (
        <GameOverScreen
          title="FATE SEALED"
          subtitle={`You reached Zone ${state.zone} with ${state.loot.length} relics.`}
          actions={<OverlayButton onClick={handleStart}>Walk Again</OverlayButton>}
        />
      )}
    </GameViewport>
  );
}

export default function Game() {
  return (
    <WorldProvider world={realmWorld}>
      <RealmApp />
    </WorldProvider>
  );
}
