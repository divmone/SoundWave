import { useState, useEffect, useRef } from 'react';
import '../styles/globals.css';

import { useProducts }  from '../hooks/useProducts';
import { useStats }     from '../hooks/useStats';
import { useAuth }      from '../hooks/useAuth';
import { logoutUser, loginWithGoogle, loginWithApple } from '../api/services/authService';
import { stopAll } from '../hooks/useAudioPlayer';
import { parseOAuthCallback } from '../utils/oauthUtils';

import Header       from '../components/layout/Header';
import Footer       from '../components/layout/Footer';
import Hero         from '../components/Hero';
import FilterTabs   from '../components/FilterTabs';
import ProductCard  from '../components/product/ProductCard';
import CardSkeleton from '../components/product/CardSkeleton';
import EmptyState   from '../components/EmptyState';
import StatsBar     from '../components/StatsBar';
import CTASection   from '../components/CTASection';
import UploadModal  from '../components/product/UploadModal';

import LoginPage     from './LoginPage';
import ProfilePage   from './ProfilePage';
import AdminPage, { isAdminUser } from './AdminPage';
import ProductPage   from './ProductPage';

// Определяем начальную страницу: если URL содержит OAuth-callback — показываем лоадер
function getInitialPage() {
  const params = new URLSearchParams(window.location.search);
  const state  = params.get('state');
  if ((state === 'google' || state === 'apple') && params.get('code')) return 'oauth-callback';
  return 'home';
}

export default function App() {
  const [debugOpen,      setDebugOpen]      = useState(false);
  const [page,           setPage]           = useState(getInitialPage);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [category,       setCategory]       = useState('all');
  const [search,         setSearch]         = useState('');
  const [modal,          setModal]          = useState(false);
  const [oauthError,     setOauthError]     = useState('');
  const [currentPage,    setCurrentPage]    = useState(1);
  const [refreshKey,     setRefreshKey]     = useState(0);
  const oauthDone = useRef(false);

  const { user, login, logout, checking }      = useAuth();
  const { data: products, total, loading, refresh } = useProducts(category, search, currentPage, refreshKey);

  const handleNavigate = (target) => {
    if (target === 'home') setRefreshKey(k => k + 1);
    setPage(target);
  };

  const handleOpenProduct = (product) => {
    setSelectedProduct(product);
    setPage('product');
  };

  const PAGE_SIZE    = 9;
  const isFiltered   = category !== 'all' || !!search.trim();
  const totalPages   = isFiltered || products.length >= total ? 1 : Math.ceil(total / PAGE_SIZE);
  const { data: stats }             = useStats();

  useEffect(() => { stopAll(); setCurrentPage(1); }, [category, search]);

  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') setDebugOpen(o => !o);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    logout();
    setPage('home');
  };

  const handleOAuthSuccess = (u) => {
    login(u);
    setPage('home');
  };

  // ── OAuth callback handling ────────────────────────────
  useEffect(() => {
    if (page !== 'oauth-callback') return;
    if (oauthDone.current) return;
    oauthDone.current = true;

    const callback = parseOAuthCallback();

    if (!callback || callback.error) {
      setOauthError(callback?.error || 'OAuth failed');
      setPage('login');
      return;
    }

    window.history.replaceState({}, '', '/');

    const exchange = callback.provider === 'google'
      ? loginWithGoogle({ code: callback.code })
      : loginWithApple({ code: callback.code });

    exchange
      .then(data => handleOAuthSuccess(data.user))
      .catch(err  => {
        setOauthError(err.message || 'OAuth failed');
        setPage('login');
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Route ─────────────────────────────────────────────
  if (checking) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', flexDirection: 'column', gap: 16 }}>
      <span style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.15)', borderTopColor: 'var(--cyan)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
    </div>
  );

  if (page === 'oauth-callback') return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', flexDirection: 'column', gap: 16 }}>
      <span style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.15)', borderTopColor: 'var(--cyan)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
      <span style={{ color: 'var(--text2)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem' }}>Signing in...</span>
    </div>
  );
  if (page === 'login')       return <LoginPage onNavigate={handleNavigate} initialError={oauthError} />;
  if (page === 'profile')     return <ProfilePage user={user} onNavigate={handleNavigate} onLogout={logout} />;
  if (page === 'admin')       return isAdminUser(user) ? <AdminPage user={user} onNavigate={handleNavigate} onLogout={handleLogout} /> : null;
  if (page === 'product' && selectedProduct) return <ProductPage product={selectedProduct} user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;

  // ── Main marketplace ───────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      {modal && <UploadModal onClose={() => setModal(false)} user={user} onSuccess={refresh} />}

      <Header
        onUploadClick={() => user ? setModal(true) : handleNavigate('login')}
        onNavigate={handleNavigate}
        user={user}
        onLogout={handleLogout}
      />

      <main className="r-main-padding" style={{
        flex: 1, maxWidth: 1360, width: '100%',
        margin: '0 auto', padding: '0 2rem', boxSizing: 'border-box',
      }}>
        <Hero search={search} onSearch={setSearch} onUploadClick={() => user ? setModal(true) : setPage('login')} />

        <section>
          <FilterTabs
            active={category}
            onChange={setCategory}
            count={loading ? '…' : products.length}
          />

          {loading ? (
            <div className="r-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
              {[...Array(9)].map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <EmptyState search={search} onReset={() => { setCategory('all'); setSearch(''); }} />
          ) : (
            <div className="r-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
              {products.map((p, i) => <ProductCard key={p.id} product={p} user={user} delay={i * 0.05} onOpenProduct={handleOpenProduct} onNavigate={handleNavigate} />)}
            </div>
          )}

          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: '2rem' }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'var(--bg3)', border: '1px solid var(--line2)',
                  color: currentPage === 1 ? 'var(--text3)' : 'var(--text)',
                  cursor: currentPage === 1 ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: currentPage === 1 ? 0.4 : 1,
                  transition: 'all 0.2s',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
              </button>

              {[...Array(totalPages)].map((_, i) => {
                const p = i + 1;
                const active = p === currentPage;
                if (totalPages > 7 && Math.abs(p - currentPage) > 2 && p !== 1 && p !== totalPages) {
                  if (p === 2 || p === totalPages - 1) return <span key={p} style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>…</span>;
                  return null;
                }
                return (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    style={{
                      minWidth: 36, height: 36, borderRadius: 8,
                      background: active ? 'var(--cyan)' : 'var(--bg3)',
                      border: `1px solid ${active ? 'var(--cyan)' : 'var(--line2)'}`,
                      color: active ? '#000' : 'var(--text)',
                      fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: active ? '0 0 16px var(--cyan-glow)' : 'none',
                    }}
                  >{p}</button>
                );
              })}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'var(--bg3)', border: '1px solid var(--line2)',
                  color: currentPage === totalPages ? 'var(--text3)' : 'var(--text)',
                  cursor: currentPage === totalPages ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: currentPage === totalPages ? 0.4 : 1,
                  transition: 'all 0.2s',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          )}
        </section>

        <StatsBar stats={stats} />
        <CTASection onUploadClick={() => user ? setModal(true) : setPage('login')} />
      </main>

      <Footer />

      {debugOpen && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
          maxHeight: '45vh', overflowY: 'auto',
          background: 'rgba(0,0,0,0.95)', borderTop: '2px solid var(--cyan)',
          fontFamily: 'monospace', fontSize: '0.72rem', color: '#0ff',
          padding: '0.75rem 1rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontWeight: 700, color: 'var(--cyan)' }}>🛠 DEBUG — Ctrl+Shift+D to close</span>
            <span style={{ color: '#888' }}>user: {user ? `id=${user.id} | ${user.username} | ${user.email}` : 'not logged in'}</span>
          </div>
          <div style={{ marginBottom: 6, color: '#aaa' }}>
            page: {currentPage} / {totalPages} | total products: {total} | loading: {String(loading)}
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: '#888', textAlign: 'left', borderBottom: '1px solid #333' }}>
                <th style={{ padding: '2px 8px' }}>id</th>
                <th style={{ padding: '2px 8px' }}>title</th>
                <th style={{ padding: '2px 8px' }}>authorId</th>
                <th style={{ padding: '2px 8px' }}>creator (resolved)</th>
                <th style={{ padding: '2px 8px' }}>price</th>
                <th style={{ padding: '2px 8px' }}>tags</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <td style={{ padding: '2px 8px', color: '#888' }}>{p.id}</td>
                  <td style={{ padding: '2px 8px' }}>{p.title}</td>
                  <td style={{ padding: '2px 8px', color: p.authorId ? '#0ff' : '#f44' }}>{p.authorId ?? '—'}</td>
                  <td style={{ padding: '2px 8px', color: p.creator ? '#0f0' : '#f44' }}>{p.creator ?? '—'}</td>
                  <td style={{ padding: '2px 8px', color: '#888' }}>{p.price}</td>
                  <td style={{ padding: '2px 8px', color: '#888' }}>{(p.tagNames ?? []).join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
