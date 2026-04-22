import { useTrait } from "koota/react";
import { primordialEntity } from "../store/world";
import { PrimordialTrait } from "../store/traits";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function Crosshair() {
  const state = useTrait(primordialEntity, PrimordialTrait);
  const [isLocked, setIsLocked] = useState(false);

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
          border: `2px solid ${isLocked ? "#00ff66" : "rgba(255, 255, 255, 0.8)"}`,
          boxShadow: isLocked ? "0 0 15px #00ff66, inset 0 0 10px #00ff66" : "0 0 5px rgba(0,0,0,0.8)",
        }}
        animate={{
          width: isLocked ? 20 : state.isInGrappleRange ? 24 : 16,
          height: isLocked ? 20 : state.isInGrappleRange ? 24 : 16,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
    </motion.div>
  );
}
