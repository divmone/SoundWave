import { useState, useEffect } from 'react';
import {
  getUserPaymentMethods,
  createPaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod,
} from '../../api/services/paymentService';

function CardForm({ user, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    holderName: '',
  });
  const [errors, setErrors] = useState({});

  const validateCard = () => {
    const newErrors = {};
    const cleanNumber = cardData.number.replace(/\s/g, '');
    
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      newErrors.number = 'Invalid card number';
    }
    
    const expiryParts = cardData.expiry.split('/');
    if (expiryParts.length !== 2) {
      newErrors.expiry = 'Use MM/YY format';
    } else {
      const month = parseInt(expiryParts[0]);
      const year = parseInt('20' + expiryParts[1]);
      if (month < 1 || month > 12) {
        newErrors.expiry = 'Invalid month';
      }
      const now = new Date();
      if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
        newErrors.expiry = 'Card expired';
      }
    }
    
    if (cardData.cvc.length < 3 || cardData.cvc.length > 4) {
      newErrors.cvc = 'Invalid CVC';
    }
    
    if (!cardData.holderName.trim()) {
      newErrors.holderName = 'Required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[PaymentMethodsPanel] Form submit', cardData);
    if (!validateCard()) return;

    setLoading(true);
    setError('');

    try {
      const cleanNumber = cardData.number.replace(/\s/g, '');
      const [expMonth, expYear] = cardData.expiry.split('/');
      
      const cardBrand = detectCardBrand(cleanNumber);
      console.log('[PaymentMethodsPanel] Submitting payment method:', { cardBrand, last4: cleanNumber.slice(-4) });

      const result = await createPaymentMethod(
        user.id,
        '',
        `pm_${Date.now()}_demo`,
        {
          brand: cardBrand,
          last4: cleanNumber.slice(-4),
          expMonth: parseInt(expMonth),
          expYear: parseInt('20' + expYear),
          holderName: cardData.holderName,
        },
        false
      );
      console.log('[PaymentMethodsPanel] API result:', result);

      console.log('[PaymentMethodsPanel] Payment method added successfully');
      onSuccess();
    } catch (err) {
      console.error('[PaymentMethodsPanel] Add card error:', err);
      setError(err.message || 'Failed to add card');
    } finally {
      setLoading(false);
    }
  };

  const detectCardBrand = (number) => {
    if (/^4/.test(number)) return 'visa';
    if (/^5[1-5]/.test(number)) return 'mastercard';
    if (/^3[47]/.test(number)) return 'amex';
    if (/^6(?:011|5)/.test(number)) return 'discover';
    return 'unknown';
  };

  const inputStyle = (field) => ({
    width: '100%',
    padding: '0.75rem 1rem',
    background: 'var(--bg4)',
    border: `1px solid ${errors[field] ? '#f66' : 'var(--line2)'}`,
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text)',
    fontSize: '0.9rem',
    fontFamily: 'var(--font-mono)',
    outline: 'none',
  });

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text3)', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>
          Cardholder Name
        </label>
        <input
          type="text"
          value={cardData.holderName}
          onChange={e => setCardData(prev => ({ ...prev, holderName: e.target.value }))}
          placeholder="John Doe"
          style={inputStyle('holderName')}
        />
        {errors.holderName && <div style={{ color: '#f66', fontSize: '0.7rem', marginTop: 4 }}>{errors.holderName}</div>}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text3)', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>
          Card Number
        </label>
        <input
          type="text"
          value={cardData.number}
          onChange={e => setCardData(prev => ({ ...prev, number: formatCardNumber(e.target.value) }))}
          placeholder="1234 5678 9012 3456"
          maxLength={19}
          style={inputStyle('number')}
        />
        {errors.number && <div style={{ color: '#f66', fontSize: '0.7rem', marginTop: 4 }}>{errors.number}</div>}
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text3)', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>
            Expiry
          </label>
          <input
            type="text"
            value={cardData.expiry}
            onChange={e => setCardData(prev => ({ ...prev, expiry: formatExpiry(e.target.value) }))}
            placeholder="MM/YY"
            maxLength={5}
            style={inputStyle('expiry')}
          />
          {errors.expiry && <div style={{ color: '#f66', fontSize: '0.7rem', marginTop: 4 }}>{errors.expiry}</div>}
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text3)', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>
            CVC
          </label>
          <input
            type="text"
            value={cardData.cvc}
            onChange={e => setCardData(prev => ({ ...prev, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
            placeholder="123"
            maxLength={4}
            style={inputStyle('cvc')}
          />
          {errors.cvc && <div style={{ color: '#f66', fontSize: '0.7rem', marginTop: 4 }}>{errors.cvc}</div>}
        </div>
      </div>

      {error && (
        <div style={{
          padding: '0.75rem',
          background: 'rgba(255,60,60,0.1)',
          border: '1px solid rgba(255,60,60,0.3)',
          borderRadius: 'var(--radius-sm)',
          color: '#f66',
          fontSize: '0.8rem',
          marginBottom: '1rem',
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button type="button" onClick={onCancel} className="btn-ghost"
          style={{ flex: 1, padding: '0.8rem' }}>
          Cancel
        </button>
        <button type="submit" disabled={loading} className="btn-primary"
          style={{ flex: 2, padding: '0.8rem', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Adding...' : 'Add Card'}
        </button>
      </div>
    </form>
  );
}

function PaymentMethodsList({ methods, user, onRefresh }) {
  const [deletingId, setDeletingId] = useState(null);
  const [settingDefault, setSettingDefault] = useState(null);

  const handleDelete = async (methodId) => {
    setDeletingId(methodId);
    try {
      await deletePaymentMethod(methodId);
      onRefresh();
    } catch (err) {
      console.error('Failed to delete payment method:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (methodId) => {
    setSettingDefault(methodId);
    try {
      await setDefaultPaymentMethod(methodId, user.id);
      onRefresh();
    } catch (err) {
      console.error('Failed to set default payment method:', err);
    } finally {
      setSettingDefault(null);
    }
  };

  const getCardIcon = (brand) => {
    const icons = {
      visa: '💳',
      mastercard: '💳',
      amex: '💳',
      discover: '💳',
      unknown: '💳',
    };
    return icons[brand?.toLowerCase()] || '💳';
  };

  if (methods.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        color: 'var(--text3)',
        fontSize: '0.85rem',
      }}>
        No payment methods added yet
      </div>
    );
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      {methods.map(method => (
        <div key={method.id} style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem',
          background: 'var(--bg3)',
          border: `1px solid ${method.isDefault ? 'var(--cyan)' : 'var(--line2)'}`,
          borderRadius: 'var(--radius-md)',
          marginBottom: '0.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.2rem' }}>{getCardIcon(method.cardBrand)}</span>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                •••• {method.cardLast4}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text3)' }}>
                {method.cardBrand?.toUpperCase()} ••• {method.expMonth}/{method.expYear}
                {method.isDefault && (
                  <span style={{
                    marginLeft: '0.5rem',
                    padding: '0.15rem 0.4rem',
                    background: 'var(--cyan)',
                    color: '#000',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.6rem',
                    fontWeight: 700,
                  }}>
                    DEFAULT
                  </span>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {!method.isDefault && (
              <button
                onClick={() => handleSetDefault(method.id)}
                disabled={settingDefault === method.id}
                className="btn-ghost"
                style={{ padding: '0.4rem 0.6rem', fontSize: '0.7rem' }}
              >
                {settingDefault === method.id ? 'Setting...' : 'Set Default'}
              </button>
            )}
            <button
              onClick={() => handleDelete(method.id)}
              disabled={deletingId === method.id}
              className="btn-ghost"
              style={{
                padding: '0.4rem 0.6rem',
                fontSize: '0.7rem',
                color: '#f66',
              }}
            >
              {deletingId === method.id ? 'Removing...' : 'Remove'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PaymentMethodsPanel({ user }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMethods = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    try {
      const data = await getUserPaymentMethods(user.id);
      setMethods(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load payment methods');
      setMethods([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, [user?.id]);

  const handleSuccess = () => {
    setShowAddForm(false);
    fetchMethods();
  };

  return (
    <div style={{
      background: 'var(--bg2)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.5rem',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
      }}>
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1rem',
          fontWeight: 900,
          margin: 0,
        }}>
          Payment Methods
        </h3>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
          >
            + Add Card
          </button>
        )}
      </div>

      {error && (
        <div style={{
          padding: '0.75rem',
          background: 'rgba(255,60,60,0.1)',
          border: '1px solid rgba(255,60,60,0.3)',
          borderRadius: 'var(--radius-sm)',
          color: '#f66',
          fontSize: '0.8rem',
          marginBottom: '1rem',
        }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text3)' }}>
          Loading...
        </div>
      ) : showAddForm ? (
        <CardForm
          user={user}
          onSuccess={handleSuccess}
          onCancel={() => setShowAddForm(false)}
        />
      ) : (
        <PaymentMethodsList
          methods={methods}
          user={user}
          onRefresh={fetchMethods}
        />
      )}
    </div>
  );
}