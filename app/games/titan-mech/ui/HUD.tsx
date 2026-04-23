import { FloatingJoystick, HUDOverlay } from "@app/shared";
import type { TitanControls } from "@logic/games/titan-mech/engine/types";
import { TitanTrait } from "@logic/games/titan-mech/store/traits";
import { titanEntity } from "@logic/games/titan-mech/store/world";
import { useTrait } from "koota/react";
import type { PointerEvent } from "react";

const accent = "#2dd4bf";
const warning = "#f59e0b";
const danger = "#f43f5e";

export function HUD() {
  const state = useTrait(titanEntity, TitanTrait);
  const heatRatio = state.heat / state.maxHeat;
  const damageRatio = 1 - state.hp / state.maxHp;
  const weaponColor =
    state.weaponFeedback === "firing"
      ? warning
      : state.weaponFeedback === "overheated" || state.weaponFeedback === "dry"
        ? danger
        : state.weaponFeedback === "cooling"
          ? "#67e8f9"
          : accent;
  const extractorColor =
    state.extraction.feedback === "blocked"
      ? danger
      : state.extraction.feedback === "grinding" || state.extraction.feedback === "ejecting"
        ? warning
        : accent;

  return (
    <HUDOverlay
      topLeft={
        <div style={{ color: "#e6fffb", fontFamily: "ui-monospace, SFMono-Regular, monospace" }}>
          <div style={{ color: accent, fontSize: 12, textTransform: "uppercase" }}>
            TITAN MECH OVERHEAT v5.1
          </div>
          <div style={{ fontSize: 24, fontWeight: 900 }}>CREDITS {state.extraction.credits}</div>
          <div style={{ color: "#94a3b8", fontSize: 12 }}>
            SCRAP {state.scrap} / ISOTOPES {state.extraction.rareIsotopes}
          </div>
          <div style={{ color: weaponColor, fontSize: 12, marginTop: 6 }}>
            WEAPON {state.weaponFeedback.toUpperCase()}
          </div>
          <div style={{ color: extractorColor, fontSize: 12, marginTop: 3 }}>
            EXTRACTOR {state.extraction.feedback.toUpperCase()}
          </div>
          <div
            style={{
              color:
                state.threatCue.level === "clear"
                  ? "#94a3b8"
                  : state.threatCue.level === "tracking"
                    ? warning
                    : danger,
              fontSize: 12,
              marginTop: 3,
            }}
          >
            THREAT {state.threatCue.level.toUpperCase()}
            {state.threatCue.distance !== null ? ` · ${Math.round(state.threatCue.distance)}M` : ""}
          </div>
          <div style={{ color: "#e2e8f0", fontSize: 12, marginTop: 8, maxWidth: 300 }}>
            CONTRACT {state.contractCue.stage.toUpperCase()}
            {state.contractCue.nextBeaconLabel ? ` · ${state.contractCue.nextBeaconLabel}` : ""}
            {state.contractCue.distanceToBeacon !== null
              ? ` · ${Math.round(state.contractCue.distanceToBeacon)}M`
              : ""}
          </div>
        </div>
      }
      topRight={
        <div
          style={{
            color: "#e6fffb",
            fontFamily: "ui-monospace, SFMono-Regular, monospace",
            minWidth: 0,
            width: "100%",
          }}
        >
          <Gauge label="SYSTEM INTEGRITY" value={state.hp} max={state.maxHp} color={accent} />
          <Gauge label="ENERGY" value={state.energy} max={state.maxEnergy} color="#38bdf8" />
          <Gauge label="COOLANT" value={state.coolantCharge} max={100} color="#67e8f9" />
          <Gauge
            label="HOPPER"
            value={state.extraction.hopperLoad}
            max={state.extraction.hopperCapacity}
            color="#f59e0b"
          />
          <Gauge
            label="CONTRACT BANK"
            value={state.extraction.credits}
            max={1800}
            color={state.deliveryCue.state === "complete" ? "#a3e635" : "#f59e0b"}
          />
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
          <div
            style={{
              border: `1px solid ${state.contractCue.heatWarning ? danger : "rgba(45,212,191,0.5)"}`,
              color: state.contractCue.heatWarning ? "#ffe4e6" : "#d8fff8",
              fontSize: 12,
              fontWeight: 800,
              lineHeight: 1.25,
              marginTop: 8,
              padding: "0.4rem 0.5rem",
            }}
          >
            {state.contractCue.label}
          </div>
          <div
            style={{
              border: `1px solid ${state.deliveryCue.state === "ejecting" || state.deliveryCue.state === "banked" ? warning : "rgba(148,163,184,0.36)"}`,
              color: state.deliveryCue.state === "complete" ? "#ecfccb" : "#fde68a",
              fontSize: 12,
              fontWeight: 800,
              lineHeight: 1.25,
              marginTop: 6,
              padding: "0.4rem 0.5rem",
            }}
          >
            DELIVERY {state.deliveryCue.state.toUpperCase()} · {state.deliveryCue.label}
          </div>
          {state.threatCue.level === "warning" || state.threatCue.level === "impact" ? (
            <div
              style={{
                border: `1px solid ${danger}`,
                color: "#ffe4e6",
                fontSize: 12,
                fontWeight: 800,
                lineHeight: 1.25,
                marginTop: 6,
                padding: "0.4rem 0.5rem",
              }}
            >
              {state.threatCue.label}
            </div>
          ) : null}
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
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          boxShadow: `inset 0 0 ${36 + damageRatio * 110}px rgba(244, 63, 94, ${damageRatio * 0.58})`,
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 72,
          height: 72,
          transform: "translate(-50%, -50%)",
          border: `2px solid ${weaponColor}`,
          clipPath:
            "polygon(0 0, 34% 0, 34% 8%, 8% 8%, 8% 34%, 0 34%, 0 0, 66% 0, 100% 0, 100% 34%, 92% 34%, 92% 8%, 66% 8%, 66% 0, 100% 66%, 100% 100%, 66% 100%, 66% 92%, 92% 92%, 92% 66%, 100% 66%, 34% 100%, 0 100%, 0 66%, 8% 66%, 8% 92%, 34% 92%, 34% 100%)",
          opacity: state.weaponFeedback === "idle" ? 0.32 : 0.86,
          pointerEvents: "none",
          filter: `drop-shadow(0 0 10px ${weaponColor})`,
        }}
      />
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
        flexWrap: "wrap",
        gap: 8,
        justifyContent: "end",
        touchAction: "none",
      }}
    >
      <ControlButton label="Run extractor" symbol="MINE" controls={{ extract: true }} />
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
        minWidth: hot ? "clamp(3rem, 15vw, 4.6rem)" : "clamp(2.8rem, 14vw, 4rem)",
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
