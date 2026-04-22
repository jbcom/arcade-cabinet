import { OverlayButton, PhaseTrait, StartScreen, useGameLoop } from "@arcade-cabinet/shared";
import { Canvas } from "@react-three/fiber";
import { useTrait, WorldProvider } from "koota/react";
import { useState } from "react";
import { BUILDINGS, type BuildingId, CONFIG } from "./engine/types";
import { World } from "./r3f/World";
import { type BuildingData, SkyTrait, TowerTrait } from "./store/traits";
import { skyEntity, skyWorld } from "./store/world";
import { HUD } from "./ui/HUD";

function SkyApp() {
  const phase = (useTrait(skyEntity, PhaseTrait) as any)?.phase ?? "menu";
  const [selectedTool, setSelectedTool] = useState<BuildingId | null>(null);

  useGameLoop(
    (_deltaMs) => {
      if (phase !== "playing") return;

      const state = skyEntity.get(SkyTrait);
      if (!state) return;

      let nextTick = state.tick + 1;
      let nextDay = state.day;
      let nextFunds = state.funds;

      if (nextTick >= CONFIG.DAY_TICKS) {
        nextTick = 0;
        nextDay += 1;
        // Midnight rent/income logic
        const tower = skyEntity.get(TowerTrait);
        if (tower) {
          tower.buildings.forEach((b) => {
            const info = BUILDINGS[b.type as BuildingId];
            if (info.rent) nextFunds += info.rent;
            if (info.income) nextFunds += info.income;
          });
        }
      }

      skyEntity.set(SkyTrait, { ...state, tick: nextTick, day: nextDay, funds: nextFunds });
    },
    [phase]
  );

  const handleStart = () => {
    skyEntity.set(PhaseTrait, { phase: "playing" });
  };

  const handlePointerDown = (_e: any) => {
    if (!selectedTool || phase !== "playing") return;

    // Simple grid placement logic for the prototype
    // Real version would use raycasting to get grid coordinates
    const tower = skyEntity.get(TowerTrait);
    if (tower) {
      const info = BUILDINGS[selectedTool];
      if (skyEntity.get(SkyTrait)?.funds < info.cost) return;

      const newBuilding: BuildingData = {
        id: Math.random().toString(36).substr(2, 9),
        type: selectedTool,
        x: Math.floor(Math.random() * 10) - 5,
        y: Math.floor(Math.random() * 10),
        w: info.w || 1,
        h: 1,
        dirt: 0,
      };

      skyEntity.set(TowerTrait, { buildings: [...tower.buildings, newBuilding] });
      const state = skyEntity.get(SkyTrait)!;
      skyEntity.set(SkyTrait, { ...state, funds: state.funds - info.cost });
    }
  };

  return (
    <div style={{ width: "100%", height: "100svh", position: "relative", background: "#000" }}>
      <Canvas
        shadows
        camera={{ position: [0, 50, 100], fov: 45 }}
        onPointerDown={handlePointerDown}
      >
        {phase === "playing" && <World />}
      </Canvas>

      {phase === "menu" && (
        <StartScreen
          title="REACH FOR THE SKY"
          subtitle="Architect, manage, and evolve your vertical empire."
          primaryAction={<OverlayButton onClick={handleStart}>Break Ground</OverlayButton>}
        />
      )}

      {phase === "playing" && <HUD onSelectTool={setSelectedTool} selectedTool={selectedTool} />}
    </div>
  );
}

export default function Game() {
  return (
    <WorldProvider world={skyWorld}>
      <SkyApp />
    </WorldProvider>
  );
}
