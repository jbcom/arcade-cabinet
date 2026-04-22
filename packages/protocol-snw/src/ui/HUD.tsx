import { HUDOverlay } from "@arcade-cabinet/shared";
import { useTrait } from "koota/react";
import { snwEntity } from "../store/world";
import { SNWTrait } from "../store/traits";

export function HUD() {
  const state = useTrait(snwEntity, SNWTrait);

  return (
    <HUDOverlay
      topLeft={
        <div>
          <div style={{ fontSize: 12, letterSpacing: "2px", color: "#00ffcc", textTransform: "uppercase" }}>SCORE</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>
            {state.score}
          </div>
        </div>
      }
      topRight={
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, letterSpacing: "2px", color: "#ff0044", textTransform: "uppercase" }}>INTEGRITY</div>
          <div style={{ width: 150, height: 10, background: "#330011", border: "1px solid #ff0044", marginTop: 5 }}>
            <div style={{ width: `${(state.hp / state.maxHp) * 100}%`, height: "100%", background: "#ff0044" }} />
          </div>
        </div>
      }
      bottomLeft={
        <div>
           <div style={{ fontSize: 12, color: "#00ffcc" }}>
             WASD: Move | SPACE: Dash | MOUSE: Aim/Shoot
           </div>
        </div>
      }
      bottomRight={
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, letterSpacing: "2px", color: "#00ffcc", textTransform: "uppercase" }}>WAVE {state.wave}</div>
          <div style={{ fontSize: 16, color: "#fff" }}>
            {state.waveTime > 0 ? `${Math.ceil(state.waveTime)}s` : "INCOMING"}
          </div>
        </div>
      }
    />
  );
}
