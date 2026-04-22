import { FloatingJoystick, HUDOverlay } from "@app/shared";
import type { SNWControls } from "@logic/games/protocol-snw/engine/types";
import { SNWTrait } from "@logic/games/protocol-snw/store/traits";
import { snwEntity } from "@logic/games/protocol-snw/store/world";
import { useTrait } from "koota/react";
import type { PointerEvent } from "react";

const cyan = "#2dd4bf";
const blue = "#38bdf8";
const red = "#f43f5e";
const amber = "#f59e0b";

export function HUD() {
  const state = useTrait(snwEntity, SNWTrait);

  return (
    <HUDOverlay
      topLeft={
        <div style={{ fontFamily: "ui-monospace, SFMono-Regular, monospace", color: "#e2e8f0" }}>
          <div style={{ fontSize: 12, letterSpacing: "0.14em", color: cyan }}>SCORE</div>
          <div style={{ fontSize: 25, fontWeight: 900 }}>{state.score}</div>
          <div style={{ color: "#94a3b8", fontSize: 12 }}>
            KILLS {state.kills} / LVL {state.level}
          </div>
        </div>
      }
      topRight={
        <div
          style={{
            minWidth: 190,
            fontFamily: "ui-monospace, SFMono-Regular, monospace",
            color: "#e2e8f0",
          }}
        >
          <Gauge label="INTEGRITY" value={state.hp} max={state.maxHp} color={red} />
          <Gauge label="FIREWALL" value={state.firewallCharge} max={100} color={cyan} />
          <Gauge
            label="THREAT"
            value={state.threat}
            max={100}
            color={state.threat > 70 ? red : amber}
          />
          <Gauge label="WAVE TIMER" value={state.waveTime} max={64} color={blue} reverse />
        </div>
      }
      bottomLeft={
        <div
          style={{
            maxWidth: 330,
            fontFamily: "ui-monospace, SFMono-Regular, monospace",
            color: "#e2e8f0",
          }}
        >
          <div style={{ color: amber, fontSize: 11, letterSpacing: "0.12em" }}>PROTOCOL</div>
          <div style={{ fontSize: 13, lineHeight: 1.35 }}>{state.objective}</div>
          <div style={{ marginTop: 8, color: "#94a3b8", fontSize: 11 }}>
            HOSTILES {state.enemies.length} / WAVE {state.wave}
          </div>
          {state.firewallActiveMs > 0 ? (
            <div style={{ marginTop: 4, color: cyan, fontSize: 11 }}>
              FIREWALL {(state.firewallActiveMs / 1000).toFixed(1)}s
            </div>
          ) : null}
        </div>
      }
      bottomRight={<ActionCluster />}
    >
      <FloatingJoystick
        accent={cyan}
        label="Protocol movement joystick"
        onChange={(vector) => updateControls({ x: vector.x, z: vector.y })}
      />
    </HUDOverlay>
  );
}

function Gauge({
  label,
  value,
  max,
  color,
  reverse = false,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  reverse?: boolean;
}) {
  const ratio = Math.max(0, Math.min(1, value / max));
  const percent = (reverse ? 1 - ratio : ratio) * 100;

  return (
    <div style={{ marginTop: 8 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          color: "#cbd5e1",
          fontSize: 11,
          letterSpacing: "0.08em",
        }}
      >
        <span>{label}</span>
        <span>{Math.round(value)}</span>
      </div>
      <div
        style={{
          height: 9,
          overflow: "hidden",
          border: "1px solid rgba(148,163,184,0.4)",
          background: "rgba(2,6,23,0.85)",
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            background: color,
            boxShadow: `0 0 16px ${color}`,
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
        justifyContent: "flex-end",
        touchAction: "none",
      }}
    >
      <ControlButton label="Dash" symbol="DASH" controls={{ dash: true }} />
      <ControlButton label="Firewall pulse" symbol="FIRE" controls={{ fire: true }} hot />
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
  controls: Partial<SNWControls>;
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
      data-snw-control="true"
      aria-label={label}
      title={label}
      onPointerDown={press}
      onPointerUp={release}
      onPointerCancel={release}
      onPointerLeave={release}
      style={{
        width: 42,
        height: 42,
        minWidth: hot ? 64 : 58,
        border: `1px solid ${hot ? red : "rgba(45,212,191,0.68)"}`,
        background: hot ? "rgba(244,63,94,0.18)" : "rgba(13,148,136,0.18)",
        color: hot ? "#ffe4e6" : "#d8fff8",
        fontSize: 11,
        fontWeight: 900,
        letterSpacing: "0.08em",
        lineHeight: 1,
        textAlign: "center",
        cursor: "pointer",
      }}
    >
      {symbol}
    </button>
  );
}

function updateControls(patch: Partial<SNWControls>) {
  const state = snwEntity.get(SNWTrait);
  if (!state) {
    return;
  }

  snwEntity.set(SNWTrait, {
    ...state,
    controls: {
      ...state.controls,
      ...patch,
    },
  });
}

function resetControls(controls: Partial<SNWControls>) {
  return Object.fromEntries(
    Object.keys(controls).map((key) => [
      key,
      typeof controls[key as keyof SNWControls] === "boolean" ? false : 0,
    ])
  ) as Partial<SNWControls>;
}
