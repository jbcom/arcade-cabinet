import { FloatingJoystick, HUDOverlay } from "@arcade-cabinet/shared";
import { useTrait } from "koota/react";
import { MovementTrait, RealmTrait } from "../store/traits";
import { realmEntity } from "../store/world";

export function HUD() {
  const state = useTrait(realmEntity, RealmTrait);
  const setMovement = (x: number, z: number) => realmEntity.set(MovementTrait, { x, z });

  return (
    <HUDOverlay
      topLeft={
        <div style={{ color: "#e2e8f0", fontFamily: "serif" }}>
          <div style={{ fontSize: 12, letterSpacing: "2px", opacity: 0.6 }}>REALMWALKER v1.0</div>
          <div style={{ fontSize: 24, fontWeight: "bold", color: "#c084fc" }}>
            ZONE {state.zone}
          </div>
        </div>
      }
      topRight={
        <div style={{ textAlign: "right", color: "#e2e8f0", fontFamily: "serif" }}>
          <div style={{ fontSize: 12, letterSpacing: "2px", opacity: 0.6 }}>VITALITY</div>
          <div
            style={{
              width: 200,
              height: 12,
              background: "#1e1b4b",
              border: "1px solid #c084fc",
              marginTop: 4,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${(state.hp / state.maxHp) * 100}%`,
                height: "100%",
                background: "linear-gradient(90deg, #7c3aed, #c084fc)",
              }}
            />
          </div>
          <div style={{ fontSize: 14, marginTop: 4 }}>ATK: {state.atk}</div>
          <div style={{ color: "#f0abfc", fontSize: 13, marginTop: 4 }}>
            Attunement {state.attunement}%
          </div>
        </div>
      }
      bottomLeft={
        <div style={{ color: "#c4b5fd", fontFamily: "serif", fontSize: 14 }}>
          <div style={{ color: "#94a3b8", marginBottom: 10 }}>{state.objective}</div>
          <div style={{ color: "#ddd6fe", fontSize: 12, marginBottom: 8 }}>
            Relic {state.nearestRelicDistance}m / Portal {state.portalDistance}m
          </div>
        </div>
      }
      bottomRight={
        <div style={{ textAlign: "right", color: "#e2e8f0", fontFamily: "serif" }}>
          <div style={{ fontSize: 12, letterSpacing: "2px", opacity: 0.6 }}>LOOT COLLECTED</div>
          <div style={{ fontSize: 24, fontWeight: "bold" }}>{state.loot.length}</div>
          <div style={{ color: "#c4b5fd", fontSize: 12 }}>Relics heal on pickup</div>
        </div>
      }
    >
      <FloatingJoystick
        accent="#c084fc"
        label="Realm movement joystick"
        onChange={(vector) => setMovement(vector.x, vector.y)}
      />
    </HUDOverlay>
  );
}
