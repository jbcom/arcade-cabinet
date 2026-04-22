const TECH = [
  {
    name: "React Three Fiber",
    description: "3D game scenes using React's declarative paradigm over WebGL.",
    color: "#0ea5e9",
    icon: "⬡",
  },
  {
    name: "Drei",
    description: "A growing collection of helpers and abstractions for R3F.",
    color: "#8b5cf6",
    icon: "✦",
  },
  {
    name: "Post Processing",
    description: "Bloom, chromatic aberration, and cinematic effects.",
    color: "#ec4899",
    icon: "◈",
  },
  {
    name: "Astro",
    description: "Islands architecture. Games as React components, zero-JS otherwise.",
    color: "#f97316",
    icon: "◎",
  },
  {
    name: "Vite",
    description: "Blazing-fast builds, HMR, and module bundling.",
    color: "#eab308",
    icon: "⚡",
  },
  {
    name: "TypeScript",
    description: "Full type safety across the entire monorepo.",
    color: "#06b6d4",
    icon: "TS",
  },
  {
    name: "Vitest",
    description: "Unit and browser testing with Vite-native speed.",
    color: "#84cc16",
    icon: "✓",
  },
  {
    name: "pnpm Workspaces",
    description: "Efficient monorepo dependency management.",
    color: "#ef4444",
    icon: "◻",
  },
];

export default function TechStack() {
  return (
    <section
      style={{
        padding: "6rem 2rem",
        background: "var(--color-bg-2)",
        borderTop: "1px solid var(--color-border)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Section header */}
        <div style={{ marginBottom: "4rem", textAlign: "center" }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: "var(--color-lime)",
              marginBottom: "1rem",
            }}
          >
            — Under the Hood —
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "var(--color-text)",
            }}
          >
            Built on Modern Primitives
          </h2>
        </div>

        {/* Tech grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "1rem",
          }}
        >
          {TECH.map((item) => (
            // biome-ignore lint/a11y/noStaticElementInteractions: visual-only hover highlight, no interactive action
            <div
              key={item.name}
              style={{
                padding: "1.5rem",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "12px",
                display: "flex",
                gap: "1rem",
                alignItems: "flex-start",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = `${item.color}60`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-border)";
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  background: `${item.color}20`,
                  border: `1px solid ${item.color}40`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-mono)",
                  fontSize: "1rem",
                  color: item.color,
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </div>
              <div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    color: "var(--color-text)",
                    marginBottom: "0.35rem",
                  }}
                >
                  {item.name}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.82rem",
                    color: "var(--color-text-muted)",
                    lineHeight: 1.5,
                  }}
                >
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
