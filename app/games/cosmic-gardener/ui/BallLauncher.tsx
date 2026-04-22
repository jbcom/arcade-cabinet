import { motion } from "framer-motion";
import { useCallback, useState } from "react";

interface BallLauncherProps {
  onLaunch: (x: number, y: number, angle: number, power: number) => void;
  disabled?: boolean;
}

export function BallLauncher({ onLaunch, disabled }: BallLauncherProps) {
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
    <div className="absolute right-2 bottom-[18%] w-8 z-40">
      <div
        className="absolute bottom-0 right-0 w-3 h-32 rounded-full overflow-hidden"
        style={{
          background:
            "linear-gradient(to top, rgba(168, 85, 247, 0.3) 0%, rgba(168, 85, 247, 0.1) 100%)",
          border: "1px solid rgba(168, 85, 247, 0.3)",
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
        className="absolute bottom-0 right-0 w-8 h-8 rounded-full cursor-pointer"
        style={{
          background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)",
          boxShadow: isCharging
            ? "0 0 20px rgba(168, 85, 247, 0.8), inset 0 2px 4px rgba(255,255,255,0.3)"
            : "0 0 10px rgba(168, 85, 247, 0.4), inset 0 2px 4px rgba(255,255,255,0.2)",
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
          className="absolute -top-8 right-1 w-4 h-4 rounded-full"
          style={{
            background: "radial-gradient(circle at 30% 30%, #ffffff 0%, #fbbf24 50%, #f59e0b 100%)",
            boxShadow: "0 0 10px rgba(251, 191, 36, 0.6)",
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
