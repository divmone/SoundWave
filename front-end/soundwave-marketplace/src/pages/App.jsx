import { useState } from 'react';

import '../styles/globals.css';

import { useProducts } from '../hooks/useProducts';
import { useStats }    from '../hooks/useStats';

import Header      from '../components/Header';
import Hero        from '../components/Hero';
import FilterTabs  from '../components/FilterTabs';
import ProductCard from '../components/ProductCard';
import CardSkeleton from '../components/CardSkeleton';
import EmptyState  from '../components/EmptyState';
import StatsBar    from '../components/StatsBar';
import CTASection  from '../components/CTASection';
import UploadModal from '../components/UploadModal';
import Footer      from '../components/Footer';

export default function App() {
  const [category, setCategory] = useState('all');
  const [search, setSearch]     = useState('');
  const [modalOpen, setModal]   = useState(false);

  const { data: products, loading } = useProducts(category, search);
  const { data: stats }             = useStats();

  const reset = () => { setCategory('all'); setSearch(''); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      {modalOpen && <UploadModal onClose={() => setModal(false)} />}

      <Header onUploadClick={() => setModal(true)} />

      <main style={{ flex: 1, maxWidth: 1360, width: '100%', margin: '0 auto', padding: '0 2rem', boxSizing: 'border-box' }}>
        <Hero
          search={search}
          onSearch={setSearch}
          onUploadClick={() => setModal(true)}
        />

        <section>
          <FilterTabs
            active={category}
            onChange={setCategory}
            count={loading ? '…' : products.length}
          />

          {loading ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
              gap: '1.2rem', marginBottom: '2rem',
            }}>
              {[...Array(8)].map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <EmptyState search={search} onReset={reset} />
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
              gap: '1.2rem', marginBottom: '2rem',
            }}>
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} delay={i * 0.05} />
              ))}
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
