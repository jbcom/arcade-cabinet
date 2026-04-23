import { FloatingJoystick, OverlayButton, useResponsive } from "@app/shared";
import { getGoatIntent, getOtterlyRescueCue } from "@logic/games/otterly-chaotic/engine/simulation";
import type { OtterlyState, Vec2 } from "@logic/games/otterly-chaotic/engine/types";

interface HUDProps {
  state: OtterlyState;
  onBark: () => void;
  onMove: (movement: Vec2) => void;
}

export function HUD({ state, onBark, onMove }: HUDProps) {
  const { isMobile } = useResponsive();
  const goatIntents = state.goats.map((goat) => getGoatIntent(state, goat));
  const rescueCue = getOtterlyRescueCue(state);
  const cueColor =
    rescueCue.threatBand === "danger"
      ? "#fb7185"
      : rescueCue.threatBand === "pressure"
        ? "#facc15"
        : "#86efac";
  const panelStyle = {
    background: "rgba(15,23,42,0.74)",
    border: "1px solid rgba(148,163,184,0.35)",
    borderRadius: 8,
    boxShadow: "0 18px 45px rgba(2,6,23,0.35)",
    color: "#f8fafc",
    padding: isMobile ? "0.55rem 0.65rem" : "0.85rem 1rem",
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
        accent="#38bdf8"
        label="Otter movement joystick"
        onChange={(vector) => onMove({ x: vector.x, y: vector.y })}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          gap: "0.5rem",
          alignItems: "flex-start",
        }}
      >
        <div style={{ ...panelStyle, flex: isMobile ? 1 : undefined, minWidth: 0 }}>
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
          <h2 style={{ margin: "0.25rem 0", fontSize: isMobile ? 16 : 28 }}>Salad Sprint</h2>
          <div
            style={{
              alignItems: "center",
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              marginBottom: 6,
            }}
          >
            <span
              style={{
                border: `1px solid ${cueColor}66`,
                borderRadius: 6,
                color: cueColor,
                fontSize: 11,
                fontWeight: 900,
                padding: "0.12rem 0.42rem",
                textTransform: "uppercase",
              }}
            >
              Next: {rescueCue.action}
            </span>
            <span style={{ color: "#bae6fd", fontSize: 11, fontWeight: 800 }}>
              Piece {rescueCue.progressLabel}
            </span>
          </div>
          <div
            style={{
              color: "#cbd5e1",
              display: isMobile ? "-webkit-box" : "block",
              fontSize: isMobile ? 11 : 14,
              lineHeight: 1.35,
              overflow: "hidden",
              textOverflow: "ellipsis",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: isMobile ? 2 : undefined,
              whiteSpace: "normal",
            }}
          >
            {rescueCue.objective}
          </div>
        </div>
        <div
          style={{
            ...panelStyle,
            flex: isMobile ? 1 : undefined,
            minWidth: isMobile ? 0 : 190,
            fontSize: isMobile ? 12 : undefined,
          }}
        >
          <div>Ball health: {Math.round(state.ballHealth)}%</div>
          <div>
            Rescues: {state.rescuesCompleted}/{state.targetRescues}
          </div>
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
          <div style={{ color: cueColor, fontWeight: 900 }}>
            Cue: {rescueCue.action} · {rescueCue.threatBand}
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 4,
              marginTop: 6,
            }}
          >
            {goatIntents.map((intent) => (
              <span
                key={intent.goatId}
                style={{
                  border: "1px solid rgba(226,232,240,0.22)",
                  borderRadius: 6,
                  color:
                    intent.state === "stunned"
                      ? "#c084fc"
                      : intent.state === "chewing"
                        ? "#fb7185"
                        : "#facc15",
                  fontSize: 11,
                  fontWeight: 800,
                  padding: "0.12rem 0.35rem",
                  textTransform: "uppercase",
                }}
              >
                {intent.goatId}: {intent.state}
              </span>
            ))}
          </div>
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
        <div style={{ ...panelStyle, width: isMobile ? 148 : 176 }}>
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
          <div style={{ color: "#bae6fd", fontSize: 12, fontWeight: 800 }}>
            Touch the arena to steer
          </div>
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
