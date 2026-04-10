import { useState } from 'react';
import { createProduct } from '../../api/services/productsService';
import LicenseModal from './LicenseModal';

const ALLOWED_MIME = [
  'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav',
  'audio/ogg', 'audio/flac', 'audio/x-flac', 'audio/aac',
  'audio/mp4', 'audio/m4a', 'audio/x-m4a',
];
const ALLOWED_EXT_RE = /\.(mp3|wav|ogg|flac|aac|m4a)$/i;
const ALLOWED_LABEL  = 'MP3, WAV, OGG, FLAC, AAC, M4A';
const MAX_MB = 50;

const inp = {
  width: '100%', padding: '0.8rem 1.1rem',
  background: 'rgba(255,255,255,0.04)', border: '1.5px solid var(--line2)',
  borderRadius: 'var(--radius-pill)', color: 'var(--text)',
  fontSize: '0.9rem', fontFamily: 'var(--font-body)', fontWeight: 600,
  outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
};
const lbl = {
  display: 'block', fontSize: '0.7rem', fontWeight: 800,
  letterSpacing: '0.1em', color: 'var(--text3)', marginBottom: 8,
  textTransform: 'uppercase', fontFamily: 'var(--font-display)',
};
const focus = e => { e.target.style.borderColor = 'var(--cyan-dark)'; e.target.style.boxShadow = '0 0 0 3px var(--cyan-dim)'; };
const blur  = e => { e.target.style.borderColor = 'var(--line2)';     e.target.style.boxShadow = 'none'; };

function SuccessScreen({ onClose }) {
  return (
    <div style={{ padding: '3rem 2.2rem 2.5rem', textAlign: 'center', animation: 'slideUp 0.4s ease both' }}>
      <div style={{
        width: 88, height: 88, borderRadius: '50%', margin: '0 auto 1.8rem',
        background: 'linear-gradient(135deg, rgba(34,211,122,0.15), rgba(99,215,255,0.1))',
        border: '2px solid rgba(34,211,122,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'popIn 0.5s cubic-bezier(.34,1.56,.64,1) both, float 3s ease-in-out 0.5s infinite',
        boxShadow: '0 0 40px rgba(34,211,122,0.2)',
      }}>
        <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
          <polyline points="8,20 16,28 30,12" stroke="var(--green)" strokeWidth="3.5"
            strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray="40" strokeDashoffset="0"
            style={{ animation: 'checkDraw 0.5s ease 0.3s both' }} />
        </svg>
      </div>
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 900, marginBottom: 10,
        background: 'linear-gradient(135deg, var(--text), var(--green))',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>Track submitted! 🎉</div>
      <p style={{ color: 'var(--text2)', fontSize: '0.92rem', lineHeight: 1.75, marginBottom: '2rem' }}>
        Your sound is now in the queue.
      </p>
      <div style={{
        background: 'rgba(255,165,0,0.06)', border: '1.5px solid rgba(255,165,0,0.25)',
        borderRadius: 'var(--radius-lg)', padding: '1.2rem 1.4rem', marginBottom: '2rem', textAlign: 'left',
        animation: 'slideUp 0.4s ease 0.2s both',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,165,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>⏳</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.85rem', color: 'rgba(255,200,80,0.9)' }}>Awaiting admin approval</span>
          <span style={{ marginLeft: 'auto', padding: '2px 10px', background: 'rgba(255,165,0,0.12)', border: '1px solid rgba(255,165,0,0.3)', borderRadius: 'var(--radius-pill)', fontSize: '0.6rem', fontWeight: 800, color: 'rgba(255,200,80,0.8)', fontFamily: 'var(--font-display)' }}>PENDING</span>
        </div>
        {[
          { done: true,  icon: '✓', label: 'File received & stored securely' },
          { done: true,  icon: '✓', label: 'Audio quality check in progress' },
          { done: false, icon: '○', label: 'Admin review (up to 24h)' },
          { done: false, icon: '○', label: 'Published to marketplace' },
        ].map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0', opacity: step.done ? 1 : 0.45, animation: `slideUp 0.3s ease ${0.3 + i * 0.08}s both` }}>
            <span style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, background: step.done ? 'rgba(34,211,122,0.2)' : 'var(--bg4)', border: `1px solid ${step.done ? 'var(--green)' : 'var(--line2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', color: step.done ? 'var(--green)' : 'var(--text3)', fontWeight: 900 }}>{step.icon}</span>
            <span style={{ fontSize: '0.78rem', color: step.done ? 'var(--text2)' : 'var(--text3)', fontFamily: 'var(--font-body)', fontWeight: 600 }}>{step.label}</span>
          </div>
        ))}
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,165,0,0.1)', fontSize: '0.72rem', color: 'rgba(255,200,80,0.55)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>📧</span> We'll email you when your track goes live.
        </div>
      </div>
      <button className="btn-primary" onClick={onClose} style={{ width: '100%', padding: '0.9rem', fontSize: '0.88rem', justifyContent: 'center' }}>
        Got it, thanks! 👍
      </button>
    </div>
  );
}

export default function UploadModal({ onClose, user, onSuccess }) {
  const [form,     setForm]     = useState({ title: '', price: '', tags: '', description: '' });
  const [file,     setFile]     = useState(null);
  const [duration, setDuration] = useState(0);
  const [dragging, setDrag]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(false);
  const [agreed,   setAgreed]   = useState(false);
  const [showLicense, setShowLicense] = useState(false);

  // Errors
  const [fileError, setFileError] = useState('');
  const [errors,    setErrors]    = useState({});
  const [apiError,  setApiError]  = useState('');

  const set = k => e => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors(er => ({ ...er, [k]: '' }));
    setApiError('');
  };

  const handleFile = (f) => {
    if (!f) return;
    const extOk  = ALLOWED_EXT_RE.test(f.name);
    const mimeOk = ALLOWED_MIME.includes(f.type);
    if (!extOk && !mimeOk) {
      const ext = f.name.includes('.') ? f.name.split('.').pop().toUpperCase() : 'unknown';
      setFileError(`❌ Unsupported format: .${ext}. Allowed formats: ${ALLOWED_LABEL}`);
      setFile(null);
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setFileError(`❌ File too large: ${(f.size/1024/1024).toFixed(1)} MB. Maximum allowed: ${MAX_MB} MB`);
      setFile(null);
      return;
    }
    setFileError('');
    setFile(f);
    // Detect duration
    const url   = URL.createObjectURL(f);
    const audio = new Audio(url);
    audio.onloadedmetadata = () => {
      setDuration(Math.round(audio.duration || 0));
      URL.revokeObjectURL(url);
    };
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())                              e.title = 'Title is required';
    if (!form.price || isNaN(form.price) || Number(form.price) < 0) e.price = 'Enter a valid price (e.g. 4.99)';
    if (!file)                                           e.file  = 'Please select an audio file';
    if (!agreed)                                         e.agreed = 'You must agree to the license terms';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    try {
      await createProduct(user?.id, file, {
        title:           form.title.trim(),
        price:           parseFloat(form.price),
        description:     form.description.trim(),
        tags:            form.tags.split(',').map(t => t.trim()).filter(Boolean),
        originalName:    file.name,
        mimeType:        file.type || 'audio/mpeg',
        durationSeconds: duration,
      });
      setDone(true);
      onSuccess?.();
    } catch (err) {
      setApiError(err.message || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const errBorder = key => errors[key] ? { borderColor: 'var(--red)', boxShadow: '0 0 0 3px var(--red-dim)' } : {};

  return (
    <>
      {/* License Agreement Modal */}
      {showLicense && (
        <LicenseModal
          onClose={() => setShowLicense(false)}
          onAccept={() => { setAgreed(true); setErrors(er => ({ ...er, agreed: '' })); }}
        />
      )}

      <div onClick={() => onClose(done)} style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(5,5,8,0.88)', backdropFilter: 'blur(20px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem', animation: 'overlayIn 0.2s ease both',
      }}>
        <div onClick={e => e.stopPropagation()} style={{
          background: 'var(--bg2)', border: '1px solid var(--line2)',
          borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 520,
          maxHeight: '94dvh', overflowY: 'auto',
          animation: 'modalIn 0.35s cubic-bezier(.34,1.3,.64,1) both',
          boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
        }}>
          {/* Shimmer */}
          <div style={{
            position: 'sticky', top: 0, height: 3, borderRadius: '20px 20px 0 0',
            background: 'linear-gradient(90deg, var(--cyan-dark), var(--violet), var(--cyan), var(--violet), var(--cyan-dark))',
            backgroundSize: '300%', animation: 'shimmer 3s linear infinite', zIndex: 2,
          }} />

          {done ? <SuccessScreen onClose={() => onClose(true)} /> : (
            <>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 1.8rem 1.2rem', borderBottom: '1px solid var(--line)' }}>
                <div>
                  <div style={{ fontSize: '0.62rem', letterSpacing: '0.15em', color: 'var(--cyan)', fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: 5 }}>🎵 NEW UPLOAD</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 900 }}>Share your sound</div>
                </div>
                <button onClick={onClose} style={{
                  width: 36, height: 36, borderRadius: '50%', background: 'var(--bg3)',
                  border: '1.5px solid var(--line2)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text3)', fontSize: '1rem', transition: 'all 0.18s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'var(--red-dim)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line2)'; e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.background = 'var(--bg3)'; }}
                >✕</button>
              </div>

              <div style={{ padding: '1.6rem 1.8rem 2rem' }}>
                {/* Drop zone */}
                <div
                  onDragOver={e => { e.preventDefault(); setDrag(true); }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
                  onClick={() => document.getElementById('_audioInput').click()}
                  style={{
                    border: `2px dashed ${dragging ? 'var(--cyan)' : file ? 'var(--green)' : errors.file ? 'var(--red)' : 'var(--line2)'}`,
                    borderRadius: 'var(--radius-md)', padding: '2rem 1.5rem',
                    textAlign: 'center', marginBottom: '0.5rem',
                    background: dragging ? 'var(--cyan-dim)' : file ? 'var(--green-dim)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer', transition: 'all 0.25s',
                  }}
                >
                  <input id="_audioInput" type="file" accept={ALLOWED_MIME.join(',')} style={{ display: 'none' }}
                    onChange={e => handleFile(e.target.files[0])} />
                  <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>{file ? '🎧' : '📂'}</div>
                  <div style={{ fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: 4, fontSize: '0.95rem', color: file ? 'var(--green)' : 'var(--text)' }}>
                    {file ? file.name : 'Drop audio here or click to browse'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>
                    {file
                      ? `${(file.size/1024/1024).toFixed(2)} MB${duration ? ` · ${Math.floor(duration/60)}:${String(duration%60).padStart(2,'0')}` : ''}`
                      : `${ALLOWED_LABEL} — max ${MAX_MB} MB`}
                  </div>
                </div>

                {/* File error */}
                {fileError && (
                  <div style={{
                    marginBottom: '1rem', padding: '0.7rem 1rem',
                    background: 'var(--red-dim)', border: '1px solid rgba(255,68,102,0.3)',
                    borderRadius: 'var(--radius-sm)', fontSize: '0.8rem',
                    color: 'var(--red)', fontWeight: 600, animation: 'slideUp 0.2s ease both',
                  }}>{fileError}</div>
                )}
                {errors.file && !fileError && (
                  <div style={{ marginBottom: '1rem', fontSize: '0.78rem', color: 'var(--red)', fontWeight: 600, display: 'flex', gap: 5, alignItems: 'center' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {errors.file}
                  </div>
                )}

                {/* Title */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={lbl}>Title <span style={{ color: 'var(--red)' }}>*</span></label>
                  <input style={{ ...inp, ...errBorder('title') }} placeholder="Epic Battle Theme"
                    value={form.title} onChange={set('title')} onFocus={focus} onBlur={blur} />
                  {errors.title && <div style={{ fontSize: '0.75rem', color: 'var(--red)', marginTop: 5, fontWeight: 600 }}>{errors.title}</div>}
                </div>

                {/* Description */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={lbl}>Description</label>
                  <textarea style={{ ...inp, borderRadius: 12, resize: 'vertical', minHeight: 65 }}
                    placeholder="Describe your sound..." value={form.description}
                    onChange={set('description')} onFocus={focus} onBlur={blur} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  {/* Price */}
                  <div>
                    <label style={lbl}>Price (USD) <span style={{ color: 'var(--red)' }}>*</span></label>
                    <input style={{ ...inp, ...errBorder('price') }} placeholder="4.99"
                      type="number" min="0" step="0.01" value={form.price}
                      onChange={set('price')} onFocus={focus} onBlur={blur} />
                    {errors.price && <div style={{ fontSize: '0.75rem', color: 'var(--red)', marginTop: 5, fontWeight: 600 }}>{errors.price}</div>}
                  </div>
                  {/* Tags */}
                  <div>
                    <label style={lbl}>Tags (comma separated)</label>
                    <input style={inp} placeholder="epic, cinematic, alerts"
                      value={form.tags} onChange={set('tags')} onFocus={focus} onBlur={blur} />
                  </div>
                </div>

                {/* License agreement */}
                <div style={{
                  padding: '1rem 1.1rem', marginBottom: '1rem',
                  background: errors.agreed ? 'var(--red-dim)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${errors.agreed ? 'rgba(255,68,102,0.4)' : 'var(--line)'}`,
                  borderRadius: 'var(--radius-sm)', transition: 'all 0.2s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}
                    onClick={() => { setAgreed(a => !a); setErrors(er => ({ ...er, agreed: '' })); }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 2,
                      background: agreed ? 'var(--cyan)' : 'var(--bg4)',
                      border: `1.5px solid ${agreed ? 'var(--cyan)' : errors.agreed ? 'var(--red)' : 'var(--line2)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}>
                      {agreed && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <polyline points="1.5,5 4,7.5 8.5,2" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text2)', lineHeight: 1.55 }}>
                      I confirm I hold exclusive rights to this audio and agree to the{' '}
                      <span
                        onClick={e => { e.stopPropagation(); setShowLicense(true); }}
                        style={{ color: 'var(--cyan)', textDecoration: 'underline', cursor: 'pointer', fontWeight: 700 }}
                      >Content Upload License Agreement</span>.
                    </div>
                  </div>
                  {errors.agreed && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--red)', fontWeight: 600, marginTop: 8, paddingLeft: 28 }}>
                      {errors.agreed}
                    </div>
                  )}
                  {/* Read license button */}
                  <button
                    onClick={e => { e.stopPropagation(); setShowLicense(true); }}
                    style={{
                      marginTop: 10, marginLeft: 28,
                      background: 'none', border: '1px solid var(--line2)',
                      borderRadius: 'var(--radius-pill)', padding: '4px 12px',
                      fontSize: '0.68rem', color: 'var(--text3)', cursor: 'pointer',
                      fontFamily: 'var(--font-display)', fontWeight: 700,
                      display: 'flex', alignItems: 'center', gap: 5,
                      transition: 'all 0.18s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--cyan)'; e.currentTarget.style.color = 'var(--cyan)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line2)'; e.currentTarget.style.color = 'var(--text3)'; }}
                  >
                    📄 Read full agreement
                  </button>
                </div>

                {/* API error */}
                {apiError && (
                  <div style={{
                    marginBottom: '1rem', padding: '0.75rem 1rem',
                    background: 'var(--red-dim)', border: '1px solid rgba(255,68,102,0.3)',
                    borderRadius: 'var(--radius-sm)', fontSize: '0.8rem',
                    color: 'var(--red)', fontWeight: 600, animation: 'slideUp 0.2s ease both',
                  }}>⚠️ {apiError}</div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn-ghost" onClick={onClose} style={{ flex: 1, padding: '0.9rem', justifyContent: 'center' }}>
                    Cancel
                  </button>
                  <button className="btn-primary" onClick={handleSubmit} disabled={loading}
                    style={{ flex: 2, padding: '0.9rem', fontSize: '0.85rem', justifyContent: 'center', opacity: loading ? 0.75 : 1, cursor: loading ? 'wait' : 'pointer' }}>
                    {loading ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 15, height: 15, border: '2.5px solid rgba(0,0,0,0.25)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block', flexShrink: 0 }} />
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
    </>
  );
}
