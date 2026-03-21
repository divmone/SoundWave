export default function Waveform({ bars, playing, compact }) {
  const height = compact ? 36 : 52;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: compact ? 2 : 3, height }}>
      {bars.map((h, i) => (
        <div key={i} style={{
          flex: 1, minWidth: compact ? 2 : 3, borderRadius: 3,
          height: `${h}%`, transformOrigin: '50% 100%',
          transition: 'background 0.3s',
          background: playing
            ? `hsl(${190 + (i % 12) * 10}, 90%, ${55 + (i % 4) * 5}%)`
            : i % 3 === 0 ? 'var(--line2)'
            : i % 2 === 0 ? 'rgba(255,255,255,0.06)'
            : 'rgba(255,255,255,0.03)',
          animation: playing
            ? `waveBar ${0.4 + (i % 7) * 0.07}s ease-in-out ${i * 0.025}s infinite`
            : 'none',
        }} />
      ))}
    </div>
  );
}
