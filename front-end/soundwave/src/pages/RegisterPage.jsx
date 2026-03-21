import { useState } from 'react';
import AuthLayout from '../components/auth/AuthLayout';
import AuthInput  from '../components/auth/AuthInput';
import { registerUser } from '../api/services/authService';
import OAuthButtons from '../components/auth/OAuthButtons';
import AuthDivider  from '../components/auth/AuthDivider';

// ── Constants ─────────────────────────────────────────────
const EMAIL_RE    = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const USERNAME_RE = /^[a-zA-Z0-9_]+$/;
const CYRILLIC    = /[а-яёА-ЯЁ]/;

// ── Password strength ─────────────────────────────────────
function getStrength(pwd) {
  if (!pwd) return { score: 0, label: '', color: 'transparent' };
  let score = 0;
  if (pwd.length >= 8)          score++;
  if (/[A-Z]/.test(pwd))        score++;
  if (/[0-9]/.test(pwd))        score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const map = [
    { label: 'Too weak',  color: 'var(--red)' },
    { label: 'Weak',      color: '#f97316' },
    { label: 'Fair',      color: '#eab308' },
    { label: 'Good',      color: '#84cc16' },
    { label: 'Strong',    color: 'var(--green)' },
  ];
  return { score, ...map[score] };
}

// ── Validation ────────────────────────────────────────────
function validate(form) {
  const e = {};

  if (!form.username.trim()) {
    e.username = 'Username is required';
  } else if (CYRILLIC.test(form.username)) {
    e.username = 'Only Latin characters allowed';
  } else if (form.username.trim().length < 3) {
    e.username = 'Minimum 3 characters';
  } else if (!USERNAME_RE.test(form.username.trim())) {
    e.username = 'Letters, numbers and underscores only';
  }

  if (!form.email.trim()) {
    e.email = 'Email is required';
  } else if (CYRILLIC.test(form.email)) {
    e.email = 'Only Latin characters allowed';
  } else if (!EMAIL_RE.test(form.email.trim())) {
    e.email = 'Enter a valid email address';
  }

  if (!form.password) {
    e.password = 'Password is required';
  } else if (CYRILLIC.test(form.password)) {
    e.password = 'Only Latin characters allowed';
  } else if (form.password.length < 8) {
    e.password = 'Minimum 8 characters';
  } else if (getStrength(form.password).score < 2) {
    e.password = 'Too weak — add uppercase letters or numbers';
  }

  if (!form.confirm) {
    e.confirm = 'Please confirm your password';
  } else if (form.confirm !== form.password) {
    e.confirm = 'Passwords do not match';
  }

  if (!form.agreed) {
    e.agreed = 'You must agree to continue';
  }

  return e;
}

// ── Icons ─────────────────────────────────────────────────
const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
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

// ── Component ─────────────────────────────────────────────
export default function RegisterPage({ onNavigate, onLogin }) {
  const [form, setForm]         = useState({ username: '', email: '', password: '', confirm: '', role: 'buyer', agreed: false });
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);

  const strength = getStrength(form.password);

  // Explicit validity per field (used to control green tick)
  const validity = {
    username: !errors.username && form.username.trim().length >= 3 && USERNAME_RE.test(form.username.trim()) && !CYRILLIC.test(form.username),
    email:    !errors.email    && EMAIL_RE.test(form.email.trim()) && !CYRILLIC.test(form.email),
    password: !errors.password && form.password.length >= 8 && strength.score >= 2 && !CYRILLIC.test(form.password),
    confirm:  !errors.confirm  && form.confirm === form.password && form.confirm.length > 0,
  };

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
      const data = await registerUser(form);
      setSuccess(true);
      setTimeout(() => { onLogin?.(data.user); onNavigate?.('home'); }, 1500);
    } catch (err) {
      if (err.code === 'EMAIL_TAKEN') {
        setErrors(er => ({ ...er, email: 'This email is already registered' }));
      } else {
        setApiError(err.message || 'Something went wrong. Please try again.');
      }
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
        background: 'var(--bg2)', border: '1px solid var(--line2)',
        borderRadius: 'var(--radius-lg)', overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
        animation: 'modalIn 0.4s cubic-bezier(.34,1.2,.64,1) both',
      }}>
        <div style={{
          height: 3,
          background: 'linear-gradient(90deg, var(--violet), var(--cyan), var(--violet), var(--cyan))',
          backgroundSize: '300%', animation: 'shimmer 3s linear infinite',
        }} />

        <div style={{ padding: '2.4rem 2.4rem 2.2rem' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0', animation: 'slideUp 0.3s ease both' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%', margin: '0 auto 1.5rem',
                background: 'var(--green-dim)', border: '2px solid rgba(34,211,122,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem',
                animation: 'popIn 0.5s cubic-bezier(.34,1.56,.64,1) both',
                boxShadow: '0 0 50px var(--green-dim)',
              }}>🎉</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 900, marginBottom: 10 }}>
                Account created!
              </div>
              <div style={{ color: 'var(--text2)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                Welcome to SoundWave,{' '}
                <b style={{ color: 'var(--cyan)' }}>{form.username}</b>.<br />
                Taking you to the marketplace...
              </div>
            </div>
          ) : (
            <>
              {/* Heading */}
              <div style={{ marginBottom: '1.8rem' }}>
                <h1 style={{
                  fontFamily: 'var(--font-display)', fontWeight: 900,
                  fontSize: '1.7rem', marginBottom: 8, letterSpacing: '-0.01em',
                }}>Create account</h1>
                <p style={{ color: 'var(--text2)', fontSize: '0.87rem' }}>
                  Already have one?{' '}
                  <button onClick={() => onNavigate?.('login')} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--cyan)', fontFamily: 'inherit',
                    fontSize: '0.87rem', fontWeight: 700, padding: 0,
                  }}>Sign in →</button>
                </p>
              </div>

              {/* API error */}
              {apiError && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '0.8rem 1rem',
                  background: 'var(--red-dim)', border: '1px solid rgba(255,68,102,0.35)',
                  borderRadius: 'var(--radius-sm)', marginBottom: '1.4rem',
                  animation: 'slideUp 0.2s ease both',
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span style={{ fontSize: '0.83rem', color: 'var(--red)', fontWeight: 700 }}>{apiError}</span>
                </div>
              )}

              {/* Demo hint */}
              <div style={{
                display: 'flex', gap: 8, padding: '0.72rem 1rem', marginBottom: '1.6rem',
                background: 'rgba(99,215,255,0.06)', border: '1px solid var(--line-hot)',
                borderRadius: 'var(--radius-sm)',
              }}>
                <span style={{ fontSize: '0.8rem', flexShrink: 0 }}>💡</span>
                <span style={{ fontSize: '0.74rem', color: 'var(--cyan)', fontWeight: 600, lineHeight: 1.55 }}>
                  Demo: use <b>taken@example.com</b> to see the "email taken" error.
                </span>
              </div>

              {/* OAuth — quick sign up */}
              <OAuthButtons />
              <AuthDivider label="or sign up with email" />

              {/* Role selector */}
              <div style={{ marginBottom: '1.6rem' }}>
                <div style={{
                  fontSize: '0.7rem', fontFamily: 'var(--font-display)', fontWeight: 800,
                  letterSpacing: '0.07em', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 10,
                }}>
                  I'm joining as
                  <span style={{ color: 'var(--red)', marginLeft: 3 }}>*</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {[
                    { id: 'buyer',   emoji: '🎧', title: 'Buyer',   desc: 'Browse & buy sounds' },
                    { id: 'creator', emoji: '🎤', title: 'Creator', desc: 'Upload & sell sounds' },
                  ].map(r => {
                    const active = form.role === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, role: r.id }))}
                        style={{
                          padding: '0.95rem 0.75rem',
                          background: active ? 'var(--cyan-dim)' : 'rgba(255,255,255,0.02)',
                          border: `1.5px solid ${active ? 'var(--line-hot)' : 'var(--line)'}`,
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer', textAlign: 'center',
                          transition: 'all 0.2s cubic-bezier(.34,1.3,.64,1)',
                          transform: active ? 'scale(1.02)' : 'scale(1)',
                          boxShadow: active ? '0 4px 20px var(--cyan-dim)' : 'none',
                        }}
                        onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = 'var(--line2)'; }}
                        onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = 'var(--line)'; }}
                        onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.96)'; }}
                        onMouseUp={e => { e.currentTarget.style.transform = active ? 'scale(1.02)' : 'scale(1)'; }}
                      >
                        <div style={{ fontSize: '1.5rem', marginBottom: 5 }}>{r.emoji}</div>
                        <div style={{
                          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.88rem',
                          color: active ? 'var(--cyan)' : 'var(--text)', marginBottom: 3,
                        }}>{r.title}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text3)', fontWeight: 600 }}>{r.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fields */}
              <AuthInput
                label="Username" placeholder="coolproducer99"
                value={form.username} onChange={set('username')}
                error={errors.username} icon={<IconUser />}
                isValid={validity.username} required
              />
              <AuthInput
                label="Email address" type="email" placeholder="you@example.com"
                value={form.email} onChange={set('email')}
                error={errors.email} icon={<IconMail />}
                isValid={validity.email} required
              />
              <AuthInput
                label="Password" type="password" placeholder="Min. 8 characters"
                value={form.password} onChange={set('password')}
                error={errors.password} icon={<IconLock />}
                isValid={validity.password} required
              />

              {/* Strength bar */}
              {form.password.length > 0 && (
                <div style={{ marginTop: -8, marginBottom: '1.2rem', animation: 'slideUp 0.2s ease both' }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
                    {[0,1,2,3].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 3, borderRadius: 4,
                        background: i < strength.score ? strength.color : 'var(--bg4)',
                        transition: 'background 0.3s',
                      }} />
                    ))}
                  </div>
                  <span style={{
                    fontSize: '0.7rem', color: strength.color,
                    fontWeight: 700, fontFamily: 'var(--font-display)',
                  }}>{strength.label}</span>
                </div>
              )}

              <AuthInput
                label="Confirm password" type="password" placeholder="Repeat your password"
                value={form.confirm} onChange={set('confirm')}
                error={errors.confirm} icon={<IconLock />}
                isValid={validity.confirm} required
              />

              {/* Terms checkbox */}
              <div style={{ marginBottom: errors.agreed ? '0.5rem' : '1.8rem' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
                  <div
                    onClick={() => { setForm(f => ({ ...f, agreed: !f.agreed })); if (errors.agreed) setErrors(er => ({ ...er, agreed: '' })); }}
                    style={{
                      width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 2,
                      border: `1.5px solid ${errors.agreed ? 'var(--red)' : form.agreed ? 'var(--cyan-dark)' : 'var(--line2)'}`,
                      background: form.agreed ? 'var(--cyan-dim)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.18s', cursor: 'pointer',
                    }}
                  >
                    {form.agreed && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="3.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text2)', fontWeight: 500, lineHeight: 1.55 }}>
                    I agree to the{' '}
                    <span style={{ color: 'var(--cyan)', cursor: 'pointer', fontWeight: 700 }}>Terms of Service</span>
                    {' '}and{' '}
                    <span style={{ color: 'var(--cyan)', cursor: 'pointer', fontWeight: 700 }}>Privacy Policy</span>
                  </span>
                </label>
              </div>

              {errors.agreed && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6, marginBottom: '1.4rem',
                  animation: 'slideUp 0.2s ease both',
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span style={{ fontSize: '0.75rem', color: 'var(--red)', fontWeight: 600 }}>{errors.agreed}</span>
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary"
                style={{
                  width: '100%', padding: '0.95rem',
                  fontSize: '0.92rem', justifyContent: 'center',
                  opacity: loading ? 0.75 : 1, cursor: loading ? 'wait' : 'pointer',
                }}
              >
                {loading ? (
                  <>
                    <span style={{
                      width: 16, height: 16,
                      border: '2.5px solid rgba(0,0,0,0.2)', borderTopColor: '#000',
                      borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block',
                    }} />
                    Creating account...
                  </>
                ) : 'Create Account'}
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
