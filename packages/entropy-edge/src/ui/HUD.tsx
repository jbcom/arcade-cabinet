import { HUDOverlay } from "@arcade-cabinet/shared";
import type { EntropyState } from "../engine/types";

interface HUDProps {
  state: EntropyState;
}

export function HUD({ state }: HUDProps) {
  const timeSeconds = (state.timeMs / 1000).toFixed(1);
  const resonancePct = Math.round(state.resonance * 100);
  const isLow = state.timeMs < 5_000;
  const isMid = state.timeMs < 15_000 && !isLow;

  return (
    <HUDOverlay
      topLeft={
        <div>
          <div
            style={{
              fontSize: 12,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#00e5ff",
            }}
          >
            Entropy's Edge
          </div>
          <h2 style={{ margin: "0.35rem 0", fontSize: 24, color: "#f8fafc" }}>
            Sector {state.level}
          </h2>
          <div style={{ color: "#cbd5e1", fontSize: 14 }}>
            Anchors: {state.anchorsSecuredThisLevel} / {state.anchorsRequired}
          </div>
          <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 4 }}>
            Total secured: {state.totalAnchors}
          </div>
        </div>
      }
      topRight={
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: 13,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#94a3b8",
            }}
          >
            Score
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#00e5ff" }}>{state.score} pts</div>
          <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
            Stability:{" "}
            <span
              style={{
                color: isLow ? "#ef4444" : isMid ? "#f59e0b" : "#f8fafc",
                fontWeight: 700,
              }}
            >
              {timeSeconds}s
            </span>
          </div>
        </div>
      }
      bottomLeft={
        <div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6, letterSpacing: "0.12em" }}>
            RESONANCE {resonancePct}%{state.isResonanceMax ? " — MAX" : ""}
          </div>
          <div
            style={{
              height: 8,
              borderRadius: 999,
              background: "rgba(15, 23, 42, 0.6)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${resonancePct}%`,
                background: state.isResonanceMax
                  ? "linear-gradient(90deg, #ffcc00, #ff6600)"
                  : "linear-gradient(90deg, #00e5ff, #0080ff)",
                transition: "width 0.15s linear",
              }}
            />
          </div>
          {state.isResonanceMax ? (
            <div
              style={{
                marginTop: 4,
                fontSize: 12,
                color: "#ffcc00",
                fontWeight: 700,
                letterSpacing: "0.1em",
              }}
            >
              2× MULTIPLIER ACTIVE
            </div>
          ) : null}
        </div>
      }
      bottomRight={
        <div style={{ textAlign: "right", fontSize: 13, color: "#94a3b8" }}>
          <div>WASD / Arrows to move</div>
          <div style={{ marginTop: 4 }}>Reach the glowing pillar</div>
          {state.targetNode ? (
            <div style={{ marginTop: 4, color: "#ff0055" }}>
              Target: ({state.targetNode.gridX}, {state.targetNode.gridZ})
            </div>
          ) : null}
        </div>
      }
    />
  );
}
