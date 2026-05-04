import { useEffect, useState } from 'react';
import { Player, AttackResult } from '../types';
import { CharacterSprite } from './CharacterSprite';
import { HPBar } from './HPBar';
import { HypeBar } from './HypeBar';

interface Props {
  players: Player[];
  currentPlayerId: string | null;
  lastAttackResult: AttackResult | null;
}

export function BattleArena({ players, currentPlayerId, lastAttackResult }: Props) {
  const [hittingId, setHittingId] = useState<string | null>(null);
  const [attackingId, setAttackingId] = useState<string | null>(null);

  useEffect(() => {
    if (!lastAttackResult) return;
    setAttackingId(lastAttackResult.attackerId);
    setHittingId(lastAttackResult.targetId);
    const t = setTimeout(() => { setHittingId(null); setAttackingId(null); }, 600);
    return () => clearTimeout(t);
  }, [lastAttackResult]);

  return (
    <div style={{
      display: 'flex',
      gap: '16px',
      justifyContent: 'center',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      padding: '16px 0',
    }}>
      {players.map(p => (
        <PlayerCard
          key={p.id}
          player={p}
          isActive={p.id === currentPlayerId}
          isAttacking={p.id === attackingId}
          isTakingHit={p.id === hittingId}
        />
      ))}
    </div>
  );
}

interface CardProps {
  player: Player;
  isActive: boolean;
  isAttacking: boolean;
  isTakingHit: boolean;
}

function PlayerCard({ player, isActive, isAttacking, isTakingHit }: CardProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      padding: '14px',
      background: isActive ? '#1e293b' : '#0f172a',
      border: `2px solid ${isActive ? '#6366f1' : '#1e293b'}`,
      borderRadius: '16px',
      minWidth: '130px',
      maxWidth: '160px',
      transition: 'all 0.3s',
      boxShadow: isActive ? '0 0 20px #6366f144' : 'none',
      opacity: player.isEliminated ? 0.5 : 1,
    }}>
      <div style={{ fontSize: '12px', fontWeight: 700, color: isActive ? '#818cf8' : '#94a3b8', textAlign: 'center' }}>
        {player.name}
        <span style={{ marginLeft: '4px', opacity: 0.7 }}>
          {player.mode === 'kid' ? '🧒' : '🧑'}
        </span>
      </div>

      <CharacterSprite
        character={player.character ?? 'carnage'}
        size="md"
        isActive={isActive}
        isEliminated={player.isEliminated}
        isAttacking={isAttacking}
        isTakingHit={isTakingHit}
      />

      <div style={{ width: '100%' }}>
        <HPBar hp={player.hp} maxHp={player.maxHp} compact />
        <div style={{ height: '4px' }} />
        <HypeBar hype={player.hype} compact />
      </div>

      <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: '#64748b' }}>
        <span>❤️ {player.hp}</span>
        <span>✨ {player.hype}</span>
      </div>
    </div>
  );
}
