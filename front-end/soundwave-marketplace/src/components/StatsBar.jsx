const STAT_ICONS = {
  sounds:    { svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>, label: 'Sound Effects' },
  creators:  { svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, label: 'Creators' },
  streamers: { svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>, label: 'Happy Streamers' },
  paid:      { svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, label: 'Paid to Artists' },
};

export default function StatsBar({ stats }) {
  if (!stats) return null;
  const entries = Object.entries(stats);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${entries.length}, 1fr)`,
      border: '1px solid var(--line)',
      borderRadius: 14, overflow: 'hidden',
      margin: '4rem 0',
      background: 'var(--bg2)',
    }}>
      {entries.map(([key, val], i) => {
        const meta = STAT_ICONS[key] || { svg: null, label: key };
        return (
          <div key={key}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            style={{
              padding: '2.2rem 1.5rem',
              textAlign: 'center',
              borderRight: i < entries.length - 1 ? '1px solid var(--line)' : 'none',
              transition: 'background 0.2s',
              cursor: 'default',
            }}
          >
            <div style={{ color: 'var(--cyan)', marginBottom: 12, opacity: 0.6 }}>
              {meta.svg}
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '2.1rem',
              fontWeight: 700, letterSpacing: '-0.04em', marginBottom: 6,
              background: 'linear-gradient(135deg, var(--text), var(--cyan))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>{val}</div>
            <div style={{
              fontSize: '0.66rem', letterSpacing: '0.15em', color: 'var(--text3)',
              fontWeight: 600, textTransform: 'uppercase', fontFamily: 'var(--font-mono)',
            }}>{meta.label}</div>
          </div>
        );
      })}
    </div>
  );
}
