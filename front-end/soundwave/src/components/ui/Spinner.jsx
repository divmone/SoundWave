export default function Spinner({ size = 16, color = 'var(--cyan)' }) {
  return (
    <span style={{
      width: size, height: size, display: 'inline-block', flexShrink: 0,
      border: `2px solid rgba(255,255,255,0.1)`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }} />
  );
}
