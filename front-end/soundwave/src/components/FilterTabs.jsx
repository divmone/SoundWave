export default function FilterTabs({ count }) {
  return (
    <div className="r-filters" style={{
      display: 'flex', alignItems: 'center',
      gap: '0.5rem', marginBottom: '2.5rem',
      flexWrap: 'wrap',
    }}>
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
