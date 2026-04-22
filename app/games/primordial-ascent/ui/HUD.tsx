import { FloatingJoystick } from "@app/shared";
import { PrimordialTrait } from "@logic/games/primordial-ascent/store/traits";
import { primordialEntity } from "@logic/games/primordial-ascent/store/world";
import { motion } from "framer-motion";
import { useTrait } from "koota/react";

export function HUD() {
  const state = useTrait(primordialEntity, PrimordialTrait);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`;
  };

  const isDanger = state.distToLava < 60;
  const intensity = Math.max(0, 1.0 - state.distToLava / 60);
  const dispatchControl = (
    name: "primordial:grapple-start" | "primordial:grapple-end" | "primordial:jump"
  ) => {
    window.dispatchEvent(new Event(name));
  };
  const dispatchMove = (x: number, y: number) => {
    window.dispatchEvent(new CustomEvent("primordial:move", { detail: { x, y } }));
  };

  return (
    <>
      <FloatingJoystick
        accent="#00e5ff"
        label="Primordial air-control joystick"
        onChange={(vector) => dispatchMove(vector.x, vector.y)}
      />
      <motion.div
        className="fixed inset-0 pointer-events-none z-[5]"
        animate={{
          boxShadow: isDanger
            ? [
                `inset 0 0 ${20 + 150 * intensity * 0.5}px rgba(255, 51, 51, ${intensity * 0.6})`,
                `inset 0 0 ${20 + 150 * intensity * 1.0}px rgba(255, 51, 51, ${intensity * 0.9})`,
                `inset 0 0 ${20 + 150 * intensity * 0.5}px rgba(255, 51, 51, ${intensity * 0.6})`,
              ]
            : "inset 0 0 0px rgba(255, 51, 51, 0)",
        }}
        transition={{
          duration: isDanger ? Math.max(0.2, 1.0 - intensity * 0.8) : 0.1,
          repeat: isDanger ? Infinity : 0,
          ease: "easeInOut",
        }}
      />
      <div
        className="fixed inset-0 z-10 pointer-events-none"
        style={{
          display: "grid",
          gridTemplateRows: "auto 1fr auto",
          gap: "0.75rem",
          padding: "clamp(0.65rem, 2vw, 1rem)",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, max-content))",
            gap: "0.65rem",
            alignItems: "start",
            justifyContent: "space-between",
          }}
        >
          <Metric label="Altitude" value={`${state.altitude}M`} accent="#35d07f" />
          <Metric label="Lava Gap" value={`${state.distToLava}M`} accent="#ff7448" />
          <Metric label="Thermal" value={`+${state.thermalLift.toFixed(1)}`} accent="#f59e0b" />
          <Metric label="Velocity" value={`${state.velocity}`} accent="#00e5ff" align="right" />
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
              maxWidth: 520,
              border: "1px solid rgba(45, 212, 191, 0.28)",
              background: "rgba(2, 6, 8, 0.72)",
              boxShadow: "0 14px 40px rgba(0, 0, 0, 0.32)",
              borderRadius: 8,
              padding: "0.7rem 0.8rem",
              backdropFilter: "blur(10px)",
            }}
          >
            <div
              style={{
                color: "#94a3b8",
                fontSize: 11,
                letterSpacing: 0,
                textTransform: "uppercase",
              }}
            >
              {formatTime(state.timeSurvived)} / {state.objectiveProgress}%
            </div>
            <div style={{ color: "#f8fafc", fontWeight: 800, lineHeight: 1.25 }}>
              {state.objective}
            </div>
          </div>

          <div
            className="pointer-events-auto"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 4.25rem)",
              gap: "0.55rem",
            }}
          >
            <ControlButton
              label="Grip"
              onPointerDown={() => dispatchControl("primordial:grapple-start")}
              onPointerUp={() => dispatchControl("primordial:grapple-end")}
              onPointerLeave={() => dispatchControl("primordial:grapple-end")}
            />
            <ControlButton label="Jump" onPointerDown={() => dispatchControl("primordial:jump")} />
          </div>
        </div>
      </div>
    </>
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
        minWidth: "min(8.6rem, 30vw)",
        border: "1px solid rgba(148, 163, 184, 0.22)",
        background: "rgba(2, 6, 8, 0.68)",
        boxShadow: "0 14px 40px rgba(0, 0, 0, 0.3)",
        borderRadius: 8,
        padding: "0.65rem 0.72rem",
        textAlign: align,
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          letterSpacing: 0,
          color: "#94a3b8",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "clamp(1.25rem, 4vw, 2rem)",
          fontWeight: 900,
          color: accent,
          textShadow: `0 0 12px ${accent}66`,
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1,
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
        height: "4.25rem",
        borderRadius: 8,
        border: "1px solid rgba(0, 229, 255, 0.55)",
        background: "rgba(0, 229, 255, 0.14)",
        color: "#dffbff",
        fontWeight: 900,
        textTransform: "uppercase",
        letterSpacing: 0,
        boxShadow: "0 0 18px rgba(0, 229, 255, 0.2)",
        touchAction: "none",
      }}
    >
      {label}
    </button>
  );
}
