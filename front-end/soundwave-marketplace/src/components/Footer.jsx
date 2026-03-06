export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--line)', padding: '2.5rem 0' }}>
      <div style={{
        maxWidth: 1360, margin: '0 auto', padding: '0 2rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '1.5rem',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 22, height: 22, borderRadius: 5,
            background: 'linear-gradient(135deg, var(--cyan-dark), var(--violet))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.55rem',
          }}>◈</div>
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
              letterSpacing: '0.25em', color: 'var(--text3)', fontWeight: 600,
            }}>SOUNDWAVE © 2026</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text3)', marginTop: 2 }}>
              Premium audio marketplace
            </div>
          </div>
        </div>

        {/* Links */}
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {['About', 'FAQ', 'Terms', 'Privacy', 'Contact'].map(l => (
            <a key={l} href="#" style={{
              color: 'var(--text3)', textDecoration: 'none',
              fontSize: '0.75rem', fontWeight: 500,
              letterSpacing: '0.05em',
              transition: 'color 0.18s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
            >{l}</a>
          ))}
        </div>

        {/* Status */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 12px',
          background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: 20,
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: '50%',
            background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.6)',
            animation: 'pulse 3s ease infinite',
          }} />
          <span style={{
            fontSize: '0.6rem', fontFamily: 'var(--font-mono)',
            color: 'var(--text3)', letterSpacing: '0.1em',
          }}>All systems operational</span>
        </div>
      </div>
    </footer>
  );
}
