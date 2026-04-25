import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { storage } from '../api/httpClient';
import { useAuth } from '../hooks/useAuth';

export default function PaymentSuccessPage({ onNavigate }) {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get('session_id');
  
  const [loading, setLoading] = useState(true);
  const [productId, setProductId] = useState(null);
  const [productTitle, setProductTitle] = useState('');
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  
  const { user } = useAuth();

  useEffect(() => {
    async function getPurchase() {
      if (!user?.id) {
        setError('Please log in to access your purchase');
        setLoading(false);
        return;
      }

      try {
        console.log('[PaymentSuccess] Fetching purchases for user:', user.id);
        const purchases = await storage.get(`/api/payment/purchases/user/${user.id}`);
        console.log('[PaymentSuccess] Purchases:', purchases);
        
        if (Array.isArray(purchases) && purchases.length > 0) {
          const latestPurchase = purchases[0];
          setProductId(latestPurchase.productId);
          setProductTitle(latestPurchase.productTitle || 'sound');
        } else {
          setError('No purchase found. Please contact support if you believe this is an error.');
        }
      } catch (err) {
        console.error('[PaymentSuccess] Error:', err);
        setError('Failed to verify purchase. Please contact support.');
      } finally {
        setLoading(false);
      }
    }

    getPurchase();
  }, [user]);

  const handleDownload = async () => {
    if (!productId) return;

    setDownloading(true);
    setError('');

    try {
      console.log('[PaymentSuccess] Downloading sound:', productId);
      
      const response = await fetch(`/api/v1.0/sounds/${productId}/data`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sw_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download sound');
      }

      const blob = await response.blob();
      const contentType = response.headers.get('Content-Type') || 'audio/mpeg';
      const extension = contentType.includes('wav') ? 'wav' : 'mp3';
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${productTitle.replace(/[^a-zA-Z0-9]/g, '_') || 'sound'}.${extension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log('[PaymentSuccess] Download complete!');
    } catch (err) {
      console.error('[PaymentSuccess] Download error:', err);
      setError('Failed to download. Please try again.');
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
          {loading ? (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '1rem',
              color: 'var(--text3)' 
            }}>
              <span style={{ 
                width: 40, height: 40, 
                border: '3px solid rgba(255,255,255,0.15)', 
                borderTopColor: 'var(--cyan)', 
                borderRadius: '50%', 
                animation: 'spin 0.8s linear infinite',
                display: 'inline-block' 
              }} />
              <span>Verifying your purchase...</span>
            </div>
          ) : error ? (
            <>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.5rem',
                marginBottom: '1rem',
              }}>Verification Failed</h1>
              <p style={{ color: 'var(--text3)', marginBottom: '1.5rem' }}>{error}</p>
              <button
                onClick={() => onNavigate?.('home')}
                className="btn-primary"
                style={{ padding: '0.8rem 2rem' }}
              >
                Go to Home
              </button>
            </>
          ) : (
            <>
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
              <p style={{
                color: 'var(--text3)',
                marginBottom: '2rem',
                fontSize: '0.9rem',
              }}>
                Thank you for your purchase. Your sound is ready to download.
              </p>
              
              <div style={{
                background: 'var(--bg2)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                marginBottom: '1.5rem',
              }}>
                <div style={{
                  fontSize: '0.75rem',
                  color: 'var(--text3)',
                  fontFamily: 'var(--font-mono)',
                  marginBottom: '0.5rem',
                }}>
                  Transaction ID
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  wordBreak: 'break-all',
                }}>
                  {sessionId || 'N/A'}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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
                  {downloading ? '⏳ Downloading...' : '⬇ Download Your Sound'}
                </button>
                
                <button
                  onClick={() => onNavigate?.('home')}
                  className="btn-ghost"
                  style={{ padding: '0.8rem' }}
                >
                  Continue Browsing
                </button>
              </div>
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}