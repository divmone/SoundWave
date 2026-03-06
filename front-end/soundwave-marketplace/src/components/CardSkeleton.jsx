function Skeleton({ style }) {
  return (
    <div style={{
      background: 'linear-gradient(90deg, var(--bg3) 25%, var(--bg4) 50%, var(--bg3) 75%)',
      backgroundSize: '300% 100%',
      animation: 'shimmer 1.8s linear infinite',
      borderRadius: 6,
      ...style,
    }} />
  );
}

export default function CardSkeleton() {
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--line)',
      borderRadius: 14, padding: '1.25rem',
    }}>
      <Skeleton style={{ height: 90, borderRadius: 10, marginBottom: '1rem' }} />
      <Skeleton style={{ height: 16, width: '70%', marginBottom: 8 }} />
      <Skeleton style={{ height: 12, width: '45%', marginBottom: '1rem' }} />
      <div style={{ display: 'flex', gap: 6, marginBottom: '1rem' }}>
        <Skeleton style={{ height: 22, width: 60 }} />
        <Skeleton style={{ height: 22, width: 50 }} />
        <Skeleton style={{ height: 22, width: 70 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--line)' }}>
        <Skeleton style={{ height: 36, width: 60 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <Skeleton style={{ height: 36, width: 36, borderRadius: '50%' }} />
          <Skeleton style={{ height: 36, width: 60, borderRadius: 7 }} />
        </div>
      </div>
    </div>
  );
}
