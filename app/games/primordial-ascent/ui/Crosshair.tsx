import { PrimordialTrait } from "@logic/games/primordial-ascent/store/traits";
import { primordialEntity } from "@logic/games/primordial-ascent/store/world";
import { motion } from "framer-motion";
import { useTrait } from "koota/react";
import { useEffect, useState } from "react";

export function Crosshair() {
  const state = useTrait(primordialEntity, PrimordialTrait);
  const [isLocked, setIsLocked] = useState(false);
  const reticleColor =
    state.grappleTargetState === "taut"
      ? "#00ff66"
      : state.grappleTargetState === "locked"
        ? "#36fbd1"
        : state.grappleTargetState === "in-range"
          ? "#00e5ff"
          : state.grappleTargetState === "missed"
            ? "#ff7448"
            : "rgba(255, 255, 255, 0.8)";
  const targetVisible = state.grappleTargetState !== "none" || isLocked;

  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (e.button === 0 && state.isInGrappleRange) {
        setIsLocked(true);
      }
    };
    const handlePointerUp = (e: MouseEvent) => {
      if (e.button === 0) {
        setIsLocked(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [state.isInGrappleRange]);

  return (
    <motion.div
      className="fixed pointer-events-none z-[100] flex items-center justify-center"
      style={{
        left: "50%",
        top: "50%",
        width: 40,
        height: 40,
        transform: "translate(-50%, -50%)",
        opacity: state.isInGrappleRange || isLocked ? 1 : 0.4,
      }}
    >
      <div className="absolute w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_5px_rgba(0,0,0,0.8)]" />
      <motion.div
        className="absolute rounded-full"
        style={{
          border: `2px solid ${reticleColor}`,
          boxShadow: targetVisible
            ? `0 0 15px ${reticleColor}, inset 0 0 10px ${reticleColor}`
            : "0 0 5px rgba(0,0,0,0.8)",
        }}
        animate={{
          width:
            state.grappleTargetState === "taut"
              ? 18
              : state.grappleTargetState === "locked"
                ? 20
                : state.isInGrappleRange
                  ? 24
                  : 16,
          height:
            state.grappleTargetState === "taut"
              ? 18
              : state.grappleTargetState === "locked"
                ? 20
                : state.isInGrappleRange
                  ? 24
                  : 16,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
    </motion.div>
  );
}
