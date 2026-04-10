import { useState } from 'react';

function HeroBg() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(99,215,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99,215,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />

      {/* Glow orb left */}
      <div style={{
        position: 'absolute',
        left: '-10%', top: '10%',
        width: 600, height: 600,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,215,255,0.07) 0%, transparent 65%)',
      }} />

      {/* Glow orb right */}
      <div style={{
        position: 'absolute',
        right: '-5%', top: '30%',
        width: 500, height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(155,109,255,0.07) 0%, transparent 65%)',
      }} />

      {/* Horizontal scanline */}
      <div style={{
        position: 'absolute',
        top: 0, left: '-50%',
        width: '200%', height: 1,
        background: 'linear-gradient(90deg, transparent, var(--cyan-dim), transparent)',
        animation: 'scanH 6s linear infinite',
      }} />

      {/* Floating mini waveforms in the back */}
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          display: 'flex', alignItems: 'center', gap: 2,
          opacity: 0.04 + i * 0.01,
          left: `${10 + i * 18}%`,
          top: `${20 + i * 10}%`,
          animation: `float ${4 + i}s ease-in-out ${i * 0.6}s infinite`,
        }}>
          {[...Array(20)].map((_, j) => (
            <div key={j} style={{
              width: 3,
              height: `${20 + Math.sin(j + i) * 30}px`,
              background: 'var(--cyan)',
              borderRadius: 2,
            }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function Hero({ search, onSearch, onUploadClick }) {
  const [focused, setFocused] = useState(false);

  return (
    <section className="r-hero" style={{ position: 'relative', padding: '7rem 0 5rem', overflow: 'hidden' }}>
      <HeroBg />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        {/* Eyebrow badge */}

        {/* Headline */}
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(3rem, 7vw, 6.5rem)',
          fontWeight: 900,
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
          marginBottom: '1.5rem',
        }}>
          <span style={{ display: 'block' }}>Premium Audio.</span>
          <span style={{
            background: 'linear-gradient(90deg, var(--cyan-dark) 0%, var(--cyan) 35%, var(--violet) 70%, var(--cyan) 100%)',
            backgroundSize: '300% 100%',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'shimmer 5s linear infinite',
            display: 'block',
          }}>Zero Compromise.</span>
        </h1>

        {/* Search */}
        <div style={{ position: 'relative', maxWidth: 580, margin: '0 auto 3rem' }}>
          {/* Glow border when focused */}
          {focused && (
            <div style={{
              position: 'absolute', inset: -2, borderRadius: 12,
              background: 'linear-gradient(90deg, var(--cyan-dark), var(--violet), var(--cyan))',
              backgroundSize: '300% 100%',
              animation: 'shimmer 3s linear infinite',
              zIndex: 0,
            }} />
          )}
          <div style={{
            position: 'relative', zIndex: 1,
            background: focused ? 'var(--bg2)' : 'var(--bg3)',
            borderRadius: 10,
            border: `1px solid ${focused ? 'transparent' : 'var(--line2)'}`,
            display: 'flex', alignItems: 'center',
            transition: 'all 0.2s',
          }}>
            <svg style={{ marginLeft: 16, flexShrink: 0, opacity: 0.35 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search sounds, creators, tags..."
              value={search}
              onChange={e => onSearch(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={{
                flex: 1,
                padding: '1rem 1rem 1rem 0.75rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--text)',
                fontSize: '0.92rem',
                fontFamily: 'var(--font-body)',
                outline: 'none',
              }}
            />
            {search && (
              <button onClick={() => onSearch('')} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text3)', padding: '0 14px', fontSize: '1rem',
              }}>✕</button>
            )}
            <button className="btn-primary" style={{
              margin: 6, borderRadius: 'var(--radius-pill)', padding: '0.6rem 1.4rem', fontSize: '0.78rem',
            }}>
              Search
            </button>
          </div>
        </div>

        {/* CTA row */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={onUploadClick} style={{ padding: '0.9rem 2.2rem', fontSize: '0.88rem' }}>
            🚀 Upload Your Sound
          </button>
          <button className="btn-ghost" style={{ padding: '0.9rem 2.2rem', fontSize: '0.88rem' }}>
            Browse All →
          </button>
        </div>

      </div>
    </section>
  );
}
