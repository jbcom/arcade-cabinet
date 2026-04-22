import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../lib/utils";

interface StarSeedProps {
  id: string;
  x: number;
  y: number;
  energy: number;
  maxEnergy: number;
  growthStage: number;
  isSelected?: boolean;
  onClick?: () => void;
  onDragStart?: () => void;
  onDragEnd?: (position: { x: number; y: number }) => void;
}

export function StarSeed({
  x,
  y,
  energy,
  maxEnergy,
  growthStage,
  isSelected = false,
  onClick,
}: StarSeedProps) {
  const energyPercent = energy / maxEnergy;

  const sizes = [12, 18, 26, 36];
  const size = sizes[growthStage];

  const colors = {
    core: ["#fef3c7", "#fcd34d", "#f59e0b", "#ffffff"],
    glow: [
      "rgba(254, 243, 199, 0.3)",
      "rgba(252, 211, 77, 0.4)",
      "rgba(245, 158, 11, 0.5)",
      "rgba(255, 255, 255, 0.6)",
    ],
    outer: [
      "rgba(139, 92, 246, 0.2)",
      "rgba(168, 85, 247, 0.3)",
      "rgba(236, 72, 153, 0.4)",
      "rgba(255, 215, 180, 0.5)",
    ],
  };

  return (
    <motion.div
      className={cn(
        "absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2",
        "transition-transform duration-200",
        isSelected && "z-50"
      )}
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
      }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 4,
          height: size * 4,
          left: -size * 1.5,
          top: -size * 1.5,
          background: `radial-gradient(circle, ${colors.outer[growthStage]} 0%, transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 2 + growthStage * 0.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 2.5,
          height: size * 2.5,
          left: -size * 0.75,
          top: -size * 0.75,
          background: `radial-gradient(circle, ${colors.glow[growthStage]} 0%, transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="rounded-full relative"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle at 30% 30%, ${colors.core[growthStage]} 0%, ${colors.core[Math.max(0, growthStage - 1)]} 50%, transparent 100%)`,
          boxShadow: `0 0 ${size / 2}px ${colors.core[growthStage]}, 0 0 ${size}px ${colors.glow[growthStage]}`,
        }}
        animate={{
          boxShadow: [
            `0 0 ${size / 2}px ${colors.core[growthStage]}, 0 0 ${size}px ${colors.glow[growthStage]}`,
            `0 0 ${size}px ${colors.core[growthStage]}, 0 0 ${size * 1.5}px ${colors.glow[growthStage]}`,
            `0 0 ${size / 2}px ${colors.core[growthStage]}, 0 0 ${size}px ${colors.glow[growthStage]}`,
          ],
        }}
        transition={{
          duration: 1 + growthStage * 0.3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <AnimatePresence>
        {isSelected && (
          <motion.div
            className="absolute rounded-full border-2 border-white/50"
            style={{
              width: size * 2,
              height: size * 2,
              left: -size / 2,
              top: -size / 2,
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          />
        )}
      </AnimatePresence>

      <div
        className="absolute left-1/2 transform -translate-x-1/2 h-1 rounded-full bg-white/20 overflow-hidden"
        style={{
          width: size * 2,
          top: size + 8,
        }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(90deg, #fcd34d, #f59e0b, #ec4899)",
          }}
          initial={{ width: 0 }}
          animate={{ width: `${energyPercent * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div
        className="absolute flex gap-0.5"
        style={{ top: size + 14, left: "50%", transform: "translateX(-50%)" }}
      >
        {[0, 1, 2, 3].map((stage) => (
          <div
            key={stage}
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-colors duration-300",
              stage <= growthStage ? "bg-amber-400" : "bg-white/20"
            )}
          />
        ))}
      </div>
    </motion.div>
  );
}
