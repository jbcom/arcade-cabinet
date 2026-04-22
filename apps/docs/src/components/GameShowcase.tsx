import Gridizen from '@arcade-cabinet/gridizen';
import OtterlyChaotic from '@arcade-cabinet/otterly-chaotic';
import SimSoviet from '@arcade-cabinet/sim-soviet';

const gameCards = [
  {
    id: 'sim-soviet',
    title: 'SIM SOVIET 3000',
    description: '3D command-table city building with quotas, utilities, and giant concrete ambition.',
    Component: SimSoviet,
  },
  {
    id: 'otterly-chaotic',
    title: 'OTTERLY CHAOTIC',
    description: '3D animal-action sprint with spherical characters, goats, and a rolling Kudzu ball.',
    Component: OtterlyChaotic,
  },
  {
    id: 'gridizen',
    title: 'GRIDIZEN',
    description: 'Existing R3F/Koota city sim, still serving as the baseline 3D pattern.',
    Component: Gridizen,
  },
];

export default function GameShowcase() {
  return (
    <section style={{ maxWidth: 1400, margin: '0 auto', padding: '0 2rem 6rem' }}>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--color-violet)', marginBottom: '1rem' }}>— Live Islands —</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.1, color: 'var(--color-text)', marginBottom: '1rem' }}>Playable games directly on the landing page</h2>
      </div>
      <div style={{ display: 'grid', gap: '2rem' }}>
        {gameCards.map(({ id, title, description, Component }) => (
          <article key={id} style={{ background: 'rgba(15, 23, 42, 0.72)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: 24, padding: '1rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.5rem' }}>{title}</h3>
              <p style={{ color: '#cbd5e1' }}>{description}</p>
              <a href={`/games/${id}`} style={{ color: '#7dd3fc', textDecoration: 'none' }}>Open isolation page →</a>
            </div>
            <div style={{ height: 720 }}>
              <Component />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
