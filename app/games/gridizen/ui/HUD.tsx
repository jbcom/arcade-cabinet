import { useResponsive } from "@app/shared";
import {
  BUILDINGS,
  type GridizenState,
  type GridTile,
  MILESTONES,
} from "@logic/games/gridizen/engine/types";

interface HUDProps {
  state: GridizenState;
  onToggleHeatmap: () => void;
}

interface TileInspectorPanelProps {
  tile: GridTile;
  isMobile: boolean;
}

function TileInspectorPanel({ tile, isMobile }: TileInspectorPanelProps) {
  const bData = BUILDINGS[tile.building];
  const hapColor = tile.happiness > 60 ? "#4ade80" : tile.happiness < 40 ? "#f87171" : "#facc15";
  return (
    <div
      style={{
        background: "rgba(15,23,42,0.8)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.2)",
        padding: isMobile ? "0.65rem" : "0.85rem",
        borderRadius: 8,
        boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
        pointerEvents: "auto",
        color: "white",
        width: isMobile ? "min(15rem, calc(100vw - 1.2rem))" : "16rem",
        position: "absolute",
        left: isMobile ? "0.6rem" : "1rem",
        top: isMobile ? "10.4rem" : "6rem",
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
  const {
    funds,
    population,
    happiness,
    time,
    powerUse,
    powerMax,
    waterUse,
    waterMax,
    civicBoost,
    milestone,
    heatmap,
  } = state;
  const { isMobile } = useResponsive();

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
    borderRadius: 8,
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
          padding: isMobile ? "0.6rem" : "1rem",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "stretch" : "flex-start",
          gap: isMobile ? "0.45rem" : "1rem",
        }}
      >
        <div
          style={{
            ...panelStyle,
            padding: isMobile ? "0.6rem" : "0.75rem",
            maxWidth: isMobile ? "none" : "200px",
          }}
        >
          <h2
            style={{
              fontSize: "0.75rem",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: 0,
              color: "#4ade80",
              margin: 0,
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
                marginBottom: 0,
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
                marginBottom: 0,
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
              padding: isMobile ? "0.55rem 0.65rem" : "0.55rem 1rem",
              display: isMobile ? "grid" : "flex",
              gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : undefined,
              gap: isMobile ? "0.35rem 0.65rem" : "1rem",
              width: isMobile ? "100%" : undefined,
              boxSizing: "border-box",
              fontSize: isMobile ? "0.75rem" : "0.875rem",
              fontWeight: "600",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              Time {timeLabel}
            </span>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                color: "#4ade80",
              }}
            >
              ${funds.toLocaleString()}
            </span>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                color: "#93c5fd",
              }}
            >
              Pop {population}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              Mood {happiness}%
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              Civic +{civicBoost}
            </span>
          </div>
          <div
            style={{
              ...panelStyle,
              padding: isMobile ? "0.45rem 0.6rem" : "0.45rem 0.85rem",
              display: "flex",
              gap: isMobile ? "0.45rem" : "0.75rem",
              width: isMobile ? "100%" : undefined,
              boxSizing: "border-box",
              justifyContent: isMobile ? "space-between" : "flex-start",
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
              Power {powerUse}/{powerMax}
            </span>
            <span
              style={{
                color: waterUse > waterMax ? "#f87171" : "inherit",
                fontWeight: waterUse > waterMax ? "bold" : "normal",
              }}
            >
              Water {waterUse}/{waterMax}
            </span>
            <button
              type="button"
              onClick={onToggleHeatmap}
              style={{
                padding: "0.2rem 0.5rem",
                borderRadius: 6,
                background: heatmap ? "rgba(34,197,94,0.5)" : "rgba(255,255,255,0.2)",
                border: "none",
                color: "white",
                cursor: "pointer",
                pointerEvents: "auto",
              }}
            >
              Data Lens
            </button>
          </div>
        </div>
      </div>

      {inspectedTile && <TileInspectorPanel isMobile={isMobile} tile={inspectedTile} />}
    </div>
  );
}
