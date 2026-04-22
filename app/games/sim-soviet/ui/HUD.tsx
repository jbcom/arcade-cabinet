import { HUDOverlay } from "@app/shared";
import type { BuildingTypeId } from "@logic/games/sim-soviet/engine/BuildingTypes";
import type { SimSovietState } from "@logic/games/sim-soviet/engine/Simulation";
import { BuildingPalette } from "./BuildingPalette";

interface HUDProps {
  state: SimSovietState;
  onSelectTool: (tool: BuildingTypeId) => void;
}

export function HUD({ state, onSelectTool }: HUDProps) {
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
            Sim Soviet 3000
          </div>
          <h2 style={{ margin: "0.35rem 0", fontSize: 28 }}>Five-Year Plan Control</h2>
          <div style={{ color: "#cbd5e1" }}>
            Place sectors to grow housing, food, and heavy industry.
          </div>
        </div>
      }
      topRight={
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "0.35rem 0.75rem",
          }}
        >
          <span>Funds: ₽{state.funds}</span>
          <span>Population: {state.population}</span>
          <span>Food: {state.food}</span>
          <span>Morale: {state.morale}%</span>
          <span>Power: {state.power}</span>
          <span>Water: {state.water}</span>
          <span>
            Date: {state.month.toString().padStart(2, "0")}/{state.year}
          </span>
        </div>
      }
      bottomLeft={<BuildingPalette selectedTool={state.selectedTool} onSelect={onSelectTool} />}
      bottomRight={
        <div>
          <div style={{ marginBottom: 8 }}>Quota progress</div>
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
                width: `${state.quotaProgress}%`,
                background: "linear-gradient(90deg, #22c55e, #facc15)",
              }}
            />
          </div>
          <div style={{ marginTop: 8, color: "#cbd5e1" }}>Selected: {state.selectedTool}</div>
        </div>
      }
    />
  );
}
