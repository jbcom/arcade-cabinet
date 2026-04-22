import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { RUNE_PATTERNS } from "../../lib/runePatterns";

interface GameUIProps {
  wave: number;
  totalWaves: number;
  mana: number;
  maxMana: number;
  isPaused: boolean;
  gameState: "intro" | "tutorial" | "playing" | "victory" | "defeat";
  onStart: () => void;
  onRestart: () => void;
  lastRune?: string | null;
}

function SpeedLines({ direction = "radial" }: { direction?: "radial" | "horizontal" }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {direction === "radial"
        ? [...Array(24)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 left-1/2 h-[200vh] w-1 bg-gradient-to-b from-transparent via-white/20 to-transparent"
              style={{ transformOrigin: "top center", rotate: `${i * 15}deg` }}
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: [0, 0.5, 0] }}
              transition={{ duration: 0.8, delay: i * 0.02 }}
            />
          ))
        : [...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              style={{
                top: `${5 + i * 5}%`,
                width: `${50 + Math.random() * 50}%`,
                left: `${Math.random() * 50}%`,
              }}
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: "200%", opacity: [0, 1, 0] }}
              transition={{ duration: 0.5, delay: i * 0.03 }}
            />
          ))}
    </div>
  );
}

function DramaticFlash({
  text,
  subtext,
  color = "#fbbf24",
}: {
  text: string;
  subtext?: string;
  color?: string;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <SpeedLines direction="radial" />
      <div className="relative text-center">
        <motion.div
          className="text-8xl md:text-9xl font-black"
          style={{
            color,
            textShadow: `0 0 60px ${color}, 0 0 120px ${color}`,
            WebkitTextStroke: `2px ${color}`,
          }}
          initial={{ scale: 3, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {text}
        </motion.div>
        {subtext && (
          <motion.div
            className="text-2xl md:text-3xl font-bold text-white/90 mt-4 tracking-widest"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {subtext}
          </motion.div>
        )}
        <motion.div
          className="h-1 mx-auto mt-4 rounded-full"
          style={{ background: color, boxShadow: `0 0 20px ${color}` }}
          initial={{ width: 0 }}
          animate={{ width: "80%" }}
          transition={{ delay: 0.3, duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
}

function RuneActivation({
  rune,
  onComplete,
}: {
  rune: (typeof RUNE_PATTERNS)[0];
  onComplete: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const runeNames: Record<string, { jp: string; romaji: string }> = {
    Shield: { jp: "守護", romaji: "SHUGO" },
    Heal: { jp: "癒し", romaji: "IYASHI" },
    Purify: { jp: "浄化", romaji: "JOUKA" },
  };
  const runeInfo = runeNames[rune.name] || { jp: rune.name, romaji: rune.name };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ background: rune.color }}
        initial={{ opacity: 0.8 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      />
      <SpeedLines direction="horizontal" />
      <div className="relative">
        <motion.div
          className="absolute inset-0 -m-20 rounded-full blur-3xl"
          style={{ background: rune.color }}
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.8 }}
        />
        <motion.div
          className="text-7xl md:text-8xl font-black text-center"
          style={{
            color: rune.color,
            textShadow: `0 0 40px ${rune.color}, 0 0 80px ${rune.color}`,
          }}
          initial={{ scale: 2, opacity: 0, y: -50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {runeInfo.jp}
        </motion.div>
        <motion.div
          className="text-xl md:text-2xl font-bold tracking-[0.5em] text-center mt-2"
          style={{ color: rune.color }}
          initial={{ opacity: 0, letterSpacing: "1em" }}
          animate={{ opacity: 1, letterSpacing: "0.5em" }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          {runeInfo.romaji}
        </motion.div>
      </div>
    </motion.div>
  );
}

export function GameUI({
  wave,
  totalWaves,
  mana,
  maxMana,
  gameState,
  onStart,
  lastRune,
}: GameUIProps) {
  const [showRuneEffect, setShowRuneEffect] = useState<(typeof RUNE_PATTERNS)[0] | null>(null);

  useEffect(() => {
    if (lastRune) {
      const rune = RUNE_PATTERNS.find((r) => r.name === lastRune);
      if (rune) setShowRuneEffect(rune);
    }
  }, [lastRune]);

  return (
    <>
      <AnimatePresence>
        {showRuneEffect && (
          <RuneActivation rune={showRuneEffect} onComplete={() => setShowRuneEffect(null)} />
        )}
      </AnimatePresence>

      {(gameState === "playing" || gameState === "tutorial") && (
        <div className="fixed top-0 left-0 right-0 z-40 p-4 pointer-events-none">
          <div className="flex justify-between items-start max-w-4xl mx-auto">
            <motion.div
              className="relative"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
            >
              <div
                className="bg-black/80 backdrop-blur-sm px-5 py-3 border-2 border-amber-400/50"
                style={{ clipPath: "polygon(0 0, 100% 0, 95% 100%, 5% 100%)" }}
              >
                <div className="text-amber-400/80 text-xs font-bold tracking-widest">
                  WAVE ウェーブ
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-amber-400">{wave}</span>
                  <span className="text-amber-400/60 text-lg">/ {totalWaves}</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
            >
              <div
                className="bg-black/80 backdrop-blur-sm px-5 py-3 border-2 border-violet-400/50"
                style={{ clipPath: "polygon(5% 0, 100% 0, 100% 100%, 0% 100%)" }}
              >
                <div className="text-violet-400/80 text-xs font-bold tracking-widest text-right">
                  MANA マナ
                </div>
                <div className="w-36 h-4 bg-black/50 rounded-sm overflow-hidden mt-1 border border-violet-500/30">
                  <motion.div
                    className="h-full"
                    style={{
                      width: `${(mana / maxMana) * 100}%`,
                      background: "linear-gradient(90deg, #7c3aed, #a78bfa, #7c3aed)",
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {gameState === "intro" && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-center px-6">
            <h1 className="text-6xl font-black text-emerald-400 mb-8">森の守護者</h1>
            <button
              className="px-12 py-4 bg-emerald-600 text-white font-bold text-xl rounded-lg"
              onClick={onStart}
            >
              START
            </button>
          </div>
        </motion.div>
      )}

      {gameState === "victory" && <DramaticFlash text="勝利" subtext="VICTORY" color="#fbbf24" />}
      {gameState === "defeat" && <DramaticFlash text="敗北" subtext="DEFEAT" color="#ef4444" />}
    </>
  );
}
