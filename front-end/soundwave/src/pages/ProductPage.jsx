import { useState } from 'react';
import Header from '../components/layout/Header';
import Waveform from '../components/product/Waveform';
import CommentsSection from '../components/product/CommentsSection';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { getProductAudioUrl } from '../api/services/productsService';

function StarRating({ rating }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {[1,2,3,4,5].map(s => (
        <div key={s} style={{
          width: 8, height: 8, borderRadius: '50%',
          background: s <= Math.round(rating) ? 'var(--cyan)' : 'var(--bg4)',
        }} />
      ))}
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text3)', marginLeft: 4 }}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

export default function ProductPage({ product, user, onNavigate, onLogout }) {
  const { playing, toggle, analyser, duration } = useAudioPlayer(product.id);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const audioUrl = getProductAudioUrl(product.id);

  const fmtDuration = (s) => {
    if (!s) return null;
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <Header onNavigate={onNavigate} user={user} onLogout={onLogout} onUploadClick={() => {}} />

      <main style={{
        flex: 1, maxWidth: 860, width: '100%',
        margin: '0 auto', padding: '2rem', boxSizing: 'border-box',
      }}>
        {/* Back */}
        <button
          onClick={() => onNavigate('home')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text3)', fontFamily: 'var(--font-display)',
            fontWeight: 700, fontSize: '0.8rem', padding: '0 0 1.5rem',
            transition: 'color 0.18s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--cyan)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back
        </button>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: 'clamp(1.4rem, 4vw, 2rem)', color: 'var(--text)',
            margin: '0 0 0.4rem',
          }}>{product.title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--cyan-dark), var(--violet))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--cyan)', fontWeight: 600 }}>
                {product.creator}
              </span>
            </div>
            {!!product.rating && <StarRating rating={product.rating} />}
            {!!product.downloadCount && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text3)' }}>
                {product.downloadCount.toLocaleString()} downloads
              </span>
            )}
          </div>
        </div>

        {/* Player */}
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--line)',
          borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
              letterSpacing: '0.18em', fontWeight: 600,
              color: playing ? 'var(--cyan)' : 'var(--text3)', transition: 'color 0.2s',
            }}>
              {playing ? '● PLAYING' : '○ PREVIEW'}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text3)' }}>
              {fmtDuration(duration) ?? fmtDuration(product.durationSeconds) ?? '--:--'}
            </span>
          </div>

          <div style={{ marginBottom: '1.2rem' }}>
            <Waveform analyser={analyser} playing={playing} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <button
              onClick={toggle}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '0.6rem 1.4rem', borderRadius: 'var(--radius-pill)',
                background: playing ? 'var(--cyan)' : 'var(--bg3)',
                border: `1px solid ${playing ? 'var(--cyan)' : 'var(--line2)'}`,
                color: playing ? '#000' : 'var(--text)',
                fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.82rem',
                cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: playing ? '0 0 24px var(--cyan-glow)' : 'none',
              }}
            >
              {playing ? (
                <>
                  <svg width="10" height="10" viewBox="0 0 9 9">
                    <rect x="0" y="0" width="3" height="9" rx="1" fill="currentColor"/>
                    <rect x="6" y="0" width="3" height="9" rx="1" fill="currentColor"/>
                  </svg>
                  Pause
                </>
              ) : (
                <>
                  <svg width="10" height="10" viewBox="0 0 9 9">
                    <polygon points="1,0 9,4.5 1,9" fill="currentColor"/>
                  </svg>
                  Play Preview
                </>
              )}
            </button>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--cyan)', fontWeight: 600 }}>$</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.05em', color: 'var(--text)', lineHeight: 1 }}>
                {product.price}
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text3)' }}>USD</span>
              <button
                onClick={() => setShowBuyModal(true)}
                style={{
                  marginLeft: 12, padding: '0.55rem 1.4rem', borderRadius: 'var(--radius-pill)',
                  background: 'linear-gradient(135deg, var(--cyan-dark), var(--cyan))',
                  border: 'none', color: '#000', cursor: 'pointer',
                  fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.82rem',
                  boxShadow: '0 4px 16px rgba(99,215,255,0.3)', transition: 'transform 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                Buy
              </button>
            </div>
          </div>
        </div>

        {/* Tags */}
        {(product.tagNames ?? product.tags ?? []).length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '2rem' }}>
            {(product.tagNames ?? product.tags ?? []).map(t => (
              <span key={t} style={{
                padding: '5px 12px',
                background: 'rgba(99,215,255,0.08)', border: '1px solid rgba(99,215,255,0.25)',
                borderRadius: 20, fontSize: '0.65rem', fontWeight: 700,
                letterSpacing: '0.08em', color: 'var(--cyan)', textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)',
              }}>{t}</span>
            ))}
          </div>
        )}

        {/* Comments */}
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--line)',
          borderRadius: 'var(--radius-lg)', overflow: 'hidden',
        }}>
          <div style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--line)',
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: '0.9rem', color: 'var(--text)',
          }}>Comments</div>
          <CommentsSection product={product} user={user} />
        </div>
      </main>

      {/* Buy modal */}
      {showBuyModal && (
        <div
          onClick={() => setShowBuyModal(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(5,5,8,0.88)', backdropFilter: 'blur(16px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem', animation: 'overlayIn 0.2s ease both',
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{
            background: 'var(--bg2)', border: '1px solid var(--line2)',
            borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 420,
            overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.85)',
            animation: 'modalIn 0.35s cubic-bezier(.34,1.2,.64,1) both',
          }}>
            <div style={{ height: 3, background: 'linear-gradient(90deg, var(--cyan-dark), var(--violet), var(--cyan))', backgroundSize: '300%', animation: 'shimmer 3s linear infinite' }} />
            <div style={{ padding: '2rem' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.15rem', marginBottom: 4 }}>
                {product.title}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginBottom: '1.5rem' }}>
                by {product.creator}
              </div>
              <audio controls style={{ width: '100%', marginBottom: '1.5rem' }} src={audioUrl}>
                Your browser does not support the audio element.
              </audio>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '1rem', background: 'var(--bg3)', borderRadius: 'var(--radius-md)', marginBottom: '1rem',
              }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>Price</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--cyan)' }}>$</span>{product.price}
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.72rem', color: 'var(--text3)', lineHeight: 1.7 }}>
                  Commercial license included<br />Instant download after payment
                </div>
              </div>
              <div style={{
                padding: '0.7rem 1rem', marginBottom: '1.2rem',
                background: 'rgba(255,165,0,0.06)', border: '1px solid rgba(255,165,0,0.2)',
                borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'rgba(255,200,80,0.8)',
              }}>
                💳 Payment integration coming soon. Contact the creator to arrange purchase.
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => setShowBuyModal(false)} className="btn-ghost"
                  style={{ flex: 1, padding: '0.8rem', justifyContent: 'center' }}>Close</button>
                <button className="btn-primary" disabled
                  style={{ flex: 2, padding: '0.8rem', fontSize: '0.82rem', justifyContent: 'center', opacity: 0.45, cursor: 'not-allowed' }}>
                  Purchase (Coming Soon)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
