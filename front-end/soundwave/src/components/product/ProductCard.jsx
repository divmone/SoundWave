import { useState, useEffect } from 'react';
import Waveform from './Waveform';
import { getProductAudioUrl } from '../../api/services/productsService';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { createCheckoutSession } from '../../api/services/paymentService';
import { getGenerationInfo } from '../../api/services/generateService';
import { loadMethods } from '../../pages/ProfilePage';

function StarRating({ rating }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      {[1,2,3,4,5].map(s => (
        <div key={s} style={{
          width: 6, height: 6, borderRadius: '50%',
          background: s <= Math.round(rating) ? 'var(--cyan)' : 'var(--bg4)',
        }} />
      ))}
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text3)', marginLeft: 4 }}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

export default function ProductCard({ product, user, delay = 0, onOpenProduct, onNavigate }) {
  const [hovered,      setHovered]      = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [purchasing,   setPurchasing]   = useState(false);
  const [purchaseError, setPurchaseError] = useState('');
  const [aiPrompt,     setAiPrompt]     = useState('');
  // payment flow: null = choose, 'cash', 'crypto'
  const [payMethod,    setPayMethod]    = useState(null);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const { playing, toggle, analyser, duration } = useAudioPlayer(product.id);

  const cryptoWallets = user
    ? (loadMethods(user.id) || []).filter(m => m.type === 'crypto')
    : [];

  useEffect(() => {
    if (!product.isAiSlop) return;
    let cancelled = false;
    getGenerationInfo(product.id)
      .then(info => { if (!cancelled) setAiPrompt(info?.prompt ?? ''); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [product.id, product.isAiSlop]);

  const fmtDuration = (s) => {
    if (!s) return null;
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  const audioUrl = getProductAudioUrl(product.id);

  const openBuyModal = (e) => {
    e.stopPropagation();
    if (!user) { onNavigate?.('login'); return; }
    setPurchaseError('');
    setPayMethod(null);
    setSelectedWallet(null);
    setShowBuyModal(true);
  };

  const closeBuyModal = () => {
    if (purchasing) return;
    setShowBuyModal(false);
    setPayMethod(null);
    setSelectedWallet(null);
    setPurchaseError('');
  };

  const handleCashCheckout = async () => {
    setPurchaseError('');
    setPurchasing(true);
    try {
      const res = await createCheckoutSession(user.id, product.id, product.price, 'usd', product.title);
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      } else {
        setPurchaseError(res.errorMessage || 'Failed to create checkout');
      }
    } catch (err) {
      setPurchaseError(err.message || 'Checkout failed');
    } finally {
      setPurchasing(false);
    }
  };

  const handleCryptoCheckout = async () => {
    if (!selectedWallet) { setPurchaseError('Please select a wallet first'); return; }
    setPurchaseError('');
    setPurchasing(true);
    try {
      const res = await createCheckoutSession(
        user.id, product.id, product.price, 'crypto', product.title,
        { walletAddress: selectedWallet.address, network: selectedWallet.network }
      );
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      } else {
        setPurchaseError(res.errorMessage || 'Failed to create crypto checkout');
      }
    } catch (err) {
      setPurchaseError(err.message || 'Checkout failed');
    } finally {
      setPurchasing(false);
    }
  };

  const cardOptionBase = {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)',
    background: 'var(--bg3)', border: '1px solid var(--line2)',
    cursor: 'pointer', transition: 'all 0.18s', width: '100%',
    boxSizing: 'border-box', textAlign: 'left',
  };

  return (
    <>
      {/* ══════════════ BUY MODAL ══════════════ */}
      {showBuyModal && (
        <div
          onClick={closeBuyModal}
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
              {/* Product info */}
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.15rem', marginBottom: 4 }}>
                {product.title}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginBottom: '1.2rem' }}>
                by {product.creator}
              </div>
              <audio controls style={{ width: '100%', marginBottom: '1.2rem' }} src={audioUrl}>
                Your browser does not support the audio element.
              </audio>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.9rem 1rem', background: 'var(--bg3)', borderRadius: 'var(--radius-md)', marginBottom: '1.4rem',
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

              {/* ── STEP 1: Choose method ── */}
              {payMethod === null && (
                <>
                  <div style={{
                    fontSize: '0.7rem', fontWeight: 800, color: 'var(--text3)',
                    fontFamily: 'var(--font-display)', textTransform: 'uppercase',
                    letterSpacing: '0.1em', marginBottom: '0.75rem',
                  }}>Choose payment method</div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.2rem' }}>
                    <button
                      onClick={() => setPayMethod('cash')}
                      style={{ ...cardOptionBase }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--cyan)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--line2)'}
                    >
                      <div style={{
                        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                        background: 'linear-gradient(135deg, rgba(99,215,255,0.15), rgba(155,109,255,0.15))',
                        border: '1px solid var(--line2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
                      }}>💳</div>
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.88rem', color: 'var(--text)', marginBottom: 2 }}>Card / Cash</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>Stripe — card, Apple Pay, Google Pay</div>
                      </div>
                      <svg style={{ marginLeft: 'auto', flexShrink: 0, color: 'var(--text3)' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>

                    <button
                      onClick={() => setPayMethod('crypto')}
                      style={{ ...cardOptionBase }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,180,0,0.5)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--line2)'}
                    >
                      <div style={{
                        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                        background: 'linear-gradient(135deg, rgba(255,180,0,0.15), rgba(255,100,0,0.1))',
                        border: '1px solid var(--line2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
                      }}>₿</div>
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.88rem', color: 'var(--text)', marginBottom: 2 }}>Cryptocurrency</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>
                          {cryptoWallets.length > 0
                            ? `${cryptoWallets.length} wallet${cryptoWallets.length > 1 ? 's' : ''} saved`
                            : 'Add wallets in Profile settings'}
                        </div>
                      </div>
                      <svg style={{ marginLeft: 'auto', flexShrink: 0, color: 'var(--text3)' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                  </div>

                  <button onClick={closeBuyModal} className="btn-ghost" style={{ width: '100%', padding: '0.7rem', justifyContent: 'center', fontSize: '0.8rem' }}>
                    Cancel
                  </button>
                </>
              )}

              {/* ── STEP 2a: Cash ── */}
              {payMethod === 'cash' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.2rem' }}>
                    <button onClick={() => setPayMethod(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: 0, display: 'flex' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.88rem', color: 'var(--text)' }}>💳 Card / Cash</span>
                  </div>
                  {purchaseError && (
                    <div style={{ padding: '0.7rem 1rem', marginBottom: '1rem', background: 'rgba(255,60,60,0.1)', border: '1px solid rgba(255,60,60,0.3)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: '#f66' }}>
                      {purchaseError}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => setPayMethod(null)} className="btn-ghost" disabled={purchasing}
                      style={{ flex: 1, padding: '0.8rem', justifyContent: 'center', opacity: purchasing ? 0.5 : 1 }}>
                      Back
                    </button>
                    <button onClick={handleCashCheckout} disabled={purchasing} className="btn-primary"
                      style={{ flex: 2, padding: '0.8rem', fontSize: '0.82rem', justifyContent: 'center', opacity: purchasing ? 0.7 : 1, cursor: purchasing ? 'wait' : 'pointer' }}>
                      {purchasing ? 'Redirecting...' : `Pay $${product.price}`}
                    </button>
                  </div>
                </>
              )}

              {/* ── STEP 2b: Crypto wallet picker ── */}
              {payMethod === 'crypto' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                    <button onClick={() => { setPayMethod(null); setSelectedWallet(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: 0, display: 'flex' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.88rem', color: 'var(--text)' }}>₿ Select wallet</span>
                  </div>

                  {cryptoWallets.length === 0 ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', background: 'var(--bg3)', borderRadius: 'var(--radius-md)', marginBottom: '1.2rem' }}>
                      <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>🔐</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.88rem', color: 'var(--text)', marginBottom: 6 }}>No wallets saved</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginBottom: '1rem' }}>Add crypto wallets in your Profile to pay with crypto</div>
                      <button onClick={() => { closeBuyModal(); onNavigate?.('profile'); }} className="btn-primary"
                        style={{ padding: '0.5rem 1.2rem', fontSize: '0.78rem' }}>
                        Go to Profile →
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1.2rem', maxHeight: 200, overflowY: 'auto' }}>
                      {cryptoWallets.map(w => {
                        const sel = selectedWallet?.id === w.id;
                        return (
                          <button key={w.id} onClick={() => setSelectedWallet(w)} style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            padding: '0.7rem 0.9rem', borderRadius: 'var(--radius-md)',
                            background: sel ? 'rgba(255,180,0,0.07)' : 'var(--bg3)',
                            border: `1.5px solid ${sel ? 'rgba(255,180,0,0.65)' : 'var(--line)'}`,
                            cursor: 'pointer', transition: 'all 0.15s', width: '100%',
                            boxSizing: 'border-box', textAlign: 'left',
                          }}
                            onMouseEnter={e => { if (!sel) e.currentTarget.style.borderColor = 'rgba(255,180,0,0.35)'; }}
                            onMouseLeave={e => { if (!sel) e.currentTarget.style.borderColor = 'var(--line)'; }}
                          >
                            <div style={{
                              width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                              background: 'linear-gradient(135deg, rgba(255,180,0,0.15), rgba(255,100,0,0.1))',
                              border: '1px solid var(--line2)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
                            }}>₿</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.8rem', color: 'var(--text)', marginBottom: 2 }}>
                                {w.address.slice(0, 8)}…{w.address.slice(-6)}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text3)' }}>{w.network}</div>
                            </div>
                            {sel && (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,180,0,0.9)" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {purchaseError && (
                    <div style={{ padding: '0.7rem 1rem', marginBottom: '1rem', background: 'rgba(255,60,60,0.1)', border: '1px solid rgba(255,60,60,0.3)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: '#f66' }}>
                      {purchaseError}
                    </div>
                  )}

                  {cryptoWallets.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button onClick={() => { setPayMethod(null); setSelectedWallet(null); }} className="btn-ghost" disabled={purchasing}
                        style={{ flex: 1, padding: '0.8rem', justifyContent: 'center', opacity: purchasing ? 0.5 : 1 }}>
                        Back
                      </button>
                      <button onClick={handleCryptoCheckout} disabled={purchasing || !selectedWallet}
                        style={{
                          flex: 2, padding: '0.8rem', fontSize: '0.82rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          borderRadius: 'var(--radius-pill)', border: 'none',
                          fontFamily: 'var(--font-display)', fontWeight: 800,
                          background: selectedWallet ? 'linear-gradient(135deg, rgba(220,140,0,0.95), rgba(255,190,0,0.95))' : 'var(--bg4)',
                          color: selectedWallet ? '#000' : 'var(--text3)',
                          opacity: (purchasing || !selectedWallet) ? 0.6 : 1,
                          cursor: (purchasing || !selectedWallet) ? 'not-allowed' : 'pointer',
                          transition: 'all 0.18s',
                        }}>
                        {purchasing ? 'Processing...' : selectedWallet ? `Pay $${product.price} with crypto` : 'Select a wallet'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ CARD ══════════════ */}
      <div style={{ animation: `cardIn 0.5s cubic-bezier(.22,.68,0,1.1) ${delay}s both`, minWidth: 0, maxWidth: '100%' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onOpenProduct?.(product)}
        style={{
          position: 'relative',
          background: hovered ? 'var(--bg3)' : 'var(--bg2)',
          border: `1px solid ${hovered ? 'rgba(99,215,255,0.2)' : 'var(--line)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          cursor: 'pointer',
          overflow: 'hidden',
          minWidth: 0, maxWidth: '100%',
          transition: 'background 0.25s, border-color 0.25s, box-shadow 0.3s, transform 0.3s, border-radius 0.2s',
          transform: hovered ? 'translateY(-6px)' : 'none',
          boxShadow: hovered
            ? '0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(99,215,255,0.08)'
            : '0 4px 20px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 1,
          background: hovered
            ? 'linear-gradient(90deg, transparent, var(--cyan), var(--violet), var(--cyan), transparent)'
            : 'transparent',
          backgroundSize: '300% 100%',
          animation: hovered ? 'shimmer 2.5s linear infinite' : 'none',
        }} />

        {/* Waveform */}
        <div style={{
          background: 'var(--void)', border: '1px solid var(--line)',
          borderRadius: 10, padding: '10px 12px 11px', marginBottom: '1rem',
          position: 'relative', overflow: 'hidden',
        }}>
          {hovered && (
            <div style={{
              position: 'absolute', top: 0, left: '-50%', width: '200%', height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(99,215,255,0.04), transparent)',
              animation: 'scanH 2.5s linear infinite',
            }} />
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.58rem',
              letterSpacing: '0.18em', fontWeight: 600,
              color: playing ? 'var(--cyan)' : 'var(--text3)', transition: 'color 0.2s',
            }}>
              {playing ? '● PLAYING' : '○ PREVIEW'}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text3)' }}>
              {fmtDuration(duration) ?? fmtDuration(product.durationSeconds) ?? '--:--'}
            </span>
          </div>
          <Waveform analyser={analyser} playing={playing} />
        </div>

        {/* Meta */}
        <div style={{ marginBottom: '0.85rem' }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: '0.98rem', color: 'var(--text)', marginBottom: 3,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{product.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--cyan-dark), var(--violet))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                overflow: 'hidden',
              }}>
                {product.creatorAvatarUrl
                  ? <img src={product.creatorAvatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <svg width="9" height="9" viewBox="0 0 24 24" fill="white">
                      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                    </svg>
                }
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--cyan)', fontWeight: 600 }}>
                {product.creator}
              </span>
            </div>
            {!!product.rating && <StarRating rating={product.rating} />}
          </div>
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: '1rem' }}>
          {(product.tagNames ?? product.tags ?? []).map(t => (
            <span key={t} style={{
              padding: '4px 10px',
              background: 'rgba(99,215,255,0.08)', border: '1px solid rgba(99,215,255,0.25)',
              borderRadius: 20, fontSize: '0.62rem', fontWeight: 700,
              letterSpacing: '0.08em', color: 'var(--cyan)', textTransform: 'uppercase',
              fontFamily: 'var(--font-mono)',
            }}>{t}</span>
          ))}
        </div>

        {/* AI prompt */}
        {product.isAiSlop && aiPrompt && (
          <div style={{
            padding: '6px 10px', marginBottom: '1rem',
            background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: 8, fontSize: '0.72rem', color: 'var(--text2)',
            fontStyle: 'italic',
            display: 'flex', alignItems: 'center', gap: 6,
            minWidth: 0, maxWidth: '100%', overflow: 'hidden',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontStyle: 'normal',
              color: 'var(--violet)', letterSpacing: '0.1em', flexShrink: 0,
            }}>PROMPT</span>
            <span style={{
              flex: 1, minWidth: 0,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>«{aiPrompt}»</span>
          </div>
        )}

        {/* Downloads */}
        {!!product.downloadCount && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text3)' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {product.downloadCount.toLocaleString()} downloads
          </div>
        )}

        {/* Price + actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--line)', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--cyan)', fontWeight: 600 }}>$</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.7rem', fontWeight: 700, letterSpacing: '-0.05em', color: 'var(--text)', lineHeight: 1 }}>
              {product.price}
            </span>
            <span style={{ fontSize: '0.62rem', color: 'var(--text3)', marginLeft: 2 }}>USD</span>
          </div>

          <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
            {/* Play */}
            <button
              onClick={e => { e.stopPropagation(); toggle(); }}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: playing ? 'var(--cyan)' : 'var(--bg4)',
                border: `1px solid ${playing ? 'var(--cyan)' : 'var(--line2)'}`,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s', flexShrink: 0,
                boxShadow: playing ? '0 0 20px var(--cyan-glow)' : 'none',
              }}
            >
              {playing ? (
                <svg width="9" height="9" viewBox="0 0 9 9">
                  <rect x="0" y="0" width="3" height="9" rx="1" fill="#000"/>
                  <rect x="6" y="0" width="3" height="9" rx="1" fill="#000"/>
                </svg>
              ) : (
                <svg width="9" height="9" viewBox="0 0 9 9">
                  <polygon points="1,0 9,4.5 1,9" fill="white"/>
                </svg>
              )}
            </button>

            {/* Buy */}
            <button
              onClick={openBuyModal}
              style={{
                padding: '0 1.2rem', height: 36, borderRadius: 'var(--radius-pill)',
                fontSize: '0.72rem', fontFamily: 'var(--font-display)', fontWeight: 800,
                border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, var(--cyan-dark), var(--cyan))',
                color: '#000', transition: 'all 0.2s',
                boxShadow: '0 4px 16px rgba(99,215,255,0.3)',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.93)'; }}
              onMouseUp={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
            >
              Buy
            </button>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}