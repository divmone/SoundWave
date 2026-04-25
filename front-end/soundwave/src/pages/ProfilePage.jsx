import { useState, useEffect, useCallback, useRef } from 'react';
import { getUserProducts, deleteProduct, getProductAudioUrl } from '../api/services/productsService';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import UploadModal from '../components/product/UploadModal';
import PaymentMethodsPanel from '../components/payment/PaymentMethodsPanel';
import { logoutUser } from '../api/services/authService';
import { isAdminUser } from './AdminPage';

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

const CRYPTO_NETWORKS = ['Bitcoin (BTC)', 'Ethereum (ETH)', 'Solana (SOL)', 'Tron USDT (TRC-20)', 'BNB Chain (BEP-20)'];
const pmKey = (userId) => `sw_payment_methods_${userId}`;

function loadMethods(userId) {
  try { return JSON.parse(localStorage.getItem(pmKey(userId))) ?? []; } catch { return []; }
}

function saveMethods(userId, methods) {
  localStorage.setItem(pmKey(userId), JSON.stringify(methods));
}

const REVEAL_TIMEOUT = 30; // seconds

function PaymentMethodRow({ method, onRemove }) {
  const [confirm, setConfirm] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef(null);
  const isCard = method.type === 'card';

  const handleReveal = () => {
    setRevealed(true);
    setCountdown(REVEAL_TIMEOUT);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(timerRef.current); setRevealed(false); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const maskedNumber = isCard
    ? `•••• •••• •••• ${method.lastFour}`
    : `${method.address.slice(0, 6)}…${method.address.slice(-5)}`;

  const revealedNumber = isCard && method.firstSix
    ? `${method.firstSix.slice(0, 4)} ${method.firstSix.slice(4)}•• •••• ${method.lastFour}`
    : maskedNumber;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '1rem',
      padding: '0.9rem 1.2rem',
      background: 'var(--bg3)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-md)',
      transition: 'border-color 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--line2)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--line)'}
    >
      <div style={{
        width: 38, height: 38, flexShrink: 0,
        borderRadius: 10,
        background: isCard
          ? 'linear-gradient(135deg, rgba(99,215,255,0.15), rgba(155,109,255,0.15))'
          : 'linear-gradient(135deg, rgba(255,180,0,0.15), rgba(255,100,0,0.1))',
        border: '1px solid var(--line2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.1rem',
      }}>
        {isCard ? '💳' : '₿'}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontWeight: 800,
          fontSize: '0.88rem', color: 'var(--text)',
          marginBottom: 2,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          letterSpacing: revealed ? '0.05em' : undefined,
        }}>
          {revealed ? revealedNumber : maskedNumber}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text3)', fontFamily: 'var(--font-body)' }}>
          {isCard
            ? `${method.name} · expires ${method.expiry}${revealed ? ` · hides in ${countdown}s` : ''}`
            : method.network}
        </div>
      </div>

      <span style={{
        fontSize: '0.62rem', fontWeight: 700,
        color: isCard ? 'var(--cyan)' : 'rgba(255,180,0,0.9)',
        background: isCard ? 'rgba(99,215,255,0.08)' : 'rgba(255,180,0,0.08)',
        border: `1px solid ${isCard ? 'rgba(99,215,255,0.2)' : 'rgba(255,180,0,0.2)'}`,
        borderRadius: 20, padding: '2px 10px',
        fontFamily: 'var(--font-mono)', textTransform: 'uppercase', flexShrink: 0,
      }}>
        {isCard ? 'card' : 'crypto'}
      </span>

      {/* Reveal button — только для карт */}
      {isCard && (
        <button
          onClick={() => revealed ? (clearInterval(timerRef.current), setRevealed(false)) : handleReveal()}
          title={revealed ? 'Hide card number' : 'Show card number (PCI DSS: first 6 + last 4)'}
          style={{
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            background: revealed ? 'var(--cyan-dim)' : 'var(--bg4)',
            border: `1px solid ${revealed ? 'var(--line-hot)' : 'var(--line2)'}`,
            color: revealed ? 'var(--cyan)' : 'var(--text3)',
            cursor: 'pointer', fontSize: '0.85rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.18s',
          }}
        >{revealed ? '🙈' : '👁'}</button>
      )}

      <button
        onClick={() => { if (!confirm) { setConfirm(true); return; } onRemove(method.id); }}
        style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: confirm ? 'var(--red-dim)' : 'var(--bg4)',
          border: `1px solid ${confirm ? 'rgba(255,68,102,0.4)' : 'var(--line2)'}`,
          color: confirm ? 'var(--red)' : 'var(--text3)',
          cursor: 'pointer', fontSize: '0.8rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.18s',
        }}
        onMouseEnter={e => { if (!confirm) { e.currentTarget.style.borderColor = 'rgba(255,68,102,0.4)'; e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'var(--red-dim)'; }}}
        onMouseLeave={e => { if (!confirm) { e.currentTarget.style.borderColor = 'var(--line2)'; e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.background = 'var(--bg4)'; }}}
        title={confirm ? 'Click again to remove' : 'Remove'}
      >{confirm ? '!' : '✕'}</button>
    </div>
  );
}

function AddPaymentModal({ onClose, onAdd }) {
  const [tab, setTab] = useState('card');
  const [card, setCard] = useState({ number: '', expiry: '', name: '' });
  const [crypto, setCrypto] = useState({ address: '', network: CRYPTO_NETWORKS[0] });
  const [errors, setErrors] = useState({});
  const overlayRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const setC = k => e => { setCard(f => ({ ...f, [k]: e.target.value })); setErrors(er => ({ ...er, [k]: '' })); };
  const setX = k => e => { setCrypto(f => ({ ...f, [k]: e.target.value })); setErrors(er => ({ ...er, [k]: '' })); };

  const formatCardNumber = (val) => val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (val) => {
    const d = val.replace(/\D/g, '').slice(0, 4);
    return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const handleSubmit = () => {
    const e = {};
    if (tab === 'card') {
      const digits = card.number.replace(/\s/g, '');
      if (digits.length < 16) e.number = 'Enter a valid 16-digit card number';
      if (!/^\d{2}\/\d{2}$/.test(card.expiry)) e.expiry = 'Format: MM/YY';
      if (!card.name.trim()) e.name = 'Cardholder name is required';
      if (Object.keys(e).length) { setErrors(e); return; }
      // PCI DSS: храним только первые 6 и последние 4 цифры, остальное отбрасывается
      onAdd({ type: 'card', firstSix: digits.slice(0, 6), lastFour: digits.slice(-4), expiry: card.expiry, name: card.name.trim(), id: Date.now() });
    } else {
      if (crypto.address.length < 10) e.address = 'Enter a valid wallet address';
      if (Object.keys(e).length) { setErrors(e); return; }
      onAdd({ type: 'crypto', address: crypto.address.trim(), network: crypto.network, id: Date.now() });
    }
    onClose();
  };

  const inputStyle = (hasErr) => ({
    width: '100%', boxSizing: 'border-box',
    background: 'var(--bg3)',
    border: `1.5px solid ${hasErr ? 'var(--red)' : 'var(--line2)'}`,
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text)', fontFamily: 'var(--font-mono)',
    fontSize: '0.9rem', padding: '0.65rem 0.9rem',
    outline: 'none', transition: 'border-color 0.18s',
  });

  const labelStyle = {
    display: 'block', fontSize: '0.68rem', fontWeight: 700,
    color: 'var(--text3)', textTransform: 'uppercase',
    letterSpacing: '0.1em', fontFamily: 'var(--font-display)',
    marginBottom: 6,
  };

  return (
    <div
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(5,5,8,0.82)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        animation: 'overlayIn 0.18s ease',
      }}
    >
      <div style={{
        background: 'var(--bg2)',
        border: '1px solid var(--line2)',
        borderRadius: 'var(--radius-lg)',
        width: '100%', maxWidth: 420,
        overflow: 'hidden',
        animation: 'modalIn 0.22s cubic-bezier(.22,.61,.36,1)',
      }}>
        {/* Header */}
        <div style={{
          height: 3,
          background: 'linear-gradient(90deg, var(--cyan-dark), var(--violet), var(--cyan))',
          backgroundSize: '300%', animation: 'shimmer 3s linear infinite',
        }} />
        <div style={{ padding: '1.5rem 1.5rem 0' }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: '1rem', color: 'var(--text)', marginBottom: '1.2rem',
          }}>Add payment method</div>

          {/* Tabs */}
          <div style={{
            display: 'flex', gap: 8, marginBottom: '1.4rem',
            background: 'var(--bg3)', borderRadius: 'var(--radius-sm)',
            padding: 4,
          }}>
            {['card', 'crypto'].map(t => (
              <button key={t} onClick={() => { setTab(t); setErrors({}); }} style={{
                flex: 1, padding: '0.45rem',
                borderRadius: 8, border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-display)', fontWeight: 800,
                fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em',
                background: tab === t ? 'var(--bg2)' : 'transparent',
                color: tab === t ? 'var(--cyan)' : 'var(--text3)',
                border: tab === t ? '1px solid var(--line2)' : '1px solid transparent',
                transition: 'all 0.18s',
              }}>
                {t === 'card' ? '💳 Card' : '₿ Crypto'}
              </button>
            ))}
          </div>

          {/* Card form */}
          {tab === 'card' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Card number</label>
                <input
                  style={inputStyle(errors.number)}
                  placeholder="1234 5678 9012 3456"
                  value={card.number}
                  onChange={e => { setCard(f => ({ ...f, number: formatCardNumber(e.target.value) })); setErrors(er => ({ ...er, number: '' })); }}
                  onFocus={e => e.target.style.borderColor = 'var(--cyan)'}
                  onBlur={e => e.target.style.borderColor = errors.number ? 'var(--red)' : 'var(--line2)'}
                  maxLength={19}
                />
                {errors.number && <div style={{ color: 'var(--red)', fontSize: '0.72rem', marginTop: 4 }}>{errors.number}</div>}
              </div>
              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Expiry</label>
                  <input
                    style={inputStyle(errors.expiry)}
                    placeholder="MM/YY"
                    value={card.expiry}
                    onChange={e => { setCard(f => ({ ...f, expiry: formatExpiry(e.target.value) })); setErrors(er => ({ ...er, expiry: '' })); }}
                    onFocus={e => e.target.style.borderColor = 'var(--cyan)'}
                    onBlur={e => e.target.style.borderColor = errors.expiry ? 'var(--red)' : 'var(--line2)'}
                    maxLength={5}
                  />
                  {errors.expiry && <div style={{ color: 'var(--red)', fontSize: '0.72rem', marginTop: 4 }}>{errors.expiry}</div>}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Cardholder name</label>
                <input
                  style={inputStyle(errors.name)}
                  placeholder="JOHN DOE"
                  value={card.name}
                  onChange={setC('name')}
                  onFocus={e => e.target.style.borderColor = 'var(--cyan)'}
                  onBlur={e => e.target.style.borderColor = errors.name ? 'var(--red)' : 'var(--line2)'}
                />
                {errors.name && <div style={{ color: 'var(--red)', fontSize: '0.72rem', marginTop: 4 }}>{errors.name}</div>}
              </div>
            </div>
          )}

          {/* Crypto form */}
          {tab === 'crypto' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Network</label>
                <select
                  value={crypto.network}
                  onChange={setX('network')}
                  style={{ ...inputStyle(false), cursor: 'pointer' }}
                >
                  {CRYPTO_NETWORKS.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Wallet address</label>
                <input
                  style={inputStyle(errors.address)}
                  placeholder="0x... or bc1..."
                  value={crypto.address}
                  onChange={setX('address')}
                  onFocus={e => e.target.style.borderColor = 'var(--cyan)'}
                  onBlur={e => e.target.style.borderColor = errors.address ? 'var(--red)' : 'var(--line2)'}
                />
                {errors.address && <div style={{ color: 'var(--red)', fontSize: '0.72rem', marginTop: 4 }}>{errors.address}</div>}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '1.4rem 1.5rem', display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
          <button className="btn-ghost" onClick={onClose} style={{ padding: '0.5rem 1.2rem', fontSize: '0.8rem' }}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSubmit} style={{ padding: '0.5rem 1.4rem', fontSize: '0.8rem' }}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage({ user, onNavigate, onLogout: onLogoutProp, login }) {
  const [sounds, setSounds]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [modal, setModal]         = useState(false);
  const [payModal, setPayModal]   = useState(false);
  const [methods, setMethods]     = useState(() => loadMethods(user?.id));

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

  const handleAddMethod = (method) => {
    const updated = [...methods, method];
    setMethods(updated);
    saveMethods(user?.id, updated);
  };

  const handleRemoveMethod = (id) => {
    const updated = methods.filter(m => m.id !== id);
    setMethods(updated);
    saveMethods(user?.id, updated);
  };

  const totalEarnings = sounds.reduce((sum, s) => {
    const p = parseFloat(s.price);
    return sum + (isNaN(p) ? 0 : p);
  }, 0);

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
                overflow: 'hidden',
              }}>
                {user?.avatar_url
                  ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : initials}
              </div>

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

              {/* Admin + Logout */}
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                {isAdminUser(user) && (
                  <button
                    onClick={() => onNavigate?.('admin')}
                    style={{
                      padding: '0.5rem 1.2rem', fontSize: '0.78rem',
                      background: 'var(--red-dim)', border: '1px solid rgba(255,68,102,0.35)',
                      color: 'var(--red)', borderRadius: 'var(--radius-pill)',
                      fontFamily: 'var(--font-display)', fontWeight: 800,
                      cursor: 'pointer', transition: 'all 0.18s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,68,102,0.18)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--red-dim)'}
                  >
                    Admin panel
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="btn-ghost"
                  style={{ padding: '0.5rem 1.2rem', fontSize: '0.78rem' }}
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <StatCard label="Uploads" value={loading ? '—' : sounds.length} />
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
{/* Payment methods section */}
          <PaymentMethodsPanel user={user} />

      </main>

      <Footer />
    </div>
  );
}
