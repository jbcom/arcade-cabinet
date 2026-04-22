import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

// Nautical stock images from Unsplash (public domain style)
const IMAGES = {
  ship: "https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=400&q=80",
  octopus: "https://images.unsplash.com/photo-1545671913-b89ac1b4ac10?w=300&q=80",
  compass: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=200&q=80",
  waves: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&q=80",
  skull: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=150&q=80",
  fish: "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=200&q=80",
  jellyfish: "https://images.unsplash.com/photo-1545671913-b89ac1b4ac10?w=180&q=80",
  moon: "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=200&q=80",
  lantern: "https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=120&q=80",
  anchor: "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=150&q=80",
  seagull: "https://images.unsplash.com/photo-1551710029-607e06bd45ff?w=180&q=80",
  tentacle: "https://images.unsplash.com/photo-1545671913-b89ac1b4ac10?w=250&q=80",
};

const CutoutShip = () => (
  <svg viewBox="0 0 200 150" className="w-full h-full">
    <defs>
      <linearGradient id="shipGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8B4513" />
        <stop offset="100%" stopColor="#5D3A1A" />
      </linearGradient>
    </defs>
    <path d="M20 100 Q100 130 180 100 L170 80 Q100 90 30 80 Z" fill="url(#shipGrad)" stroke="#3D2817" strokeWidth="2"/>
    <rect x="95" y="20" width="10" height="70" fill="#5D3A1A" stroke="#3D2817" strokeWidth="1"/>
    <path d="M50 25 L100 20 L100 75 Q75 70 50 75 Z" fill="#F5F5DC" stroke="#8B8B7A" strokeWidth="1"/>
    <path d="M100 20 L140 30 L100 40 Z" fill="#1a1a2e" stroke="#0f0f1a" strokeWidth="1"/>
    <circle cx="115" cy="30" r="6" fill="#F5F5DC"/>
    <circle cx="113" cy="29" r="1.5" fill="#1a1a2e"/>
    <circle cx="117" cy="29" r="1.5" fill="#1a1a2e"/>
  </svg>
);

const CutoutOctopus = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
    <defs>
      <radialGradient id="octoGrad" cx="50%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#9B59B6" />
        <stop offset="100%" stopColor="#6C3483" />
      </radialGradient>
    </defs>
    <ellipse cx="100" cy="60" rx="50" ry="40" fill="url(#octoGrad)" stroke="#4A235A" strokeWidth="2"/>
    <ellipse cx="80" cy="55" rx="12" ry="15" fill="#F7DC6F"/>
    <ellipse cx="120" cy="55" rx="12" ry="15" fill="#F7DC6F"/>
    <circle cx="80" cy="58" r="6" fill="#1a1a2e"/>
    <circle cx="120" cy="58" r="6" fill="#1a1a2e"/>
    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
      <path
        key={i}
        d={`M${60 + i * 12} 95 Q${50 + i * 15} 140 ${40 + i * 18} 180`}
        fill="none"
        stroke="url(#octoGrad)"
        strokeWidth="12"
        strokeLinecap="round"
      />
    ))}
  </svg>
);

const CutoutFish = () => (
  <svg viewBox="0 0 120 60" className="w-full h-full">
    <defs>
      <linearGradient id="fishGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#5DADE2" />
        <stop offset="100%" stopColor="#2E86AB" />
      </linearGradient>
    </defs>
    <ellipse cx="55" cy="30" rx="40" ry="20" fill="url(#fishGrad)" stroke="#1A5276" strokeWidth="2"/>
    <path d="M10 30 L-10 10 L-10 50 Z" fill="#5DADE2" stroke="#1A5276" strokeWidth="1"/>
    <circle cx="80" cy="25" r="8" fill="#F7F9F9"/>
    <circle cx="82" cy="25" r="4" fill="#1a1a2e"/>
    <path d="M55 10 Q65 -5 75 10" fill="#5DADE2" stroke="#1A5276" strokeWidth="1"/>
    <path d="M40 25 Q45 20 50 25 Q55 20 60 25" fill="none" stroke="#1A5276" strokeWidth="1" opacity="0.5"/>
  </svg>
);

const CutoutJellyfish = () => (
  <svg viewBox="0 0 100 150" className="w-full h-full">
    <defs>
      <radialGradient id="jellyGrad" cx="50%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#E8DAEF" stopOpacity="0.9"/>
        <stop offset="100%" stopColor="#BB8FCE" stopOpacity="0.7"/>
      </radialGradient>
    </defs>
    <path d="M10 50 Q10 10 50 10 Q90 10 90 50 Q70 60 50 55 Q30 60 10 50 Z" 
          fill="url(#jellyGrad)" stroke="#7D3C98" strokeWidth="2"/>
    {[20, 35, 50, 65, 80].map((x, i) => (
      <path
        key={i}
        d={`M${x} 55 Q${x + (i % 2 ? 10 : -10)} 90 ${x} 130`}
        fill="none"
        stroke="#BB8FCE"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.8"
      />
    ))}
  </svg>
);

const CutoutSkull = () => (
  <svg viewBox="0 0 80 100" className="w-full h-full">
    <ellipse cx="40" cy="35" rx="35" ry="30" fill="#F5F5DC" stroke="#8B8B7A" strokeWidth="2"/>
    <path d="M15 50 Q40 80 65 50" fill="#F5F5DC" stroke="#8B8B7A" strokeWidth="2"/>
    <ellipse cx="25" cy="35" rx="10" ry="12" fill="#1a1a2e"/>
    <ellipse cx="55" cy="35" rx="10" ry="12" fill="#1a1a2e"/>
    <path d="M35 45 L40 55 L45 45 Z" fill="#1a1a2e"/>
    <rect x="25" y="58" width="6" height="10" fill="#F5F5DC" stroke="#8B8B7A" strokeWidth="1"/>
    <rect x="33" y="58" width="6" height="10" fill="#F5F5DC" stroke="#8B8B7A" strokeWidth="1"/>
    <rect x="41" y="58" width="6" height="10" fill="#F5F5DC" stroke="#8B8B7A" strokeWidth="1"/>
    <rect x="49" y="58" width="6" height="10" fill="#F5F5DC" stroke="#8B8B7A" strokeWidth="1"/>
  </svg>
);

const CutoutAnchor = () => (
  <svg viewBox="0 0 80 120" className="w-full h-full">
    <defs>
      <linearGradient id="anchorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#566573" />
        <stop offset="100%" stopColor="#2C3E50" />
      </linearGradient>
    </defs>
    <circle cx="40" cy="15" r="10" fill="none" stroke="url(#anchorGrad)" strokeWidth="6"/>
    <rect x="37" y="20" width="6" height="70" fill="url(#anchorGrad)"/>
    <rect x="15" y="30" width="50" height="6" fill="url(#anchorGrad)" rx="3"/>
    <path d="M20 90 Q10 110 40 95" fill="url(#anchorGrad)"/>
    <path d="M60 90 Q70 110 40 95" fill="url(#anchorGrad)"/>
  </svg>
);

interface FloatingElementProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  wobble?: boolean;
  onClick?: () => void;
  clickable?: boolean;
}

const FloatingElement = ({ 
  children, 
  className, 
  delay = 0, 
  duration = 4,
  wobble = true,
  onClick,
  clickable = false
}: FloatingElementProps) => {
  return (
    <motion.div
      className={cn(
        "absolute",
        clickable && "cursor-pointer hover:scale-110 transition-transform",
        className
      )}
      initial={{ opacity: 0, y: 50, rotate: -10 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        rotate: wobble ? [0, 3, -3, 0] : 0,
      }}
      transition={{
        opacity: { duration: 0.8, delay },
        y: { duration: 0.8, delay },
        rotate: wobble ? {
          duration,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        } : undefined,
      }}
      whileHover={clickable ? { scale: 1.15, rotate: 5 } : undefined}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

const Bubbles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/20 border border-white/30"
          style={{
            width: 8 + Math.random() * 20,
            height: 8 + Math.random() * 20,
            left: `${Math.random() * 100}%`,
            bottom: -50,
          }}
          animate={{
            y: [0, -window.innerHeight - 100],
            x: [0, Math.sin(i) * 50, 0],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 8 + Math.random() * 6,
            repeat: Infinity,
            delay: Math.random() * 10,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

export function NauticalLanding({ onStartGame }: { onStartGame: () => void }) {
  const [clickedElement, setClickedElement] = useState<string | null>(null);

  const handleElementClick = (element: string) => {
    setClickedElement(element);
    setTimeout(() => {
      onStartGame();
    }, 800);
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-[#0a1628] via-[#0d2137] to-[#051018]">
      <div 
        className="absolute inset-0 opacity-60"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(30, 80, 120, 0.4) 0%, transparent 60%)",
        }}
      />

      <svg className="absolute bottom-0 left-0 w-full h-32 opacity-20" preserveAspectRatio="none">
        <motion.path
          d="M0 50 Q250 0 500 50 T1000 50 T1500 50 T2000 50"
          fill="none"
          stroke="#4ECDC4"
          strokeWidth="2"
          animate={{ x: [0, -500] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        <motion.path
          d="M0 70 Q250 30 500 70 T1000 70 T1500 70 T2000 70"
          fill="none"
          stroke="#45B7AA"
          strokeWidth="2"
          animate={{ x: [0, -500] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear", delay: 0.5 }}
        />
      </svg>

      <Bubbles />

      <motion.div 
        className="absolute top-[8%] left-1/2 -translate-x-1/2 text-center z-20"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <h1 className="text-5xl md:text-7xl font-bold tracking-wider">
          {["D", "E", "E", "P", " ", "S", "E", "A"].map((letter, i) => (
            <motion.span
              key={i}
              className="inline-block text-transparent bg-clip-text"
              style={{
                backgroundImage: "linear-gradient(180deg, #F5DEB3 0%, #D4A574 50%, #8B7355 100%)",
                textShadow: "3px 3px 0 #2C1810, -1px -1px 0 #F5DEB3",
                WebkitTextStroke: "1px #2C1810",
              }}
              animate={{ 
                rotate: [0, i % 2 ? 2 : -2, 0],
                y: [0, i % 2 ? -5 : 5, 0],
              }}
              transition={{
                duration: 3 + i * 0.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.1,
              }}
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          ))}
        </h1>
        <motion.h2 
          className="text-3xl md:text-5xl font-bold mt-2 tracking-widest"
          style={{
            backgroundImage: "linear-gradient(180deg, #87CEEB 0%, #4ECDC4 50%, #2E8B8B 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "2px 2px 0 #0a1628",
          }}
          animate={{ 
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          COLLECTOR
        </motion.h2>
      </motion.div>

      <motion.p
        className="absolute top-[28%] left-1/2 -translate-x-1/2 text-cyan-200/70 text-lg md:text-xl text-center z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        Click any creature to begin your descent...
      </motion.p>

      <FloatingElement
        className="top-[35%] left-1/2 -translate-x-1/2 w-48 md:w-64"
        delay={0.3}
        duration={5}
        clickable
        onClick={() => handleElementClick("ship")}
      >
        <CutoutShip />
        <motion.div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs text-amber-200/60 whitespace-nowrap"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          The Abyssal Wanderer
        </motion.div>
      </FloatingElement>

      <FloatingElement
        className="bottom-[15%] left-[5%] w-32 md:w-48"
        delay={0.6}
        duration={6}
        clickable
        onClick={() => handleElementClick("octopus")}
      >
        <CutoutOctopus />
      </FloatingElement>

      <FloatingElement
        className="top-[45%] right-[8%] w-24 md:w-32"
        delay={0.8}
        duration={3}
        clickable
        onClick={() => handleElementClick("fish1")}
      >
        <CutoutFish />
      </FloatingElement>

      <FloatingElement
        className="top-[60%] left-[15%] w-20 md:w-28"
        delay={0.5}
        duration={7}
        clickable
        onClick={() => handleElementClick("jelly1")}
      >
        <CutoutJellyfish />
      </FloatingElement>

      <FloatingElement
        className="bottom-[2%] left-1/2 -translate-x-1/2 w-16 md:w-20"
        delay={1.8}
        duration={5}
        clickable
        onClick={() => handleElementClick("anchor")}
      >
        <CutoutAnchor />
      </FloatingElement>

      <AnimatePresence>
        {clickedElement && (
          <motion.div
            className="absolute inset-0 bg-cyan-400/30 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
