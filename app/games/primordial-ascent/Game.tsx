import { browserTestCanvasGlOptions, GameViewport, PhaseTrait } from "@app/shared";
import { createInitialPrimordialState } from "@logic/games/primordial-ascent/engine/primordialSimulation";
import { PrimordialTrait } from "@logic/games/primordial-ascent/store/traits";
import { primordialEntity, primordialWorld } from "@logic/games/primordial-ascent/store/world";
import { Canvas } from "@react-three/fiber";
import { useTrait, WorldProvider } from "koota/react";
import { World } from "./r3f/World";
import { Crosshair } from "./ui/Crosshair";
import { HUD } from "./ui/HUD";

function PrimordialApp() {
  const state = useTrait(primordialEntity, PrimordialTrait);

  const handleStart = () => {
    primordialEntity.set(PhaseTrait, { phase: "playing" });
    primordialEntity.set(PrimordialTrait, createInitialPrimordialState("playing"));
  };

  return (
    <GameViewport background="#020608">
      <Canvas gl={browserTestCanvasGlOptions}>{state.phase === "playing" && <World />}</Canvas>

      {state.phase === "menu" && (
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white backdrop-blur-md"
          style={{
            background:
              "linear-gradient(180deg, rgba(2,6,8,0.68), rgba(2,6,8,0.94)), linear-gradient(135deg, rgba(0,238,255,0.18), rgba(255,51,51,0.2)), repeating-linear-gradient(0deg, rgba(255,116,72,0.18) 0 2px, transparent 2px 18px)",
          }}
        >
          <h1
            className="text-5xl md:text-7xl font-black uppercase tracking-[5px] mb-4 text-center text-white"
            style={{ textShadow: "0 0 20px #00eeff, 2px 2px 0px #000" }}
          >
            PRIMORDIAL ASCENT
          </h1>
          <div className="bg-black/40 p-6 rounded-lg border border-slate-800 max-w-2xl text-center text-slate-300 leading-relaxed mb-10 text-lg">
            The magma wake is climbing through a basalt lung. Read the anchor chain and keep your
            swing above the red line.
            <br />
            <br />
            Aim at the{" "}
            <span className="font-bold text-[#00eeff]" style={{ textShadow: "0 0 10px #00eeff" }}>
              GLOWING CYAN CEILINGS
            </span>{" "}
            and hold <b>[LEFT CLICK]</b> to swing.
            <br />
            Land on the <span className="font-bold text-[#00ff66]">GREEN MOSS</span> to rest and
            press <b>[SPACE]</b> to leap.
            <br />
            <b>[WASD] / [ARROWS]</b> to shift momentum mid-air. On touch screens, press anywhere in
            the cavern to spawn the movement joystick.
            <br />
          </div>
          <button
            type="button"
            onClick={handleStart}
            className="px-12 py-4 text-xl font-bold uppercase tracking-[3px] text-[#00eeff] bg-[#00eeff]/10 border-2 border-[#00eeff] rounded hover:bg-[#00eeff] hover:text-black transition-all duration-200"
            style={{
              boxShadow: "0 0 15px rgba(0,238,255,0.2), inset 0 0 10px rgba(0,238,255,0.1)",
            }}
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
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white backdrop-blur-md"
          style={{
            background:
              "linear-gradient(180deg, rgba(20,2,2,0.74), rgba(2,6,8,0.94)), repeating-linear-gradient(0deg, rgba(255,51,51,0.22) 0 2px, transparent 2px 16px)",
          }}
        >
          <h1
            className="text-5xl md:text-7xl font-black uppercase tracking-[5px] mb-12 text-center text-white"
            style={{ textShadow: "0 0 20px #ff3333, 2px 2px 0px #000" }}
          >
            CONSUMED BY MAGMA
          </h1>

          <div className="grid grid-cols-2 gap-5 mb-10 bg-black/50 p-6 rounded-lg border border-slate-800">
            <div className="text-center">
              <div className="text-[10px] text-slate-400 mb-1">MAX ALTITUDE</div>
              <div className="text-3xl font-bold text-white">{state.maxAltitude}m</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-slate-400 mb-1">TIME SURVIVED</div>
              <div className="text-3xl font-bold text-white">
                {Math.floor(state.timeSurvived / 1000)}s
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleStart}
            className="px-12 py-4 text-xl font-bold uppercase tracking-[3px] text-[#ff3333] bg-[#ff3333]/10 border-2 border-[#ff3333] rounded hover:bg-[#ff3333] hover:text-black transition-all duration-200"
            style={{
              boxShadow: "0 0 15px rgba(255,51,51,0.2), inset 0 0 10px rgba(255,51,51,0.1)",
            }}
          >
            Retry Ascent
          </button>
        </div>
      )}
    </GameViewport>
  );
}

export default function Game() {
  return (
    <WorldProvider world={primordialWorld}>
      <PrimordialApp />
    </WorldProvider>
  );
}
