import {
  browserTestCanvasGlOptions,
  GameOverScreen,
  GameViewport,
  OverlayButton,
  StartScreen,
} from "@arcade-cabinet/shared";
import { Canvas } from "@react-three/fiber";
import { useTrait, WorldProvider } from "koota/react";
import { createInitialVoxelState } from "./engine/voxelSimulation";
import { World } from "./r3f/World";
import { VoxelTrait } from "./store/traits";
import { voxelEntity, voxelWorld } from "./store/world";
import { HUD } from "./ui/HUD";

function VoxelApp() {
  const state = useTrait(voxelEntity, VoxelTrait);

  const handleStart = () => {
    voxelEntity.set(VoxelTrait, createInitialVoxelState("playing"));
  };

  return (
    <GameViewport background="#9fd7e8">
      <Canvas shadows camera={{ fov: 72, position: [0, 4.6, 0] }} gl={browserTestCanvasGlOptions}>
        {state.phase !== "gameover" && (
          <World
            key={state.phase === "playing" ? "playing" : "preview"}
            interactive={state.phase === "playing"}
          />
        )}
      </Canvas>

      {state.phase === "menu" && (
        <StartScreen
          accent="#84cc16"
          title="Voxel Realms"
          subtitle="Step out from a surveyed shoreline camp, read the beacon chain, and map the living terrain before nightfall."
          primaryAction={<OverlayButton onClick={handleStart}>Enter Realm</OverlayButton>}
        />
      )}

      {state.phase === "playing" && (
        <>
          <HUD />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 28,
              height: 28,
              border: "2px solid rgba(255, 255, 255, 0.82)",
              borderRadius: "50%",
              pointerEvents: "none",
              boxShadow:
                "0 0 12px rgba(14, 165, 233, 0.55), inset 0 0 8px rgba(14, 165, 233, 0.35)",
              zIndex: 20,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: "#ffffff",
              pointerEvents: "none",
              zIndex: 21,
            }}
          />
        </>
      )}

      {state.phase === "gameover" && (
        <GameOverScreen
          title="YOU DIED"
          subtitle={`Final Score: ${state.score}`}
          actions={<OverlayButton onClick={handleStart}>Respawn</OverlayButton>}
        />
      )}
    </GameViewport>
  );
}

export default function Game() {
  return (
    <WorldProvider world={voxelWorld}>
      <VoxelApp />
    </WorldProvider>
  );
}
