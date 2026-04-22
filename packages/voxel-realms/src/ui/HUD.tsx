import { useTrait } from "koota/react";
import { VoxelTrait } from "../store/traits";
import { voxelEntity } from "../store/world";

type ControlEvent =
  | "voxel:forward-start"
  | "voxel:forward-end"
  | "voxel:left-start"
  | "voxel:left-end"
  | "voxel:right-start"
  | "voxel:right-end"
  | "voxel:jump";

export function HUD() {
  const state = useTrait(voxelEntity, VoxelTrait);
  const hpRatio = state.hp / state.maxHp;

  const dispatchControl = (event: ControlEvent) => {
    window.dispatchEvent(new Event(event));
  };

  return (
    <div
      className="fixed inset-0 z-10 pointer-events-none"
      style={{
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        gap: "0.75rem",
        padding: "clamp(0.65rem, 2vw, 1rem)",
        color: "#f8fafc",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, max-content))",
          justifyContent: "space-between",
          gap: "0.65rem",
          alignItems: "start",
        }}
      >
        <Metric label="Survey" value={`${state.objectiveProgress}%`} accent="#38bdf8" />
        <Metric label="Biome" value={state.biome} accent="#a3e635" />
        <Metric label="Kit" value={`${state.inventory.length}/3`} accent="#facc15" />
        <Metric label="HP" value={`${state.hp}/${state.maxHp}`} accent="#fb7185" align="right" />
      </div>

      <div />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) auto",
          gap: "0.75rem",
          alignItems: "end",
        }}
      >
        <div
          style={{
            maxWidth: 560,
            border: "1px solid rgba(14, 165, 233, 0.35)",
            background: "rgba(8, 20, 24, 0.72)",
            boxShadow: "0 14px 40px rgba(0, 0, 0, 0.25)",
            borderRadius: 8,
            padding: "0.72rem 0.82rem",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) auto",
              gap: "0.75rem",
              color: "#94a3b8",
              fontSize: 11,
              letterSpacing: 0,
              textTransform: "uppercase",
            }}
          >
            <span>
              XYZ {state.coordinates.x}, {state.coordinates.y}, {state.coordinates.z}
            </span>
            <span>{Math.round(state.nearestLandmarkDistance)}M beacon</span>
            <span>{Math.round(state.nearestResourceDistance)}M resource</span>
          </div>
          <div style={{ color: "#f8fafc", fontWeight: 800, lineHeight: 1.25 }}>
            {state.objective}
          </div>
          <div
            style={{
              marginTop: "0.52rem",
              height: 6,
              borderRadius: 999,
              background: "rgba(15, 23, 42, 0.78)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${Math.max(0, Math.min(100, hpRatio * 100))}%`,
                height: "100%",
                background: "linear-gradient(90deg, #fb7185, #f59e0b)",
              }}
            />
          </div>
        </div>

        <div
          className="pointer-events-auto"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 3.6rem)",
            gridTemplateRows: "repeat(2, 3.4rem)",
            gap: "0.45rem",
          }}
        >
          <span />
          <ControlButton
            label="Up"
            onPointerDown={() => dispatchControl("voxel:forward-start")}
            onPointerUp={() => dispatchControl("voxel:forward-end")}
            onPointerLeave={() => dispatchControl("voxel:forward-end")}
          />
          <ControlButton label="Jump" onPointerDown={() => dispatchControl("voxel:jump")} />
          <ControlButton
            label="Left"
            onPointerDown={() => dispatchControl("voxel:left-start")}
            onPointerUp={() => dispatchControl("voxel:left-end")}
            onPointerLeave={() => dispatchControl("voxel:left-end")}
          />
          <span />
          <ControlButton
            label="Right"
            onPointerDown={() => dispatchControl("voxel:right-start")}
            onPointerUp={() => dispatchControl("voxel:right-end")}
            onPointerLeave={() => dispatchControl("voxel:right-end")}
          />
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  accent,
  align = "left",
}: {
  label: string;
  value: string;
  accent: string;
  align?: "left" | "right";
}) {
  return (
    <div
      style={{
        minWidth: "min(9rem, 30vw)",
        border: "1px solid rgba(148, 163, 184, 0.28)",
        background: "rgba(8, 20, 24, 0.68)",
        boxShadow: "0 14px 40px rgba(0, 0, 0, 0.25)",
        borderRadius: 8,
        padding: "0.65rem 0.72rem",
        textAlign: align,
        backdropFilter: "blur(10px)",
      }}
    >
      <div style={{ fontSize: 11, letterSpacing: 0, color: "#94a3b8", textTransform: "uppercase" }}>
        {label}
      </div>
      <div
        style={{
          fontSize: "clamp(1rem, 3.5vw, 1.65rem)",
          fontWeight: 900,
          color: accent,
          lineHeight: 1.05,
          textShadow: `0 0 12px ${accent}66`,
          textTransform: label === "Biome" ? "capitalize" : undefined,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ControlButton({
  label,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
}: {
  label: string;
  onPointerDown: () => void;
  onPointerUp?: () => void;
  onPointerLeave?: () => void;
}) {
  return (
    <button
      type="button"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
      style={{
        width: "3.6rem",
        height: "3.4rem",
        borderRadius: 8,
        border: "1px solid rgba(56, 189, 248, 0.58)",
        background: "rgba(14, 165, 233, 0.16)",
        color: "#e0f2fe",
        fontWeight: 900,
        letterSpacing: 0,
        textTransform: "uppercase",
        boxShadow: "0 0 18px rgba(14, 165, 233, 0.22)",
        touchAction: "none",
      }}
    >
      {label}
    </button>
  );
}
