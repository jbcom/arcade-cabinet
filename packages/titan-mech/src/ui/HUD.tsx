import { HUDOverlay } from "@arcade-cabinet/shared";
import { useTrait } from "koota/react";
import { TitanTrait } from "../store/traits";
import { titanEntity } from "../store/world";

export function HUD() {
  const state = useTrait(titanEntity, TitanTrait);

  return (
    <HUDOverlay
      topLeft={
        <div style={{ color: "#00ffcc", fontFamily: "monospace" }}>
          <div style={{ fontSize: 12 }}>TITAN MECH OS v5.0</div>
          <div style={{ fontSize: 24, fontWeight: "bold" }}>SCRAP: {state.scrap}</div>
        </div>
      }
      topRight={
        <div style={{ textAlign: "right", color: "#00ffcc", fontFamily: "monospace" }}>
          <div style={{ fontSize: 12 }}>SYSTEM INTEGRITY</div>
          <div
            style={{
              width: 150,
              height: 10,
              background: "#111",
              border: "1px solid #00ffcc",
              marginTop: 4,
            }}
          >
            <div
              style={{
                width: `${(state.hp / state.maxHp) * 100}%`,
                height: "100%",
                background: "#00ffcc",
              }}
            />
          </div>
        </div>
      }
      bottomLeft={
        <div style={{ color: "#00ffcc", fontFamily: "monospace", fontSize: 12 }}>
          WASD: Move/Turn | CLICK: Fire
        </div>
      }
    />
  );
}
