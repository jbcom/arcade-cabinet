import { Canvas } from "@react-three/fiber";
import { WorldProvider, useTrait } from "koota/react";
import { primordialWorld, primordialEntity } from "./store/world";
import { PrimordialTrait } from "./store/traits";
import { World } from "./r3f/World";
import { HUD } from "./ui/HUD";
import { Crosshair } from "./ui/Crosshair";
import { StartScreen, GameOverScreen, OverlayButton, PhaseTrait } from "@arcade-cabinet/shared";
import { useEffect } from "react";

function PrimordialApp() {
  const state = useTrait(primordialEntity, PrimordialTrait);
  const phase = (useTrait(primordialEntity, PhaseTrait) as any)?.phase ?? "menu";

  const handleStart = () => {
    primordialEntity.set(PhaseTrait, { phase: "playing" });
    primordialEntity.set(PrimordialTrait, { phase: "playing", altitude: 0, maxAltitude: 0, timeSurvived: 0, velocity: 0, distToLava: 100, isInGrappleRange: false });
  };

  return (
    <div style={{ width: "100%", height: "100svh", position: "relative", background: "#020608" }}>
      <Canvas>
        {state.phase === "playing" && <World />}
      </Canvas>
      
      {state.phase === "menu" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#020608]/90 backdrop-blur-md z-20 text-white">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-[5px] mb-4 text-center text-white" style={{ textShadow: "0 0 20px #00eeff, 2px 2px 0px #000" }}>
            PRIMORDIAL ASCENT
          </h1>
          <div className="bg-black/40 p-6 rounded-lg border border-slate-800 max-w-2xl text-center text-slate-300 leading-relaxed mb-10 text-lg">
            The magma is rising. Keep moving upwards.<br/><br/>
            Aim at the <span className="font-bold text-[#00eeff]" style={{ textShadow: "0 0 10px #00eeff" }}>GLOWING CYAN CEILINGS</span> and hold <b>[LEFT CLICK]</b> to swing.<br/>
            Land on the <span className="font-bold text-[#00ff66]">GREEN MOSS</span> to rest and press <b>[SPACE]</b> to leap.<br/>
            <b>[WASD] / [ARROWS]</b> to shift momentum mid-air.<br/>
          </div>
          <button 
            onClick={handleStart}
            className="px-12 py-4 text-xl font-bold uppercase tracking-[3px] text-[#00eeff] bg-[#00eeff]/10 border-2 border-[#00eeff] rounded hover:bg-[#00eeff] hover:text-black transition-all duration-200"
            style={{ boxShadow: "0 0 15px rgba(0,238,255,0.2), inset 0 0 10px rgba(0,238,255,0.1)" }}
          >
            Initiate Sequence
          </button>
        </div>
      )}
      
      {state.phase === "playing" && (
        <>
          <HUD />
          <Crosshair />
        </>
      )}
      
      {state.phase === "gameover" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#020608]/90 backdrop-blur-md z-20 text-white">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-[5px] mb-12 text-center text-white" style={{ textShadow: "0 0 20px #ff3333, 2px 2px 0px #000" }}>
            CONSUMED BY MAGMA
          </h1>
          
          <div className="grid grid-cols-2 gap-5 mb-10 bg-black/50 p-6 rounded-lg border border-slate-800">
            <div className="text-center">
              <div className="text-[10px] text-slate-400 mb-1">MAX ALTITUDE</div>
              <div className="text-3xl font-bold text-white">{state.maxAltitude}m</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-slate-400 mb-1">TIME SURVIVED</div>
              <div className="text-3xl font-bold text-white">{Math.floor(state.timeSurvived / 1000)}s</div>
            </div>
          </div>

          <button 
            onClick={handleStart}
            className="px-12 py-4 text-xl font-bold uppercase tracking-[3px] text-[#ff3333] bg-[#ff3333]/10 border-2 border-[#ff3333] rounded hover:bg-[#ff3333] hover:text-black transition-all duration-200"
            style={{ boxShadow: "0 0 15px rgba(255,51,51,0.2), inset 0 0 10px rgba(255,51,51,0.1)" }}
          >
            Retry Ascent
          </button>
        </div>
      )}
    </div>
  );
}

export default function Game() {
  return (
    <WorldProvider world={primordialWorld}>
      <PrimordialApp />
    </WorldProvider>
  );
}
