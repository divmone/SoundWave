/* Animated auth background with floating elements */
export default function AuthLayout({ children }) {
  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--void)',
      display: 'flex',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient glow blobs */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,215,255,0.07) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-15%', right: '-5%',
        width: 700, height: 700, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(155,109,255,0.07) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '40%', right: '30%',
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,215,255,0.04) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(99,215,255,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99,215,255,0.025) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
        pointerEvents: 'none',
      }} />

      {/* Floating waveform decoration left */}
      <div style={{
        position: 'absolute', left: '3%', top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex', alignItems: 'center', gap: 3,
        opacity: 0.06, pointerEvents: 'none',
        animation: 'float 5s ease-in-out infinite',
      }}>
        {[35,55,75,45,85,60,40,70,80,50,65,45,75,55,40,65,80,50,70,45].map((h, i) => (
          <div key={i} style={{
            width: 4, height: `${h * 0.7}px`,
            background: 'var(--cyan)', borderRadius: 3,
          }} />
        ))}
      </div>

      {/* Floating waveform decoration right */}
      <div style={{
        position: 'absolute', right: '3%', top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex', alignItems: 'center', gap: 3,
        opacity: 0.06, pointerEvents: 'none',
        animation: 'float 6s ease-in-out 1s infinite',
      }}>
        {[40,65,50,80,55,45,70,60,85,50,40,75,55,65,45,80,50,70,60,45].map((h, i) => (
          <div key={i} style={{
            width: 4, height: `${h * 0.7}px`,
            background: 'var(--violet)', borderRadius: 3,
          }} />
        ))}
      </div>

      {/* Scanline */}
      <div style={{
        position: 'absolute', top: 0, left: '-50%',
        width: '200%', height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(99,215,255,0.08), transparent)',
        animation: 'scanH 8s linear infinite',
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        position: 'relative',
        zIndex: 1,
      }}>
        {children}
      </div>
    </div>
  );
}
