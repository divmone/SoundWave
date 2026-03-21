import { useState } from 'react';
import AuthLayout   from '../components/auth/AuthLayout';
import AuthInput    from '../components/auth/AuthInput';
import AuthDivider  from '../components/auth/AuthDivider';
import OAuthButtons from '../components/auth/OAuthButtons';
import { loginUser } from '../api/services/authService';

const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const CYRILLIC = /[а-яёА-ЯЁ]/;

function validate(form) {
  const e = {};
  if (!form.email.trim())                    e.email    = 'Email is required';
  else if (CYRILLIC.test(form.email))        e.email    = 'Latin characters only';
  else if (!EMAIL_RE.test(form.email.trim())) e.email   = 'Enter a valid email';
  if (!form.password)                        e.password = 'Password is required';
  else if (CYRILLIC.test(form.password))     e.password = 'Latin characters only';
  else if (form.password.length < 6)         e.password = 'Minimum 6 characters';
  return e;
}

const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

function Checkbox({ checked, onChange, label }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
      <div onClick={onChange} style={{
        width: 18, height: 18, borderRadius: 5, flexShrink: 0,
        border: `1.5px solid ${checked ? 'var(--cyan-dark)' : 'var(--line2)'}`,
        background: checked ? 'var(--cyan-dim)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.18s', cursor: 'pointer',
      }}>
        {checked && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="3.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
      </div>
      <span style={{ fontSize: '0.82rem', color: 'var(--text2)', fontWeight: 600 }}>{label}</span>
    </label>
  );
}

export default function LoginPage({ onNavigate, onLogin }) {
  const [form,     setForm]     = useState({ email: '', password: '', remember: false });
  const [errors,   setErrors]   = useState({});
  const [apiError, setApiError] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);

  const emailValid    = !errors.email    && EMAIL_RE.test(form.email.trim()) && !CYRILLIC.test(form.email);
  const passwordValid = !errors.password && form.password.length >= 6        && !CYRILLIC.test(form.password);

  const set = k => e => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [k]: val }));
    if (errors[k]) setErrors(er => ({ ...er, [k]: '' }));
    if (apiError)  setApiError('');
  };

  const handleSubmit = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setApiError('');
    try {
      const data = await loginUser(form);
      setSuccess(true);
      setTimeout(() => { onLogin?.(data.user); onNavigate?.('home'); }, 1200);
    } catch (err) {
      setApiError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
        width: '100%', maxWidth: 440,
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
          {success ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0 1rem', animation: 'slideUp 0.3s ease both' }}>
              <div style={{
                width: 76, height: 76, borderRadius: '50%', margin: '0 auto 1.5rem',
                background: 'var(--green-dim)', border: '2px solid rgba(34,211,122,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem',
                animation: 'popIn 0.4s cubic-bezier(.34,1.56,.64,1) both',
                boxShadow: '0 0 40px var(--green-dim)',
              }}>✓</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', fontWeight: 900, marginBottom: 8 }}>
                Welcome back! 👋
              </div>
              <div style={{ color: 'var(--text2)', fontSize: '0.88rem' }}>
                Redirecting to the marketplace...
              </div>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '1.8rem' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.75rem', marginBottom: 8 }}>
                  Sign in
                </h1>
                <p style={{ color: 'var(--text2)', fontSize: '0.87rem' }}>
                  Don't have an account?{' '}
                  <button onClick={() => onNavigate?.('register')} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--cyan)', fontFamily: 'inherit', fontSize: '0.87rem', fontWeight: 700, padding: 0,
                  }}>Create one →</button>
                </p>
              </div>

              {/* OAuth buttons — top position, most prominent */}
              <OAuthButtons />

              <AuthDivider label="or sign in with email" />

              {/* API error */}
              {apiError && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '0.8rem 1rem', marginBottom: '1.2rem',
                  background: 'var(--red-dim)', border: '1px solid rgba(255,68,102,0.35)',
                  borderRadius: 'var(--radius-sm)', animation: 'slideUp 0.2s ease both',
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span style={{ fontSize: '0.83rem', color: 'var(--red)', fontWeight: 700 }}>{apiError}</span>
                </div>
              )}

              <AuthInput
                label="Email address" type="email" placeholder="you@example.com"
                value={form.email} onChange={set('email')} error={errors.email}
                icon={<IconMail />} required isValid={!!emailValid}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
              <AuthInput
                label="Password" type="password" placeholder="Enter your password"
                value={form.password} onChange={set('password')} error={errors.password}
                icon={<IconLock />} required isValid={!!passwordValid}
                hint={
                  <button type="button" onClick={() => onNavigate?.('forgot')} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--cyan)', fontSize: '0.72rem', fontWeight: 700,
                    fontFamily: 'var(--font-display)', padding: 0,
                  }}>Forgot password?</button>
                }
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />

              <div style={{ marginBottom: '1.8rem' }}>
                <Checkbox
                  checked={form.remember}
                  onChange={() => setForm(f => ({ ...f, remember: !f.remember }))}
                  label="Keep me signed in for 30 days"
                />
              </div>

              <button
                onClick={handleSubmit} disabled={loading}
                className="btn-primary"
                style={{
                  width: '100%', padding: '0.95rem', fontSize: '0.92rem',
                  justifyContent: 'center', opacity: loading ? 0.75 : 1,
                  cursor: loading ? 'wait' : 'pointer',
                }}
              >
                {loading ? (
                  <>
                    <span style={{
                      width: 16, height: 16,
                      border: '2.5px solid rgba(0,0,0,0.2)', borderTopColor: '#000',
                      borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block',
                    }} />
                    Signing in...
                  </>
                ) : 'Sign In'}
              </button>
            </>
          )}
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
