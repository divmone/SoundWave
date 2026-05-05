import { useState, useEffect, useRef } from 'react';
import '../styles/globals.css';

import { useProducts }  from '../hooks/useProducts';
import { useStats }     from '../hooks/useStats';
import { useAuth }      from '../hooks/useAuth';
import { logoutUser, loginWithGoogle, loginWithApple } from '../api/services/authService';
import { getProduct } from '../api/services/productsService';
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
import GenerateModal from '../components/product/GenerateModal';

import LoginPage     from './LoginPage';
import ProfilePage   from './ProfilePage';
import AdminPage, { isAdminUser } from './AdminPage';
import ProductPage   from './ProductPage';
import PaymentSuccessPage from './PaymentSuccessPage';
import ClickerPage   from './ClickerPage';

const URL_KNOWN_PAGES = ['profile', 'admin', 'clicker', 'product'];

function getInitialPage() {
  const params = new URLSearchParams(window.location.search);
  const state  = params.get('state');
  if ((state === 'google' || state === 'apple') && params.get('code')) return 'oauth-callback';
  if (params.get('payment') === 'success') return 'payment-success';
  if (params.get('payment') === 'cancel') return 'home';

  const path = window.location.pathname.replace(/^\/+/, '').split('/')[0];
  if (URL_KNOWN_PAGES.includes(path)) return path;
  return 'home';
}

function getInitialProductId() {
  const path = window.location.pathname.replace(/^\/+/, '').split('/');
  if (path[0] === 'product' && path[1]) return path[1];
  return null;
}

function pathForPage(page, productId) {
  if (page === 'home')    return '/';
  if (page === 'product' && productId) return `/product/${productId}`;
  return `/${page}`;
}

export default function App() {
  const [debugOpen,      setDebugOpen]      = useState(false);
  const [page,           setPage]           = useState(getInitialPage);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [search,         setSearch]         = useState('');
  const [modal,          setModal]          = useState(false);
  const [generateModal,  setGenerateModal]  = useState(false);
  const [oauthError,     setOauthError]     = useState('');
  const [currentPage,    setCurrentPage]    = useState(1);
  const [refreshKey,     setRefreshKey]     = useState(0);
  const oauthDone = useRef(false);

  const { user, login, logout, checking }      = useAuth();
  const { data: products, total, loading, refresh } = useProducts(search, currentPage, refreshKey);

  const regularProducts = products.filter(p => !p.isAiSlop);
  const aiProducts      = products.filter(p =>  p.isAiSlop);

  const handleNavigate = (target) => {
    if (target === 'home') setRefreshKey(k => k + 1);
    if (target !== 'product') setSelectedProduct(null);
    setPage(target);
    if (target !== 'login') {
      window.history.pushState({ page: target }, '', pathForPage(target));
    }
  };

  const handleOpenProduct = (product) => {
    setSelectedProduct(product);
    setPage('product');
    window.history.pushState(
      { page: 'product', productId: product.id },
      '',
      pathForPage('product', product.id),
    );
  };

  const PAGE_SIZE    = 9;
  const isFiltered   = !!search.trim();
  const totalPages   = isFiltered || products.length >= total ? 1 : Math.ceil(total / PAGE_SIZE);
  const { data: stats }             = useStats();

  useEffect(() => { stopAll(); setCurrentPage(1); }, [search]);

  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') setDebugOpen(o => !o);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ── seed initial history state ─────────────────────────
  useEffect(() => {
    const skipSeed = ['login', 'oauth-callback', 'payment-success'];
    if (!window.history.state && !skipSeed.includes(page)) {
      const pid = page === 'product' ? getInitialProductId() : null;
      const seedState = pid ? { page, productId: pid } : { page };
      window.history.replaceState(seedState, '', pathForPage(page, pid));
    }

    if (page === 'product' && !selectedProduct) {
      const pid = getInitialProductId();
      if (pid) getProduct(pid).then(p => p && setSelectedProduct(p)).catch(() => setPage('home'));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── browser back/forward ───────────────────────────────
  useEffect(() => {
    const onPop = (e) => {
      const next = e.state?.page ?? 'home';
      stopAll();
      if (next === 'product') {
        const pid = e.state?.productId;
        if (pid) {
          getProduct(pid)
            .then(p => { if (p) { setSelectedProduct(p); setPage('product'); } else { setPage('home'); } })
            .catch(() => setPage('home'));
        } else {
          setPage('home');
        }
      } else {
        setSelectedProduct(null);
        setPage(next);
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    logout();
    handleNavigate('home');
  };

  const handleOAuthSuccess = (u) => {
    login(u);
    handleNavigate('home');
  };

  // ── OAuth callback handling ────────────────────────────
  useEffect(() => {
    if (page !== 'oauth-callback') return;
    if (oauthDone.current) return;
    oauthDone.current = true;

    const callback = parseOAuthCallback();

    if (!callback || callback.error) {
      setOauthError(callback?.error || 'OAuth failed');
      handleNavigate('login');
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
        handleNavigate('login');
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
  if (page === 'payment-success') return <PaymentSuccessPage onNavigate={handleNavigate} />;
  if (page === 'login')       return <LoginPage onNavigate={handleNavigate} initialError={oauthError} />;
  if (page === 'profile')     return <ProfilePage user={user} onNavigate={handleNavigate} onLogout={logout} />;
  if (page === 'admin')       return isAdminUser(user) ? <AdminPage user={user} onNavigate={handleNavigate} onLogout={handleLogout} /> : null;
  if (page === 'clicker')     return <ClickerPage user={user} onNavigate={handleNavigate} onLogout={handleLogout} onGenerated={refresh} />;
  if (page === 'product' && selectedProduct) return <ProductPage product={selectedProduct} user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;

  // ── Main marketplace ───────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      {modal && <UploadModal onClose={() => setModal(false)} user={user} onSuccess={refresh} />}
      {generateModal && <GenerateModal onClose={() => setGenerateModal(false)} onSuccess={refresh} />}

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
        <Hero search={search} onSearch={setSearch} onUploadClick={() => user ? setModal(true) : handleNavigate('login')} />


        <section>
          <FilterTabs
             count={loading ? '…' : products.length}
           />

          {loading ? (
            <div className="r-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
              {[...Array(9)].map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <EmptyState search={search} onReset={() => { setSearch(''); }} />
          ) : (
            <>
              {regularProducts.length > 0 && (
                <div className="r-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
                  {regularProducts.map((p, i) => <ProductCard key={p.id} product={p} user={user} delay={i * 0.05} onOpenProduct={handleOpenProduct} onNavigate={handleNavigate} />)}
                </div>
              )}

              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                margin: '1.5rem 0 1rem',
              }}>
                <span style={{
                  fontFamily: 'var(--font-display)', fontWeight: 800,
                  fontSize: '1.1rem', letterSpacing: '0.02em',
                  color: 'var(--text)',
                }}>
                  AI generated
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
                  color: 'var(--violet)', padding: '2px 8px',
                  border: '1px solid var(--violet)', borderRadius: 'var(--radius-pill)',
                }}>
                  {aiProducts.length}
                </span>
                <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
                <button
                  className="btn-primary"
                  onClick={() => handleNavigate(user ? 'clicker' : 'login')}
                  style={{ padding: '0.55rem 1rem', fontSize: '0.78rem' }}
                >
                  ✨ Generate
                </button>
              </div>
              {aiProducts.length > 0 && (
                <div className="r-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
                  {aiProducts.map((p, i) => <ProductCard key={p.id} product={p} user={user} delay={i * 0.05} onOpenProduct={handleOpenProduct} onNavigate={handleNavigate} />)}
                </div>
              )}
            </>
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
        <CTASection onUploadClick={() => user ? setModal(true) : handleNavigate('login')} />
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
