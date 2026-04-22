import { HUDOverlay } from "@arcade-cabinet/shared";
import type { MegaTrackState } from "../engine/types";

interface HUDProps {
  state: MegaTrackState;
}

export function HUD({ state }: HUDProps) {
  return (
    <HUDOverlay
      topLeft={
        <div>
          <div
            style={{
              fontSize: 12,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#facc15",
            }}
          >
            Mega Track
          </div>
          <h2 style={{ margin: "0.35rem 0", fontSize: 28 }}>Extreme Racing</h2>
        </div>
      }
      topRight={
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 24, fontWeight: "bold" }}>{Math.floor(state.distance / 10)}m</div>
          <div style={{ color: "#cbd5e1" }}>Speed: {Math.round(state.speed * 100)} km/h</div>
        </div>
      }
    />
  );
}
