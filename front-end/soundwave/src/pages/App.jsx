import { useState, useEffect, useRef } from 'react';
import '../styles/globals.css';

import { useProducts }  from '../hooks/useProducts';
import { useStats }     from '../hooks/useStats';
import { useAuth }      from '../hooks/useAuth';
import { logoutUser, loginWithGoogle, loginWithApple } from '../api/services/authService';
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

import LoginPage from './LoginPage';

// Определяем начальную страницу: если URL содержит OAuth-callback — показываем лоадер
function getInitialPage() {
  const params = new URLSearchParams(window.location.search);
  const state  = params.get('state');
  if ((state === 'google' || state === 'apple') && params.get('code')) return 'oauth-callback';
  return 'home';
}

export default function App() {
  const [page,        setPage]       = useState(getInitialPage);
  const [category,    setCategory]   = useState('all');
  const [search,      setSearch]     = useState('');
  const [modal,       setModal]      = useState(false);
  const [oauthError,  setOauthError] = useState('');
  const oauthDone = useRef(false);

  const { user, login, logout }     = useAuth();
  const { data: products, loading } = useProducts(category, search);
  const { data: stats }             = useStats();

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
      : loginWithApple({ identityToken: callback.identityToken, authorizationCode: callback.authorizationCode });

    exchange
      .then(data => handleOAuthSuccess(data.user))
      .catch(err  => {
        setOauthError(err.message || 'OAuth failed');
        setPage('login');
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Route ─────────────────────────────────────────────
  if (page === 'oauth-callback') return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', flexDirection: 'column', gap: 16 }}>
      <span style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.15)', borderTopColor: 'var(--cyan)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
      <span style={{ color: 'var(--text2)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem' }}>Signing in...</span>
    </div>
  );
  if (page === 'login')       return <LoginPage onNavigate={setPage} initialError={oauthError} />;

  // ── Main marketplace ───────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      {modal && <UploadModal onClose={() => setModal(false)} />}

      <Header
        onUploadClick={() => setModal(true)}
        onNavigate={setPage}
        user={user}
        onLogout={handleLogout}
      />

      <main style={{
        flex: 1, maxWidth: 1360, width: '100%',
        margin: '0 auto', padding: '0 2rem', boxSizing: 'border-box',
      }}>
        <Hero search={search} onSearch={setSearch} onUploadClick={() => setModal(true)} />

        <section>
          <FilterTabs
            active={category}
            onChange={setCategory}
            count={loading ? '…' : products.length}
          />

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
              {[...Array(8)].map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <EmptyState search={search} onReset={() => { setCategory('all'); setSearch(''); }} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
              {products.map((p, i) => <ProductCard key={p.id} product={p} delay={i * 0.05} />)}
            </div>
          )}
        </section>

        <StatsBar stats={stats} />
        <CTASection onUploadClick={() => setModal(true)} />
      </main>

      <Footer />
    </div>
  );
}
