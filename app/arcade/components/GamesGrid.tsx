import { type Game, games } from "../games/catalog";
import { withBasePath } from "../utils/basePath";

export default function GamesGrid() {
  return (
    <section id="library" className="mx-auto max-w-7xl px-8 py-24">
      <div className="mb-16 text-center">
        <div className="mb-4 font-mono text-[0.7rem] uppercase tracking-[0.4em] text-violet-400">
          Cabinet Library
        </div>
        <h2 className="mb-4 font-display text-4xl font-extrabold tracking-normal text-white md:text-6xl">
          All Playable Slots
        </h2>
        <p className="mx-auto max-w-lg font-body text-lg text-slate-400">
          A quick launcher for the whole cabinet after the marquee has done its job.
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
      className="group relative overflow-hidden rounded-md border border-slate-800 bg-slate-900/50 transition-all duration-300 hover:scale-[1.02] hover:border-slate-600 hover:shadow-2xl"
    >
      <div
        className="relative flex h-48 items-center justify-center overflow-hidden"
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
        <div
          aria-hidden="true"
          className="absolute inset-x-8 top-8 h-1 rounded-full bg-white/80 shadow-[0_0_24px_rgba(255,255,255,0.55)]"
        />
        <span className="z-10 px-4 text-center font-display text-2xl font-black uppercase tracking-normal text-white drop-shadow-lg">
          {game.title}
        </span>
      </div>

      <div className="p-6">
        <p className="mb-6 text-sm leading-relaxed text-slate-400">{game.description}</p>

        <div className="font-mono text-[0.68rem] font-black uppercase tracking-[0.22em] text-cyan-200">
          Play Slot
        </div>
      </div>
    </a>
  );
}
