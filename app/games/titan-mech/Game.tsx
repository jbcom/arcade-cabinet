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
          description="Pilot a heat-stressed extraction titan through ore pylons and reactor pressure."
          kicker="Overheat Cartridge"
          motif="mech"
          onStart={handleStart}
          rules={[
            "Enter pylon rings and hold extractor to grind ore into the hopper.",
            "Full hoppers eject into credits and scrap while heat spikes climb.",
            "Use coolant, movement, and weapons to keep the chassis online.",
          ]}
          secondaryAccent="#f59e0b"
          startLabel="Engage Chassis"
          title="TITAN MECH: OVERHEAT"
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
