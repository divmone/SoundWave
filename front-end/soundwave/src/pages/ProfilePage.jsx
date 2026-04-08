import { useState, useEffect, useCallback } from 'react';
import { getUserProducts, deleteProduct, getProductAudioUrl } from '../api/services/productsService';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import UploadModal from '../components/product/UploadModal';
import { logoutUser } from '../api/services/authService';

function StatCard({ label, value }) {
  return (
    <div style={{
      background: 'var(--bg3)',
      border: '1px solid var(--line2)',
      borderRadius: 'var(--radius-md)',
      padding: '1rem 1.4rem',
      textAlign: 'center',
      flex: 1,
      minWidth: 100,
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '1.5rem',
        fontWeight: 900,
        color: 'var(--cyan)',
        lineHeight: 1,
        marginBottom: 6,
      }}>{value}</div>
      <div style={{
        fontSize: '0.7rem',
        fontWeight: 700,
        color: 'var(--text3)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        fontFamily: 'var(--font-display)',
      }}>{label}</div>
    </div>
  );
}

function SoundRow({ sound, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const handleDelete = async () => {
    if (!confirmDel) { setConfirmDel(true); return; }
    setDeleting(true);
    try {
      await deleteProduct(sound.id);
      onDelete(sound.id);
    } catch {
      setDeleting(false);
      setConfirmDel(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '0.9rem 1.2rem',
      background: 'var(--bg3)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-md)',
      transition: 'border-color 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--line2)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--line)'}
    >
      {/* Icon */}
      <div style={{
        width: 38, height: 38, flexShrink: 0,
        borderRadius: 10,
        background: 'linear-gradient(135deg, rgba(99,215,255,0.15), rgba(155,109,255,0.15))',
        border: '1px solid var(--line2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1rem',
      }}>🎵</div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: '0.88rem',
          color: 'var(--text)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          marginBottom: 2,
        }}>{sound.title}</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {(sound.tagNames ?? []).slice(0, 3).map(t => (
            <span key={t} style={{
              fontSize: '0.62rem',
              fontWeight: 700,
              color: 'var(--cyan)',
              background: 'rgba(99,215,255,0.08)',
              border: '1px solid rgba(99,215,255,0.2)',
              borderRadius: 20,
              padding: '1px 8px',
              fontFamily: 'var(--font-mono)',
              textTransform: 'lowercase',
            }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Price */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontWeight: 800,
        fontSize: '0.88rem',
        color: 'var(--text2)',
        flexShrink: 0,
      }}>${Number(sound.price).toFixed(2)}</div>

      {/* Published badge */}
      <div style={{
        padding: '2px 10px',
        borderRadius: 20,
        fontSize: '0.62rem',
        fontWeight: 800,
        fontFamily: 'var(--font-display)',
        letterSpacing: '0.05em',
        background: sound.isPublished ? 'rgba(34,211,122,0.1)' : 'rgba(255,165,0,0.1)',
        border: `1px solid ${sound.isPublished ? 'rgba(34,211,122,0.3)' : 'rgba(255,165,0,0.3)'}`,
        color: sound.isPublished ? 'var(--green)' : 'rgba(255,200,80,0.8)',
        flexShrink: 0,
      }}>
        {sound.isPublished ? 'LIVE' : 'PENDING'}
      </div>

      {/* Play link */}
      <a
        href={getProductAudioUrl(sound.id)}
        target="_blank"
        rel="noreferrer"
        style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'var(--bg4)',
          border: '1px solid var(--line2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text3)',
          flexShrink: 0,
          textDecoration: 'none',
          fontSize: '0.75rem',
          transition: 'all 0.18s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--cyan)'; e.currentTarget.style.color = 'var(--cyan)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line2)'; e.currentTarget.style.color = 'var(--text3)'; }}
        title="Open audio file"
      >▶</a>

      {/* Delete */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        style={{
          width: 32, height: 32, borderRadius: '50%',
          background: confirmDel ? 'var(--red-dim)' : 'var(--bg4)',
          border: `1px solid ${confirmDel ? 'rgba(255,68,102,0.4)' : 'var(--line2)'}`,
          color: confirmDel ? 'var(--red)' : 'var(--text3)',
          cursor: deleting ? 'wait' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          fontSize: '0.8rem',
          transition: 'all 0.18s',
        }}
        onMouseEnter={e => { if (!confirmDel) { e.currentTarget.style.borderColor = 'rgba(255,68,102,0.4)'; e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'var(--red-dim)'; } }}
        onMouseLeave={e => { if (!confirmDel) { e.currentTarget.style.borderColor = 'var(--line2)'; e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.background = 'var(--bg4)'; } }}
        title={confirmDel ? 'Click again to confirm delete' : 'Delete sound'}
      >
        {deleting ? '…' : confirmDel ? '!' : '✕'}
      </button>
    </div>
  );
}

export default function ProfilePage({ user, onNavigate, onLogout: onLogoutProp, login }) {
  const [sounds, setSounds]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [modal, setModal]     = useState(false);

  const loadSounds = useCallback(() => {
    if (!user?.id) return;
    setLoading(true);
    getUserProducts(user.id)
      .then(data => setSounds(Array.isArray(data) ? data : []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [user?.id]);

  useEffect(() => { loadSounds(); }, [loadSounds]);

  const handleUploadClose = (uploaded) => {
    setModal(false);
    if (uploaded) loadSounds();
  };

  const handleLogout = async () => {
    await logoutUser();
    onLogoutProp?.();
    onNavigate?.('home');
  };

  const handleDelete = (id) => {
    setSounds(prev => prev.filter(s => s.id !== id));
  };

  const totalEarnings = sounds
    .filter(s => s.isPublished)
    .reduce((sum, s) => sum + Number(s.price ?? 0), 0);

  const initials = user?.username?.[0]?.toUpperCase() ?? '?';
  const isCreator = user?.role === 'creator' || sounds.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      {modal && <UploadModal onClose={handleUploadClose} user={user} />}
      <Header
        onUploadClick={() => setModal(true)}
        onNavigate={onNavigate}
        user={user}
        onLogout={handleLogout}
      />

      <main style={{
        flex: 1,
        maxWidth: 860,
        width: '100%',
        margin: '0 auto',
        padding: '2.5rem 1.5rem',
        boxSizing: 'border-box',
      }}>

        {/* Back link */}
        <button
          onClick={() => onNavigate?.('home')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text3)', fontFamily: 'var(--font-display)',
            fontWeight: 700, fontSize: '0.78rem',
            display: 'flex', alignItems: 'center', gap: 6,
            marginBottom: '2rem', padding: 0,
            transition: 'color 0.18s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
        >
          ← Back to marketplace
        </button>

        {/* Profile card */}
        <div style={{
          background: 'var(--bg2)',
          border: '1px solid var(--line2)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          marginBottom: '2rem',
        }}>
          {/* Shimmer stripe */}
          <div style={{
            height: 3,
            background: 'linear-gradient(90deg, var(--cyan-dark), var(--violet), var(--cyan), var(--violet), var(--cyan-dark))',
            backgroundSize: '300%',
            animation: 'shimmer 3s linear infinite',
          }} />

          <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              {/* Avatar */}
              <div style={{
                width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, var(--cyan-dark), var(--violet))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.8rem', fontWeight: 900, color: '#fff',
                fontFamily: 'var(--font-display)',
                boxShadow: '0 0 32px var(--cyan-dim)',
              }}>{initials}</div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.5rem',
                  fontWeight: 900,
                  color: 'var(--text)',
                  marginBottom: 4,
                }}>{user?.username}</div>
                <div style={{
                  color: 'var(--text3)',
                  fontSize: '0.85rem',
                  marginBottom: 10,
                  fontFamily: 'var(--font-body)',
                }}>{user?.email}</div>
                {user?.role && (
                  <span style={{
                    padding: '3px 12px',
                    borderRadius: 20,
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    fontFamily: 'var(--font-display)',
                    background: isCreator ? 'rgba(155,109,255,0.15)' : 'rgba(99,215,255,0.1)',
                    border: `1px solid ${isCreator ? 'rgba(155,109,255,0.4)' : 'rgba(99,215,255,0.3)'}`,
                    color: isCreator ? 'var(--violet)' : 'var(--cyan)',
                  }}>
                    {isCreator ? '🎨 CREATOR' : '🎧 LISTENER'}
                  </span>
                )}
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="btn-ghost"
                style={{ padding: '0.5rem 1.2rem', fontSize: '0.78rem', flexShrink: 0 }}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <StatCard label="Uploads" value={loading ? '—' : sounds.length} />
          <StatCard label="Published" value={loading ? '—' : sounds.filter(s => s.isPublished).length} />
          <StatCard label="Pending" value={loading ? '—' : sounds.filter(s => !s.isPublished).length} />
          <StatCard label="Catalog value" value={loading ? '—' : `$${totalEarnings.toFixed(2)}`} />
        </div>

        {/* My sounds section */}
        <div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '1rem',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 900, fontSize: '1rem',
              color: 'var(--text)',
              margin: 0,
            }}>My Sounds</h2>
            <button
              className="btn-primary"
              onClick={() => setModal(true)}
              style={{ padding: '0.42rem 1.1rem', fontSize: '0.75rem', background: 'linear-gradient(135deg, #6d28d9, var(--violet))' }}
            >
              + Upload new
            </button>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{
                  height: 64,
                  background: 'var(--bg3)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-md)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }} />
              ))}
            </div>
          ) : error ? (
            <div style={{
              padding: '1.5rem',
              background: 'var(--red-dim)',
              border: '1px solid rgba(255,68,102,0.3)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--red)',
              fontSize: '0.85rem',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
            }}>⚠️ Could not load sounds: {error}</div>
          ) : sounds.length === 0 ? (
            <div style={{
              padding: '3rem 2rem',
              textAlign: 'center',
              background: 'var(--bg2)',
              border: '1px dashed var(--line2)',
              borderRadius: 'var(--radius-lg)',
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🎵</div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '1rem',
                marginBottom: 8,
                color: 'var(--text)',
              }}>No sounds yet</div>
              <div style={{ color: 'var(--text3)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Upload your first sound to start selling
              </div>
              <button
                className="btn-primary"
                onClick={() => setModal(true)}
                style={{ padding: '0.6rem 1.6rem', fontSize: '0.83rem', background: 'linear-gradient(135deg, #6d28d9, var(--violet))' }}
              >
                + Upload a sound
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {sounds.map(s => (
                <SoundRow key={s.id} sound={s} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
