export default function AuthDivider({ label = 'or' }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '1rem',
      margin: '1.4rem 0',
    }}>
      <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
      <span style={{
        fontSize: '0.72rem',
        color: 'var(--text3)',
        fontWeight: 700,
        fontFamily: 'var(--font-display)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
    </div>
  );
}
