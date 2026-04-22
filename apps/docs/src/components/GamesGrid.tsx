import { type Game, games } from "../games/catalog";
import { withBasePath } from "../utils/basePath";

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
        {games.map((game) => (
          <GameCard key={game.slug} game={game} />
        ))}
      </div>
    </section>
  );
}

function GameCard({ game }: { game: Game }) {
  return (
    <a
      href={withBasePath(`/games/${game.slug}`)}
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
            <pattern id={`grid-${game.slug}`} width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#grid-${game.slug})`} />
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
