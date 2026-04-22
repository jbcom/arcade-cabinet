import {
  browserTestCanvasGlOptions,
  CartridgeStartScreen,
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
        <CartridgeStartScreen
          accent="#f43f5e"
          cartridgeId="Slot 08"
          description="Pilot a heavy chassis through an industrial arena and secure the pylons."
          kicker="Mech Cartridge"
          motif="mech"
          onStart={handleStart}
          rules={[
            "Fire only while energy and heat allow the weapon loop to stay stable.",
            "Read pylon objective rings and enemy threats before committing.",
            "Use coolant, movement, and reactor timing to keep the chassis alive.",
          ]}
          secondaryAccent="#f59e0b"
          startLabel="Engage Chassis"
          title="TITAN MECH OS"
        />
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
