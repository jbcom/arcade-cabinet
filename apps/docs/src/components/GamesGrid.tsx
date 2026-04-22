const GAMES = [
  {
    id: "otterly-chaotic",
    title: "OTTERLY CHAOTIC",
    description: "Navigate a chaotic otter through a series of wild challenges.",
    tags: ["r3f", "physics", "action"],
    color: "#0ea5e9",
    gradient: "linear-gradient(135deg, #0ea5e9, #8b5cf6)",
    href: "/games/otterly-chaotic",
  },
  {
    id: "sim-soviet",
    title: "SIM SOVIET",
    description: "Manage a Soviet-era city in this strategic simulation.",
    tags: ["r3f", "simulation", "strategy"],
    color: "#ef4444",
    gradient: "linear-gradient(135deg, #ef4444, #f97316)",
    href: "/games/sim-soviet",
  },
  {
    id: "cosmic-gardener",
    title: "COSMIC GARDENER",
    description: "Plant stars and build constellations in a hybrid pinball puzzle.",
    tags: ["react", "framer-motion", "puzzle"],
    color: "#fbbf24",
    gradient: "linear-gradient(135deg, #fbbf24, #ec4899)",
    href: "/games/cosmic-gardener",
  },
  {
    id: "bioluminescent-sea",
    title: "BIOLUMINESCENT SEA",
    description: "Descent into the deep ocean as a glowing collector of light.",
    tags: ["canvas", "framer-motion", "exploration"],
    color: "#4ecdc4",
    gradient: "linear-gradient(135deg, #4ecdc4, #051018)",
    href: "/games/bioluminescent-sea",
  },
  {
    id: "enchanted-forest",
    title: "ENCHANTED FOREST",
    description: "Protect sacred trees using musical runes and spirit magic.",
    tags: ["react", "tone.js", "manga"],
    color: "#10b981",
    gradient: "linear-gradient(135deg, #10b981, #7c3aed)",
    href: "/games/enchanted-forest",
  },
  {
    id: "primordial-ascent",
    title: "PRIMORDIAL ASCENT",
    description: "Grapple your way out of a rising lava cavern using procedural physics.",
    tags: ["r3f", "physics", "procedural"],
    color: "#00ff66",
    gradient: "linear-gradient(135deg, #00ff66, #ff3333)",
    href: "/games/primordial-ascent",
  },
  {
    id: "reach-for-the-sky",
    title: "REACH FOR THE SKY",
    description: "Architect, manage, and evolve your vertical skyscraper empire.",
    tags: ["r3f", "simulation", "management"],
    color: "#1e88e5",
    gradient: "linear-gradient(135deg, #1e88e5, #43a047)",
    href: "/games/reach-for-the-sky",
  },
  {
    id: "voxel-realms",
    title: "VOXEL REALMS",
    description: "Explore and survive in an infinite, procedurally generated voxel world.",
    tags: ["r3f", "procedural", "survival"],
    color: "#84cc16",
    gradient: "linear-gradient(135deg, #84cc16, #064e3b)",
    href: "/games/voxel-realms",
  },
  {
    id: "titan-mech",
    title: "TITAN MECH",
    description: "Pilot a giant mechanical titan through a field of hazardous obstacles.",
    tags: ["r3f", "cockpit", "action"],
    color: "#f43f5e",
    gradient: "linear-gradient(135deg, #f43f5e, #4c0519)",
    href: "/games/titan-mech",
  },
  {
    id: "protocol-snw",
    title: "PROTOCOL: SNW",
    description: "Tactical survival combat protocol in a shifting neon void.",
    tags: ["r3f", "tactical", "combat"],
    color: "#2dd4bf",
    gradient: "linear-gradient(135deg, #2dd4bf, #042f2e)",
    href: "/games/protocol-snw",
  },
  {
    id: "realmwalker",
    title: "REALMWALKER",
    description: "High-fantasy adventure through shifting realms and mystical relics.",
    tags: ["r3f", "fantasy", "adventure"],
    color: "#c084fc",
    gradient: "linear-gradient(135deg, #c084fc, #4c1d95)",
    href: "/games/realmwalker",
  },
];

export default function GamesGrid() {
  return (
    <section id="games" className="py-24 px-8 max-w-7xl mx-auto">
      <div className="mb-16 text-center">
        <div className="font-mono text-[0.7rem] tracking-[0.4em] uppercase text-violet-400 mb-4">
          — The Collection —
        </div>
        <h2 className="font-display font-extrabold text-4xl md:text-6xl tracking-tight text-white mb-4">
          Games in the Cabinet
        </h2>
        <p className="font-body text-lg text-slate-400 max-w-lg mx-auto">
          Each game is an independent interactive experience, playable directly in your browser.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {GAMES.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </section>
  );
}

function GameCard({ game }: { game: (typeof GAMES)[number] }) {
  return (
    <a
      href={game.href}
      className="group relative bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:border-slate-700 hover:shadow-2xl"
    >
      <div
        className="h-48 flex items-center justify-center relative overflow-hidden"
        style={{ background: game.gradient }}
      >
        <svg
          width="100%"
          height="100%"
          className="absolute inset-0 opacity-20"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <pattern id={`grid-${game.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#grid-${game.id})`} />
        </svg>
        <span className="font-display font-black text-2xl text-white tracking-wider drop-shadow-lg z-10 uppercase">
          {game.title}
        </span>
      </div>

      <div className="p-6">
        <p className="text-slate-400 text-sm leading-relaxed mb-6">{game.description}</p>

        <div className="flex flex-wrap gap-2">
          {game.tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[0.65rem] tracking-wider px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </a>
  );
}
