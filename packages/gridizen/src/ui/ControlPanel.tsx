import { useResponsive } from "@arcade-cabinet/shared";
import { setTool } from "../engine/logic";
import { BUILDINGS, type GridizenState, MILESTONES } from "../engine/types";

interface ControlPanelProps {
  state: GridizenState;
  onSetTool: (tool: string) => void;
}

export function ControlPanel({ state, onSetTool }: ControlPanelProps) {
  const { selectedTool, milestone } = state;
  const { isMobile } = useResponsive();
  const allowedTools = MILESTONES.filter((m) => m.tier <= milestone).flatMap((m) => m.unlocks);
  const buttonSize = isMobile ? "3.65rem" : "4.75rem";
  const utilityButtonSize = isMobile ? "3.35rem" : "4rem";
  const labelSize = isMobile ? "9px" : "10px";

  return (
    <div
      style={{
        background: "rgba(15,23,42,0.8)",
        backdropFilter: "blur(24px)",
        paddingBottom: isMobile ? "0.65rem" : "1rem",
        paddingTop: isMobile ? "0.65rem" : "0.85rem",
        borderRadius: "8px 8px 0 0",
        boxShadow: "0 -10px 40px rgba(0,0,0,0.3)",
        pointerEvents: "auto",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: isMobile ? "0.45rem" : "0.65rem",
          overflowX: "auto",
          paddingLeft: isMobile ? "0.6rem" : "1rem",
          paddingRight: isMobile ? "0.6rem" : "1rem",
          paddingBottom: "0.35rem",
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
            width: utilityButtonSize,
            height: utilityButtonSize,
            borderRadius: 8,
            border: selectedTool === "INSPECT" ? "2px solid #60a5fa" : "2px solid transparent",
            background:
              selectedTool === "INSPECT" ? "rgba(59,130,246,0.3)" : "rgba(255,255,255,0.05)",
            color: selectedTool === "INSPECT" ? "#bfdbfe" : "white",
            cursor: "pointer",
          }}
        >
          <span
            style={{
              display: "grid",
              placeItems: "center",
              width: "1.35rem",
              height: "1.35rem",
              border: "2px solid currentColor",
              borderRadius: "50%",
              fontSize: "0.7rem",
              fontWeight: 800,
            }}
          >
            i
          </span>
          <span style={{ fontSize: labelSize, marginTop: "0.25rem", fontWeight: "bold" }}>
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
            width: utilityButtonSize,
            height: utilityButtonSize,
            borderRadius: 8,
            border: selectedTool === "BULLDOZE" ? "2px solid #ef4444" : "2px solid transparent",
            background:
              selectedTool === "BULLDOZE" ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.05)",
            color: selectedTool === "BULLDOZE" ? "#fca5a5" : "white",
            cursor: "pointer",
          }}
        >
          <span
            style={{
              display: "grid",
              placeItems: "center",
              width: "1.35rem",
              height: "1.35rem",
              border: "2px solid currentColor",
              borderRadius: 4,
              fontSize: "0.85rem",
              fontWeight: 800,
            }}
          >
            X
          </span>
          <span style={{ fontSize: labelSize, marginTop: "0.25rem", fontWeight: "bold" }}>
            Clear
          </span>
        </button>
        <div
          style={{
            width: "1px",
            height: isMobile ? "2.5rem" : "3rem",
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
                  width: buttonSize,
                  height: buttonSize,
                  borderRadius: 8,
                  border: isSelected ? "2px solid #4ade80" : "2px solid transparent",
                  background: isSelected ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.05)",
                  color: isSelected ? "white" : "rgba(255,255,255,0.8)",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: isMobile ? "1.15rem" : "1.45rem",
                    height: isMobile ? "1.15rem" : "1.45rem",
                    borderRadius: 6,
                    marginBottom: "0.25rem",
                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
                    backgroundColor: data.color,
                  }}
                />
                <span
                  style={{
                    fontSize: labelSize,
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
                    fontSize: isMobile ? "8px" : "9px",
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
