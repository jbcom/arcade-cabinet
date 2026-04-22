import { HUDOverlay } from "@arcade-cabinet/shared";
import { useTrait } from "koota/react";
import { Bed, Briefcase, Coffee, Home, type LucideIcon, Star, Users, Wrench } from "lucide-react";
import { BUILDINGS, type BuildingId } from "../engine/types";
import { SkyTrait } from "../store/traits";
import { skyEntity } from "../store/world";

interface HUDProps {
  onSelectTool: (toolId: BuildingId | null) => void;
  selectedTool: BuildingId | null;
}

export function HUD({ onSelectTool, selectedTool }: HUDProps) {
  const state = useTrait(skyEntity, SkyTrait);

  const formatHour = (tick: number) => {
    const totalTicks = 2000;
    const hour = Math.floor((tick / totalTicks) * 24);
    const minute = Math.floor((((tick / totalTicks) * 24) % 1) * 60);
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  };

  const tools: { id: BuildingId; icon: LucideIcon }[] = [
    { id: "lobby", icon: Home },
    { id: "office", icon: Briefcase },
    { id: "condo", icon: Star },
    { id: "cafe", icon: Coffee },
    { id: "hotel", icon: Bed },
    { id: "maint", icon: Wrench },
  ];

  return (
    <HUDOverlay
      topLeft={
        <div style={{ fontFamily: "monospace", color: "#fff" }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>DAY {state.day}</div>
          <div style={{ fontSize: 32, fontWeight: "bold" }}>{formatHour(state.tick)}</div>
        </div>
      }
      topRight={
        <div style={{ textAlign: "right", fontFamily: "monospace", color: "#fff" }}>
          <div style={{ fontSize: 24, fontWeight: "bold", color: "#4ade80" }}>
            ${state.funds.toLocaleString()}
          </div>
          <div style={{ fontSize: 14, opacity: 0.8 }}>
            <Users size={14} style={{ display: "inline", marginRight: 4 }} />
            {state.population}
          </div>
        </div>
      }
      bottomLeft={
        <div style={{ display: "flex", gap: 8 }}>
          {tools.map((t) => (
            <button
              type="button"
              key={t.id}
              onClick={() => onSelectTool(selectedTool === t.id ? null : t.id)}
              style={{
                width: 48,
                height: 48,
                borderRadius: 8,
                background: selectedTool === t.id ? "#3b82f6" : "rgba(15, 23, 42, 0.8)",
                border: `1px solid ${selectedTool === t.id ? "#60a5fa" : "rgba(51, 65, 85, 0.5)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              title={BUILDINGS[t.id].name}
            >
              <t.icon size={24} />
            </button>
          ))}
        </div>
      }
    />
  );
}
