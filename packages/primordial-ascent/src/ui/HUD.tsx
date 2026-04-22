import { HUDOverlay } from "@arcade-cabinet/shared";
import { motion } from "framer-motion";
import { useTrait } from "koota/react";
import { PrimordialTrait } from "../store/traits";
import { primordialEntity } from "../store/world";

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

  return (
    <>
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
      <HUDOverlay
        topLeft={
          <div className="z-10 relative">
            <div
              style={{
                fontSize: 12,
                letterSpacing: "2px",
                color: "#aaa",
                textTransform: "uppercase",
              }}
            >
              Altitude
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 900,
                color: "#00ff66",
                textShadow: "0 0 10px rgba(0,255,102,0.5)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {state.altitude}M
            </div>
          </div>
        }
        topRight={
          <div style={{ textAlign: "right" }} className="z-10 relative">
            <div
              style={{
                fontSize: 12,
                letterSpacing: "2px",
                color: "#aaa",
                textTransform: "uppercase",
              }}
            >
              Velocity
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 900,
                color: "#00ff66",
                textShadow: "0 0 10px rgba(0,255,102,0.5)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {state.velocity}
            </div>
          </div>
        }
        bottomLeft={
          <div className="z-10 relative">
            <div
              style={{
                fontSize: 12,
                letterSpacing: "2px",
                color: "#aaa",
                textTransform: "uppercase",
              }}
            >
              Chronometer
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 900,
                color: "white",
                textShadow: "0 0 10px rgba(255,255,255,0.5)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {formatTime(state.timeSurvived)}
            </div>
          </div>
        }
      />
    </>
  );
}
