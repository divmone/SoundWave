import { useState } from 'react';

export default function Header({ onUploadClick }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = ['Browse', 'Creators', 'Pricing', 'Blog'];

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 200,
      background: 'rgba(13,13,18,0.85)',
      backdropFilter: 'blur(24px)',
      borderBottom: '1px solid var(--line)',
    }}>
      {/* Top accent stripe */}
      <div style={{
        height: 1,
        background: 'linear-gradient(90deg, transparent, var(--cyan-dark), var(--violet), var(--cyan), transparent)',
        backgroundSize: '300% 100%',
        animation: 'shimmer 4s linear infinite',
      }} />

      <div style={{
        maxWidth: 1360, margin: '0 auto',
        padding: '0 2rem',
        height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          fontSize: '1.05rem',
          letterSpacing: '0.18em',
          display: 'flex', alignItems: 'center', gap: 10,
          cursor: 'pointer',
        }}>
          <div style={{
            width: 32, height: 32,
            borderRadius: 12,
            background: 'linear-gradient(135deg, var(--cyan-dark), var(--violet))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8rem',
            boxShadow: '0 0 20px var(--cyan-dim)',
          }}>
            🎵
          </div>
          <span style={{
            background: 'linear-gradient(90deg, var(--text), var(--cyan))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>SOUNDWAVE</span>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {navLinks.map(l => (
            <a key={l} href="#" style={{
              color: 'var(--text3)', textDecoration: 'none',
              fontSize: '0.85rem', fontWeight: 700,
              padding: '0.45rem 0.9rem',
              borderRadius: 'var(--radius-pill)',
              transition: 'all 0.18s',
              fontFamily: 'var(--font-display)',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--bg3)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.background = 'transparent'; }}
            >{l}</a>
          ))}
        </nav>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Live indicator */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 12px',
            background: 'rgba(99,215,255,0.06)',
            border: '1px solid var(--line-hot)',
            borderRadius: 20,
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: '50%',
              background: 'var(--cyan)',
              animation: 'pulse 2s ease infinite',
              boxShadow: '0 0 6px var(--cyan)',
            }} />
            <span style={{
              fontSize: '0.62rem', fontFamily: 'var(--font-mono)',
              letterSpacing: '0.15em', color: 'var(--cyan)',
              fontWeight: 600,
            }}>LIVE</span>
          </div>

          <button className="btn-ghost" style={{ padding: '0.48rem 1.2rem', fontSize: '0.78rem' }}>
            Sign In
          </button>
          <button className="btn-primary" onClick={onUploadClick} style={{ padding: '0.48rem 1.3rem', fontSize: '0.78rem' }}>
            + Upload
          </button>
        </div>
      </div>
    </header>
  );
}
