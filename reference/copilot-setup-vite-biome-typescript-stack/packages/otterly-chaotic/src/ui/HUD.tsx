import { OverlayButton, useResponsive } from "@arcade-cabinet/shared";
import type { OtterlyState, Vec2 } from "../engine/types";

interface HUDProps {
  state: OtterlyState;
  onBark: () => void;
  onMove: (movement: Vec2) => void;
}

export function HUD({ state, onBark, onMove }: HUDProps) {
  const { isMobile } = useResponsive();
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
          justifyContent: "space-between",
          gap: "0.5rem",
          alignItems: isMobile ? "stretch" : "flex-start",
        }}
      >
        <div style={panelStyle}>
          <div
            style={{
              fontSize: 12,
              letterSpacing: 0,
              textTransform: "uppercase",
              color: "#34d399",
            }}
          >
            Otterly Chaotic
          </div>
          <h2 style={{ margin: "0.35rem 0", fontSize: isMobile ? 20 : 28 }}>Salad Sprint</h2>
          <div style={{ color: "#cbd5e1", fontSize: isMobile ? 12 : 14 }}>{state.objective}</div>
        </div>
        <div style={{ ...panelStyle, minWidth: isMobile ? undefined : 190 }}>
          <div>Ball health: {Math.round(state.ballHealth)}%</div>
          <div>Time: {(state.elapsedMs / 1000).toFixed(1)}s</div>
          <div>
            Bark:{" "}
            {state.barkCooldownMs > 0 ? `${(state.barkCooldownMs / 1000).toFixed(1)}s` : "Ready"}
          </div>
          <div style={{ color: state.rallyMs > 0 ? "#facc15" : "#cbd5e1" }}>
            Rally:{" "}
            {state.rallyMs > 0 ? `${(state.rallyMs / 1000).toFixed(1)}s` : "Build with barks"}
          </div>
          <div style={{ color: "#a7f3d0" }}>Rescue streak: {state.rescueStreak}</div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "0.75rem",
        }}
      >
        <div style={{ ...panelStyle, width: isMobile ? 128 : 152 }}>
          <div
            style={{
              height: 10,
              borderRadius: 6,
              background: "rgba(15, 23, 42, 0.6)",
              overflow: "hidden",
              marginBottom: "0.65rem",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${state.ballHealth}%`,
                background: "linear-gradient(90deg, #22c55e, #f97316, #ef4444)",
              }}
            />
          </div>
          <MovePad onMove={onMove} />
        </div>
        <OverlayButton
          onClick={onBark}
          style={{
            borderRadius: 8,
            minHeight: "3.25rem",
            pointerEvents: "auto",
          }}
        >
          Bark Pulse
        </OverlayButton>
      </div>
    </div>
  );
}

function MovePad({ onMove }: { onMove: (movement: Vec2) => void }) {
  const buttons: Array<{
    label: string;
    x: number;
    y: number;
    gridColumn: number;
    gridRow: number;
  }> = [
    { label: "^", x: 0, y: -1, gridColumn: 2, gridRow: 1 },
    { label: "<", x: -1, y: 0, gridColumn: 1, gridRow: 2 },
    { label: ">", x: 1, y: 0, gridColumn: 3, gridRow: 2 },
    { label: "v", x: 0, y: 1, gridColumn: 2, gridRow: 3 },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 2.25rem)",
        gridTemplateRows: "repeat(3, 2.25rem)",
        gap: "0.25rem",
        justifyContent: "center",
      }}
    >
      {buttons.map((button) => (
        <button
          key={button.label}
          type="button"
          onPointerDown={() => onMove({ x: button.x, y: button.y })}
          onPointerUp={() => onMove({ x: 0, y: 0 })}
          onPointerCancel={() => onMove({ x: 0, y: 0 })}
          onPointerLeave={() => onMove({ x: 0, y: 0 })}
          style={{
            gridColumn: button.gridColumn,
            gridRow: button.gridRow,
            border: "1px solid rgba(148,163,184,0.45)",
            borderRadius: 8,
            background: "rgba(15,23,42,0.76)",
            color: "#e2e8f0",
            fontWeight: 900,
            cursor: "pointer",
            pointerEvents: "auto",
            touchAction: "none",
          }}
        >
          {button.label}
        </button>
      ))}
    </div>
  );
}
