export default function ErrorBanner({ message, style }) {
  if (!message) return null;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '0.8rem 1rem',
      background: 'var(--red-dim)',
      border: '1px solid rgba(255,68,102,0.35)',
      borderRadius: 'var(--radius-sm)',
      animation: 'slideUp 0.2s ease both',
      ...style,
    }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="var(--red)" strokeWidth="2.5" style={{ flexShrink: 0 }}>
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span style={{ fontSize: '0.83rem', color: 'var(--red)', fontWeight: 700 }}>
        {message}
      </span>
    </div>
  );
}
