interface Props {
  hype: number;
  compact?: boolean;
  barHeight?: number; // override default height
}

export function HypeBar({ hype, compact, barHeight }: Props) {
  const pct = Math.max(0, Math.min(1, hype / 100));
  const color = hype >= 100 ? '#f59e0b' : hype >= 50 ? '#a855f7' : '#6366f1';
  const height = barHeight ?? (compact ? 6 : 10);

  return (
    <div style={{ width: '100%' }}>
      {!compact && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '3px' }}>
          <span>✨ HYPE</span>
          <span>{hype}/100</span>
        </div>
      )}
      <div style={{
        width: '100%', height, background: '#07101f',
        borderRadius: 0, overflow: 'hidden', border: '2px solid #1e3050',
        transform: 'translateZ(0)',
      }}>
        <div style={{
          width: `${pct * 100}%`, height: '100%',
          borderRadius: 0,
          background: hype >= 100
            ? 'linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)'
            : color,
          transition: 'width 0.4s ease',
          backgroundSize: hype >= 100 ? '200% 100%' : undefined,
          animation: hype >= 100 ? 'hype-shimmer 1s linear infinite' : undefined,
        }} />
      </div>
    </div>
  );
}
