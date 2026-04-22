import {
  browserTestCanvasGlOptions,
  GameOverScreen,
  GameViewport,
  OverlayButton,
  PhaseTrait,
} from "@app/shared";
import { createInitialTitanState } from "@logic/games/titan-mech/engine/titanSimulation";
import { TitanTrait } from "@logic/games/titan-mech/store/traits";
import { titanEntity, titanWorld } from "@logic/games/titan-mech/store/world";
import { Canvas } from "@react-three/fiber";
import { useTrait, WorldProvider } from "koota/react";
import { World } from "./r3f/World";
import { HUD } from "./ui/HUD";

function TitanApp() {
  const state = useTrait(titanEntity, TitanTrait);
  const phase =
    (useTrait(titanEntity, PhaseTrait) as { phase: string } | undefined)?.phase ?? "menu";

  const handleStart = () => {
    titanEntity.set(PhaseTrait, { phase: "playing" });
    titanEntity.set(TitanTrait, createInitialTitanState("playing"));
  };

  return (
    <GameViewport background="#0b0f14">
      <Canvas shadows camera={{ fov: 48, position: [0, 20, -42] }} gl={browserTestCanvasGlOptions}>
        {phase === "playing" && <World />}
      </Canvas>

      {phase === "menu" && (
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-[#c8fff3] backdrop-blur-md"
          style={{
            background:
              "linear-gradient(180deg, rgba(9,13,18,0.7), rgba(9,13,18,0.96)), linear-gradient(135deg, rgba(45,212,191,0.16), rgba(244,63,94,0.12)), repeating-linear-gradient(90deg, rgba(45,212,191,0.12) 0 1px, transparent 1px 48px)",
          }}
        >
          <h1
            className="mb-5 text-center font-black uppercase leading-none"
            style={{
              color: "#f8fafc",
              fontSize: "clamp(2.8rem, 9vw, 6.4rem)",
              letterSpacing: "0.12em",
              textShadow: "0 0 28px rgba(45,212,191,0.45)",
            }}
          >
            TITAN MECH OS
          </h1>
          <div className="mb-8 grid w-full max-w-2xl gap-3 rounded border border-[#2dd4bf]/35 bg-[#111827]/85 p-5 font-mono shadow-[0_0_40px_rgba(45,212,191,0.16)] sm:grid-cols-3">
            <div>
              <div className="text-[0.68rem] uppercase text-[#f59e0b]">Reactor</div>
              <div className="text-2xl font-black">100%</div>
            </div>
            <div>
              <div className="text-[0.68rem] uppercase text-[#f59e0b]">Chassis</div>
              <div className="text-2xl font-black">MX-9</div>
            </div>
            <div>
              <div className="text-[0.68rem] uppercase text-[#f59e0b]">Mission</div>
              <div className="text-2xl font-black">Pylon Sweep</div>
            </div>
            <div className="border-t border-[#2dd4bf]/20 pt-3 text-sm leading-6 text-slate-300 sm:col-span-3">
              A heavy frame, live coolant loop, and forward ordnance array are online. Hold the
              reactor perimeter, secure pylons, and bring back enough scrap to harden the chassis.
            </div>
          </div>
          <button
            type="button"
            onClick={handleStart}
            className="border-2 border-[#2dd4bf] bg-[#2dd4bf]/12 px-10 py-4 font-mono text-xl font-bold uppercase text-[#e6fffb] transition-colors duration-200 hover:bg-[#2dd4bf] hover:text-[#06110f]"
            style={{ letterSpacing: "0.14em", boxShadow: "0 0 24px rgba(45,212,191,0.24)" }}
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
