import { setTool } from "../engine/logic";
import { BUILDINGS, type GridizenState, MILESTONES } from "../engine/types";

interface ControlPanelProps {
  state: GridizenState;
  onSetTool: (tool: string) => void;
}

export function ControlPanel({ state, onSetTool }: ControlPanelProps) {
  const { selectedTool, milestone } = state;
  const allowedTools = MILESTONES.filter((m) => m.tier <= milestone).flatMap((m) => m.unlocks);

  return (
    <div
      style={{
        background: "rgba(15,23,42,0.8)",
        backdropFilter: "blur(24px)",
        paddingBottom: "1.5rem",
        paddingTop: "1rem",
        borderRadius: "1.5rem 1.5rem 0 0",
        boxShadow: "0 -10px 40px rgba(0,0,0,0.3)",
        pointerEvents: "auto",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          overflowX: "auto",
          paddingLeft: "1rem",
          paddingRight: "1rem",
          paddingBottom: "0.5rem",
        }}
      >
        <button
          type="button"
          onClick={() => onSetTool("INSPECT")}
          style={{
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "4rem",
            height: "4rem",
            borderRadius: "1rem",
            border: selectedTool === "INSPECT" ? "2px solid #60a5fa" : "2px solid transparent",
            background:
              selectedTool === "INSPECT" ? "rgba(59,130,246,0.3)" : "rgba(255,255,255,0.05)",
            color: selectedTool === "INSPECT" ? "#bfdbfe" : "white",
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: "1.25rem" }}>🔍</span>
          <span style={{ fontSize: "10px", marginTop: "0.25rem", fontWeight: "bold" }}>
            Inspect
          </span>
        </button>
        <button
          type="button"
          onClick={() => onSetTool("BULLDOZE")}
          style={{
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "4rem",
            height: "4rem",
            borderRadius: "1rem",
            border: selectedTool === "BULLDOZE" ? "2px solid #ef4444" : "2px solid transparent",
            background:
              selectedTool === "BULLDOZE" ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.05)",
            color: selectedTool === "BULLDOZE" ? "#fca5a5" : "white",
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: "1.25rem" }}>🚜</span>
          <span style={{ fontSize: "10px", marginTop: "0.25rem", fontWeight: "bold" }}>Clear</span>
        </button>
        <div
          style={{
            width: "1px",
            height: "3rem",
            background: "rgba(255,255,255,0.1)",
            margin: "auto 0.25rem",
            flexShrink: 0,
          }}
        />
        {Object.entries(BUILDINGS)
          .filter(([key]) => allowedTools.includes(key))
          .map(([key, data]) => {
            const isSelected = selectedTool === key;
            return (
              <button
                type="button"
                key={key}
                onClick={() => onSetTool(key)}
                style={{
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "5rem",
                  height: "5rem",
                  borderRadius: "1rem",
                  border: isSelected ? "2px solid #4ade80" : "2px solid transparent",
                  background: isSelected ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.05)",
                  color: isSelected ? "white" : "rgba(255,255,255,0.8)",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: "1.5rem",
                    height: "1.5rem",
                    borderRadius: "0.375rem",
                    marginBottom: "0.25rem",
                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
                    backgroundColor: data.color,
                  }}
                />
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: "bold",
                    color: "white",
                    textAlign: "center",
                    lineHeight: "1.2",
                    paddingLeft: "0.25rem",
                    paddingRight: "0.25rem",
                  }}
                >
                  {data.name}
                </span>
                <span
                  style={{
                    fontSize: "9px",
                    color: "rgba(255,255,255,0.5)",
                    marginTop: "0.125rem",
                  }}
                >
                  ${data.cost}
                </span>
              </button>
            );
          })}
      </div>
    </div>
  );
}

export { setTool };
