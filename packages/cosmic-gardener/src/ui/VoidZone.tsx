import { motion } from "framer-motion";
import type { VoidZone as VoidZoneType } from "../engine/constellations";

interface VoidZoneProps {
  zone: VoidZoneType;
}

export function VoidZone({ zone }: VoidZoneProps) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${zone.x}%`,
        top: `${zone.y}%`,
        width: `${zone.radius * 2}%`,
        height: `${zone.radius * 2}%`,
        transform: "translate(-50%, -50%)",
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle, transparent 40%, rgba(139, 69, 102, 0.2) 60%, transparent 80%)",
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute inset-[15%] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(0, 0, 0, 0.8) 0%, rgba(30, 10, 40, 0.6) 50%, transparent 100%)",
          boxShadow: "inset 0 0 20px rgba(139, 69, 102, 0.3)",
        }}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-purple-900/60"
          style={{
            left: "50%",
            top: "50%",
          }}
          animate={{
            x: [0, Math.cos((i * Math.PI) / 3) * 20, 0],
            y: [0, Math.sin((i * Math.PI) / 3) * 20, 0],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 2 + i * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.2,
          }}
        />
      ))}

      <motion.div
        className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full transform -translate-x-1/2 -translate-y-1/2"
        style={{
          background: "radial-gradient(circle, rgba(100, 40, 80, 0.9) 0%, transparent 100%)",
        }}
        animate={{
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
}
