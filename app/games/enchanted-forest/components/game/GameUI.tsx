import { CartridgeStartScreen } from "@app/shared";
import { RUNE_PATTERNS } from "@logic/games/enchanted-forest/lib/runePatterns";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const RADIAL_SPEED_LINES = Array.from({ length: 24 }, (_, index) => ({
  id: `radial-speed-line-${index + 1}`,
  rotate: index * 15,
  delay: index * 0.02,
}));
const HORIZONTAL_SPEED_LINES = Array.from({ length: 20 }, (_, index) => ({
  id: `horizontal-speed-line-${index + 1}`,
  top: `${5 + index * 5}%`,
  width: `${50 + ((index * 17) % 50)}%`,
  left: `${(index * 23) % 50}%`,
  delay: index * 0.03,
}));

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
  objective: string;
  threatLevel: number;
  harmonyLevel: number;
  harmonySurgeActive: boolean;
}

function SpeedLines({ direction = "radial" }: { direction?: "radial" | "horizontal" }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {direction === "radial"
        ? RADIAL_SPEED_LINES.map((line) => (
            <motion.div
              key={line.id}
              className="absolute top-1/2 left-1/2 h-[200vh] w-1 bg-gradient-to-b from-transparent via-white/20 to-transparent"
              style={{ transformOrigin: "top center", rotate: `${line.rotate}deg` }}
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: [0, 0.5, 0] }}
              transition={{ duration: 0.8, delay: line.delay }}
            />
          ))
        : HORIZONTAL_SPEED_LINES.map((line) => (
            <motion.div
              key={line.id}
              className="absolute h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              style={{
                top: line.top,
                width: line.width,
                left: line.left,
              }}
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: "200%", opacity: [0, 1, 0] }}
              transition={{ duration: 0.5, delay: line.delay }}
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
  onRestart,
  lastRune,
  objective,
  threatLevel,
  harmonyLevel,
  harmonySurgeActive,
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
        <div className="fixed inset-x-0 top-0 z-40 p-3 md:p-4 pointer-events-none">
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-3 md:gap-4 items-start max-w-5xl mx-auto">
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
              className="relative hidden sm:block"
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <div
                className="bg-black/70 backdrop-blur-sm px-4 py-3 border border-emerald-300/30"
                style={{ clipPath: "polygon(3% 0, 100% 0, 97% 100%, 0% 100%)" }}
              >
                <div className="text-emerald-200/70 text-[10px] font-bold tracking-widest">
                  GROVE CHORUS
                </div>
                <div className="text-white font-black text-sm md:text-base leading-tight truncate">
                  {objective}
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-purple-950/80">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-400 via-amber-300 to-purple-400"
                    animate={{ width: `${Math.max(4, Math.min(100, threatLevel))}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-widest text-emerald-100/75">
                  <span>Harmony</span>
                  <span style={{ color: harmonySurgeActive ? "#fbbf24" : "#a7f3d0" }}>
                    {harmonySurgeActive ? "Surge" : `${harmonyLevel}/3`}
                  </span>
                </div>
                <div className="mt-1 grid grid-cols-3 gap-1">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className="h-1 rounded-full"
                      style={{
                        background:
                          harmonyLevel >= step
                            ? "linear-gradient(90deg, #34d399, #fbbf24)"
                            : "rgba(148, 163, 184, 0.24)",
                      }}
                    />
                  ))}
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
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <CartridgeStartScreen
            accent="#10b981"
            cartridgeId="Slot 03"
            description="Conduct the ward line with gesture runes and keep the grove alive."
            gameSlug="enchanted-forest"
            kicker="Spell Grove Cartridge"
            motif="forest"
            onStart={onStart}
            rules={[
              "Draw shield, heal, and purify runes over the grove stage.",
              "Alternate spells to build harmony and empower the next cast.",
              "Watch shadow paths and protect the targeted sacred trees.",
            ]}
            secondaryAccent="#fbbf24"
            startLabel="START"
            title="ENCHANTED FOREST"
          />
        </motion.div>
      )}

      {gameState === "victory" && <DramaticFlash text="勝利" subtext="VICTORY" color="#fbbf24" />}
      {gameState === "defeat" && (
        <>
          <DramaticFlash text="敗北" subtext="DEFEAT" color="#ef4444" />
          <button
            type="button"
            className="fixed bottom-8 left-1/2 z-[60] -translate-x-1/2 rounded-lg border border-red-300/40 bg-red-900/80 px-8 py-3 text-white font-black"
            onClick={onRestart}
          >
            RESTART
          </button>
        </>
      )}
    </>
  );
}
