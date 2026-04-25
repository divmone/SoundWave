import { useState, useEffect, useRef } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { storage } from '../api/httpClient';
import { useAuth } from '../hooks/useAuth';

export default function PaymentSuccessPage({ onNavigate }) {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get('session_id');
  
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState([]);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [downloading, setDownloading] = useState(false);
  
  const { user, checking } = useAuth();
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (checking || fetchedRef.current) return;
    if (!user?.id) {
      setLoading(false);
      return;
    }

    fetchedRef.current = true;

    async function getPurchases() {
      try {
        const data = await storage.get(`/api/payment/purchases/user/${user.id}`);
        if (Array.isArray(data)) {
          setPurchases(data);
          if (data.length === 1) {
            setSelectedPurchase(data[0]);
          }
        }
      } catch (err) {
        console.error('[PaymentSuccess] Error:', err);
      } finally {
        setLoading(false);
      }
    }

    getPurchases();
  }, [user, checking]);

  useEffect(() => {
    if (!loading && selectedPurchase) {
      window.history.replaceState({}, '', '/?payment=verified');
    }
  }, [loading, selectedPurchase]);

  const handleDownload = async () => {
    if (!selectedPurchase) return;

    setDownloading(true);
    try {
      const response = await fetch(`/api/v1.0/sounds/${selectedPurchase.productId}/data`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sw_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to download');

      const blob = await response.blob();
      const extension = response.headers.get('Content-Type')?.includes('wav') ? 'wav' : 'mp3';
      const title = (selectedPurchase.productTitle || 'sound').replace(/[^a-zA-Z0-9]/g, '_');
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.${extension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('[PaymentSuccess] Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading || checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ 
            width: 40, height: 40, 
            border: '3px solid rgba(255,255,255,0.15)', 
            borderTopColor: 'var(--cyan)', 
            borderRadius: '50%', 
            animation: 'spin 0.8s linear infinite',
            display: 'inline-block' 
          }} />
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Please log in</h1>
            <button onClick={() => onNavigate?.('login')} className="btn-primary" style={{ padding: '0.8rem 2rem' }}>
              Go to Login
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
          
          {purchases.length === 0 ? (
            <p style={{ color: 'var(--text3)' }}>No purchases found</p>
          ) : (
            <>
              {purchases.length === 1 ? (
                <p style={{ marginBottom: '1rem', color: 'var(--text2)' }}>
                  {purchases[0].productTitle || 'Sound'}
                </p>
              ) : (
                <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text3)', marginBottom: '0.5rem' }}>
                    Select a sound to download:
                  </label>
                  <select
                    value={selectedPurchase?.id || ''}
                    onChange={e => {
                      const p = purchases.find(x => x.id === parseInt(e.target.value));
                      setSelectedPurchase(p);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'var(--bg4)',
                      border: '1px solid var(--line2)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text)',
                      fontSize: '0.9rem',
                    }}
                  >
                    {purchases.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.productTitle || `Sound #${p.productId}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={handleDownload}
                disabled={downloading || !selectedPurchase}
                className="btn-primary"
                style={{
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  opacity: downloading || !selectedPurchase ? 0.7 : 1,
                  cursor: downloading || !selectedPurchase ? 'wait' : 'pointer',
                }}
              >
                {downloading ? '⏳ Downloading...' : '⬇ Download'}
              </button>
            </>
          )}
          
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