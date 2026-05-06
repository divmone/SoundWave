import { useState, useEffect, useCallback, useRef } from 'react';
import { getProducts, deleteProduct } from '../api/services/productsService';
import { getStats } from '../api/services/statsService';
import { getUserById } from '../api/services/authService';
import { auth, storage } from '../api/httpClient';
import Header from '../components/layout/Header';

// ── Доступ к админке ──────────────────────────────────────────
const ADMIN_EMAILS = [
  'dimasston99@gmail.com',
  'dimoon.amid05@gmail.com',
  'kadakel02@gmail.com',
];
export function isAdminUser(user) {
  return !!user && ADMIN_EMAILS.includes(user.email);
}

// ─────────────────────────────────────────────────────────────
//  API CALLS — реальные запросы к бэку (null = эндпоинт не готов)
// ─────────────────────────────────────────────────────────────
async function fetchAllUsers() {
  try {
    const data = await auth.get('/admin/users');
    return Array.isArray(data) ? data : (data?.users ?? []);
  } catch { return null; }
}
async function fetchReports() {
  try {
    const data = await storage.get('/admin/reports');
    return Array.isArray(data) ? data : (data?.reports ?? []);
  } catch { return null; }
}
async function fetchLog() {
  try {
    const data = await storage.get('/admin/activity-log');
    return Array.isArray(data) ? data : (data?.log ?? []);
  } catch { return null; }
}
async function fetchOnlineCount() {
  try {
    const data = await storage.get('/admin/online-count');
    return data?.count ?? data?.online ?? null;
  } catch { return null; }
}
async function fetchActivityChart() {
  try {
    return await storage.get('/admin/activity-chart?days=7');
  } catch { return null; }
}
async function banUserReq(id)   { return auth.patch(`/admin/users/${id}/ban`, {}); }
async function unbanUserReq(id) { return auth.patch(`/admin/users/${id}/unban`, {}); }
async function resolveReportReq(id, action) {
  return storage.post(`/admin/reports/${id}/resolve`, { action });
}

// ─────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────
function useIsMobile(bp = 640) {
  const [v, setV] = useState(() => window.innerWidth < bp);
  useEffect(() => {
    const h = () => setV(window.innerWidth < bp);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [bp]);
  return v;
}

const fmtDur = (s) => s ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : '—';

const S = {
  bg: '#0d0d12', bg2: '#13131a', bg3: '#1a1a24', bg4: '#22222f',
  line: 'rgba(255,255,255,0.06)', line2: 'rgba(255,255,255,0.1)',
  text: '#f0f0f8', text2: '#7878a0', text3: '#40405a',
  cyan: '#63d7ff', cyanDim: 'rgba(99,215,255,0.15)', cyanGlow: 'rgba(99,215,255,0.35)', cyanDark: '#1e9ecb',
  violet: '#9b6dff', violetDim: 'rgba(155,109,255,0.12)',
  red: '#ff4466', redDim: 'rgba(255,68,102,0.15)',
  green: '#22d37a', greenDim: 'rgba(34,211,122,0.15)',
  fontD: "'Nunito', sans-serif", fontM: "'Space Grotesk', sans-serif", fontB: "'Nunito Sans', sans-serif",
};

function Pill({ children, color = 'cyan' }) {
  const map = {
    cyan:   { bg: S.cyanDim,   border: 'rgba(99,215,255,.25)',  text: S.cyan },
    red:    { bg: S.redDim,    border: 'rgba(255,68,102,.25)',  text: S.red },
    violet: { bg: S.violetDim, border: 'rgba(155,109,255,.25)', text: S.violet },
    green:  { bg: S.greenDim,  border: 'rgba(34,211,122,.25)',  text: S.green },
    gray:   { bg: 'rgba(255,255,255,.05)', border: S.line2, text: S.text3 },
  };
  const c = map[color] ?? map.gray;
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 20,
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      fontSize: '0.6rem', fontWeight: 700, fontFamily: S.fontM,
      letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

function tagColor(t) {
  if (['trap','drill','808','hard','uk','dark'].includes(t)) return 'red';
  if (['lofi','chill','ambient','space'].includes(t)) return 'violet';
  if (['house','edm'].includes(t)) return 'cyan';
  return 'gray';
}
function roleColor(r) {
  return r === 'admin' ? 'red' : r === 'creator' ? 'cyan' : 'gray';
}

function SkeletonRow({ cols = 6 }) {
  return (
    <tr style={{ borderBottom: `1px solid ${S.line}` }}>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '0.8rem 1rem' }}>
          <div style={{
            height: 12, borderRadius: 6, width: i === 0 ? 40 : i === 1 ? 140 : 80,
            background: `linear-gradient(90deg, ${S.bg3} 25%, ${S.bg4} 50%, ${S.bg3} 75%)`,
            backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
          }} />
        </td>
      ))}
    </tr>
  );
}

function StatCard({ label, value, color = 'cyan', delta, loading }) {
  const colors = { cyan: S.cyan, violet: S.violet, green: S.green, red: S.red };
  const tc = colors[color] ?? S.cyan;
  return (
    <div style={{
      background: S.bg2, border: `1px solid ${S.line2}`, borderRadius: 14,
      padding: '1.25rem 1.5rem', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${tc}, transparent)` }} />
      <div style={{ fontFamily: S.fontM, fontSize: '0.6rem', color: S.text3,
        marginBottom: 8, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</div>
      {loading ? (
        <div style={{ height: 32, borderRadius: 6, width: 80,
          background: `linear-gradient(90deg, ${S.bg3} 25%, ${S.bg4} 50%, ${S.bg3} 75%)`,
          backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
      ) : (
        <div style={{ fontFamily: S.fontM, fontSize: '2rem', fontWeight: 700, color: tc, lineHeight: 1 }}>
          {value ?? '—'}
        </div>
      )}
      {delta && !loading && (
        <div style={{ fontFamily: S.fontM, fontSize: '.65rem',
          color: delta.startsWith('↑') ? S.green : S.red, marginTop: 4 }}>{delta}</div>
      )}
    </div>
  );
}

function Avatar({ name = '', size = 24 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(135deg, ${S.cyanDark}, ${S.violet})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.32 + 'px', fontWeight: 800, color: '#000', fontFamily: S.fontM,
    }}>
      {String(name).slice(0, 2).toUpperCase() || '?'}
    </div>
  );
}

function Spin({ size = 28 }) {
  return (
    <span style={{
      width: size, height: size, border: '2px solid rgba(255,255,255,.08)',
      borderTopColor: S.cyan, borderRadius: '50%', animation: 'spin 0.8s linear infinite',
      display: 'inline-block',
    }} />
  );
}

function SearchInput({ placeholder, value, onChange }) {
  return (
    <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
      <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
        width: 14, height: 14, color: S.text3, pointerEvents: 'none' }}
        viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="7" cy="7" r="5"/><path d="M11 11l3 3"/>
      </svg>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{
          width: '100%', background: S.bg3, border: `1px solid ${S.line2}`, borderRadius: 10,
          padding: '.52rem 1rem .52rem 2.3rem', color: S.text, fontFamily: S.fontM,
          fontSize: '.76rem', outline: 'none',
        }} />
    </div>
  );
}

function NotReadyNote({ endpoint }) {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <div style={{ fontFamily: S.fontM, fontSize: '.78rem', color: S.text3, marginBottom: '.4rem' }}>
        ⚙️ Эндпоинт <code style={{ color: S.cyan, background: S.bg3, padding: '2px 8px', borderRadius: 6 }}>
          {endpoint}
        </code> ещё не готов на бэке
      </div>
      <div style={{ fontFamily: S.fontM, fontSize: '.68rem', color: S.text3 }}>
        Как только появится — данные загрузятся автоматически
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  SPARKLINE CHART (canvas, без зависимостей)
// ─────────────────────────────────────────────────────────────
function SparkChart({ uploadsData, salesData, labels }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const W = canvas.offsetWidth; const H = canvas.offsetHeight;
    canvas.width = W * devicePixelRatio; canvas.height = H * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    const all = [...uploadsData, ...salesData];
    const max = Math.max(...all, 1);
    const pad = { t: 10, b: 28, l: 8, r: 8 };
    const gW = W - pad.l - pad.r; const gH = H - pad.t - pad.b;
    const n = uploadsData.length;
    const xP = (i) => pad.l + (i / (n - 1)) * gW;
    const yP = (v) => pad.t + gH - (v / max) * gH;
    const drawLine = (data, color) => {
      ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.lineJoin = 'round';
      data.forEach((v, i) => i === 0 ? ctx.moveTo(xP(i), yP(v)) : ctx.lineTo(xP(i), yP(v)));
      ctx.stroke();
      ctx.beginPath();
      data.forEach((v, i) => i === 0 ? ctx.moveTo(xP(i), yP(v)) : ctx.lineTo(xP(i), yP(v)));
      ctx.lineTo(xP(n - 1), pad.t + gH); ctx.lineTo(xP(0), pad.t + gH); ctx.closePath();
      const grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + gH);
      grad.addColorStop(0, color + '30'); grad.addColorStop(1, color + '00');
      ctx.fillStyle = grad; ctx.fill();
      data.forEach((v, i) => {
        ctx.beginPath(); ctx.arc(xP(i), yP(v), 3, 0, Math.PI * 2);
        ctx.fillStyle = color; ctx.fill();
      });
    };
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1;
    [0.25, 0.5, 0.75, 1].forEach(r => {
      const y = pad.t + gH * r;
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(pad.l + gW, y); ctx.stroke();
    });
    drawLine(uploadsData, '#63d7ff');
    drawLine(salesData, '#9b6dff');
    ctx.fillStyle = S.text3; ctx.font = `10px 'Space Grotesk', sans-serif`; ctx.textAlign = 'center';
    labels.forEach((l, i) => ctx.fillText(l, xP(i), H - 6));
  }, [uploadsData, salesData, labels]);
  return <canvas ref={ref} style={{ width: '100%', height: '100%' }} />;
}

// ─────────────────────────────────────────────────────────────
//  TAB: SOUNDS
// ─────────────────────────────────────────────────────────────
function SoundsTab({ onCountChange }) {
  const [sounds, setSounds]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [deleting, setDeleting]   = useState(null);
  const [search, setSearch]       = useState('');
  const [tagFilter, setTagFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const first = await getProducts({ page: 1 });
      const total = first?.total ?? 0;
      const pages = Math.ceil(total / 9) || 1;
      let all = first?.items ?? [];
      if (pages > 1) {
        const rest = await Promise.all(
          Array.from({ length: pages - 1 }, (_, i) =>
            getProducts({ page: i + 2 }).catch(() => ({ items: [] }))
          )
        );
        rest.forEach(r => { all = all.concat(r?.items ?? []); });
      }
      const ids = [...new Set(all.map(p => p.authorId).filter(Boolean))];
      const umap = {};
      await Promise.allSettled(ids.map(id =>
        getUserById(id)
          .then(u => { umap[id] = { username: u?.username ?? String(id) }; })
          .catch(() => { umap[id] = { username: String(id) }; })
      ));
      const enriched = all.map(p => ({
        ...p,
        creatorName: p.authorId ? (umap[p.authorId]?.username ?? p.creator ?? '—') : (p.creator ?? '—'),
      }));
      setSounds(enriched);
      onCountChange?.(enriched.length);
    } catch (e) {
      console.error('[AdminPage/Sounds]', e);
    } finally {
      setLoading(false);
    }
  }, [onCountChange]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete sound #${id}?`)) return;
    setDeleting(id);
    try {
      await deleteProduct(id);
      setSounds(s => s.filter(p => p.id !== id));
    } catch (e) { alert('Delete failed: ' + e.message); }
    finally { setDeleting(null); }
  };

  const filtered = sounds.filter(s =>
    (!search || s.title?.toLowerCase().includes(search.toLowerCase()) ||
      s.creatorName?.toLowerCase().includes(search.toLowerCase())) &&
    (!tagFilter || (s.tagNames ?? []).includes(tagFilter))
  );

  const sel = { background: S.bg3, border: `1px solid ${S.line2}`, borderRadius: 10,
    padding: '.52rem 1rem', color: S.text2, fontFamily: S.fontM, fontSize: '.75rem', outline: 'none' };

  return (
    <div>
      <div style={{ display: 'flex', gap: '.6rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <SearchInput placeholder="Search sounds…" value={search} onChange={setSearch} />
        <select value={tagFilter} onChange={e => setTagFilter(e.target.value)} style={sel}>
          <option value="">All tags</option>
          {['trap','drill','lofi','house','ambient','808'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <span style={{ fontFamily: S.fontM, fontSize: '.7rem', color: S.text3, marginLeft: 'auto' }}>
          {loading ? '…' : `${filtered.length} sounds`}
        </span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: S.fontM, fontSize: '.78rem' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${S.line2}` }}>
              {['ID','Title','Author','Price','Tags','Duration','Actions'].map((h, i) => (
                <th key={i} style={{ padding: '.55rem 1rem', textAlign: 'left', fontWeight: 600,
                  fontSize: '.6rem', letterSpacing: '.08em', textTransform: 'uppercase', color: S.text3 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={7} />)
              : filtered.map(p => (
                <tr key={p.id} style={{ borderBottom: `1px solid ${S.line}`, transition: 'background .12s' }}
                  onMouseEnter={e => e.currentTarget.style.background = S.bg3}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '.65rem 1rem', color: S.text3, fontSize: '.7rem' }}>#{p.id}</td>
                  <td style={{ padding: '.65rem 1rem', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <span style={{ fontFamily: S.fontD, fontWeight: 700, fontSize: '.82rem' }}>{p.title}</span>
                  </td>
                  <td style={{ padding: '.65rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <Avatar name={p.creatorName} size={24} />
                      <span style={{ color: S.cyan, fontSize: '.72rem' }}>{p.creatorName}</span>
                    </div>
                  </td>
                  <td style={{ padding: '.65rem 1rem', fontWeight: 600 }}>${p.price}</td>
                  <td style={{ padding: '.65rem 1rem' }}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {(p.tagNames ?? []).slice(0, 3).map(t => <Pill key={t} color={tagColor(t)}>{t}</Pill>)}
                    </div>
                  </td>
                  <td style={{ padding: '.65rem 1rem', color: S.text3 }}>{fmtDur(p.durationSeconds)}</td>
                  <td style={{ padding: '.65rem 1rem' }}>
                    <button
                      onClick={() => handleDelete(p.id)} disabled={deleting === p.id}
                      style={{ padding: '4px 12px', borderRadius: 8,
                        cursor: deleting === p.id ? 'not-allowed' : 'pointer',
                        background: S.redDim, border: '1px solid rgba(255,68,102,.3)', color: S.red,
                        fontFamily: S.fontM, fontSize: '.65rem', fontWeight: 700,
                        opacity: deleting === p.id ? 0.5 : 1, transition: 'all .15s' }}>
                      {deleting === p.id ? '…' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  TAB: USERS
// ─────────────────────────────────────────────────────────────
function UsersTab({ onCountChange }) {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [banning, setBanning]       = useState(null);
  const [search, setSearch]         = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [backendReady, setBackendReady] = useState(true);

  useEffect(() => {
    fetchAllUsers().then(data => {
      if (data === null) { setBackendReady(false); }
      else { setUsers(data); onCountChange?.(data.length); }
      setLoading(false);
    });
  }, [onCountChange]);

  const handleBan = async (id, status) => {
    const isBanned = status === 'banned';
    if (!window.confirm(`${isBanned ? 'Unban' : 'Ban'} user #${id}?`)) return;
    setBanning(id);
    try {
      isBanned ? await unbanUserReq(id) : await banUserReq(id);
      setUsers(u => u.map(x => x.id === id ? { ...x, status: isBanned ? 'active' : 'banned' } : x));
    } catch (e) { alert(`Failed: ${e.message}`); }
    finally { setBanning(null); }
  };

  if (!backendReady) return <NotReadyNote endpoint="/admin/users" />;

  const filtered = users.filter(u =>
    (!search || u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())) &&
    (!roleFilter || u.role === roleFilter)
  );

  const sel = { background: S.bg3, border: `1px solid ${S.line2}`, borderRadius: 10,
    padding: '.52rem 1rem', color: S.text2, fontFamily: S.fontM, fontSize: '.75rem', outline: 'none' };

  return (
    <div>
      <div style={{ display: 'flex', gap: '.6rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <SearchInput placeholder="Search users…" value={search} onChange={setSearch} />
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={sel}>
          <option value="">All roles</option>
          {['creator','listener','admin'].map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <span style={{ fontFamily: S.fontM, fontSize: '.7rem', color: S.text3, marginLeft: 'auto' }}>
          {loading ? '…' : `${filtered.length} users`}
        </span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: S.fontM, fontSize: '.78rem' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${S.line2}` }}>
              {['ID','User','Role','Sounds','Sales','Joined','Status','Actions'].map((h, i) => (
                <th key={i} style={{ padding: '.55rem 1rem', textAlign: 'left', fontWeight: 600,
                  fontSize: '.6rem', letterSpacing: '.08em', textTransform: 'uppercase', color: S.text3 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={8} />)
              : filtered.map(u => (
                <tr key={u.id} style={{ borderBottom: `1px solid ${S.line}`, transition: 'background .12s' }}
                  onMouseEnter={e => e.currentTarget.style.background = S.bg3}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '.65rem 1rem', color: S.text3, fontSize: '.7rem' }}>#{u.id}</td>
                  <td style={{ padding: '.65rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Avatar name={u.username} size={26} />
                      <div>
                        <div style={{ fontFamily: S.fontD, fontWeight: 700, fontSize: '.82rem' }}>{u.username}</div>
                        <div style={{ fontSize: '.65rem', color: S.text3 }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '.65rem 1rem' }}><Pill color={roleColor(u.role)}>{u.role}</Pill></td>
                  <td style={{ padding: '.65rem 1rem', color: S.text2 }}>{u.sounds ?? u.soundsCount ?? '—'}</td>
                  <td style={{ padding: '.65rem 1rem', color: S.text2 }}>{u.sales ?? u.salesCount ?? '—'}</td>
                  <td style={{ padding: '.65rem 1rem', color: S.text3, fontSize: '.7rem' }}>
                    {u.joined ?? u.createdAt?.slice(0, 10) ?? '—'}
                  </td>
                  <td style={{ padding: '.65rem 1rem' }}>
                    <Pill color={u.status === 'active' ? 'green' : 'red'}>{u.status ?? 'active'}</Pill>
                  </td>
                  <td style={{ padding: '.65rem 1rem' }}>
                    <button
                      disabled={banning === u.id} onClick={() => handleBan(u.id, u.status)}
                      style={{ padding: '4px 12px', borderRadius: 8,
                        cursor: banning === u.id ? 'not-allowed' : 'pointer',
                        background: u.status === 'banned' ? S.greenDim : S.redDim,
                        border: `1px solid ${u.status === 'banned' ? 'rgba(34,211,122,.3)' : 'rgba(255,68,102,.3)'}`,
                        color: u.status === 'banned' ? S.green : S.red,
                        fontFamily: S.fontM, fontSize: '.65rem', fontWeight: 700,
                        opacity: banning === u.id ? 0.5 : 1, transition: 'all .15s' }}>
                      {banning === u.id ? '…' : u.status === 'banned' ? 'Unban' : 'Ban'}
                    </button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  TAB: REPORTS
// ─────────────────────────────────────────────────────────────
function ReportsTab({ onCountChange }) {
  const [reports, setReports]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [resolving, setResolving]   = useState(null);
  const [backendReady, setBackendReady] = useState(true);

  useEffect(() => {
    fetchReports().then(data => {
      if (data === null) { setBackendReady(false); }
      else { setReports(data); onCountChange?.(data.length); }
      setLoading(false);
    });
  }, [onCountChange]);

  const handleResolve = async (id, action) => {
    setResolving(id);
    try {
      await resolveReportReq(id, action);
      setReports(r => r.filter(x => x.id !== id));
    } catch (e) { alert(`Failed: ${e.message}`); }
    finally { setResolving(null); }
  };

  if (!backendReady) return <NotReadyNote endpoint="/admin/reports" />;
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '2.5rem' }}><Spin /></div>;
  if (!reports.length) return (
    <div style={{ padding: '2rem', textAlign: 'center', fontFamily: S.fontM, fontSize: '.78rem', color: S.text3 }}>
      ✓ Нет открытых репортов
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
      {reports.map(r => (
        <div key={r.id} style={{
          background: S.bg3, border: `1px solid ${S.line}`, borderRadius: 14,
          padding: '1rem 1.25rem', display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', gap: '1rem',
        }}>
          <div>
            <div style={{ fontFamily: S.fontM, fontSize: '.62rem', color: S.text3, marginBottom: '.3rem' }}>
              #{r.id} · {r.date ?? r.createdAt?.slice(0, 10)} · by <span style={{ color: S.cyan }}>{r.reporter ?? r.reporterUsername}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.25rem' }}>
              <Pill color="red">{r.type ?? r.category}</Pill>
              <span style={{ fontFamily: S.fontD, fontWeight: 700, fontSize: '.85rem' }}>{r.target ?? r.targetName}</span>
            </div>
            <div style={{ fontFamily: S.fontB, fontSize: '.75rem', color: S.text2 }}>{r.reason ?? r.description}</div>
          </div>
          <div style={{ display: 'flex', gap: '.4rem', flexShrink: 0, marginTop: '.1rem' }}>
            {[['Resolve','resolved',S.greenDim,'rgba(34,211,122,.3)',S.green],['Dismiss','dismiss',S.redDim,'rgba(255,68,102,.3)',S.red]].map(([label, action, bg, border, color]) => (
              <button key={action}
                onClick={() => handleResolve(r.id, action)} disabled={resolving === r.id}
                style={{ padding: '5px 14px', borderRadius: 8, cursor: resolving === r.id ? 'not-allowed' : 'pointer',
                  background: bg, border: `1px solid ${border}`, color,
                  fontFamily: S.fontM, fontSize: '.65rem', fontWeight: 700, opacity: resolving === r.id ? .5 : 1 }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  TAB: ACTIVITY LOG
// ─────────────────────────────────────────────────────────────
const LOG_ICONS = {
  delete: { bg: S.redDim,    icon: '✕' },
  create: { bg: S.greenDim,  icon: '+' },
  ban:    { bg: S.violetDim, icon: '⊘' },
  edit:   { bg: S.cyanDim,   icon: '✎' },
};

function LogTab() {
  const [log, setLog]               = useState([]);
  const [loading, setLoading]       = useState(true);
  const [backendReady, setBackendReady] = useState(true);

  useEffect(() => {
    fetchLog().then(data => {
      if (data === null) setBackendReady(false);
      else setLog(data);
      setLoading(false);
    });
  }, []);

  if (!backendReady) return <NotReadyNote endpoint="/admin/activity-log" />;
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '2.5rem' }}><Spin /></div>;
  if (!log.length) return (
    <div style={{ padding: '2rem', textAlign: 'center', fontFamily: S.fontM, fontSize: '.78rem', color: S.text3 }}>
      Лог пуст
    </div>
  );

  return (
    <div>
      {log.map((item, i) => {
        const cfg = LOG_ICONS[item.type] ?? LOG_ICONS.edit;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '.75rem',
            padding: '.65rem 0', borderBottom: `1px solid ${S.line}` }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0,
              background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: S.fontM, fontSize: 14, color: S.text }}>
              {cfg.icon}
            </div>
            <div style={{ flex: 1, fontFamily: S.fontB, fontSize: '.75rem', color: S.text2, lineHeight: 1.5 }}
              dangerouslySetInnerHTML={{ __html: item.text ?? item.message ?? '' }} />
            <div style={{ fontFamily: S.fontM, fontSize: '.62rem', color: S.text3, flexShrink: 0, marginTop: 2 }}>
              {item.time ?? item.createdAt?.slice(11, 16) ?? ''}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  MAIN ADMIN PAGE
// ─────────────────────────────────────────────────────────────
export default function AdminPage({ user, onNavigate, onLogout }) {
  const [tab, setTab]                   = useState('sounds');
  const [stats, setStats]               = useState(null);
  const [soundsTotal, setSoundsTotal]   = useState(null);
  const [usersCount, setUsersCount]     = useState(null);
  const [reportsCount, setReportsCount] = useState(null);
  const [chartData, setChartData]       = useState(null);
  const [onlineCount, setOnlineCount]   = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    Promise.all([
      getStats().catch(() => null),
      getProducts({ page: 1 }).then(r => r?.total ?? null).catch(() => null),
      fetchActivityChart(),
      fetchOnlineCount(),
    ]).then(([s, total, chart, online]) => {
      setStats(s);
      if (total !== null) setSoundsTotal(total);
      setChartData(chart);
      if (online !== null) setOnlineCount(online);
      setStatsLoading(false);
    });
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      fetchOnlineCount().then(n => { if (n !== null) setOnlineCount(n); });
    }, 30_000);
    return () => clearInterval(t);
  }, []);

  const chartLabels = chartData?.labels  ?? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const uploadsData = chartData?.uploads ?? [3,5,2,8,4,7,6];
  const salesData   = chartData?.sales   ?? [12,18,9,24,15,28,19];

  const TABS = [
    { id: 'sounds',  label: 'Sounds',       badge: soundsTotal },
    { id: 'users',   label: 'Users',        badge: usersCount },
    { id: 'reports', label: 'Reports',      badge: reportsCount },
    { id: 'log',     label: 'Activity Log', badge: null },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0%   { background-position: -200% center; }
                             100% { background-position:  200% center; } }
        @keyframes slideUp { from { opacity:0; transform:translateY(10px); }
                               to { opacity:1; transform:translateY(0);    } }
        @keyframes pulse   { 0%,100% { opacity:1; } 50% { opacity:.4; } }
      `}</style>

      <Header onNavigate={onNavigate} user={user} onLogout={onLogout} onUploadClick={() => {}} />

      <main style={{ flex: 1, maxWidth: 1280, width: '100%', margin: '0 auto',
        padding: isMobile ? '1rem' : '2rem', boxSizing: 'border-box' }}>

        {/* PAGE HEADER */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '.4rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: S.red }} />
              <span style={{ fontFamily: S.fontM, fontSize: '.6rem', color: S.text3,
                letterSpacing: '.15em', textTransform: 'uppercase' }}>Admin Panel</span>
              {onlineCount !== null && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 10px',
                  borderRadius: 999, background: S.greenDim, border: '1px solid rgba(34,211,122,.3)',
                  fontFamily: S.fontM, fontSize: '.6rem', fontWeight: 600, color: S.green, letterSpacing: '.08em' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: S.green,
                    animation: 'pulse 1.5s ease-in-out infinite', display: 'inline-block' }} />
                  {onlineCount} ONLINE
                </span>
              )}
            </div>
            <h1 style={{ fontFamily: S.fontD, fontWeight: 900,
              fontSize: isMobile ? '1.4rem' : '1.8rem', color: S.text, margin: 0 }}>Management</h1>
            <p style={{ fontFamily: S.fontM, fontSize: '.7rem', color: S.text3, marginTop: 3 }}>{user?.email}</p>
          </div>
          {!isMobile && (
            <button onClick={() => window.location.reload()}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '.5rem 1.1rem',
                borderRadius: 999, background: 'transparent', border: `1.5px solid ${S.line2}`,
                color: S.text2, fontFamily: S.fontM, fontSize: '.72rem', fontWeight: 600, cursor: 'pointer' }}>
              ↺ Refresh
            </button>
          )}
        </div>

        {/* STAT CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)',
          gap: '1rem', marginBottom: '1.5rem' }}>
          <StatCard label="Total Sounds" value={soundsTotal ?? stats?.sounds} color="cyan"   loading={statsLoading} />
          <StatCard label="Creators"     value={stats?.creators}              color="violet" loading={statsLoading} />
          <StatCard label="Listeners"    value={stats?.streamers}             color="cyan"   loading={statsLoading} />
          <StatCard label="Sales"        value={stats?.paid}                  color="green"  loading={statsLoading} />
        </div>

        {/* ACTIVITY CHART */}
        <div style={{ background: S.bg2, border: `1px solid ${S.line2}`, borderRadius: 20,
          padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <span style={{ fontFamily: S.fontD, fontWeight: 800, fontSize: '.9rem' }}>Activity — last 7 days</span>
              {chartData === null && (
                <span style={{ fontFamily: S.fontM, fontSize: '.63rem', color: S.text3, marginLeft: 10 }}>
                  (placeholder — /admin/activity-chart не готов)
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {[['Uploads', S.cyan],['Sales', S.violet]].map(([label, color]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5,
                  fontFamily: S.fontM, fontSize: '.65rem', color: S.text2 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
                  {label}
                </div>
              ))}
            </div>
          </div>
          <div style={{ height: 180 }}>
            <SparkChart uploadsData={uploadsData} salesData={salesData} labels={chartLabels} />
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: 2, borderBottom: `1px solid ${S.line2}`, marginBottom: '1rem' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: isMobile ? '.5rem 1rem' : '.6rem 1.4rem',
              background: 'none', border: 'none',
              borderBottom: `2px solid ${tab === t.id ? S.cyan : 'transparent'}`,
              color: tab === t.id ? S.cyan : S.text3,
              fontFamily: S.fontD, fontWeight: 700, fontSize: isMobile ? '.78rem' : '.85rem',
              cursor: 'pointer', transition: 'all .15s', marginBottom: -1,
              display: 'inline-flex', alignItems: 'center', gap: '.4rem',
            }}>
              {t.label}
              {t.badge != null && (
                <span style={{ padding: '2px 7px', borderRadius: 999, background: S.cyanDim,
                  color: S.cyan, fontSize: '.6rem', fontWeight: 700, fontFamily: S.fontM }}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* PANEL */}
        <div style={{ background: S.bg2, border: `1px solid ${S.line2}`, borderRadius: 20,
          padding: isMobile ? '1rem' : '1.5rem', animation: 'slideUp .2s ease' }}>
          {tab === 'sounds'  && <SoundsTab  onCountChange={n => setSoundsTotal(n)} />}
          {tab === 'users'   && <UsersTab   onCountChange={n => setUsersCount(n)} />}
          {tab === 'reports' && <ReportsTab onCountChange={n => setReportsCount(n)} />}
          {tab === 'log'     && <LogTab />}
        </div>
      </main>
    </div>
  );
}