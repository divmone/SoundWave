import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { getProduct } from '../api/services/productsService';

export default function PaymentSuccessPage({ onNavigate }) {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('productId');

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(!!productId);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!productId) { setLoading(false); return; }
    getProduct(productId)
      .then(p => setProduct(p))
      .catch(() => setError('Could not load product'))
      .finally(() => setLoading(false));
  }, [productId]);

  const handleDownload = async () => {
    if (!product) return;
    setDownloading(true);
    try {
      const response = await fetch(`/api/v1.0/sounds/${product.id}/data`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sw_token')}`,
        },
      });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(product.title || 'sound').replace(/[^a-zA-Z0-9]/g, '_')}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}>
        <div style={{
          maxWidth: 500,
          width: '100%',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.8rem',
            fontWeight: 900,
            marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, var(--cyan), var(--violet))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Payment Successful!
          </h1>
          <p style={{ color: 'var(--text3)', marginBottom: '2rem', fontSize: '0.9rem' }}>
            Thank you for your purchase.
          </p>

          {loading ? (
            <div style={{
              width: 32, height: 32, margin: '0 auto 1.5rem',
              border: '3px solid rgba(255,255,255,0.15)',
              borderTopColor: 'var(--cyan)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              display: 'inline-block',
            }} />
          ) : error ? (
            <p style={{ color: 'var(--text3)', marginBottom: '1.5rem' }}>{error}</p>
          ) : product ? (
            <>
              <p style={{ marginBottom: '1.5rem', color: 'var(--text2)', fontSize: '1.1rem' }}>
                {product.title}
              </p>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="btn-primary"
                style={{
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  opacity: downloading ? 0.7 : 1,
                  cursor: downloading ? 'wait' : 'pointer',
                }}
              >
                {downloading ? 'Downloading...' : 'Download'}
              </button>
            </>
          ) : null}

          <button
            onClick={() => onNavigate?.('home')}
            className="btn-ghost"
            style={{ marginTop: '1rem', padding: '0.8rem' }}
          >
            Continue Browsing
          </button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
