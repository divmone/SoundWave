import { useState } from 'react';

/**
 * Button — универсальная кнопка
 *
 * Props:
 *   variant: 'primary' | 'ghost' | 'danger'  (default: 'primary')
 *   size:    'sm' | 'md' | 'lg'              (default: 'md')
 *   loading: bool
 *   fullWidth: bool
 *   icon: ReactNode  (иконка слева)
 *   onClick, disabled, children, style
 */
export default function Button({
  variant  = 'primary',
  size     = 'md',
  loading  = false,
  fullWidth = false,
  icon,
  children,
  disabled,
  style,
  ...rest
}) {
  const [pressed, setPressed] = useState(false);

  const sizes = {
    sm: { padding: '0.45rem 1rem',   fontSize: '0.75rem' },
    md: { padding: '0.7rem 1.5rem',  fontSize: '0.85rem' },
    lg: { padding: '0.95rem 2.2rem', fontSize: '0.95rem' },
  };

  const variants = {
    primary: {
      background: 'linear-gradient(135deg, var(--cyan-dark), var(--cyan))',
      color: '#000',
      border: 'none',
      boxShadow: '0 4px 20px rgba(99,215,255,0.25)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text2)',
      border: '1.5px solid var(--line2)',
      boxShadow: 'none',
    },
    danger: {
      background: 'linear-gradient(135deg, #c0392b, var(--red))',
      color: '#fff',
      border: 'none',
      boxShadow: 'none',
    },
  };

  const isDisabled = disabled || loading;

  return (
    <button
      {...rest}
      disabled={isDisabled}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: 'var(--radius-pill)',
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        cursor: isDisabled ? (loading ? 'wait' : 'not-allowed') : 'pointer',
        opacity: isDisabled && !loading ? 0.5 : 1,
        width: fullWidth ? '100%' : undefined,
        transition: 'all 0.18s cubic-bezier(.34,1.56,.64,1)',
        transform: pressed && !isDisabled ? 'scale(0.93)' : 'scale(1)',
        userSelect: 'none',
        ...sizes[size],
        ...variants[variant],
        ...style,
      }}
    >
      {loading ? (
        <span style={{
          width: 14, height: 14, flexShrink: 0,
          border: `2px solid ${variant === 'ghost' ? 'var(--text3)' : 'rgba(0,0,0,0.25)'}`,
          borderTopColor: variant === 'ghost' ? 'var(--cyan)' : '#000',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
          display: 'inline-block',
        }} />
      ) : icon ? (
        <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
