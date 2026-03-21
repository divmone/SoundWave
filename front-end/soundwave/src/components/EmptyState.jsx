export default function EmptyState({ search, onReset }) {
  return (
    <div style={{
      textAlign: 'center', padding: '6rem 2rem',
      border: '1px solid var(--line)', borderRadius: 14,
      background: 'var(--bg2)', marginBottom: '2rem',
    }}>
      <div style={{ fontSize: '3rem', marginBottom: 16, opacity: 0.5 }}>🎧</div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>
        No sounds found
      </div>
      <div style={{ color: 'var(--text2)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
        {search ? `No results for "${search}"` : 'Try a different category'}
      </div>
      <button className="btn-ghost" onClick={onReset} style={{ fontSize: '0.82rem', padding: '0.65rem 1.8rem' }}>
        Clear filters
      </button>
    </div>
  );
}
