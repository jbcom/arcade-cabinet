import { motion } from "framer-motion";
import type { PinballOrb as PinballOrbType } from "../engine/usePinballPhysics";

interface PinballOrbProps {
  orb: PinballOrbType;
}

export function PinballOrb({ orb }: PinballOrbProps) {
  if (!orb.active) return null;

  return (
    <>
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
        {orb.trail.length > 1 && (
          <path
            d={`M ${orb.trail.map((t) => `${t.x}% ${t.y}%`).join(" L ")}`}
            fill="none"
            stroke="url(#orbTrailGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            opacity={0.6}
          />
        )}
        <defs>
          <linearGradient id="orbTrailGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(251, 191, 36, 0)" />
            <stop offset="50%" stopColor="rgba(251, 191, 36, 0.5)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.8)" />
          </linearGradient>
        </defs>
      </svg>

      <motion.div
        className="absolute pointer-events-none z-30"
        style={{
          left: `${orb.x}%`,
          top: `${orb.y}%`,
          transform: "translate(-50%, -50%)",
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
      >
        <div
          className="absolute rounded-full"
          style={{
            width: 40,
            height: 40,
            left: -15,
            top: -15,
            background: "radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, rgba(251, 191, 36, 0.1) 40%, transparent 70%)",
          }}
        />

        <div
          className="absolute rounded-full"
          style={{
            width: 24,
            height: 24,
            left: -7,
            top: -7,
            background: "radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, rgba(251, 191, 36, 0.6) 50%, transparent 100%)",
          }}
        />

        <motion.div
          className="rounded-full"
          style={{
            width: 10,
            height: 10,
            background: "radial-gradient(circle at 30% 30%, #ffffff 0%, #fbbf24 50%, #f59e0b 100%)",
            boxShadow: "0 0 10px #fbbf24, 0 0 20px rgba(251, 191, 36, 0.5)",
          }}
          animate={{
            boxShadow: [
              "0 0 10px #fbbf24, 0 0 20px rgba(251, 191, 36, 0.5)",
              "0 0 15px #fbbf24, 0 0 30px rgba(251, 191, 36, 0.7)",
              "0 0 10px #fbbf24, 0 0 20px rgba(251, 191, 36, 0.5)",
            ],
          }}
          transition={{ duration: 0.3, repeat: Infinity }}
        />
      </motion.div>
    </>
  );
}
