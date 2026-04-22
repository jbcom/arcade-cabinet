import { FloatingJoystick } from "@arcade-cabinet/shared";
import { useTrait } from "koota/react";
import { VoxelTrait } from "../store/traits";
import { voxelEntity } from "../store/world";

type ControlEvent = "voxel:jump";

export function HUD() {
  const state = useTrait(voxelEntity, VoxelTrait);
  const hpRatio = state.hp / state.maxHp;

  const dispatchControl = (event: ControlEvent) => {
    window.dispatchEvent(new Event(event));
  };
  const dispatchMove = (x: number, y: number) => {
    window.dispatchEvent(new CustomEvent("voxel:move", { detail: { x, y } }));
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
      <FloatingJoystick
        accent="#38bdf8"
        label="Voxel movement joystick"
        onChange={(vector) => dispatchMove(vector.x, vector.y)}
      />

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
          <BlockHotbar inventory={state.inventory} />
        </div>

        <div
          className="pointer-events-auto"
          style={{
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <ControlButton label="Jump" onPointerDown={() => dispatchControl("voxel:jump")} />
        </div>
      </div>
    </div>
  );
}

function BlockHotbar({ inventory }: { inventory: string[] }) {
  const slots = [
    { label: "Stone", color: "#8b98a6", count: inventory.includes("Copper") ? 4 : 0 },
    { label: "Wood", color: "#6b4423", count: inventory.includes("Sapwood") ? 6 : 0 },
    { label: "Leaves", color: "#2f8f3a", count: inventory.includes("Sapwood") ? 3 : 0 },
    { label: "Dirt", color: "#7c5a3a", count: 2 },
    { label: "Sand", color: "#e7c86e", count: inventory.includes("Water") ? 5 : 1 },
    { label: "Torch", color: "#f59e0b", count: 3 },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.35rem",
        marginTop: "0.65rem",
      }}
    >
      {slots.map((slot, index) => (
        <div
          key={slot.label}
          title={slot.label}
          style={{
            position: "relative",
            width: "2rem",
            height: "2rem",
            border: index === 0 ? "2px solid #facc15" : "1px solid rgba(226,232,240,0.32)",
            borderRadius: 6,
            background: slot.color,
            boxShadow:
              index === 0 ? "0 0 14px rgba(250,204,21,0.4)" : "0 8px 16px rgba(0,0,0,0.22)",
            filter: slot.count <= 0 ? "grayscale(0.75) brightness(0.55)" : undefined,
          }}
        >
          <span
            style={{
              position: "absolute",
              right: 3,
              bottom: 1,
              color: "#fff",
              fontFamily: "ui-monospace, SFMono-Regular, monospace",
              fontSize: 10,
              fontWeight: 900,
              textShadow: "0 1px 2px #000",
            }}
          >
            {slot.count}
          </span>
        </div>
      ))}
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
