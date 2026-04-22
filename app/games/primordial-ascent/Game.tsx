import {
  browserTestCanvasGlOptions,
  CartridgeStartScreen,
  GameOverScreen,
  GameViewport,
  OverlayButton,
  PhaseTrait,
} from "@app/shared";
import {
  createInitialPrimordialState,
  getPrimordialRunSummary,
} from "@logic/games/primordial-ascent/engine/primordialSimulation";
import { PrimordialTrait } from "@logic/games/primordial-ascent/store/traits";
import { primordialEntity, primordialWorld } from "@logic/games/primordial-ascent/store/world";
import { Canvas } from "@react-three/fiber";
import { useTrait, WorldProvider } from "koota/react";
import { World } from "./r3f/World";
import { Crosshair } from "./ui/Crosshair";
import { HUD } from "./ui/HUD";

function PrimordialApp() {
  const state = useTrait(primordialEntity, PrimordialTrait);
  const summary = getPrimordialRunSummary(state);

  const handleStart = (mode: string) => {
    primordialEntity.set(PhaseTrait, { phase: "playing" });
    primordialEntity.set(PrimordialTrait, createInitialPrimordialState("playing", mode));
  };

  return (
    <GameViewport background="#020608">
      <Canvas gl={browserTestCanvasGlOptions}>{state.phase === "playing" && <World />}</Canvas>

      {state.phase === "menu" && (
        <CartridgeStartScreen
          accent="#00ff66"
          cartridgeId="Slot 07"
          description="Grapple out of a rising lava cavern before the magma wake catches you."
          gameSlug="primordial-ascent"
          kicker="Escape Cartridge"
          motif="primordial"
          onStart={handleStart}
          rules={[
            "Lock to cyan ceiling anchors and build controlled swing tension.",
            "Touch green moss to recover before the next leap.",
            "Stay ahead of the red lava pressure and climb toward brighter air.",
          ]}
          secondaryAccent="#ff3333"
          startLabel="Initiate Sequence"
          title="PRIMORDIAL ASCENT"
        />
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
            onClick={() => handleStart(state.sessionMode)}
            className="px-12 py-4 text-xl font-bold uppercase tracking-[3px] text-[#ff3333] bg-[#ff3333]/10 border-2 border-[#ff3333] rounded hover:bg-[#ff3333] hover:text-black transition-all duration-200"
            style={{
              boxShadow: "0 0 15px rgba(255,51,51,0.2), inset 0 0 10px rgba(255,51,51,0.1)",
            }}
          >
            Retry Ascent
          </button>
        </div>
      )}

      {state.phase === "complete" && (
        <GameOverScreen
          accent="#00ff66"
          title="SURFACE BREACHED"
          subtitle={`Escaped in ${summary.elapsedSeconds}s at ${summary.maxAltitude}m. Final lava gap: ${summary.finalDistanceToLava}m.`}
          actions={
            <OverlayButton onClick={() => handleStart(state.sessionMode)}>
              Climb Again
            </OverlayButton>
          }
        />
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
