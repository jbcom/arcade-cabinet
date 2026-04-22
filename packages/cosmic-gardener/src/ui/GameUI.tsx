import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../lib/utils";

interface GameUIProps {
  level: number;
  totalEnergy: number;
  cosmicCold: number;
  constellationsCompleted: number;
  totalConstellations: number;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
}

export function GameUI({
  level,
  totalEnergy,
  cosmicCold,
  constellationsCompleted,
  totalConstellations,
  isPaused,
  onPause,
  onResume,
  onRestart,
}: GameUIProps) {
  const constellationSlots = Array.from({ length: totalConstellations }, (_, index) => ({
    id: `constellation-${index + 1}`,
    index,
  }));

  return (
    <>
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start pointer-events-none z-50">
        <motion.div
          className="flex flex-col gap-2 pointer-events-auto"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3">
            <span className="text-white/60 text-xs uppercase tracking-widest">Level</span>
            <span className="text-white text-2xl font-light">{level}</span>
          </div>

          <div className="flex gap-1.5">
            {constellationSlots.map((slot) => (
              <motion.div
                key={slot.id}
                className={cn(
                  "w-3 h-3 rounded-full border transition-colors duration-300",
                  slot.index < constellationsCompleted
                    ? "bg-amber-400 border-amber-400"
                    : "bg-transparent border-white/30"
                )}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + slot.index * 0.1 }}
              />
            ))}
          </div>
        </motion.div>

        <motion.button
          type="button"
          className="pointer-events-auto px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-sm hover:bg-white/20 transition-colors"
          onClick={isPaused ? onResume : onPause}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isPaused ? "Resume" : "Pause"}
        </motion.button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-end pointer-events-none z-50">
        <motion.div
          className="flex flex-col gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-white/60 text-xs uppercase tracking-widest">Cosmic Energy</span>
          <div className="w-48 h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, #fbbf24, #f59e0b, #ec4899)",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${(totalEnergy / 500) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-white/80 text-sm font-light">{Math.floor(totalEnergy)}</span>
        </motion.div>

        <motion.div
          className="flex flex-col gap-2 items-end"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <span className="text-white/60 text-xs uppercase tracking-widest">Cosmic Cold</span>
          <div className="w-48 h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7)",
              }}
              animate={{
                width: `${cosmicCold}%`,
                background:
                  cosmicCold > 70
                    ? "linear-gradient(90deg, #dc2626, #ef4444, #f87171)"
                    : "linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7)",
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span
            className={cn(
              "text-sm font-light transition-colors",
              cosmicCold > 70 ? "text-red-400" : "text-white/80"
            )}
          >
            {cosmicCold > 70 ? "Danger!" : `${Math.floor(100 - cosmicCold)}% warmth`}
          </span>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p className="text-white/40 text-xs">
          Click to plant stars | Drag between stars to create energy streams
        </p>
      </motion.div>

      <AnimatePresence>
        {isPaused && (
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.h2
              className="text-white text-4xl font-light mb-8"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              Paused
            </motion.h2>
            <div className="flex gap-4">
              <motion.button
                className="px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-colors"
                onClick={onResume}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Resume
              </motion.button>
              <motion.button
                className="px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-colors"
                onClick={onRestart}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Restart
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
