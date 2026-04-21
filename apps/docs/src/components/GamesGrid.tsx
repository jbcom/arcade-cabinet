const GAMES = [
  {
    id: "coming-soon-1",
    title: "VOID RUNNER",
    description: "Navigate infinite procedurally generated tunnels at hyperspeed.",
    tags: ["r3f", "procedural", "runner"],
    color: "#0ea5e9",
    gradient: "linear-gradient(135deg, #0ea5e9, #8b5cf6)",
    status: "coming soon",
  },
  {
    id: "coming-soon-2",
    title: "NEON DRIFT",
    description: "Precision racing through neon-soaked city circuits.",
    tags: ["r3f", "physics", "racing"],
    color: "#ec4899",
    gradient: "linear-gradient(135deg, #ec4899, #f97316)",
    status: "coming soon",
  },
  {
    id: "coming-soon-3",
    title: "PRISM BREAK",
    description: "Shatter crystalline structures with satisfying physics.",
    tags: ["r3f", "destruction", "puzzle"],
    color: "#eab308",
    gradient: "linear-gradient(135deg, #eab308, #84cc16)",
    status: "coming soon",
  },
  {
    id: "coming-soon-4",
    title: "DEEP FIELD",
    description: "Explore procedurally generated galaxies and their secrets.",
    tags: ["r3f", "exploration", "space"],
    color: "#8b5cf6",
    gradient: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
    status: "coming soon",
  },
];

export default function GamesGrid() {
  return (
    <section
      id="games"
      style={{
        padding: "6rem 2rem",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      {/* Section header */}
      <div style={{ marginBottom: "4rem", textAlign: "center" }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: "var(--color-violet)",
            marginBottom: "1rem",
          }}
        >
          — The Collection —
        </div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "var(--color-text)",
            marginBottom: "1rem",
          }}
        >
          Games in the Cabinet
        </h2>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "1.1rem",
            color: "var(--color-text-muted)",
            maxWidth: "480px",
            margin: "0 auto",
          }}
        >
          Each game is an independent React Three Fiber experience, playable directly in your
          browser.
        </p>
      </div>

      {/* Games grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {GAMES.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </section>
  );
}

function GameCard({
  game,
}: {
  game: (typeof GAMES)[number];
}) {
  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "16px",
        overflow: "hidden",
        transition: "border-color 0.3s, transform 0.3s, box-shadow 0.3s",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "translateY(-4px)";
        el.style.boxShadow = `0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px ${game.color}40`;
        el.style.borderColor = `${game.color}60`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "none";
        el.style.borderColor = "var(--color-border)";
      }}
    >
      {/* Card header - colored preview area */}
      <div
        style={{
          height: "160px",
          background: game.gradient,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Abstract game preview pattern */}
        <svg
          width="100%"
          height="100%"
          style={{ position: "absolute", inset: 0, opacity: 0.3 }}
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
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "1.8rem",
            color: "rgba(255,255,255,0.9)",
            letterSpacing: "0.05em",
            textShadow: "0 2px 20px rgba(0,0,0,0.3)",
            zIndex: 1,
          }}
        >
          {game.title}
        </span>

        {/* Status badge */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(8px)",
            borderRadius: "999px",
            padding: "0.25rem 0.75rem",
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.8)",
          }}
        >
          {game.status}
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: "1.5rem" }}>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.9rem",
            color: "var(--color-text-muted)",
            lineHeight: 1.6,
            marginBottom: "1.25rem",
          }}
        >
          {game.description}
        </p>

        {/* Tags */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {game.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                letterSpacing: "0.05em",
                padding: "0.2rem 0.6rem",
                borderRadius: "4px",
                background: `${game.color}15`,
                color: game.color,
                border: `1px solid ${game.color}30`,
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
