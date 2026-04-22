import { GameOverScreen, OverlayButton, StartScreen } from "@arcade-cabinet/shared";
import { Canvas } from "@react-three/fiber";
import { useTrait, WorldProvider } from "koota/react";
import { World } from "./r3f/World";
import { SNWTrait } from "./store/traits";
import { snwEntity, snwWorld } from "./store/world";
import { HUD } from "./ui/HUD";

function SNWApp() {
  const state = useTrait(snwEntity, SNWTrait);

  const handleStart = () => {
    snwEntity.set(SNWTrait, {
      phase: "playing",
      hp: 100,
      maxHp: 100,
      score: 0,
      level: 1,
      xp: 0,
      xpNeeded: 5,
      wave: 1,
      waveTime: 0,
      kills: 0,
    });
  };

  return (
    <div style={{ width: "100%", height: "100svh", position: "relative", background: "#020205" }}>
      <Canvas shadows camera={{ fov: 55 }}>
        {state.phase === "playing" && <World />}
      </Canvas>

      {state.phase === "menu" && (
        <StartScreen
          title="PROTOCOL: SILENT NIGHT"
          subtitle="Defend the perimeter. Survive the onslaught."
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
              border: "2px solid rgba(0, 255, 204, 0.5)",
              borderRadius: "50%",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: 4,
                height: 4,
                background: "#00ffcc",
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
    </div>
  );
}

export default function Game() {
  return (
    <WorldProvider world={snwWorld}>
      <SNWApp />
    </WorldProvider>
  );
}
