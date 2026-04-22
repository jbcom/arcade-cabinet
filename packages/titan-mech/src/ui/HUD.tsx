import { FloatingJoystick, HUDOverlay } from "@arcade-cabinet/shared";
import { useTrait } from "koota/react";
import type { PointerEvent } from "react";
import type { TitanControls } from "../engine/types";
import { TitanTrait } from "../store/traits";
import { titanEntity } from "../store/world";

const accent = "#2dd4bf";
const warning = "#f59e0b";
const danger = "#f43f5e";

export function HUD() {
  const state = useTrait(titanEntity, TitanTrait);
  const heatRatio = state.heat / state.maxHeat;

  return (
    <HUDOverlay
      topLeft={
        <div style={{ color: "#e6fffb", fontFamily: "ui-monospace, SFMono-Regular, monospace" }}>
          <div style={{ color: accent, fontSize: 12, textTransform: "uppercase" }}>
            TITAN MECH OS v5.1
          </div>
          <div style={{ fontSize: 24, fontWeight: 900 }}>SCRAP {state.scrap}</div>
          <div style={{ color: "#94a3b8", fontSize: 12 }}>RANGE SCORE {state.score}</div>
        </div>
      }
      topRight={
        <div
          style={{
            color: "#e6fffb",
            fontFamily: "ui-monospace, SFMono-Regular, monospace",
            minWidth: 190,
          }}
        >
          <Gauge label="SYSTEM INTEGRITY" value={state.hp} max={state.maxHp} color={accent} />
          <Gauge label="ENERGY" value={state.energy} max={state.maxEnergy} color="#38bdf8" />
          <Gauge label="COOLANT" value={state.coolantCharge} max={100} color="#67e8f9" />
          <Gauge
            label="HEAT"
            value={state.heat}
            max={state.maxHeat}
            color={heatRatio > 0.75 ? danger : warning}
          />
        </div>
      }
      bottomLeft={
        <div
          style={{
            color: "#e2e8f0",
            fontFamily: "ui-monospace, SFMono-Regular, monospace",
            maxWidth: 320,
          }}
        >
          <div style={{ color: warning, fontSize: 11, textTransform: "uppercase" }}>Objective</div>
          <div style={{ fontSize: 13, lineHeight: 1.35 }}>{state.objective}</div>
          {state.coolantBurstMs > 0 ? (
            <div style={{ color: "#67e8f9", fontSize: 12, marginTop: 6 }}>
              COOLANT BURST {(state.coolantBurstMs / 1000).toFixed(1)}s
            </div>
          ) : null}
          <Gauge label="PYLON LOCK" value={state.objectiveProgress} max={100} color={warning} />
        </div>
      }
      bottomRight={<ActionCluster />}
    >
      <FloatingJoystick
        accent={accent}
        label="Titan drive joystick"
        onChange={(vector) => updateControls({ throttle: -vector.y, turn: vector.x })}
      />
    </HUDOverlay>
  );
}

function Gauge({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div style={{ marginTop: 8 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          color: "#cbd5e1",
          fontSize: 11,
          textTransform: "uppercase",
        }}
      >
        <span>{label}</span>
        <span>{Math.round(value)}</span>
      </div>
      <div
        style={{
          height: 9,
          overflow: "hidden",
          border: "1px solid rgba(148,163,184,0.42)",
          background: "rgba(2,6,23,0.82)",
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            background: color,
            boxShadow: `0 0 14px ${color}`,
          }}
        />
      </div>
    </div>
  );
}

function ActionCluster() {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        justifyContent: "end",
        touchAction: "none",
      }}
    >
      <ControlButton label="Brace coolant" symbol="BRACE" controls={{ brace: true }} />
      <ControlButton label="Fire ordnance" symbol="FIRE" controls={{ fire: true }} hot />
    </div>
  );
}

function ControlButton({
  label,
  symbol,
  controls,
  hot = false,
}: {
  label: string;
  symbol: string;
  controls: Partial<TitanControls>;
  hot?: boolean;
}) {
  const press = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    updateControls(controls);
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const release = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    updateControls(resetControls(controls));
  };

  return (
    <button
      type="button"
      data-titan-control="true"
      aria-label={label}
      title={label}
      onPointerDown={press}
      onPointerUp={release}
      onPointerCancel={release}
      onPointerLeave={release}
      style={{
        width: 44,
        height: 44,
        minWidth: hot ? 74 : 64,
        border: `1px solid ${hot ? danger : "rgba(45,212,191,0.65)"}`,
        background: hot ? "rgba(244,63,94,0.22)" : "rgba(13,148,136,0.18)",
        color: hot ? "#ffe4e6" : "#d8fff8",
        fontSize: 11,
        fontWeight: 900,
        letterSpacing: "0.08em",
        lineHeight: 1,
        textAlign: "center",
        cursor: "pointer",
        boxShadow: hot ? "0 0 16px rgba(244,63,94,0.22)" : "0 0 16px rgba(45,212,191,0.16)",
      }}
    >
      {symbol}
    </button>
  );
}

function updateControls(patch: Partial<TitanControls>) {
  const state = titanEntity.get(TitanTrait);
  if (!state) {
    return;
  }

  titanEntity.set(TitanTrait, {
    ...state,
    controls: {
      ...state.controls,
      ...patch,
    },
  });
}

function resetControls(controls: Partial<TitanControls>) {
  return Object.fromEntries(
    Object.keys(controls).map((key) => [
      key,
      typeof controls[key as keyof TitanControls] === "boolean" ? false : 0,
    ])
  ) as Partial<TitanControls>;
}
