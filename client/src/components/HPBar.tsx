interface Props {
  hp: number;
  maxHp: number;
  compact?: boolean;
  barHeight?: number; // override default height
}

export function HPBar({ hp, maxHp, compact, barHeight }: Props) {
  const pct = Math.max(0, Math.min(1, hp / maxHp));
  const color = pct > 0.5 ? '#22c55e' : pct > 0.25 ? '#eab308' : '#ef4444';
  const height = barHeight ?? (compact ? 8 : 12);

  return (
    <div style={{ width: '100%' }}>
      {!compact && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '3px' }}>
          <span>❤️ HP</span>
          <span>{hp}/{maxHp}</span>
        </div>
      )}
      <div style={{
        width: '100%', height, background: '#07101f',
        borderRadius: 0, overflow: 'hidden', border: '2px solid #1e3050',
        transform: 'translateZ(0)',
      }}>
        <div style={{
          width: `${pct * 100}%`, height: '100%',
          background: color,
          transition: 'width 0.4s ease, background 0.4s ease',
          borderRadius: 0,
        }} />
      </div>
    </div>
  );
}
