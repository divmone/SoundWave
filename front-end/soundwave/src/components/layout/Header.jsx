import { useState } from 'react';

export default function Header({ onUploadClick, onNavigate, user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navLinks = ['Browse', 'Creators', 'Pricing', 'Blog'];

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 200,
      background: 'rgba(13,13,18,0.85)',
      backdropFilter: 'blur(24px)',
      borderBottom: '1px solid var(--line)',
    }}>
      <div style={{
        height: 1,
        background: 'linear-gradient(90deg, transparent, var(--cyan-dark), var(--violet), var(--cyan), transparent)',
        backgroundSize: '300% 100%',
        animation: 'shimmer 4s linear infinite',
      }} />

      <div style={{
        maxWidth: 1360, margin: '0 auto',
        padding: '0 1.25rem', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <div
          onClick={() => { onNavigate?.('home'); setMenuOpen(false); }}
          style={{
            fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.05rem',
            letterSpacing: '0.18em', display: 'flex', alignItems: 'center', gap: 10,
            cursor: 'pointer',
          }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: 12,
            background: 'linear-gradient(135deg, var(--cyan-dark), var(--violet))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.9rem', boxShadow: '0 0 20px var(--cyan-dim)',
          }}>🎵</div>
          <span style={{
            background: 'linear-gradient(90deg, var(--text), var(--cyan))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>SOUNDWAVE</span>
        </div>

        {/* Nav — hidden on mobile */}
        <nav className="header-nav" style={{ alignItems: 'center', gap: '0.25rem' }}>
          {navLinks.map(l => (
            <a key={l} href="#" style={{
              color: 'var(--text3)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700,
              padding: '0.45rem 0.9rem', borderRadius: 'var(--radius-pill)', transition: 'all 0.18s',
              fontFamily: 'var(--font-display)',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--bg3)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.background = 'transparent'; }}
            >{l}</a>
          ))}
        </nav>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Desktop auth — hidden on mobile */}
          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '5px 12px 5px 6px',
                  background: 'var(--bg3)', border: '1px solid var(--line2)', borderRadius: 'var(--radius-pill)',
                }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--cyan-dark), var(--violet))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', fontWeight: 900, color: '#fff',
                    fontFamily: 'var(--font-display)',
                  }}>
                    {user.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
                    {user.username}
                  </span>
                </div>
                <button className="btn-ghost" onClick={onLogout} style={{ padding: '0.42rem 1rem', fontSize: '0.75rem' }}>
                  Sign Out
                </button>
              </div>
            ) : (
              <button className="btn-ghost" onClick={() => onNavigate?.('login')} style={{ padding: '0.48rem 1.2rem', fontSize: '0.78rem' }}>
                Sign In
              </button>
            )}
          </div>

          <button className="btn-primary hide-mobile" onClick={onUploadClick} style={{ padding: '0.48rem 1.1rem', fontSize: '0.78rem', background: 'linear-gradient(135deg, #6d28d9, var(--violet))' }}>
            + Upload
          </button>

          {/* Hamburger — visible on mobile only */}
          <button
            className="show-mobile"
            onClick={() => setMenuOpen(o => !o)}
            style={{
              background: 'none', border: '1px solid var(--line2)', borderRadius: 8,
              cursor: 'pointer', padding: '6px 8px',
              display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'center', justifyContent: 'center',
            }}
          >
            <span style={{ display: 'block', width: 18, height: 2, background: menuOpen ? 'var(--cyan)' : 'var(--text2)', borderRadius: 2, transition: 'all 0.2s', transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
            <span style={{ display: 'block', width: 18, height: 2, background: menuOpen ? 'transparent' : 'var(--text2)', borderRadius: 2, transition: 'all 0.2s' }} />
            <span style={{ display: 'block', width: 18, height: 2, background: menuOpen ? 'var(--cyan)' : 'var(--text2)', borderRadius: 2, transition: 'all 0.2s', transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        {navLinks.map(l => (
          <a key={l} href="#" onClick={() => setMenuOpen(false)} style={{
            color: 'var(--text2)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 700,
            padding: '0.7rem 0.5rem', borderRadius: 8, transition: 'all 0.18s',
            fontFamily: 'var(--font-display)', borderBottom: '1px solid var(--line)',
          }}>{l}</a>
        ))}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          {user ? (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '5px 12px 5px 6px', flex: 1,
                background: 'var(--bg3)', border: '1px solid var(--line2)', borderRadius: 'var(--radius-pill)',
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--cyan-dark), var(--violet))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 900, color: '#fff',
                }}>
                  {user.username?.[0]?.toUpperCase() || '?'}
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
                  {user.username}
                </span>
              </div>
              <button className="btn-ghost" onClick={() => { onLogout(); setMenuOpen(false); }} style={{ padding: '0.42rem 1rem', fontSize: '0.75rem' }}>
                Sign Out
              </button>
            </>
          ) : (
            <button className="btn-ghost" onClick={() => { onNavigate?.('login'); setMenuOpen(false); }} style={{ flex: 1, fontSize: '0.85rem' }}>
              Sign In
            </button>
          )}
          <button className="btn-primary" onClick={() => { onUploadClick(); setMenuOpen(false); }} style={{ flex: 1, fontSize: '0.85rem', background: 'linear-gradient(135deg, #6d28d9, var(--violet))' }}>
            + Upload
          </button>
        </div>
      </div>
    </header>
  );
}
