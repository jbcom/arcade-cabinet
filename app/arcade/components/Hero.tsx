export default function Hero() {
  return (
    <section className="relative grid min-h-[48svh] place-items-center overflow-hidden bg-[#09090d] px-5 py-14 text-white sm:min-h-[54svh]">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(34,211,238,0.14), transparent 45%), repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 64px), repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 14px)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[34%]"
        style={{
          background:
            "linear-gradient(180deg, transparent, rgba(0,0,0,0.72)), repeating-linear-gradient(90deg, rgba(34,211,238,0.18) 0 4px, transparent 4px 10vw)",
          clipPath: "polygon(0 34%, 100% 12%, 100% 100%, 0 100%)",
        }}
      />

      <div className="relative z-10 grid w-full max-w-5xl gap-6 text-center">
        <div className="mx-auto w-fit rounded-md border border-white/14 bg-black/44 px-4 py-2 font-mono text-[0.68rem] font-black uppercase tracking-[0.26em] text-cyan-100/72">
          Twelve launch cartridges / local-only couch play
        </div>
        <div>
          <h1 className="font-display text-6xl font-black uppercase leading-none tracking-normal sm:text-8xl">
            ARCADE
          </h1>
          <h1 className="font-display text-6xl font-black uppercase leading-none tracking-normal text-cyan-100 sm:text-8xl">
            CABINET
          </h1>
        </div>
        <p className="mx-auto max-w-2xl text-base font-semibold leading-relaxed text-slate-300 sm:text-lg">
          A single cabinet shell for 8-15 minute cartridges: pick a label, choose your session mode,
          resume local progress, and play full screen on desktop, mobile web, or Android.
        </p>
        <a
          className="mx-auto w-fit rounded-md border border-cyan-300/42 bg-cyan-300/12 px-5 py-3 font-mono text-[0.72rem] font-black uppercase tracking-[0.2em] text-cyan-100 transition hover:bg-cyan-300/18 focus:outline-none focus:ring-2 focus:ring-cyan-300"
          href="#games"
        >
          Choose A Cartridge
        </a>
      </div>
    </section>
  );
}
