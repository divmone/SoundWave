import { useState } from 'react';
import Waveform from './Waveform';
import { purchaseProduct } from '../api/products';

function StarRating({ rating }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      {[1,2,3,4,5].map(s => (
        <div key={s} style={{
          width: 6, height: 6, borderRadius: '50%',
          background: s <= Math.round(rating) ? 'var(--cyan)' : 'var(--bg4)',
        }} />
      ))}
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.58rem',
        color: 'var(--text3)', marginLeft: 4,
      }}>{rating.toFixed(1)}</span>
    </div>
  );
}

export default function ProductCard({ product, delay = 0 }) {
  const [hovered, setHovered] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [buying, setBuying]   = useState(false);
  const [bought, setBought]   = useState(false);

  const handleBuy = async (e) => {
    e.stopPropagation();
    setBuying(true);
    try {
      await purchaseProduct(product.id, {
        email: 'user@example.com',       // подставить из auth
        paymentMethodId: 'pm_mock_test', // подставить из Stripe
      });
      setBought(true);
      setTimeout(() => setBought(false), 3000);
    } catch (err) {
      console.error('Purchase failed:', err);
    } finally {
      setBuying(false);
    }
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); }}
      style={{
        position: 'relative',
        background: hovered ? 'var(--bg3)' : 'var(--bg2)',
        border: `1px solid ${hovered ? 'rgba(99,215,255,0.2)' : 'var(--line)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        cursor: 'default',
        overflow: 'hidden',
        transition: 'background 0.25s, border-color 0.25s, box-shadow 0.3s, transform 0.3s',
        transform: hovered ? 'translateY(-6px)' : 'none',
        boxShadow: hovered
          ? '0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(99,215,255,0.08)'
          : '0 4px 20px rgba(0,0,0,0.5)',
        animation: `cardIn 0.5s cubic-bezier(.22,.68,0,1.1) ${delay}s both`,
      }}
    >
      {/* Featured badge */}
      {product.isFeatured && (
        <div style={{
          position: 'absolute', top: 14, right: 14,
          padding: '3px 10px',
          background: 'linear-gradient(90deg, var(--cyan-dark), var(--violet))',
          borderRadius: 20,
          fontSize: '0.58rem', fontWeight: 700,
          fontFamily: 'var(--font-mono)', letterSpacing: '0.1em',
          color: '#fff',
          zIndex: 2,
        }}>★ FEATURED</div>
      )}

      {/* Top glow on hover */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: hovered
          ? 'linear-gradient(90deg, transparent, var(--cyan), var(--violet), var(--cyan), transparent)'
          : 'transparent',
        backgroundSize: '300% 100%',
        animation: hovered ? 'shimmer 2.5s linear infinite' : 'none',
        transition: 'opacity 0.3s',
      }} />

      {/* Corner accent */}
      <div style={{
        position: 'absolute', bottom: 0, right: 0,
        width: 60, height: 60,
        background: hovered
          ? 'radial-gradient(circle at bottom right, rgba(99,215,255,0.1), transparent 70%)'
          : 'transparent',
        pointerEvents: 'none',
        transition: 'all 0.3s',
      }} />

      {/* Waveform area */}
      <div style={{
        background: 'var(--void)',
        border: '1px solid var(--line)',
        borderRadius: 10,
        padding: '10px 12px 11px',
        marginBottom: '1rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Scanline effect on hover */}
        {hovered && (
          <div style={{
            position: 'absolute', top: 0, left: '-50%',
            width: '200%', height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(99,215,255,0.04), transparent)',
            animation: 'scanH 2.5s linear infinite',
          }} />
        )}

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 8,
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.58rem',
            letterSpacing: '0.18em', fontWeight: 600,
            color: playing ? 'var(--cyan)' : 'var(--text3)',
            transition: 'color 0.2s',
          }}>
            {playing ? '● PLAYING' : '○ PREVIEW'}
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.58rem',
            color: 'var(--text3)',
          }}>0:{String(product.duration || 8).padStart(2,'0')}</span>
        </div>
        <Waveform bars={product.bars} playing={playing} />
      </div>

      {/* Meta */}
      <div style={{ marginBottom: '0.85rem' }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: '0.98rem', letterSpacing: '-0.01em',
          color: 'var(--text)', marginBottom: 3,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{product.title}</div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
            color: 'var(--text3)',
          }}>{product.creator}</span>
          {product.rating && <StarRating rating={product.rating} />}
        </div>
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: '1rem' }}>
        {product.tags.map(t => (
          <span key={t} style={{
            padding: '3px 9px',
            background: 'var(--bg4)',
            border: '1px solid var(--line)',
            borderRadius: 4,
            fontSize: '0.6rem', fontWeight: 600,
            letterSpacing: '0.1em', color: 'var(--text3)',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-mono)',
          }}>{t}</span>
        ))}
      </div>

      {/* Downloads count */}
      {product.downloadCount && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          marginBottom: '1rem',
          fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text3)',
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          {product.downloadCount.toLocaleString()} downloads
        </div>
      )}

      {/* Price + actions */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderTop: '1px solid var(--line)',
        paddingTop: '1rem', marginTop: 'auto',
      }}>
        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
            color: 'var(--cyan)', fontWeight: 600,
          }}>$</span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '1.7rem',
            fontWeight: 700, letterSpacing: '-0.05em',
            color: 'var(--text)',
            lineHeight: 1,
          }}>{product.price}</span>
          <span style={{ fontSize: '0.62rem', color: 'var(--text3)', marginLeft: 2 }}>USD</span>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
          {/* Play */}
          <button
            onClick={e => { e.stopPropagation(); setPlaying(p => !p); }}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: playing ? 'var(--cyan)' : 'var(--bg4)',
              border: `1px solid ${playing ? 'var(--cyan)' : 'var(--line2)'}`,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
              boxShadow: playing ? '0 0 20px var(--cyan-glow)' : 'none',
              flexShrink: 0,
            }}
          >
            {playing ? (
              <svg width="9" height="9" viewBox="0 0 9 9">
                <rect x="0" y="0" width="3" height="9" rx="1" fill={playing ? '#000' : 'white'}/>
                <rect x="6" y="0" width="3" height="9" rx="1" fill={playing ? '#000' : 'white'}/>
              </svg>
            ) : (
              <svg width="9" height="9" viewBox="0 0 9 9">
                <polygon points="1,0 9,4.5 1,9" fill="white"/>
              </svg>
            )}
          </button>

          {/* Buy */}
          <button
            onClick={handleBuy}
            disabled={buying || bought}
            style={{
              padding: '0 1.2rem', height: 36, borderRadius: 'var(--radius-pill)',
              fontSize: '0.72rem', fontFamily: 'var(--font-display)',
              fontWeight: 800,
              border: 'none', cursor: buying ? 'wait' : 'pointer',
              background: bought
                ? 'linear-gradient(135deg, #16a34a, var(--green))'
                : 'linear-gradient(135deg, var(--cyan-dark), var(--cyan))',
              color: '#000',
              transition: 'all 0.2s',
              boxShadow: bought ? '0 0 20px rgba(34,211,122,0.4)' : '0 4px 16px rgba(99,215,255,0.3)',
              opacity: buying ? 0.7 : 1,
              transform: 'scale(1)',
            }}
            onMouseEnter={e => { if (!buying && !bought) e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.93)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
          >
            {bought ? '✓ Done' : buying ? '...' : 'Buy'}
          </button>
        </div>
      </div>
    </div>
  );
}
