import { useState } from 'react';
import AuthLayout from '../components/auth/AuthLayout';
import AuthInput from '../components/auth/AuthInput';
import { forgotPassword } from '../api/services/authService';

const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

export default function ForgotPasswordPage({ onNavigate }) {
  const [email, setEmail]       = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [sent, setSent]         = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) { setError('Email is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email address'); return; }

    setLoading(true);
    try {
      await forgotPassword({ email });
      setSent(true);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2.5rem',
        animation: 'slideUp 0.4s ease both',
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 12,
          background: 'linear-gradient(135deg, var(--cyan-dark), var(--violet))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
          boxShadow: '0 0 24px var(--cyan-dim)',
        }}>🎵</div>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.1rem', letterSpacing: '0.18em',
          background: 'linear-gradient(90deg, var(--text), var(--cyan))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>SOUNDWAVE</span>
      </div>

      <div style={{
        width: '100%', maxWidth: 420,
        background: 'var(--bg2)', border: '1px solid var(--line2)',
        borderRadius: 'var(--radius-lg)', overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
        animation: 'modalIn 0.4s cubic-bezier(.34,1.2,.64,1) both',
      }}>
        <div style={{
          height: 3,
          background: 'linear-gradient(90deg, var(--violet), var(--cyan-dark), var(--violet))',
          backgroundSize: '300%', animation: 'shimmer 3s linear infinite',
        }} />

        <div style={{ padding: '2.2rem' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '1rem 0', animation: 'slideUp 0.3s ease both' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%', margin: '0 auto 1.5rem',
                background: 'var(--cyan-dim)', border: '2px solid var(--line-hot)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem',
                animation: 'popIn 0.5s cubic-bezier(.34,1.56,.64,1) both',
                boxShadow: '0 0 40px var(--cyan-dim)',
              }}>📧</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 900, marginBottom: 10 }}>
                Check your inbox!
              </div>
              <div style={{ color: 'var(--text2)', fontSize: '0.88rem', lineHeight: 1.8, marginBottom: '2rem' }}>
                We sent a reset link to<br />
                <b style={{ color: 'var(--cyan)' }}>{email}</b>
              </div>
              <div style={{
                padding: '0.8rem 1rem', background: 'rgba(255,165,0,0.06)',
                border: '1px solid rgba(255,165,0,0.2)', borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem', color: 'rgba(255,200,80,0.8)', marginBottom: '1.5rem',
              }}>
                ⏱ Link expires in 30 minutes. Check your spam folder if you don't see it.
              </div>
              <button
                onClick={() => onNavigate?.('login')}
                className="btn-primary"
                style={{ width: '100%', padding: '0.9rem', fontSize: '0.88rem', justifyContent: 'center' }}
              >
                ← Back to Sign In
              </button>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '1.8rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔑</div>
                <h1 style={{
                  fontFamily: 'var(--font-display)', fontWeight: 900,
                  fontSize: '1.6rem', letterSpacing: '-0.01em', marginBottom: 8,
                }}>Forgot password?</h1>
                <p style={{ color: 'var(--text2)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                  No worries! Enter your email and we'll send you a reset link.
                </p>
              </div>

              <AuthInput
                label="Email address" type="email" placeholder="you@example.com"
                value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                error={error} icon={<IconMail />} required
              />

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary"
                style={{
                  width: '100%', padding: '0.95rem', fontSize: '0.92rem',
                  justifyContent: 'center', marginTop: '0.5rem',
                  opacity: loading ? 0.75 : 1, cursor: loading ? 'wait' : 'pointer',
                }}
              >
                {loading ? (
                  <>
                    <span style={{
                      width: 16, height: 16, border: '2.5px solid rgba(0,0,0,0.25)',
                      borderTopColor: '#000', borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite', display: 'inline-block',
                    }} />
                    Sending...
                  </>
                ) : '📧 Send Reset Link'}
              </button>
            </>
          )}
        </div>
      </div>

      <button
        onClick={() => onNavigate?.('login')}
        style={{
          marginTop: '1.5rem', background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text3)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8rem',
          transition: 'color 0.18s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
      >
        ← Back to Sign In
      </button>
    </AuthLayout>
  );
}
