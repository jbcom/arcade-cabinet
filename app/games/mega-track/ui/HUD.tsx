import { FloatingJoystick, useResponsive } from "@app/shared";
import type { MegaTrackState } from "@logic/games/mega-track/engine/types";

interface HUDProps {
  state: MegaTrackState;
  onLaneControl: (direction: number) => void;
}

export function HUD({ state, onLaneControl }: HUDProps) {
  const { isMobile } = useResponsive();
  const speed = Math.round(state.speed * 100);
  const distance = Math.floor(state.distance / 10);
  const overdriveSeconds = (state.overdriveMs / 1000).toFixed(1);
  const integrityColor =
    state.integrity > 60 ? "#86efac" : state.integrity > 30 ? "#facc15" : "#f87171";
  const panelStyle = {
    background: "rgba(15,23,42,0.74)",
    border: "1px solid rgba(148,163,184,0.35)",
    borderRadius: 8,
    boxShadow: "0 18px 45px rgba(2,6,23,0.35)",
    color: "#f8fafc",
    padding: isMobile ? "0.65rem" : "0.85rem 1rem",
    pointerEvents: "auto" as const,
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: isMobile ? "0.6rem" : "1rem",
        boxSizing: "border-box",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <FloatingJoystick
        accent="#facc15"
        label="Mega Track lane joystick"
        onChange={(vector) => {
          const direction = Math.abs(vector.x) > 0.22 ? Math.sign(vector.x) : 0;
          onLaneControl(direction);
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "flex-start",
          justifyContent: "space-between",
          gap: "0.5rem",
        }}
      >
        <div style={panelStyle}>
          <div
            style={{
              fontSize: 12,
              letterSpacing: 0,
              textTransform: "uppercase",
              color: "#facc15",
            }}
          >
            Mega Track
          </div>
          <h2 style={{ margin: "0.35rem 0", fontSize: isMobile ? 20 : 28 }}>Hazard Ribbon</h2>
          <div style={{ color: "#cbd5e1", fontSize: 12 }}>
            Integrity <span style={{ color: integrityColor }}>{state.integrity}%</span>
          </div>
        </div>
        <div style={{ ...panelStyle, textAlign: isMobile ? "left" : "right" }}>
          <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: "bold" }}>{distance}m</div>
          <div style={{ color: "#cbd5e1" }}>Speed: {speed} km/h</div>
          <div style={{ color: "#cbd5e1", fontSize: 12 }}>
            Hazards {state.obstacles.length} | Boost {Math.round(state.boostCharge)}%
          </div>
          <div style={{ color: state.overdriveMs > 0 ? "#facc15" : "#94a3b8", fontSize: 12 }}>
            Clean pass x{state.cleanPassStreak}{" "}
            {state.overdriveMs > 0 ? `| Overdrive ${overdriveSeconds}s` : ""}
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "0.65rem",
          alignItems: "flex-end",
        }}
      >
        <div
          style={{
            ...panelStyle,
            maxWidth: 260,
            color: "#fde68a",
            fontSize: 12,
            fontWeight: 800,
            textTransform: "uppercase",
          }}
        >
          Touch the track and drag left or right to change lanes.
        </div>
      </div>
    </div>
  );
}
