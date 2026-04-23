import type { CosmicLowerBoardLayout } from "@logic/games/cosmic-gardener/engine/cosmicBoardLayout";
import { motion } from "framer-motion";

interface FlippersProps {
  layout: CosmicLowerBoardLayout;
  leftActive: boolean;
  rightActive: boolean;
  onLeftDown: () => void;
  onLeftUp: () => void;
  onRightDown: () => void;
  onRightUp: () => void;
}

export function Flippers({
  layout,
  leftActive,
  rightActive,
  onLeftDown,
  onLeftUp,
  onRightDown,
  onRightUp,
}: FlippersProps) {
  return (
    <>
      <div
        className="absolute bottom-0 left-0 right-0 h-[15%] pointer-events-none"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)",
          height: `${layout.apronHeightPct}%`,
        }}
      />

      <motion.div
        className="absolute cursor-pointer z-40"
        style={{
          bottom: `${layout.flipperBottomPct}%`,
          height: `${layout.flipperHeightPct}%`,
          left: layout.compactPortrait ? "11%" : "12%",
          transformOrigin: "15% 50%",
          width: `${layout.flipperWidthPct}%`,
        }}
        animate={{
          rotate: leftActive ? -30 : 20,
        }}
        transition={{ type: "spring", stiffness: 800, damping: 20 }}
        onPointerDown={onLeftDown}
        onPointerUp={onLeftUp}
        onPointerLeave={onLeftUp}
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background: "linear-gradient(90deg, #f59e0b 0%, #fbbf24 50%, #fcd34d 100%)",
            boxShadow: leftActive
              ? "0 0 20px rgba(251, 191, 36, 0.8), inset 0 2px 4px rgba(255,255,255,0.3)"
              : "0 0 10px rgba(251, 191, 36, 0.4), inset 0 2px 4px rgba(255,255,255,0.2)",
          }}
        />
        <div
          className="absolute w-4 h-4 rounded-full"
          style={{
            left: "10%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(251, 191, 36, 0.6) 50%, transparent 100%)",
          }}
        />
      </motion.div>

      <motion.div
        className="absolute cursor-pointer z-40"
        style={{
          bottom: `${layout.flipperBottomPct}%`,
          height: `${layout.flipperHeightPct}%`,
          right: layout.compactPortrait ? "11%" : "12%",
          transformOrigin: "85% 50%",
          width: `${layout.flipperWidthPct}%`,
        }}
        animate={{
          rotate: rightActive ? 30 : -20,
        }}
        transition={{ type: "spring", stiffness: 800, damping: 20 }}
        onPointerDown={onRightDown}
        onPointerUp={onRightUp}
        onPointerLeave={onRightUp}
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background: "linear-gradient(270deg, #f59e0b 0%, #fbbf24 50%, #fcd34d 100%)",
            boxShadow: rightActive
              ? "0 0 20px rgba(251, 191, 36, 0.8), inset 0 2px 4px rgba(255,255,255,0.3)"
              : "0 0 10px rgba(251, 191, 36, 0.4), inset 0 2px 4px rgba(255,255,255,0.2)",
          }}
        />
        <div
          className="absolute w-4 h-4 rounded-full"
          style={{
            right: "10%",
            top: "50%",
            transform: "translate(50%, -50%)",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(251, 191, 36, 0.6) 50%, transparent 100%)",
          }}
        />
      </motion.div>

      <div
        className="absolute left-[35%] right-[35%] h-[2%] rounded-t-full"
        style={{
          bottom: `${Math.max(0, layout.flipperBottomPct - 6)}%`,
          background: "linear-gradient(to top, rgba(139, 69, 102, 0.6) 0%, transparent 100%)",
        }}
      />
    </>
  );
}
