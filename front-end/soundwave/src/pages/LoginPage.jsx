import AuthLayout   from '../components/auth/AuthLayout';
import OAuthButtons from '../components/auth/OAuthButtons';

export default function LoginPage({ onNavigate, initialError = '' }) {
  return (
    <AuthLayout>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2.5rem', animation: 'slideUp 0.4s ease both' }}>
        <div style={{
          width: 38, height: 38, borderRadius: 12,
          background: 'linear-gradient(135deg, var(--cyan-dark), var(--violet))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.1rem', boxShadow: '0 0 24px var(--cyan-dim)',
        }}>🎵</div>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 900,
          fontSize: '1.1rem', letterSpacing: '0.18em',
          background: 'linear-gradient(90deg, var(--text), var(--cyan))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>SOUNDWAVE</span>
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 400,
        background: 'var(--bg2)', border: '1px solid var(--line2)',
        borderRadius: 'var(--radius-lg)', overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
        animation: 'modalIn 0.4s cubic-bezier(.34,1.2,.64,1) both',
      }}>
        <div style={{
          height: 3,
          background: 'linear-gradient(90deg, var(--cyan-dark), var(--violet), var(--cyan), var(--violet), var(--cyan-dark))',
          backgroundSize: '300%', animation: 'shimmer 3s linear infinite',
        }} />

        <div style={{ padding: '2.4rem 2.4rem 2.2rem' }}>
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.75rem', marginBottom: 8 }}>
              Sign in
            </h1>
            <p style={{ color: 'var(--text2)', fontSize: '0.87rem' }}>
              Choose how you'd like to continue
            </p>
          </div>

          {initialError && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '0.8rem 1rem', marginBottom: '1.5rem',
              background: 'var(--red-dim)', border: '1px solid rgba(255,68,102,0.35)',
              borderRadius: 'var(--radius-sm)', animation: 'slideUp 0.2s ease both',
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span style={{ fontSize: '0.83rem', color: 'var(--red)', fontWeight: 700 }}>{initialError}</span>
            </div>
          )}

          <OAuthButtons />
        </div>
      </div>

      <button onClick={() => onNavigate?.('home')} style={{
        marginTop: '1.5rem', background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--text3)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8rem',
        display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.18s',
      }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
      >
        ← Back to marketplace
      </button>
    </AuthLayout>
  );
}
