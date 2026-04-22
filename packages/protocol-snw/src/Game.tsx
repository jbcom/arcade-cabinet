import {
  browserTestCanvasGlOptions,
  GameOverScreen,
  GameViewport,
  OverlayButton,
  PhaseTrait,
  StartScreen,
} from "@arcade-cabinet/shared";
import { Canvas } from "@react-three/fiber";
import { useTrait, WorldProvider } from "koota/react";
import { createInitialSNWState } from "./engine/protocolSimulation";
import { World } from "./r3f/World";
import { SNWTrait } from "./store/traits";
import { snwEntity, snwWorld } from "./store/world";
import { HUD } from "./ui/HUD";

function SNWApp() {
  const state = useTrait(snwEntity, SNWTrait);

  const handleStart = () => {
    snwEntity.set(PhaseTrait, { phase: "playing" });
    snwEntity.set(SNWTrait, createInitialSNWState("playing"));
  };

  return (
    <GameViewport background="#03070a">
      <Canvas shadows camera={{ position: [0, 36, 26], fov: 46 }} gl={browserTestCanvasGlOptions}>
        {state.phase === "playing" && <World />}
      </Canvas>

      {state.phase === "menu" && (
        <StartScreen
          accent="#2dd4bf"
          title="PROTOCOL: SILENT NIGHT"
          subtitle="Hold the signal ring, read the threat lanes, and erase hostile constructs before they breach."
          primaryAction={<OverlayButton onClick={handleStart}>Engage</OverlayButton>}
        />
      )}

      {state.phase === "playing" && (
        <>
          <HUD />
          {/* Custom Crosshair */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 20,
              height: 20,
              border: "2px solid rgba(45, 212, 191, 0.58)",
              borderRadius: "50%",
              pointerEvents: "none",
              boxShadow: "0 0 18px rgba(45, 212, 191, 0.32)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: 4,
                height: 4,
                background: "#2dd4bf",
                borderRadius: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          </div>
        </>
      )}

      {state.phase === "gameover" && (
        <GameOverScreen
          title="MISSION FAILED"
          subtitle={`Final Score: ${state.score}`}
          actions={<OverlayButton onClick={handleStart}>Retry</OverlayButton>}
        />
      )}
    </GameViewport>
  );
}

export default function Game() {
  return (
    <WorldProvider world={snwWorld}>
      <SNWApp />
    </WorldProvider>
  );
}
