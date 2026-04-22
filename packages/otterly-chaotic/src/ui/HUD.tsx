import { HUDOverlay, OverlayButton } from "@arcade-cabinet/shared";
import type { OtterlyState } from "../engine/types";

interface HUDProps {
  state: OtterlyState;
  onBark: () => void;
}

export function HUD({ state, onBark }: HUDProps) {
  return (
    <HUDOverlay
      topLeft={
        <div>
          <div
            style={{
              fontSize: 12,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#34d399",
            }}
          >
            Otterly Chaotic
          </div>
          <h2 style={{ margin: "0.35rem 0", fontSize: 28 }}>3D Salad Sprint</h2>
          <div style={{ color: "#cbd5e1" }}>{state.objective}</div>
        </div>
      }
      topRight={
        <div>
          <div>Ball health: {Math.round(state.ballHealth)}%</div>
          <div>Time: {(state.elapsedMs / 1000).toFixed(1)}s</div>
          <div>
            Bark:{" "}
            {state.barkCooldownMs > 0 ? `${(state.barkCooldownMs / 1000).toFixed(1)}s` : "Ready"}
          </div>
        </div>
      }
      bottomLeft={
        <div>
          <div style={{ marginBottom: 8 }}>
            Keep the goats off the Kudzu ball and roll it into the crater.
          </div>
          <div
            style={{
              height: 10,
              borderRadius: 999,
              background: "rgba(15, 23, 42, 0.6)",
              overflow: "hidden",
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
        </div>
      }
      bottomRight={<OverlayButton onClick={onBark}>Bark Pulse</OverlayButton>}
    />
  );
}
