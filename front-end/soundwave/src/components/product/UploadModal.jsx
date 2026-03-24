import { useState } from 'react';
import { createProduct } from '../../api/services/productsService';

const CATEGORIES = [
  { id: 'alerts', label: '🔔 Alerts' },
  { id: 'transitions', label: '🌊 Transitions' },
  { id: 'jingles', label: '🎵 Jingles' },
  { id: 'ui', label: '⬡ UI Sounds' },
  { id: 'stingers', label: '⚡ Stingers' },
];

const inp = {
  width: '100%',
  padding: '0.8rem 1.1rem',
  background: 'rgba(255,255,255,0.04)',
  border: '1.5px solid var(--line2)',
  borderRadius: 'var(--radius-pill)',
  color: 'var(--text)',
  fontSize: '0.9rem',
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
};

const lbl = {
  display: 'block',
  fontSize: '0.7rem',
  fontWeight: 800,
  letterSpacing: '0.1em',
  color: 'var(--text3)',
  marginBottom: 8,
  textTransform: 'uppercase',
  fontFamily: 'var(--font-display)',
};

function Field({ label, children }) {
  return <div><label style={lbl}>{label}</label>{children}</div>;
}

function Input({ label, ...props }) {
  return (
    <Field label={label}>
      <input style={inp} {...props} />
    </Field>
  );
}

function SuccessScreen({ onClose }) {
  return (
    <div style={{
      padding: '3rem 2.2rem 2.5rem',
      textAlign: 'center',
      animation: 'slideUp 0.4s ease both',
    }}>
      {/* Animated check icon */}
      <div style={{
        width: 88, height: 88, borderRadius: '50%',
        margin: '0 auto 1.8rem',
        background: 'linear-gradient(135deg, rgba(34,211,122,0.15), rgba(99,215,255,0.1))',
        border: '2px solid rgba(34,211,122,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'popIn 0.5s cubic-bezier(.34,1.56,.64,1) both, float 3s ease-in-out 0.5s infinite',
        boxShadow: '0 0 40px rgba(34,211,122,0.2), 0 0 80px rgba(34,211,122,0.08)',
      }}>
        <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
          <polyline
            points="8,20 16,28 30,12"
            stroke="var(--green)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="40"
            strokeDashoffset="0"
            style={{ animation: 'checkDraw 0.5s ease 0.3s both' }}
          />
        </svg>
      </div>

      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: '1.5rem', fontWeight: 900,
        marginBottom: 10,
        background: 'linear-gradient(135deg, var(--text), var(--green))',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        Track submitted! 🎉
      </div>

      <p style={{
        color: 'var(--text2)', fontSize: '0.92rem',
        lineHeight: 1.75, marginBottom: '2rem',
      }}>
        Your sound is now in the queue.
      </p>

      {/* Status badge — the "admin will confirm" card */}
      <div style={{
        background: 'rgba(255,165,0,0.06)',
        border: '1.5px solid rgba(255,165,0,0.25)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.2rem 1.4rem',
        marginBottom: '2rem',
        textAlign: 'left',
        animation: 'slideUp 0.4s ease 0.2s both',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'rgba(255,165,0,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.9rem', flexShrink: 0,
          }}>⏳</span>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800, fontSize: '0.85rem',
            color: 'rgba(255,200,80,0.9)',
          }}>Awaiting admin approval</span>
          <span style={{
            marginLeft: 'auto',
            padding: '2px 10px',
            background: 'rgba(255,165,0,0.12)',
            border: '1px solid rgba(255,165,0,0.3)',
            borderRadius: 'var(--radius-pill)',
            fontSize: '0.6rem', fontWeight: 800,
            color: 'rgba(255,200,80,0.8)',
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.05em',
          }}>PENDING</span>
        </div>

        {/* Steps */}
        {[
          { done: true,  icon: '✓', label: 'File received & stored securely' },
          { done: true,  icon: '✓', label: 'Audio quality check in progress' },
          { done: false, icon: '○', label: 'Admin review (up to 24h)' },
          { done: false, icon: '○', label: 'Published to marketplace' },
        ].map((step, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '5px 0',
            opacity: step.done ? 1 : 0.45,
            animation: `slideUp 0.3s ease ${0.3 + i * 0.08}s both`,
          }}>
            <span style={{
              width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
              background: step.done ? 'rgba(34,211,122,0.2)' : 'var(--bg4)',
              border: `1px solid ${step.done ? 'var(--green)' : 'var(--line2)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.55rem', color: step.done ? 'var(--green)' : 'var(--text3)',
              fontWeight: 900,
            }}>{step.icon}</span>
            <span style={{
              fontSize: '0.78rem', color: step.done ? 'var(--text2)' : 'var(--text3)',
              fontFamily: 'var(--font-body)', fontWeight: 600,
            }}>{step.label}</span>
          </div>
        ))}

        <div style={{
          marginTop: 12, paddingTop: 12,
          borderTop: '1px solid rgba(255,165,0,0.1)',
          fontSize: '0.72rem', color: 'rgba(255,200,80,0.55)',
          fontFamily: 'var(--font-body)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span>📧</span>
          We'll email you when your track goes live.
        </div>
      </div>

      <button className="btn-primary" onClick={onClose} style={{ width: '100%', padding: '0.9rem', fontSize: '0.88rem' }}>
        Got it, thanks! 👍
      </button>
    </div>
  );
}

export default function UploadModal({ onClose, user }) {
  const [form, setForm]         = useState({ title: '', creator: '', price: '', category: 'alerts', tags: '' });
  const [file, setFile]         = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);
  const [errors, setErrors]     = useState({});

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = true;
    if (!form.creator.trim()) e.creator = true;
    if (!form.price || isNaN(form.price)) e.price = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await createProduct(user?.id, file, {
        title: form.title,
        price: parseFloat(form.price),
        description: form.category,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      setDone(true);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const errStyle = (key) => errors[key] ? { borderColor: 'var(--red)', boxShadow: '0 0 0 3px var(--red-dim)' } : {};

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(5,5,8,0.88)',
        backdropFilter: 'blur(20px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        animation: 'overlayIn 0.2s ease both',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg2)',
          border: '1px solid var(--line2)',
          borderRadius: 'var(--radius-lg)',
          width: '100%', maxWidth: 520,
          maxHeight: '94dvh', overflowY: 'auto',
          animation: 'modalIn 0.35s cubic-bezier(.34,1.3,.64,1) both',
          position: 'relative',
          boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)',
        }}
      >
        {/* Shimmer top stripe */}
        <div style={{
          position: 'sticky', top: 0,
          height: 3, borderRadius: '20px 20px 0 0',
          background: 'linear-gradient(90deg, var(--cyan-dark), var(--violet), var(--cyan), var(--violet), var(--cyan-dark))',
          backgroundSize: '300%',
          animation: 'shimmer 3s linear infinite',
          zIndex: 2,
        }} />

        {done ? (
          <SuccessScreen onClose={onClose} />
        ) : (
          <>
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1.5rem 1.8rem 1.3rem',
              borderBottom: '1px solid var(--line)',
            }}>
              <div>
                <div style={{
                  fontSize: '0.62rem', letterSpacing: '0.15em',
                  color: 'var(--cyan)', fontFamily: 'var(--font-display)',
                  fontWeight: 800, marginBottom: 5,
                }}>🎵 NEW UPLOAD</div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.3rem', fontWeight: 900,
                }}>Share your sound</div>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'var(--bg3)', border: '1.5px solid var(--line2)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text3)', fontSize: '1rem',
                  transition: 'all 0.18s', fontFamily: 'var(--font-body)',
                  fontWeight: 700,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'var(--red-dim)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line2)'; e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.background = 'var(--bg3)'; }}
              >✕</button>
            </div>

            <div style={{ padding: '1.6rem 1.8rem 2rem' }}>
              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
                onClick={() => document.getElementById('_audioInput').click()}
                style={{
                  border: `2px dashed ${dragging ? 'var(--cyan)' : file ? 'var(--green)' : 'var(--line2)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '2rem 1.5rem',
                  textAlign: 'center', marginBottom: '1.5rem',
                  background: dragging ? 'var(--cyan-dim)' : file ? 'var(--green-dim)' : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.25s',
                  boxShadow: dragging ? '0 0 40px var(--cyan-dim)' : 'none',
                }}
              >
                <input id="_audioInput" type="file" accept="audio/*" style={{ display: 'none' }}
                  onChange={e => setFile(e.target.files[0])} />
                <div style={{ fontSize: '2.5rem', marginBottom: 10, lineHeight: 1 }}>
                  {file ? '🎧' : '📂'}
                </div>
                <div style={{
                  fontWeight: 800, fontFamily: 'var(--font-display)',
                  marginBottom: 4, fontSize: '0.95rem',
                  color: file ? 'var(--green)' : 'var(--text)',
                }}>
                  {file ? file.name : 'Drop audio here or click to browse'}
                </div>
                <div style={{
                  fontSize: '0.72rem', color: 'var(--text3)',
                  fontFamily: 'var(--font-body)',
                }}>
                  {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'MP3 · WAV · OGG — max 50 MB'}
                </div>
              </div>

              {/* Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <Input label="Title *" placeholder="Epic Drop Alert" value={form.title} onChange={set('title')}
                  style={{ ...inp, ...errStyle('title') }} />
                <Input label="Creator *" placeholder="@YourHandle" value={form.creator} onChange={set('creator')}
                  style={{ ...inp, ...errStyle('creator') }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <Input label="Price (USD) *" placeholder="9.99" type="number" min="0" step="0.01" value={form.price}
                  onChange={set('price')} style={{ ...inp, ...errStyle('price') }} />
                <Field label="Category">
                  <select
                    value={form.category} onChange={set('category')}
                    style={{ ...inp, cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.id} style={{ background: 'var(--bg2)' }}>{c.label}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <div style={{ marginBottom: '1.8rem' }}>
                <Input label="Tags (comma separated)" placeholder="Alert, Epic, Cinematic" value={form.tags} onChange={set('tags')} />
              </div>

              {Object.keys(errors).length > 0 && (
                <div style={{
                  marginBottom: '1rem', padding: '0.75rem 1rem',
                  background: 'var(--red-dim)', border: '1px solid rgba(255,68,102,0.3)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem', color: 'var(--red)',
                  fontFamily: 'var(--font-body)', fontWeight: 600,
                }}>
                  ⚠️ Please fill in all required fields
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn-ghost" onClick={onClose} style={{ flex: 1, padding: '0.9rem' }}>
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{ flex: 2, padding: '0.9rem', fontSize: '0.85rem' }}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        width: 15, height: 15,
                        border: '2.5px solid rgba(0,0,0,0.25)',
                        borderTopColor: '#000',
                        borderRadius: '50%',
                        animation: 'spin 0.7s linear infinite',
                        display: 'inline-block', flexShrink: 0,
                      }} />
                      Uploading...
                    </span>
                  ) : '🚀 Upload Sound'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
