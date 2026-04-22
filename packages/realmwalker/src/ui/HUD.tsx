import { HUDOverlay } from "@arcade-cabinet/shared";
import { useTrait } from "koota/react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, type LucideIcon } from "lucide-react";
import { MovementTrait, RealmTrait } from "../store/traits";
import { realmEntity } from "../store/world";

const TOUCH_CONTROLS: Array<{
  id: string;
  label: string;
  x: number;
  z: number;
  gridColumn: number;
  gridRow: number;
  Icon: LucideIcon;
}> = [
  { id: "up", label: "Move forward", x: 0, z: -1, gridColumn: 2, gridRow: 1, Icon: ChevronUp },
  { id: "left", label: "Move left", x: -1, z: 0, gridColumn: 1, gridRow: 2, Icon: ChevronLeft },
  { id: "down", label: "Move back", x: 0, z: 1, gridColumn: 2, gridRow: 2, Icon: ChevronDown },
  { id: "right", label: "Move right", x: 1, z: 0, gridColumn: 3, gridRow: 2, Icon: ChevronRight },
];

const touchButtonStyle = {
  width: 44,
  height: 44,
  borderRadius: 10,
  border: "1px solid rgba(216, 180, 254, 0.45)",
  background: "rgba(76, 29, 149, 0.62)",
  color: "#f5f3ff",
  display: "grid",
  placeItems: "center",
  touchAction: "none",
};

export function HUD() {
  const state = useTrait(realmEntity, RealmTrait);
  const setMovement = (x: number, z: number) => realmEntity.set(MovementTrait, { x, z });
  const stopMovement = () => setMovement(0, 0);

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
        </div>
      }
      bottomLeft={
        <div style={{ color: "#c4b5fd", fontFamily: "serif", fontSize: 14 }}>
          <div style={{ color: "#94a3b8", marginBottom: 10 }}>[W][A][S][D] or touch to move</div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 44px)",
              gridTemplateRows: "repeat(2, 44px)",
              gap: 8,
            }}
          >
            {TOUCH_CONTROLS.map(({ id, label, x, z, gridColumn, gridRow, Icon }) => (
              <button
                key={id}
                type="button"
                aria-label={label}
                title={label}
                onPointerDown={() => setMovement(x, z)}
                onPointerUp={stopMovement}
                onPointerCancel={stopMovement}
                onPointerLeave={stopMovement}
                style={{ ...touchButtonStyle, gridColumn, gridRow }}
              >
                <Icon size={24} />
              </button>
            ))}
          </div>
        </div>
      }
      bottomRight={
        <div style={{ textAlign: "right", color: "#e2e8f0", fontFamily: "serif" }}>
          <div style={{ fontSize: 12, letterSpacing: "2px", opacity: 0.6 }}>LOOT COLLECTED</div>
          <div style={{ fontSize: 24, fontWeight: "bold" }}>{state.loot.length}</div>
        </div>
      }
    />
  );
}
