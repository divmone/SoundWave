const CATEGORIES = [
  { id: 'all',         label: 'All Sounds',   emoji: '✨' },
  { id: 'alerts',      label: 'Alerts',       emoji: '🔔' },
  { id: 'transitions', label: 'Transitions',  emoji: '🌊' },
  { id: 'jingles',     label: 'Jingles',      emoji: '🎵' },
  { id: 'ui',          label: 'UI Sounds',    emoji: '⬡' },
  { id: 'stingers',    label: 'Stingers',     emoji: '⚡' },
];

export default function FilterTabs({ active, onChange, count }) {
  return (
    <div className="r-filters" style={{
      display: 'flex', alignItems: 'center',
      gap: '0.5rem', marginBottom: '2.5rem',
      flexWrap: 'wrap',
    }}>
      {CATEGORIES.map(cat => {
        const isActive = cat.id === active;
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '0.5rem 1.1rem',
              background: isActive
                ? 'linear-gradient(135deg, var(--cyan-dark), var(--cyan))'
                : 'rgba(255,255,255,0.04)',
              border: `1.5px solid ${isActive ? 'transparent' : 'var(--line)'}`,
              borderRadius: 'var(--radius-pill)',
              color: isActive ? '#000' : 'var(--text3)',
              fontFamily: 'var(--font-display)',
              fontWeight: isActive ? 800 : 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.18s cubic-bezier(.34,1.56,.64,1)',
              boxShadow: isActive ? '0 4px 20px rgba(99,215,255,0.3)' : 'none',
              transform: 'scale(1)',
            }}
            onMouseEnter={e => {
              if (!isActive) {
                e.currentTarget.style.borderColor = 'var(--line2)';
                e.currentTarget.style.color = 'var(--text2)';
                e.currentTarget.style.transform = 'scale(1.04)';
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                e.currentTarget.style.borderColor = 'var(--line)';
                e.currentTarget.style.color = 'var(--text3)';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
            onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.93)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = isActive ? 'scale(1)' : 'scale(1.04)'; }}
          >
            <span style={{ fontSize: '0.75rem' }}>{cat.emoji}</span>
            {cat.label}
          </button>
        );
      })}

      <span style={{
        marginLeft: 'auto',
        fontFamily: 'var(--font-display)', fontSize: '0.72rem',
        color: 'var(--text3)', fontWeight: 700,
        padding: '0.4rem 0.9rem',
        background: 'var(--bg2)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-pill)',
      }}>
        {count} results
      </span>
    </div>
  );
}
