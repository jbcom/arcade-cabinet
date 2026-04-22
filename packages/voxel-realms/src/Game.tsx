import { GameOverScreen, OverlayButton, StartScreen } from "@arcade-cabinet/shared";
import { Canvas } from "@react-three/fiber";
import { useTrait, WorldProvider } from "koota/react";
import { World } from "./r3f/World";
import { VoxelTrait } from "./store/traits";
import { voxelEntity, voxelWorld } from "./store/world";
import { HUD } from "./ui/HUD";

function VoxelApp() {
  const state = useTrait(voxelEntity, VoxelTrait);

  const handleStart = () => {
    voxelEntity.set(VoxelTrait, { phase: "playing", hp: 20, maxHp: 20, score: 0, inventory: [] });
  };

  return (
    <div style={{ width: "100%", height: "100svh", position: "relative", background: "#87ceeb" }}>
      <Canvas shadows camera={{ fov: 75 }}>
        {state.phase === "playing" && <World />}
      </Canvas>

      {state.phase === "menu" && (
        <StartScreen
          title="Voxel Realms"
          subtitle="Explore the infinite procedural world."
          primaryAction={<OverlayButton onClick={handleStart}>Enter Realm</OverlayButton>}
        />
      )}

      {state.phase === "playing" && (
        <>
          <HUD />
          {/* Simple Crosshair */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "white",
              pointerEvents: "none",
              textShadow: "0 0 2px black",
            }}
          >
            +
          </div>
        </>
      )}

      {state.phase === "gameover" && (
        <GameOverScreen
          title="YOU DIED"
          subtitle={`Final Score: ${state.score}`}
          actions={<OverlayButton onClick={handleStart}>Respawn</OverlayButton>}
        />
      )}
    </div>
  );
}

export default function Game() {
  return (
    <WorldProvider world={voxelWorld}>
      <VoxelApp />
    </WorldProvider>
  );
}
