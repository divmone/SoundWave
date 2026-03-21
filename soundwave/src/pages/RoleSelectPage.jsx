import { useState } from 'react';
import AuthLayout from '../components/auth/AuthLayout';
import { setUserRole } from '../api/services/authService';

const ROLES = [
  {
    id:    'buyer',
    emoji: '🎧',
    title: 'Buyer',
    desc:  'Browse, preview and purchase premium sound effects for your streams and projects.',
    perks: ['Access 12K+ sounds', 'Instant download', 'Commercial license'],
  },
  {
    id:    'creator',
    emoji: '🎤',
    title: 'Creator',
    desc:  'Upload and sell your original sounds. Keep 80% of every sale.',
    perks: ['Upload unlimited tracks', '80% revenue share', 'Analytics dashboard'],
  },
];

export default function RoleSelectPage({ user, onComplete }) {
  const [selected, setSelected] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleConfirm = async () => {
    if (!selected) { setError('Please choose a role to continue.'); return; }
    setLoading(true);
    setError('');
    try {
      const data = await setUserRole({ role: selected });
      onComplete?.(data.user);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2rem',
        animation: 'slideUp 0.4s ease both',
      }}>
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
        width: '100%', maxWidth: 480,
        background: 'var(--bg2)',
        border: '1px solid var(--line2)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
        animation: 'modalIn 0.4s cubic-bezier(.34,1.2,.64,1) both',
      }}>
        {/* Shimmer */}
        <div style={{
          height: 3,
          background: 'linear-gradient(90deg, var(--cyan-dark), var(--violet), var(--cyan))',
          backgroundSize: '300%', animation: 'shimmer 3s linear infinite',
        }} />

        <div style={{ padding: '2.4rem 2.4rem 2.2rem' }}>
          {/* Header */}
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            {/* Welcome avatar */}
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--cyan-dark), var(--violet))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.6rem', margin: '0 auto 1.2rem',
              boxShadow: '0 0 30px var(--cyan-dim)',
              animation: 'popIn 0.4s cubic-bezier(.34,1.56,.64,1) both',
            }}>
              {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '👋'}
            </div>

            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 900,
              fontSize: '1.6rem', marginBottom: 8, letterSpacing: '-0.01em',
            }}>
              One last step{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
            </h1>
            <p style={{ color: 'var(--text2)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              How will you use SoundWave? You can always change this later.
            </p>
          </div>

          {/* Role cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.6rem' }}>
            {ROLES.map(role => {
              const isSelected = selected === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => { setSelected(role.id); setError(''); }}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '1rem',
                    padding: '1.1rem 1.2rem',
                    background: isSelected ? 'var(--cyan-dim)' : 'rgba(255,255,255,0.02)',
                    border: `1.5px solid ${isSelected ? 'var(--line-hot)' : 'var(--line)'}`,
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.2s cubic-bezier(.34,1.3,.64,1)',
                    transform: isSelected ? 'scale(1.01)' : 'scale(1)',
                    boxShadow: isSelected ? '0 4px 24px var(--cyan-dim)' : 'none',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--line2)'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--line)'; }}
                  onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.98)'; }}
                  onMouseUp={e => { e.currentTarget.style.transform = isSelected ? 'scale(1.01)' : 'scale(1)'; }}
                >
                  {/* Emoji */}
                  <div style={{
                    width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                    background: isSelected ? 'rgba(99,215,255,0.15)' : 'var(--bg4)',
                    border: `1px solid ${isSelected ? 'var(--line-hot)' : 'var(--line)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.4rem', transition: 'all 0.2s',
                  }}>
                    {role.emoji}
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{
                        fontFamily: 'var(--font-display)', fontWeight: 800,
                        fontSize: '0.95rem',
                        color: isSelected ? 'var(--cyan)' : 'var(--text)',
                        transition: 'color 0.2s',
                      }}>{role.title}</span>

                      {/* Radio indicator */}
                      <div style={{
                        marginLeft: 'auto', width: 18, height: 18, borderRadius: '50%',
                        border: `2px solid ${isSelected ? 'var(--cyan)' : 'var(--line2)'}`,
                        background: isSelected ? 'var(--cyan)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s', flexShrink: 0,
                      }}>
                        {isSelected && (
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#000' }} />
                        )}
                      </div>
                    </div>

                    <p style={{
                      fontSize: '0.78rem', color: 'var(--text2)',
                      lineHeight: 1.55, marginBottom: 8,
                    }}>{role.desc}</p>

                    {/* Perks */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {role.perks.map(p => (
                        <span key={p} style={{
                          fontSize: '0.65rem', fontWeight: 700,
                          color: isSelected ? 'var(--cyan)' : 'var(--text3)',
                          fontFamily: 'var(--font-mono)',
                          display: 'flex', alignItems: 'center', gap: 4,
                          transition: 'color 0.2s',
                        }}>
                          <span style={{ color: isSelected ? 'var(--green)' : 'var(--text3)' }}>✓</span>
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '0.75rem 1rem', marginBottom: '1.2rem',
              background: 'var(--red-dim)', border: '1px solid rgba(255,68,102,0.35)',
              borderRadius: 'var(--radius-sm)',
              animation: 'slideUp 0.2s ease both',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="var(--red)" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span style={{ fontSize: '0.82rem', color: 'var(--red)', fontWeight: 700 }}>{error}</span>
            </div>
          )}

          {/* Confirm button */}
          <button
            onClick={handleConfirm}
            disabled={loading || !selected}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 8, width: '100%', padding: '0.95rem',
              background: selected
                ? 'linear-gradient(135deg, var(--cyan-dark), var(--cyan))'
                : 'var(--bg4)',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              color: selected ? '#000' : 'var(--text3)',
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: '0.92rem',
              cursor: loading ? 'wait' : selected ? 'pointer' : 'not-allowed',
              transition: 'all 0.25s',
              boxShadow: selected ? '0 4px 24px rgba(99,215,255,0.3)' : 'none',
              opacity: loading ? 0.75 : 1,
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: 16, height: 16,
                  border: '2.5px solid rgba(0,0,0,0.2)', borderTopColor: '#000',
                  borderRadius: '50%', animation: 'spin 0.7s linear infinite',
                  display: 'inline-block',
                }} />
                Setting up your account...
              </>
            ) : (
              <>Get started as {selected ? ROLES.find(r => r.id === selected)?.title : '...'} →</>
            )}
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
