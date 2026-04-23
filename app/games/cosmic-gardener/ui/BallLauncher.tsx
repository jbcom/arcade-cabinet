import type { CosmicLowerBoardLayout } from "@logic/games/cosmic-gardener/engine/cosmicBoardLayout";
import { motion } from "framer-motion";
import { useCallback, useState } from "react";

interface BallLauncherProps {
  layout: CosmicLowerBoardLayout;
  onLaunch: (x: number, y: number, angle: number, power: number) => void;
  disabled?: boolean;
}

export function BallLauncher({ layout, onLaunch, disabled }: BallLauncherProps) {
  const [isCharging, setIsCharging] = useState(false);
  const [power, setPower] = useState(0);

  const startCharge = useCallback(() => {
    if (disabled) return;
    setIsCharging(true);
    setPower(0);
  }, [disabled]);

  const release = useCallback(() => {
    if (!isCharging) return;
    const launchPower = 6 + (power / 100) * 10;
    const launchAngle = -100 - (power / 100) * 20;
    onLaunch(92, 75, launchAngle, launchPower);
    setIsCharging(false);
    setPower(0);
  }, [isCharging, power, onLaunch]);

  return (
    <div
      className="absolute z-40"
      style={{
        bottom: `${layout.launcherBottomPct}%`,
        right: layout.compactPortrait ? 8 : 12,
        width: layout.launcherButtonSizePx,
      }}
    >
      <div
        className="absolute bottom-0 right-0 overflow-hidden rounded-full"
        style={{
          background:
            "linear-gradient(to top, rgba(168, 85, 247, 0.3) 0%, rgba(168, 85, 247, 0.1) 100%)",
          border: "1px solid rgba(168, 85, 247, 0.3)",
          height: layout.launcherTrackHeightPx,
          width: Math.max(12, Math.round(layout.launcherButtonSizePx * 0.34)),
        }}
      >
        <motion.div
          className="absolute bottom-0 left-0 right-0 rounded-full"
          style={{
            background: "linear-gradient(to top, #a855f7 0%, #ec4899 50%, #fbbf24 100%)",
          }}
          animate={{
            height: `${power}%`,
          }}
          transition={{ duration: 0.05 }}
        />
      </div>

      <motion.button
        aria-label="Launch cosmic orb"
        className="absolute bottom-0 right-0 cursor-pointer rounded-full"
        style={{
          background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)",
          boxShadow: isCharging
            ? "0 0 20px rgba(168, 85, 247, 0.8), inset 0 2px 4px rgba(255,255,255,0.3)"
            : "0 0 10px rgba(168, 85, 247, 0.4), inset 0 2px 4px rgba(255,255,255,0.2)",
          height: layout.touchTargetPx,
          width: layout.touchTargetPx,
        }}
        animate={{
          y: isCharging ? power * 0.3 : 0,
          scale: isCharging ? 0.9 : 1,
        }}
        onPointerDown={startCharge}
        onPointerUp={release}
        onPointerLeave={release}
        disabled={disabled}
        whileHover={{ scale: disabled ? 1 : 1.05 }}
      >
        <div
          className="absolute inset-1 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 50%)",
          }}
        />
      </motion.button>

      {!disabled && (
        <motion.div
          className="absolute rounded-full"
          style={{
            background: "radial-gradient(circle at 30% 30%, #ffffff 0%, #fbbf24 50%, #f59e0b 100%)",
            boxShadow: "0 0 10px rgba(251, 191, 36, 0.6)",
            height: layout.compactPortrait ? 18 : 16,
            right: Math.max(4, layout.launcherButtonSizePx * 0.2),
            top: layout.compactPortrait ? -30 : -32,
            width: layout.compactPortrait ? 18 : 16,
          }}
          animate={{
            y: [0, -3, 0],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </div>
  );
}
