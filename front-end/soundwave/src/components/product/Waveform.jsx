import { useMemo } from 'react';

function generateBars(count = 48) {
  return Array.from({ length: count }, (_, i) => {
    const env = Math.sin((i / count) * Math.PI);          // огибающая
    const detail = Math.sin(i * 1.7) * 0.3 + Math.sin(i * 3.1) * 0.15;
    return Math.max(8, Math.round((env + detail) * 55 + 18));
  });
}

export default function Waveform({ bars, playing, compact }) {
  const height = compact ? 36 : 54;
  // useMemo чтобы форма не прыгала при каждом рендере
  const resolvedBars = useMemo(
    () => (bars && bars.length > 0) ? bars : generateBars(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      gap: compact ? 2 : 2.5, height,
    }}>
      {resolvedBars.map((h, i) => {
        const delay = `${(i % 9) * 0.06}s`;
        const dur   = `${0.35 + (i % 7) * 0.06}s`;
        return (
          <div key={i} style={{
            flex: 1,
            minWidth: compact ? 2 : 3,
            maxWidth: compact ? 3 : 5,
            borderRadius: 3,
            height: playing ? `${Math.min(h + 10, 95)}%` : `${h}%`,
            transformOrigin: '50% 50%',
            transition: playing ? 'none' : 'height 0.4s ease, background 0.3s',
            background: playing
              ? `hsl(${185 + (i % 14) * 8}, 85%, ${50 + (i % 5) * 6}%)`
              : i % 4 === 0 ? 'rgba(255,255,255,0.12)'
              : i % 3 === 0 ? 'rgba(255,255,255,0.07)'
              : 'rgba(255,255,255,0.04)',
            boxShadow: playing
              ? `0 0 6px hsl(${185 + (i % 14) * 8}, 85%, 60%)`
              : 'none',
            animation: playing
              ? `waveBar ${dur} ease-in-out ${delay} infinite alternate`
              : 'none',
          }} />
        );
      })}
    </div>
  );
}
