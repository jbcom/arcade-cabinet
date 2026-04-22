import { OverlayButton } from "@arcade-cabinet/shared";
import { BUILDING_LIST, type BuildingTypeId } from "../engine/BuildingTypes";

interface BuildingPaletteProps {
  selectedTool: BuildingTypeId;
  onSelect: (tool: BuildingTypeId) => void;
}

export function BuildingPalette({ selectedTool, onSelect }: BuildingPaletteProps) {
  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      {BUILDING_LIST.map((building) => (
        <OverlayButton
          key={building.id}
          onClick={() => onSelect(building.id)}
          style={{
            background:
              selectedTool === building.id
                ? "linear-gradient(135deg, rgba(251, 191, 36, 0.8), rgba(249, 115, 22, 0.85))"
                : undefined,
            minWidth: 120,
          }}
        >
          {building.label}
        </OverlayButton>
      ))}
    </div>
  );
}
