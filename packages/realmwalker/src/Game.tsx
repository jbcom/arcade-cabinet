import { GameOverScreen, OverlayButton, PhaseTrait } from "@arcade-cabinet/shared";
import { Canvas } from "@react-three/fiber";
import { useTrait, WorldProvider } from "koota/react";
import { World } from "./r3f/World";
import { RealmTrait } from "./store/traits";
import { realmEntity, realmWorld } from "./store/world";
import { HUD } from "./ui/HUD";

function RealmApp() {
  const state = useTrait(realmEntity, RealmTrait);
  const phase = (useTrait(realmEntity, PhaseTrait) as any)?.phase ?? "menu";

  const handleStart = () => {
    realmEntity.set(PhaseTrait, { phase: "playing" });
    realmEntity.set(RealmTrait, {
      phase: "playing",
      hp: 100,
      maxHp: 100,
      atk: 10,
      zone: 1,
      score: 0,
      loot: [],
    });
  };

  return (
    <div style={{ width: "100%", height: "100svh", position: "relative", background: "#050505" }}>
      <Canvas shadows camera={{ fov: 45 }}>
        {phase === "playing" && <World />}
      </Canvas>

      {phase === "menu" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505]/95 backdrop-blur-lg z-20 text-[#e2e8f0] font-serif">
          <h1
            className="text-6xl md:text-8xl font-black uppercase tracking-[12px] mb-8 text-center text-transparent bg-clip-text bg-gradient-to-b from-[#c084fc] to-[#7c3aed]"
            style={{ filter: "drop-shadow(0 0 20px rgba(124, 58, 237, 0.4))" }}
          >
            REALMWALKER
          </h1>
          <div className="bg-[#1e1b4b]/40 p-10 rounded-xl border border-[#c084fc]/30 max-w-2xl text-center leading-relaxed mb-12 relative overflow-hidden">
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
    </div>
  );
}

export default function Game() {
  return (
    <WorldProvider world={realmWorld}>
      <RealmApp />
    </WorldProvider>
  );
}
