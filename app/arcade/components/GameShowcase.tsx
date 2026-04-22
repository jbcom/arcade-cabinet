import { useMemo, useState } from "react";
import { type GameSlug, games, gamesBySlug } from "../games/catalog";
import { withBasePath } from "../utils/basePath";
import GameIsland from "./GameIsland";

export default function GameShowcase() {
  const [activeSlug, setActiveSlug] = useState<GameSlug>(games[0].slug);
  const activeGame = useMemo(() => gamesBySlug[activeSlug], [activeSlug]);

  return (
    <section style={{ maxWidth: 1400, margin: "0 auto", padding: "0 2rem 6rem" }}>
      <div style={{ marginBottom: "2rem", textAlign: "center" }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            textTransform: "uppercase",
            color: "var(--color-violet)",
            marginBottom: "1rem",
          }}
        >
          Live Cabinet Slot
        </div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(2rem, 5vw, 3rem)",
            lineHeight: 1.1,
            color: "var(--color-text)",
            marginBottom: "1rem",
          }}
        >
          One cabinet, every game playable
        </h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(220px, 320px) minmax(0, 1fr)",
          gap: "1rem",
          alignItems: "stretch",
        }}
        className="cabinet-showcase"
      >
        <nav
          aria-label="Playable cabinet slots"
          style={{
            display: "grid",
            alignContent: "start",
            gap: "0.5rem",
            padding: "0.75rem",
            border: "1px solid rgba(148, 163, 184, 0.24)",
            background: "rgba(2, 6, 23, 0.76)",
          }}
        >
          {games.map((game) => {
            const isActive = game.slug === activeSlug;

            return (
              <button
                key={game.slug}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveSlug(game.slug)}
                style={{
                  width: "100%",
                  minHeight: 48,
                  border: `1px solid ${isActive ? game.color : "rgba(148, 163, 184, 0.22)"}`,
                  background: isActive ? `${game.color}24` : "rgba(15, 23, 42, 0.72)",
                  color: isActive ? "#f8fafc" : "#cbd5e1",
                  cursor: "pointer",
                  padding: "0.75rem",
                  textAlign: "left",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.76rem",
                  textTransform: "uppercase",
                }}
              >
                {game.title}
              </button>
            );
          })}
        </nav>

        <article
          style={{
            minWidth: 0,
            border: "1px solid rgba(148, 163, 184, 0.24)",
            background: "rgba(15, 23, 42, 0.72)",
          }}
        >
          <div
            style={{
              padding: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
            }}
          >
            <div>
              <h3 style={{ margin: 0, color: "#f8fafc", fontSize: "1.35rem" }}>
                {activeGame.title}
              </h3>
              <p style={{ margin: "0.25rem 0 0", color: "#cbd5e1" }}>{activeGame.description}</p>
            </div>
            <a
              href={withBasePath(`/games/${activeGame.slug}`)}
              style={{
                flexShrink: 0,
                border: `1px solid ${activeGame.color}`,
                color: "#f8fafc",
                padding: "0.65rem 0.9rem",
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                textTransform: "uppercase",
              }}
            >
              Fullscreen
            </a>
          </div>
          <div
            style={{
              padding: "0.85rem 1rem",
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
              gap: "0.75rem 1rem",
              borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
              color: "#cbd5e1",
              fontSize: "0.82rem",
              lineHeight: 1.45,
            }}
            className="cabinet-direction"
          >
            <div>
              <div
                style={{
                  color: activeGame.color,
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.68rem",
                  textTransform: "uppercase",
                  marginBottom: "0.45rem",
                }}
              >
                Pillars
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                {activeGame.pillars.map((pillar) => (
                  <span
                    key={pillar}
                    style={{
                      border: "1px solid rgba(148, 163, 184, 0.24)",
                      background: "rgba(2, 6, 23, 0.38)",
                      padding: "0.35rem 0.5rem",
                      color: "#e2e8f0",
                    }}
                  >
                    {pillar}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div
                style={{
                  color: activeGame.color,
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.68rem",
                  textTransform: "uppercase",
                  marginBottom: "0.45rem",
                }}
              >
                Responsive Intent
              </div>
              <p style={{ margin: 0 }}>{activeGame.responsiveDirection}</p>
            </div>
            <p style={{ margin: 0 }}>{activeGame.presentation}</p>
            <p style={{ margin: 0 }}>{activeGame.sceneDirection}</p>
          </div>
          <div style={{ height: 720, minHeight: 420 }}>
            <GameIsland key={activeGame.slug} slug={activeGame.slug} />
          </div>
        </article>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .cabinet-showcase {
            grid-template-columns: 1fr !important;
          }
          .cabinet-direction {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
