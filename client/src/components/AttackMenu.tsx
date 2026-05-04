import { Player, AttackType } from '../types';

const ATTACKS: { type: AttackType; name: string; emoji: string; damage: number; hypeCost: number; hypeRequired: number; desc: string }[] = [
  { type: 'normal',   name: 'Quick Strike', emoji: '⚡', damage: 22, hypeCost: 0,   hypeRequired: 0,   desc: 'Fast and reliable' },
  { type: 'power',    name: 'Power Blast',  emoji: '💥', damage: 38, hypeCost: 50,  hypeRequired: 50,  desc: 'Costs 50 Hype' },
  { type: 'ultimate', name: 'ULTIMATE!',    emoji: '🌟', damage: 58, hypeCost: 100, hypeRequired: 100, desc: 'Costs ALL Hype!' },
];

interface Props {
  targets: Player[];
  myHype: number;
  timeLeft: number;
  onAttack: (targetId: string, type: AttackType) => void;
}

export function AttackMenu({ targets, myHype, timeLeft, onAttack }: Props) {
  return (
    <div className="attack-menu">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ color: '#fbbf24', fontFamily: "'Press Start 2P', monospace", fontSize: '10px', lineHeight: 1.8 }}>⚔️ Attack!</span>
        <span style={{ color: timeLeft <= 5 ? '#ef4444' : '#94a3b8', fontFamily: "'Press Start 2P', monospace", fontSize: '16px' }}>{timeLeft}s</span>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <p style={{ color: '#94a3b8', fontFamily: "'Press Start 2P', monospace", fontSize: '9px', marginBottom: '8px', letterSpacing: '1px' }}>TARGET</p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {targets.map(t => (
            <div key={t.id} style={{ textAlign: 'center' }}>
              {t.character && (
                <img src={`/sprites/${t.character}.png`} alt={t.character} style={{ width: 32, height: 32, objectFit: 'contain', imageRendering: 'pixelated' }} />
              )}
              <p style={{ color: '#e2e8f0', fontFamily: "'Press Start 2P', monospace", fontSize: '8px', marginTop: '4px', lineHeight: 1.8 }}>{t.name}</p>
              <div style={{ background: '#07101f', border: '2px solid #1e3050', height: '6px', width: '60px', marginTop: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(t.hp / t.maxHp) * 100}%`, height: '100%', background: '#22c55e' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {ATTACKS.map(atk => {
          const canUse = myHype >= atk.hypeRequired;
          return (
            <div key={atk.type}>
              {!canUse && (
                <p style={{ color: '#475569', fontFamily: "'Press Start 2P', monospace", fontSize: '8px', marginBottom: '4px', lineHeight: 1.8 }}>
                  Need {atk.hypeRequired} hype
                </p>
              )}
              {targets.map(t => (
                <button
                  key={`${atk.type}-${t.id}`}
                  onClick={() => canUse && onAttack(t.id, atk.type)}
                  disabled={!canUse}
                  className={`attack-btn atk-${atk.type}`}
                  style={{
                    width: '100%', marginBottom: '6px',
                    background: canUse ? getAttackBg(atk.type) : '#0a1120',
                    padding: '10px 14px',
                    cursor: canUse ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    opacity: canUse ? 1 : 0.35,
                    WebkitUserSelect: 'none', userSelect: 'none',
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{atk.emoji}</span>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ color: '#e2e8f0', fontFamily: "'Press Start 2P', monospace", fontSize: '9px', lineHeight: 1.8 }}>
                      {atk.name} → {t.name}
                    </div>
                    <div style={{ color: '#94a3b8', fontFamily: "'Press Start 2P', monospace", fontSize: '8px', lineHeight: 1.8 }}>{atk.desc}</div>
                  </div>
                  <span style={{ color: '#f87171', fontFamily: "'Press Start 2P', monospace", fontSize: '10px' }}>-{atk.damage}</span>
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getAttackColor(type: AttackType): string {
  return type === 'normal' ? '#6366f1' : type === 'power' ? '#a855f7' : '#f59e0b';
}

function getAttackBg(type: AttackType): string {
  return type === 'normal' ? '#1e1b4b' : type === 'power' ? '#2e1065' : '#1c0f00';
}
