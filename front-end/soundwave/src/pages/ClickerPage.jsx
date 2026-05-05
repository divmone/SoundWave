import { useState, useRef, useEffect } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import GenerateModal from '../components/product/GenerateModal';
import { useClicks } from '../hooks/useClicks';

export const GENERATE_COST = 100;

const TAP_IMAGE = '/clicker.jpg';
const TAP_SOUND = '/sound.mp3';

export default function ClickerPage({ user, onNavigate, onLogout, onGenerated }) {
  const { count, add, spend } = useClicks();
  const [particles, setParticles] = useState([]);
  const [pressed, setPressed] = useState(false);
  const [generateModal, setGenerateModal] = useState(false);
  const [error, setError] = useState('');
  const idRef = useRef(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const a = new Audio(TAP_SOUND);
    a.preload = 'auto';
    a.volume = 0.5;
    audioRef.current = a;
    return () => { audioRef.current = null; };
  }, []);

  const handleTap = (e) => {
    add(1);
    setPressed(true);
    setTimeout(() => setPressed(false), 110);

    if (audioRef.current) {
      const a = audioRef.current.cloneNode();
      a.volume = audioRef.current.volume;
      a.play().catch(() => {});
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX ?? rect.left + rect.width / 2) - rect.left;
    const y = (e.clientY ?? rect.top + rect.height / 2) - rect.top;
    const id = ++idRef.current;
    const dx = (Math.random() - 0.5) * 60;
    setParticles(ps => [...ps, { id, x, y, dx }]);
    setTimeout(() => setParticles(ps => ps.filter(p => p.id !== id)), 900);
  };

  const handleGenerate = () => {
    setError('');
    if (!user) {
      onNavigate('login');
      return;
    }
    if (count < GENERATE_COST) {
      setError(`Need ${GENERATE_COST} taps. You have ${count}.`);
      return;
    }
    setGenerateModal(true);
  };

  const progress = Math.min(100, (count / GENERATE_COST) * 100);
  const canGenerate = count >= GENERATE_COST;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      {generateModal && (
        <GenerateModal
          onClose={() => setGenerateModal(false)}
          onSuccess={() => { spend(GENERATE_COST); onGenerated?.(); }}
        />
      )}

      <Header
        onUploadClick={() => onNavigate('home')}
        onNavigate={onNavigate}
        user={user}
        onLogout={onLogout}
      />

      <main style={{
        flex: 1, maxWidth: 720, width: '100%',
        margin: '0 auto', padding: '2rem 1.5rem',
        boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem',
      }}>
        <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
            color: 'var(--violet)', letterSpacing: '0.2em', fontWeight: 800,
          }}>
            ✨ TAP TO EARN
          </div>
          <h1 style={{
            margin: '0.5rem 0 0', fontFamily: 'var(--font-display)',
            fontWeight: 900, fontSize: '1.8rem',
            background: 'linear-gradient(90deg, var(--text), var(--cyan), var(--violet))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Earn taps. Spend on AI sounds.
          </h1>
        </div>

        {/* Balance */}
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 8,
          padding: '14px 28px', background: 'var(--bg2)',
          border: '1px solid var(--line2)', borderRadius: 'var(--radius-pill)',
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 900,
            color: 'var(--cyan)', lineHeight: 1, letterSpacing: '-0.02em',
          }}>
            {count.toLocaleString()}
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
            color: 'var(--text3)', letterSpacing: '0.2em', fontWeight: 700,
          }}>TAPS</span>
        </div>

        {/* Tap target */}
        <div style={{ position: 'relative', userSelect: 'none' }}>
          {particles.map(p => (
            <span
              key={p.id}
              style={{
                position: 'absolute',
                left: p.x, top: p.y,
                pointerEvents: 'none',
                fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '1rem',
                color: 'var(--cyan)',
                animation: `floatUp 0.9s ease-out forwards`,
                ['--dx']: `${p.dx}px`,
              }}
            >+1</span>
          ))}
          <button
            onClick={handleTap}
            style={{
              width: 240, height: 240, borderRadius: '50%',
              border: 'none', cursor: 'pointer', padding: 0,
              background: 'radial-gradient(circle at 30% 30%, var(--cyan), var(--violet) 70%, #1a1a26 100%)',
              boxShadow: pressed
                ? '0 0 60px rgba(99,215,255,0.6), inset 0 0 30px rgba(0,0,0,0.4)'
                : '0 20px 60px rgba(99,215,255,0.25), 0 0 30px rgba(139,92,246,0.3)',
              transform: pressed ? 'scale(0.94)' : 'scale(1)',
              transition: 'transform 0.1s, box-shadow 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <img
              src={TAP_IMAGE}
              alt="tap"
              draggable={false}
              style={{
                width: '88%', height: '88%', objectFit: 'cover', borderRadius: '50%',
                pointerEvents: 'none', userSelect: 'none',
              }}
            />
          </button>
        </div>

        {/* Progress towards next generation */}
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
            color: 'var(--text3)', marginBottom: 6, letterSpacing: '0.1em',
          }}>
            <span>NEXT GENERATION</span>
            <span>{Math.min(count, GENERATE_COST)} / {GENERATE_COST}</span>
          </div>
          <div style={{
            width: '100%', height: 8, borderRadius: 4,
            background: 'var(--bg3)', overflow: 'hidden',
          }}>
            <div style={{
              width: `${progress}%`, height: '100%',
              background: 'linear-gradient(90deg, var(--cyan), var(--violet))',
              transition: 'width 0.2s',
              boxShadow: progress >= 100 ? '0 0 12px var(--cyan-glow)' : 'none',
            }} />
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className={canGenerate ? 'btn-primary' : 'btn-ghost'}
          style={{
            padding: '0.95rem 2rem', fontSize: '0.92rem',
            opacity: canGenerate ? 1 : 0.5,
            cursor: canGenerate ? 'pointer' : 'not-allowed',
            justifyContent: 'center',
          }}
        >
          ✨ Generate AI sound — {GENERATE_COST} taps
        </button>

        {error && (
          <div style={{
            padding: '10px 14px',
            background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.3)',
            borderRadius: 10, fontSize: '0.82rem', color: '#ff8080',
          }}>{error}</div>
        )}
      </main>

      <Footer />

      <style>{`
        @keyframes floatUp {
          0%   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(calc(-50% + var(--dx)), calc(-50% - 80px)) scale(1.4); }
        }
      `}</style>
    </div>
  );
}
