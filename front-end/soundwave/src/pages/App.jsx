import { useState } from 'react';
import '../styles/globals.css';

import { useProducts }  from '../hooks/useProducts';
import { useStats }     from '../hooks/useStats';
import { useAuth }      from '../hooks/useAuth';
import { logoutUser }   from '../api/services/authService';

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

import LoginPage          from './LoginPage';
import RegisterPage       from './RegisterPage';
import ForgotPasswordPage from './ForgotPasswordPage';
import RoleSelectPage     from './RoleSelectPage';

export default function App() {
  const [page,        setPage]       = useState('home');
  const [category,    setCategory]   = useState('all');
  const [search,      setSearch]     = useState('');
  const [modal,       setModal]      = useState(false);
  // oauthUser — временный пользователь после OAuth, до выбора роли
  const [oauthUser,   setOauthUser]  = useState(null);

  const { user, login, logout }     = useAuth();
  const { data: products, loading } = useProducts(category, search);
  const { data: stats }             = useStats();

  const handleLogout = async () => {
    await logoutUser();
    logout();
    setPage('home');
  };

  // После обычного login/register
  const handleLogin = (u) => {
    login(u);
    setPage('home');
  };

  // После OAuth — если нет роли, показываем выбор роли
  const handleOAuthSuccess = (u) => {
    if (!u?.role) {
      setOauthUser(u);
      setPage('role-select');
    } else {
      login(u);
      setPage('home');
    }
  };

  // После выбора роли
  const handleRoleSelected = (u) => {
    login(u);
    setOauthUser(null);
    setPage('home');
  };

  // ── Route ─────────────────────────────────────────────
  if (page === 'login')       return <LoginPage    onNavigate={setPage} onLogin={handleLogin} />;
  if (page === 'register')    return <RegisterPage onNavigate={setPage} onLogin={handleLogin} />;
  if (page === 'forgot')      return <ForgotPasswordPage onNavigate={setPage} />;
  if (page === 'role-select') return <RoleSelectPage user={oauthUser} onComplete={handleRoleSelected} />;

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
