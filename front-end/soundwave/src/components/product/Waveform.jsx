import { useMemo, useRef, useEffect } from 'react';

function generateStaticBars(count = 48) {
  return Array.from({ length: count }, (_, i) => {
    const env = Math.sin((i / count) * Math.PI);
    const detail = Math.sin(i * 1.7) * 0.3 + Math.sin(i * 3.1) * 0.15;
    return Math.max(8, Math.round((env + detail) * 55 + 18));
  });
}

export default function Waveform({ analyser, playing, compact }) {
  const height = compact ? 36 : 54;
  const staticBars = useMemo(() => generateStaticBars(), []);
  const containerRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!analyser || !playing) {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      // Возврат к статичным высотам
      const container = containerRef.current;
      if (container) {
        Array.from(container.children).forEach((el, i) => {
          el.style.height = `${staticBars[i]}%`;
        });
      }
      return;
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const barCount = staticBars.length;

    const draw = () => {
      frameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const container = containerRef.current;
      if (!container) return;

      Array.from(container.children).forEach((el, i) => {
        const binIdx = Math.floor((i / barCount) * bufferLength);
        const value = dataArray[binIdx] / 255;
        const h = Math.max(4, Math.round(value * 92 + 4));
        el.style.height = `${h}%`;
      });
    };

    draw();

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [analyser, playing, staticBars]);

  return (
    <div ref={containerRef} style={{
      display: 'flex',
      alignItems: 'center',
      gap: compact ? 2 : 2.5,
      height,
    }}>
      {staticBars.map((h, i) => (
        <div key={i} style={{
          flex: 1,
          minWidth: compact ? 2 : 3,
          maxWidth: compact ? 3 : 5,
          borderRadius: 3,
          height: `${h}%`,
          background: playing
            ? `hsl(${185 + (i % 14) * 8}, 85%, ${50 + (i % 5) * 6}%)`
            : i % 4 === 0 ? 'rgba(255,255,255,0.12)'
            : i % 3 === 0 ? 'rgba(255,255,255,0.07)'
            : 'rgba(255,255,255,0.04)',
          boxShadow: playing ? `0 0 5px hsl(${185 + (i % 14) * 8}, 85%, 60%)` : 'none',
          transition: playing ? 'background 0.3s, box-shadow 0.3s' : 'height 0.5s ease, background 0.3s',
        }} />
      ))}
    </div>
  );
}
