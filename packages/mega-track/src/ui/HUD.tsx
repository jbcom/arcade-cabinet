import { useResponsive } from "@arcade-cabinet/shared";
import type { MegaTrackState } from "../engine/types";

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
        <LaneButton direction={-1} label="Left" onLaneControl={onLaneControl} />
        <LaneButton direction={1} label="Right" onLaneControl={onLaneControl} />
      </div>
    </div>
  );
}

interface LaneButtonProps {
  direction: -1 | 1;
  label: string;
  onLaneControl: (direction: number) => void;
}

function LaneButton({ direction, label, onLaneControl }: LaneButtonProps) {
  return (
    <button
      type="button"
      onPointerDown={() => onLaneControl(direction)}
      onPointerUp={() => onLaneControl(0)}
      onPointerCancel={() => onLaneControl(0)}
      onPointerLeave={() => onLaneControl(0)}
      style={{
        width: "min(9rem, 38vw)",
        minHeight: "3rem",
        border: "1px solid rgba(148,163,184,0.45)",
        borderRadius: 8,
        background: "rgba(15,23,42,0.74)",
        color: "#e2e8f0",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        fontWeight: 800,
        pointerEvents: "auto",
        touchAction: "none",
      }}
    >
      <span style={{ fontSize: "1.25rem" }}>{direction < 0 ? "<" : ">"}</span>
      <span>{label}</span>
    </button>
  );
}
