import { useState } from 'react';

// Проверяет что строка не содержит кириллицу
function hasCyrillic(str) {
  return /[а-яёА-ЯЁ]/.test(str);
}

export default function AuthInput({
  label, type = 'text', placeholder, value, onChange,
  error, hint, icon, required,
  // isValid позволяет родителю явно контролировать показ галочки
  // если не передан — используем внутреннюю логику только для touched+no error
  isValid,
}) {
  const [focused,  setFocused]  = useState(false);
  const [touched,  setTouched]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const isPassword = type === 'password';
  const inputType  = isPassword ? (showPass ? 'text' : 'password') : type;

  // Галочка показывается ТОЛЬКО если:
  // 1. Поле было тронуто (touched)
  // 2. Нет ошибок
  // 3. Есть значение
  // 4. Поле не в фокусе
  // 5. isValid явно true (контролируется снаружи) или не передан (fallback)
  const showTick = touched && !error && value && !focused && isValid !== false;

  const borderColor = error
    ? 'var(--red)'
    : focused
    ? 'var(--cyan-dark)'
    : touched && !error && value
    ? 'rgba(34,211,122,0.4)'
    : 'var(--line2)';

  const boxShadow = error
    ? '0 0 0 3px var(--red-dim)'
    : focused
    ? '0 0 0 3px var(--cyan-dim)'
    : 'none';

  const handleChange = (e) => {
    // Блокируем кириллицу — просто не пропускаем символы
    if (hasCyrillic(e.target.value)) {
      // Показываем визуальный shake но не меняем значение
      e.target.style.animation = 'none';
      requestAnimationFrame(() => { e.target.style.animation = 'shake 0.3s ease'; });
      return;
    }
    onChange(e);
  };

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      {/* Label row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 7,
      }}>
        <label style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: '0.7rem', letterSpacing: '0.07em',
          color: error ? 'var(--red)' : focused ? 'var(--cyan)' : 'var(--text3)',
          textTransform: 'uppercase',
          transition: 'color 0.2s',
          cursor: 'default',
          userSelect: 'none',
        }}>
          {label}
          {required && <span style={{ color: 'var(--red)', marginLeft: 3 }}>*</span>}
        </label>

        {/* Hint (e.g. "Forgot password?") shown only when no error */}
        {hint && !error && (
          <span style={{ fontSize: '0.72rem' }}>{hint}</span>
        )}
      </div>

      {/* Input wrapper */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {/* Left icon */}
        {icon && (
          <div style={{
            position: 'absolute', left: 14, zIndex: 1,
            color: error ? 'var(--red)' : focused ? 'var(--cyan)' : 'var(--text3)',
            transition: 'color 0.2s',
            display: 'flex', alignItems: 'center',
            pointerEvents: 'none',
          }}>
            {icon}
          </div>
        )}

        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); setTouched(true); }}
          autoComplete={isPassword ? 'current-password' : type === 'email' ? 'email' : 'off'}
          spellCheck={false}
          style={{
            width: '100%',
            padding: `0.82rem ${isPassword ? '3rem' : showTick ? '2.6rem' : '1.1rem'} 0.82rem ${icon ? '2.75rem' : '1.1rem'}`,
            background: focused ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
            border: `1.5px solid ${borderColor}`,
            borderRadius: 'var(--radius-pill)',
            color: 'var(--text)',
            fontSize: '0.9rem',
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            outline: 'none',
            boxShadow,
            transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
          }}
        />

        {/* Password toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPass(p => !p)}
            tabIndex={-1}
            style={{
              position: 'absolute', right: 14,
              background: 'none', border: 'none', cursor: 'pointer', padding: 4,
              color: 'var(--text3)', display: 'flex', alignItems: 'center',
              transition: 'color 0.18s', zIndex: 1,
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--cyan)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
          >
            {showPass ? (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        )}

        {/* Green tick — only when field is valid and touched and not focused */}
        {showTick && (
          <div style={{
            position: 'absolute',
            right: isPassword ? 42 : 14,
            color: 'var(--green)',
            display: 'flex', alignItems: 'center',
            animation: 'popIn 0.25s cubic-bezier(.34,1.56,.64,1) both',
            pointerEvents: 'none',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          marginTop: 6,
          animation: 'slideUp 0.2s ease both',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2.5" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span style={{
            fontSize: '0.75rem', color: 'var(--red)',
            fontFamily: 'var(--font-body)', fontWeight: 600,
          }}>{error}</span>
        </div>
      )}
    </div>
  );
}
