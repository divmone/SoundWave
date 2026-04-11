import { useState, useEffect, useCallback } from 'react';
import { getProducts, deleteProduct } from '../api/services/productsService';
import { getStats } from '../api/services/statsService';
import { getUserById } from '../api/services/authService';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import Header from '../components/layout/Header';

// ── Список email-адресов с доступом к админке ──────────────
const ADMIN_EMAILS = [
  'dimasston99@gmail.com',
  'dimoon.amid05@gmail.com',
  'kakadel02@gmail.com'
  // добавь сюда другие почты при необходимости
];

export function isAdminUser(user) {
  return !!user && ADMIN_EMAILS.includes(user.email);
}

// ── Хук ширины экрана ──────────────────────────────────────
function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [breakpoint]);
  return isMobile;
}

// ── Helpers ────────────────────────────────────────────────
function Pill({ children, color = 'cyan' }) {
  const colors = {
    cyan:   { bg: 'rgba(99,215,255,0.08)',   border: 'rgba(99,215,255,0.25)',   text: 'var(--cyan)' },
    red:    { bg: 'rgba(255,68,102,0.08)',   border: 'rgba(255,68,102,0.25)',   text: 'var(--red)' },
    violet: { bg: 'rgba(155,109,255,0.08)',  border: 'rgba(155,109,255,0.25)',  text: 'var(--violet)' },
    green:  { bg: 'rgba(34,211,122,0.08)',   border: 'rgba(34,211,122,0.25)',   text: 'var(--green)' },
  };
  const c = colors[color];
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 20,
      background: c.bg, border: `1px solid ${c.border}`,
      color: c.text, fontSize: '0.62rem', fontWeight: 700,
      fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase',
    }}>{children}</span>
  );
}

function StatCard({ label, value, color = 'cyan' }) {
  const textColor = color === 'red' ? 'var(--red)' : color === 'violet' ? 'var(--violet)' : color === 'green' ? 'var(--green)' : 'var(--cyan)';
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--line2)',
      borderRadius: 'var(--radius-md)', padding: '1.25rem 1.5rem', flex: 1, minWidth: 130,
    }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text3)', marginBottom: 8, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 700, color: textColor, lineHeight: 1 }}>
        {value ?? '—'}
      </div>
    </div>
  );
}

// ── Аватар автора ──────────────────────────────────────────
function Avatar({ url, size = 24 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, var(--cyan-dark), var(--violet))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {url
        ? <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
          </svg>
      }
    </div>
  );
}

// ── Кнопка Play ────────────────────────────────────────────
function PlayBtn({ playing, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        background: playing ? 'var(--cyan)' : 'var(--bg4)',
        border: `1px solid ${playing ? 'var(--cyan)' : 'var(--line2)'}`,
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.18s',
        boxShadow: playing ? '0 0 14px var(--cyan-glow)' : 'none',
      }}
    >
      {playing
        ? <svg width="8" height="8" viewBox="0 0 8 8"><rect x="0" y="0" width="3" height="8" rx="1" fill="#000"/><rect x="5" y="0" width="3" height="8" rx="1" fill="#000"/></svg>
        : <svg width="8" height="8" viewBox="0 0 8 8"><polygon points="1,0 8,4 1,8" fill="white"/></svg>
      }
    </button>
  );
}

// ── Строка таблицы (десктоп) ───────────────────────────────
function SoundRow({ p, onDelete, deleting }) {
  const { playing, toggle } = useAudioPlayer(p.id);
  const fmtDur = (s) => s ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : '—';

  return (
    <tr
      style={{ borderBottom: '1px solid var(--line)', transition: 'background 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <td style={{ padding: '0.65rem 1rem', color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>#{p.id}</td>

      <td style={{ padding: '0.65rem 1rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.82rem', color: 'var(--text)' }}>{p.title}</span>
      </td>

      <td style={{ padding: '0.65rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Avatar url={p.creatorAvatarUrl} size={24} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--cyan)' }}>{p.creatorName}</span>
        </div>
      </td>

      <td style={{ padding: '0.65rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text)' }}>${p.price}</td>

      <td style={{ padding: '0.65rem 1rem' }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {(p.tagNames ?? []).slice(0, 3).map(t => <Pill key={t}>{t}</Pill>)}
        </div>
      </td>

      <td style={{ padding: '0.65rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text3)' }}>
        {fmtDur(p.durationSeconds)}
      </td>

      <td style={{ padding: '0.65rem 0.5rem' }}>
        <PlayBtn playing={playing} onToggle={toggle} />
      </td>

      <td style={{ padding: '0.65rem 1rem' }}>
        <button
          onClick={() => onDelete(p.id)}
          disabled={deleting === p.id}
          style={{
            padding: '5px 14px', borderRadius: 8,
            background: 'var(--red-dim)', border: '1px solid rgba(255,68,102,0.3)',
            color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
            fontWeight: 700, cursor: deleting === p.id ? 'not-allowed' : 'pointer',
            opacity: deleting === p.id ? 0.5 : 1, transition: 'all 0.15s',
          }}
        >
          {deleting === p.id ? '...' : 'Delete'}
        </button>
      </td>
    </tr>
  );
}

// ── Карточка (мобайл) ──────────────────────────────────────
function SoundCard({ p, onDelete, deleting }) {
  const { playing, toggle } = useAudioPlayer(p.id);
  const fmtDur = (s) => s ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : null;

  return (
    <div style={{
      background: 'var(--bg3)', border: '1px solid var(--line)',
      borderRadius: 'var(--radius-md)', padding: '0.9rem',
      display: 'flex', flexDirection: 'column', gap: '0.6rem',
    }}>
      {/* Top row: avatar + name + price + play */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <Avatar url={p.creatorAvatarUrl} size={28} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--cyan)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {p.creatorName}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text2)', flexShrink: 0 }}>
          ${p.price}
        </span>
        <PlayBtn playing={playing} onToggle={toggle} />
      </div>

      {/* Title + id */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {p.title}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text3)', flexShrink: 0 }}>#{p.id}</span>
      </div>

      {/* Tags + duration + delete */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flex: 1 }}>
          {(p.tagNames ?? []).slice(0, 3).map(t => <Pill key={t}>{t}</Pill>)}
        </div>
        {fmtDur(p.durationSeconds) && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text3)', flexShrink: 0 }}>
            {fmtDur(p.durationSeconds)}
          </span>
        )}
        <button
          onClick={() => onDelete(p.id)}
          disabled={deleting === p.id}
          style={{
            padding: '4px 12px', borderRadius: 8,
            background: 'var(--red-dim)', border: '1px solid rgba(255,68,102,0.3)',
            color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
            fontWeight: 700, cursor: deleting === p.id ? 'not-allowed' : 'pointer',
            opacity: deleting === p.id ? 0.5 : 1, transition: 'all 0.15s', flexShrink: 0,
          }}
        >
          {deleting === p.id ? '...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}

// ── Таб: Звуки ─────────────────────────────────────────────
function SoundsTab() {
  const [sounds,   setSounds]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [deleting, setDeleting] = useState(null);
  const isMobile = useIsMobile();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const first = await getProducts({ page: 1 });
      const total = first?.total ?? 0;
      const PAGE_SIZE = 9;
      const totalPages = total > 0 ? Math.ceil(total / PAGE_SIZE) : 1;

      let allItems = first?.items ?? [];
      if (totalPages > 1 && allItems.length < total) {
        const rest = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, i) =>
            getProducts({ page: i + 2 }).catch(() => ({ items: [], total: 0 }))
          )
        );
        rest.forEach(r => { allItems = allItems.concat(r?.items ?? []); });
      }

      const uniqueIds = [...new Set(allItems.map(p => p.authorId).filter(Boolean))];
      const userMap = {};
      await Promise.allSettled(
        uniqueIds.map(id =>
          getUserById(id)
            .then(u => { userMap[id] = { username: u?.username ?? String(id), avatar_url: u?.avatar_url ?? '' }; })
            .catch(() => { userMap[id] = { username: String(id), avatar_url: '' }; })
        )
      );
      setSounds(allItems.map(p => ({
        ...p,
        creatorName:      p.authorId ? (userMap[p.authorId]?.username ?? p.creator ?? '—') : (p.creator ?? '—'),
        creatorAvatarUrl: p.authorId ? (userMap[p.authorId]?.avatar_url ?? '') : '',
      })));
    } catch (e) {
      console.error('[AdminPage] load error:', e);
      setError(e.message || 'Failed to load sounds');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete sound #${id}?`)) return;
    setDeleting(id);
    try {
      await deleteProduct(id);
      setSounds(s => s.filter(p => p.id !== id));
    } catch (e) {
      alert('Delete failed: ' + e.message);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
      <span style={{ width: 32, height: 32, border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--cyan)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
    </div>
  );

  if (error) return (
    <div style={{ padding: '1.5rem', background: 'var(--red-dim)', border: '1px solid rgba(255,68,102,0.3)', borderRadius: 'var(--radius-md)', color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
      Error: {error}
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text3)' }}>
        Total: <span style={{ color: 'var(--text)' }}>{sounds.length}</span>
      </div>

      {isMobile ? (
        // ── Мобайл: карточки ──
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {sounds.map(p => (
            <SoundCard key={p.id} p={p} onDelete={handleDelete} deleting={deleting} />
          ))}
        </div>
      ) : (
        // ── Десктоп: таблица ──
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line2)', color: 'var(--text3)' }}>
                {['ID', 'Title', 'Author', 'Price', 'Tags', 'Duration', '', ''].map((h, i) => (
                  <th key={i} style={{ padding: '0.6rem 1rem', textAlign: 'left', fontWeight: 600, letterSpacing: '0.06em', fontSize: '0.62rem', textTransform: 'uppercase', color: 'var(--text3)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sounds.map(p => (
                <SoundRow key={p.id} p={p} onDelete={handleDelete} deleting={deleting} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Таб: Статистика ────────────────────────────────────────
function StatsTab() {
  const [stats,   setStats]   = useState(null);
  const [total,   setTotal]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getStats().catch(() => null),
      getProducts({ page: 1 }).then(r => r?.total ?? 0).catch(() => 0),
    ]).then(([s, t]) => {
      setStats(s);
      setTotal(t);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
      <span style={{ width: 32, height: 32, border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--cyan)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <StatCard label="Total sounds"  value={total}            color="cyan"   />
        <StatCard label="Creators"      value={stats?.creators}  color="violet" />
        <StatCard label="Listeners"     value={stats?.streamers} color="cyan"   />
        <StatCard label="Sales"         value={stats?.paid}      color="green"  />
      </div>
    </div>
  );
}

// ── Главная страница ───────────────────────────────────────
export default function AdminPage({ user, onNavigate, onLogout }) {
  const [tab, setTab] = useState('sounds');
  const isMobile = useIsMobile();

  const tabs = [
    { id: 'sounds', label: 'Sounds' },
    { id: 'stats',  label: 'Statistics' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <Header onNavigate={onNavigate} user={user} onLogout={onLogout} onUploadClick={() => {}} />

      <main style={{
        flex: 1, maxWidth: 1200, width: '100%',
        margin: '0 auto',
        padding: isMobile ? '1rem' : '2rem',
        boxSizing: 'border-box',
      }}>

        {/* Заголовок */}
        <div style={{ marginBottom: isMobile ? '1.25rem' : '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text3)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Admin Panel
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: isMobile ? '1.4rem' : '1.8rem', color: 'var(--text)', margin: 0 }}>
            Management
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text3)', marginTop: 4, marginBottom: 0 }}>
            {user?.email}
          </p>
        </div>

        {/* Табы */}
        <div style={{ display: 'flex', gap: 4, marginBottom: '1.5rem', borderBottom: '1px solid var(--line2)' }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: isMobile ? '0.5rem 1rem' : '0.6rem 1.25rem',
                background: 'none', border: 'none',
                borderBottom: tab === t.id ? '2px solid var(--cyan)' : '2px solid transparent',
                color: tab === t.id ? 'var(--cyan)' : 'var(--text3)',
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: isMobile ? '0.8rem' : '0.85rem',
                cursor: 'pointer', transition: 'all 0.15s', marginBottom: -1,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Контент */}
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--line2)',
          borderRadius: 'var(--radius-lg)',
          padding: isMobile ? '1rem' : '1.5rem',
        }}>
          {tab === 'sounds' && <SoundsTab />}
          {tab === 'stats'  && <StatsTab />}
        </div>
      </main>
    </div>
  );
}
