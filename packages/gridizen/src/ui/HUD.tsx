import { BUILDINGS, type GridizenState, type GridTile, MILESTONES } from "../engine/types";

interface HUDProps {
  state: GridizenState;
  onToggleHeatmap: () => void;
}

interface TileInspectorPanelProps {
  tile: GridTile;
}

function TileInspectorPanel({ tile }: TileInspectorPanelProps) {
  const bData = BUILDINGS[tile.building];
  const hapColor = tile.happiness > 60 ? "#4ade80" : tile.happiness < 40 ? "#f87171" : "#facc15";
  return (
    <div
      style={{
        background: "rgba(15,23,42,0.8)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.2)",
        padding: "1rem",
        borderRadius: "1rem",
        boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
        pointerEvents: "auto",
        color: "white",
        width: "16rem",
        position: "absolute",
        left: "1rem",
        top: "6rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.5rem",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          paddingBottom: "0.5rem",
        }}
      >
        <h3 style={{ fontWeight: "bold", fontSize: "1.125rem" }}>
          {bData && bData.name !== "None" ? bData.name : tile.terrain}
        </h3>
        <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
          [{tile.x}, {tile.z}]
        </span>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.25rem",
          fontSize: "0.875rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#cbd5e1" }}>Base Terrain:</span>
          <span style={{ fontWeight: "500" }}>{tile.terrain}</span>
        </div>
        {tile.building !== "NONE" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#cbd5e1" }}>Level:</span>
              <span style={{ fontWeight: "500", color: "#4ade80" }}>{tile.level}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#cbd5e1" }}>Road Access:</span>
              <span>{tile.roadAccess ? "✅" : "❌"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#cbd5e1" }}>Power:</span>
              <span>{tile.powered ? "✅" : "❌"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#cbd5e1" }}>Water:</span>
              <span>{tile.watered ? "✅" : "❌"}</span>
            </div>
          </>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "0.5rem",
            paddingTop: "0.5rem",
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <span style={{ color: "#cbd5e1" }}>Happiness:</span>
          <span style={{ fontWeight: "bold", color: hapColor }}>{tile.happiness}/100</span>
        </div>
        {tile.warning !== "NONE" && (
          <div
            style={{
              marginTop: "0.5rem",
              padding: "0.5rem",
              background: "rgba(239,68,68,0.2)",
              border: "1px solid rgba(239,68,68,0.5)",
              borderRadius: "0.25rem",
              color: "#fca5a5",
              fontSize: "0.75rem",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            ⚠️ {tile.warning.replace("_", " ")}
          </div>
        )}
      </div>
    </div>
  );
}

export function HUD({ state, onToggleHeatmap }: HUDProps) {
  const { funds, population, happiness, time, powerUse, powerMax, milestone, heatmap } = state;

  const currentTier = MILESTONES.find((m) => m.tier === milestone);
  const nextTier = MILESTONES.find((m) => m.tier === milestone + 1);
  const inspectedTile =
    state.inspectedTileIdx !== null && state.inspectedTileIdx < state.grid.length
      ? state.grid[state.inspectedTileIdx]
      : undefined;

  const ampm = time >= 12 ? "PM" : "AM";
  const hour = time % 12 === 0 ? 12 : time % 12;
  const timeLabel = `${hour}:00 ${ampm}`;

  const panelStyle = {
    background: "rgba(15,23,42,0.7)",
    backdropFilter: "blur(12px)",
    borderRadius: "1rem",
    color: "white",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
    pointerEvents: "auto" as const,
    border: "1px solid rgba(255,255,255,0.1)",
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
        overflow: "hidden",
        color: "#1e293b",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          padding: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div style={{ ...panelStyle, padding: "0.75rem", maxWidth: "200px" }}>
          <h2
            style={{
              fontSize: "0.75rem",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#4ade80",
            }}
          >
            Tier {milestone}: {currentTier?.name}
          </h2>
          {nextTier ? (
            <p
              style={{
                fontSize: "0.75rem",
                marginTop: "0.25rem",
                lineHeight: "1.4",
                color: "#cbd5e1",
              }}
            >
              Goal: Reach {nextTier.popRequired} Pop
            </p>
          ) : (
            <p
              style={{
                fontSize: "0.75rem",
                marginTop: "0.25rem",
                color: "#cbd5e1",
              }}
            >
              Maximum Tier Reached!
            </p>
          )}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              ...panelStyle,
              paddingLeft: "1rem",
              paddingRight: "1rem",
              paddingTop: "0.5rem",
              paddingBottom: "0.5rem",
              borderRadius: "9999px",
              display: "flex",
              gap: "1rem",
              fontSize: "0.875rem",
              fontWeight: "600",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              ⏱️ {timeLabel}
            </span>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                color: "#4ade80",
              }}
            >
              💵 ${funds.toLocaleString()}
            </span>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                color: "#93c5fd",
              }}
            >
              👥 {population}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              😊 {happiness}%
            </span>
          </div>
          <div
            style={{
              ...panelStyle,
              paddingLeft: "1rem",
              paddingRight: "1rem",
              paddingTop: "0.375rem",
              paddingBottom: "0.375rem",
              borderRadius: "9999px",
              display: "flex",
              gap: "0.75rem",
              fontSize: "0.75rem",
              color: "rgba(255,255,255,0.8)",
            }}
          >
            <span
              style={{
                color: powerUse > powerMax ? "#f87171" : "inherit",
                fontWeight: powerUse > powerMax ? "bold" : "normal",
              }}
            >
              ⚡ {powerUse}/{powerMax}
            </span>
            <button
              type="button"
              onClick={onToggleHeatmap}
              style={{
                marginLeft: "0.5rem",
                padding: "0 0.5rem",
                borderRadius: "0.25rem",
                background: heatmap ? "rgba(34,197,94,0.5)" : "rgba(255,255,255,0.2)",
                border: "none",
                color: "white",
                cursor: "pointer",
                pointerEvents: "auto",
              }}
            >
              👁️ Data Lens
            </button>
          </div>
        </div>
      </div>

      {inspectedTile && <TileInspectorPanel tile={inspectedTile} />}
    </div>
  );
}
