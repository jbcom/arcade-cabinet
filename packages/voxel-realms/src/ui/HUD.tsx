import { HUDOverlay } from "@arcade-cabinet/shared";
import { useTrait } from "koota/react";
import { VoxelTrait } from "../store/traits";
import { voxelEntity } from "../store/world";

export function HUD() {
  const state = useTrait(voxelEntity, VoxelTrait);

  return (
    <HUDOverlay
      topLeft={
        <div>
          <div
            style={{
              fontSize: 12,
              letterSpacing: "2px",
              color: "#aaa",
              textTransform: "uppercase",
            }}
          >
            Voxel Realms
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>Score: {state.score}</div>
        </div>
      }
      topRight={
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: 12,
              letterSpacing: "2px",
              color: "#aaa",
              textTransform: "uppercase",
            }}
          >
            HP
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#ff4444" }}>
            {"❤️".repeat(Math.ceil(state.hp / 4))}
          </div>
        </div>
      }
      bottomLeft={
        <div>
          <div style={{ fontSize: 12, color: "#aaa" }}>
            WASD: Move | SPACE: Jump | Click: Lock Mouse
          </div>
        </div>
      }
    />
  );
}
