import { PrimordialTrait } from "@logic/games/primordial-ascent/store/traits";
import { primordialEntity } from "@logic/games/primordial-ascent/store/world";
import { motion } from "framer-motion";
import { useTrait } from "koota/react";
import { useEffect, useState } from "react";

export function Crosshair() {
  const state = useTrait(primordialEntity, PrimordialTrait);
  const [isLocked, setIsLocked] = useState(false);
  const guide = state.grappleGuideCue;
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
  const targetVisible = state.grappleTargetState !== "none" || isLocked || guide.pulse;
  const baseReticleSize =
    state.grappleTargetState === "taut"
      ? 18
      : state.grappleTargetState === "locked"
        ? 20
        : state.isInGrappleRange
          ? 24
          : 16;
  const reticleSize = Math.round(baseReticleSize * guide.reticleScale);

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
        opacity: targetVisible ? 1 : 0.48,
      }}
    >
      <div className="absolute w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_5px_rgba(0,0,0,0.8)]" />
      {guide.pulse ? (
        <motion.div
          className="absolute rounded-full"
          style={{
            border: `1px solid ${reticleColor}`,
            boxShadow: `0 0 18px ${reticleColor}`,
          }}
          animate={{
            height: [reticleSize + 8, reticleSize + 22, reticleSize + 8],
            opacity: [0.18, 0.58, 0.18],
            width: [reticleSize + 8, reticleSize + 22, reticleSize + 8],
          }}
          transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity }}
        />
      ) : null}
      <motion.div
        className="absolute rounded-full"
        style={{
          border: `2px solid ${reticleColor}`,
          boxShadow: targetVisible
            ? `0 0 15px ${reticleColor}, inset 0 0 10px ${reticleColor}`
            : "0 0 5px rgba(0,0,0,0.8)",
        }}
        animate={{
          height: reticleSize,
          width: reticleSize,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
      <motion.div
        className="absolute top-9 min-w-36 rounded-md border px-2 py-1 text-center font-mono text-[0.58rem] font-black uppercase text-white backdrop-blur"
        style={{
          background: "rgba(2, 6, 8, 0.68)",
          borderColor: `${reticleColor}88`,
          boxShadow: `0 0 18px ${reticleColor}33`,
        }}
        animate={{ opacity: guide.pulse || state.grappleTargetState !== "none" ? 1 : 0.64 }}
      >
        {guide.inputHint}
      </motion.div>
    </motion.div>
  );
}
