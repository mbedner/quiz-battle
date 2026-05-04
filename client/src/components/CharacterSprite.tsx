import { CharacterName } from '../types';

interface CharacterConfig {
  bg: string;
  glow: string;
  label: string;
}

export const CHARACTER_CONFIG: Record<CharacterName, CharacterConfig> = {
  batman:           { bg: 'linear-gradient(135deg, #1c1917, #44403c)', glow: '#a8a29e',  label: 'Batman' },
  carnage:          { bg: 'linear-gradient(135deg, #7f1d1d, #dc2626)', glow: '#dc2626',  label: 'Carnage' },
  godzilla:         { bg: 'linear-gradient(135deg, #14532d, #16a34a)', glow: '#4ade80',  label: 'Godzilla' },
  'green-ranger':   { bg: 'linear-gradient(135deg, #14532d, #22c55e)', glow: '#22c55e',  label: 'Green Ranger' },
  jinu:             { bg: 'linear-gradient(135deg, #4c1d95, #7c3aed)', glow: '#a78bfa',  label: 'Jinu' },
  'king-kong':      { bg: 'linear-gradient(135deg, #292524, #78716c)', glow: '#d6d3d1',  label: 'King Kong' },
  leonardo:         { bg: 'linear-gradient(135deg, #1e3a5f, #3b82f6)', glow: '#3b82f6',  label: 'Leonardo' },
  'mecha-godzilla': { bg: 'linear-gradient(135deg, #0c4a6e, #0ea5e9)', glow: '#38bdf8',  label: 'Mecha Godzilla' },
  megatron:         { bg: 'linear-gradient(135deg, #1f2937, #6b7280)', glow: '#9ca3af',  label: 'Megatron' },
  optimus:          { bg: 'linear-gradient(135deg, #1e1b4b, #6366f1)', glow: '#818cf8',  label: 'Optimus' },
  spiderman:        { bg: 'linear-gradient(135deg, #450a0a, #ef4444)', glow: '#ef4444',  label: 'Spiderman' },
  venom:            { bg: 'linear-gradient(135deg, #0f172a, #475569)', glow: '#94a3b8',  label: 'Venom' },
  wolverine:        { bg: 'linear-gradient(135deg, #422006, #f59e0b)', glow: '#fbbf24',  label: 'Wolverine' },
};

interface Props {
  character: CharacterName;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isActive?: boolean;
  isEliminated?: boolean;
  isAttacking?: boolean;
  isTakingHit?: boolean;
}

const SIZE_MAP = { sm: '48px', md: '72px', lg: '96px', xl: '120px' };

export function CharacterSprite({ character, size = 'md', isActive, isEliminated, isAttacking, isTakingHit }: Props) {
  const cfg = CHARACTER_CONFIG[character];
  const dim = SIZE_MAP[size];

  return (
    <div
      className={[
        'character-sprite',
        isActive ? 'active' : '',
        isEliminated ? 'eliminated' : '',
        isAttacking ? 'attacking' : '',
        isTakingHit ? 'taking-hit' : '',
      ].filter(Boolean).join(' ')}
      style={{
        width: dim,
        height: dim,
        background: cfg.bg,
        boxShadow: isActive ? `0 0 20px ${cfg.glow}, 0 0 40px ${cfg.glow}44` : `0 4px 12px #0006`,
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        border: isActive ? `3px solid ${cfg.glow}` : '3px solid transparent',
        opacity: isEliminated ? 0.35 : 1,
        filter: isEliminated ? 'grayscale(1)' : 'none',
        position: 'relative',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      <img
        src={`/sprites/${character}.png`}
        alt={cfg.label}
        style={{
          width: '88%',
          height: '88%',
          objectFit: 'contain',
          imageRendering: 'pixelated',
        }}
      />
      {isEliminated && (
        <div style={{ position: 'absolute', top: -4, right: -4, fontSize: '18px' }}>💀</div>
      )}
    </div>
  );
}

interface SelectionProps {
  selected: CharacterName | null;
  onSelect: (c: CharacterName) => void;
}

export function CharacterSelector({ selected, onSelect }: SelectionProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', width: '100%' }}>
      {(Object.keys(CHARACTER_CONFIG) as CharacterName[]).map(c => (
        <button
          key={c}
          onClick={() => onSelect(c)}
          className={`char-select-btn${selected === c ? ' selected' : ''}`}
          style={{
            background: selected === c ? CHARACTER_CONFIG[c].bg : '#0f172a',
            padding: '10px 6px 8px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            transform: selected === c ? 'translate(-2px, -2px)' : 'none',
            width: '100%',
          }}
        >
          <img
            src={`/sprites/${c}.png`}
            alt={CHARACTER_CONFIG[c].label}
            style={{ width: '52px', height: '52px', objectFit: 'contain', imageRendering: 'pixelated' }}
          />
          <span style={{
            color: selected === c ? '#fff' : '#94a3b8',
            fontSize: '8px',
            fontFamily: "'Press Start 2P', monospace",
            lineHeight: 1.6,
            textAlign: 'center',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            width: '100%',
          }}>
            {CHARACTER_CONFIG[c].label}
          </span>
        </button>
      ))}
    </div>
  );
}
