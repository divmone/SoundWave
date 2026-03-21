export default function CTASection({ onUploadClick }) {
  return (
    <div style={{
      position: 'relative',
      border: '1px solid var(--line)',
      borderRadius: 16,
      padding: '3.5rem 3rem',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      flexWrap: 'wrap', gap: '2rem',
      background: 'var(--bg2)',
      overflow: 'hidden',
      marginBottom: '4rem',
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute', right: -100, top: -100,
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,215,255,0.05) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', left: -50, bottom: -80,
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(155,109,255,0.05) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Mini waveform decoration */}
      <div style={{
        position: 'absolute', right: '38%', top: '50%', transform: 'translateY(-50%)',
        display: 'flex', alignItems: 'center', gap: 3, opacity: 0.06,
        pointerEvents: 'none',
      }}>
        {[40,60,80,50,90,70,55,75,85,60].map((h, i) => (
          <div key={i} style={{
            width: 3, height: `${h * 0.5}px`,
            background: 'var(--cyan)', borderRadius: 2,
          }} />
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          fontSize: '0.6rem', letterSpacing: '0.2em', color: 'var(--cyan)',
          fontWeight: 600, marginBottom: 12,
          fontFamily: 'var(--font-mono)',
        }}>◈ FOR CREATORS</div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
          fontWeight: 800, letterSpacing: '-0.03em',
          lineHeight: 1.1, marginBottom: 12,
        }}>
          Sell your sounds.<br />
          <span style={{ color: 'var(--text2)', fontWeight: 400 }}>Keep 80% revenue.</span>
        </div>
        <div style={{ color: 'var(--text2)', fontSize: '0.9rem', lineHeight: 1.7 }}>
          Join 3,500+ sound designers already earning on SoundWave.<br />
          No exclusivity. No BS. Just fair payouts.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
        <button className="btn-primary" onClick={onUploadClick}
          style={{ padding: '1rem 2.5rem', fontSize: '0.88rem', whiteSpace: 'nowrap' }}>
          🚀 Start Selling
        </button>
        <a href="#" style={{
          fontSize: '0.75rem', color: 'var(--text3)',
          textDecoration: 'none', fontFamily: 'var(--font-display)',
          fontWeight: 700,
          transition: 'color 0.18s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--cyan)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
        >
          Learn about creator program ↗
        </a>
      </div>
    </div>
  );
}
