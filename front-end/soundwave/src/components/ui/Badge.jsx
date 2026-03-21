/**
 * Badge — маленькая метка/тег
 *
 * Props:
 *   variant: 'default' | 'cyan' | 'green' | 'orange' | 'red' | 'violet'
 *   children
 */
export default function Badge({ variant = 'default', children, style }) {
  const variants = {
    default: { bg: 'var(--bg4)',      color: 'var(--text3)',  border: 'var(--line)' },
    cyan:    { bg: 'var(--cyan-dim)', color: 'var(--cyan)',   border: 'var(--line-hot)' },
    green:   { bg: 'var(--green-dim)',color: 'var(--green)',  border: 'rgba(34,211,122,0.3)' },
    orange:  { bg: 'rgba(255,165,0,0.1)', color: 'rgba(255,200,80,0.9)', border: 'rgba(255,165,0,0.3)' },
    red:     { bg: 'var(--red-dim)',  color: 'var(--red)',    border: 'rgba(255,68,102,0.3)' },
    violet:  { bg: 'var(--violet-dim)', color: 'var(--violet)', border: 'rgba(155,109,255,0.3)' },
  };

  const v = variants[variant] || variants.default;

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 9px',
      background: v.bg,
      border: `1px solid ${v.border}`,
      borderRadius: 'var(--radius-pill)',
      color: v.color,
      fontSize: '0.62rem',
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      fontFamily: 'var(--font-mono)',
      ...style,
    }}>
      {children}
    </span>
  );
}
