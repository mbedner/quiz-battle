import { useEffect, useState } from 'react';
import { socket } from '../socket';
import { EmoteEvent, Player } from '../types';
import { haptic } from '../utils/haptics';
import { sound } from '../utils/sound';

const EMOTES = ['😄', '😱', '💪', '🎉', '😅', '🔥', '👀', '🤣'];

interface Props {
  players: Player[];
}

interface FloatingEmote {
  id: number;
  emote: string;
  name: string;
  x: number;
}

let emoteId = 0;

export function EmotePanel({ players }: Props) {
  const [floating, setFloating] = useState<FloatingEmote[]>([]);

  useEffect(() => {
    const handler = ({ playerId, emote }: EmoteEvent) => {
      const player = players.find(p => p.id === playerId);
      const name = player?.name ?? 'Someone';
      const id = ++emoteId;
      setFloating(prev => [...prev, { id, emote, name, x: 10 + Math.random() * 60 }]);
      setTimeout(() => setFloating(prev => prev.filter(e => e.id !== id)), 2500);
    };
    socket.on('emote_received', handler);
    return () => { socket.off('emote_received', handler); };
  }, [players]);

  const sendEmote = (emote: string) => {
    socket.emit('send_emote', { emote });
    haptic('emote');
    sound.play('emote');
  };

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '6px' }}>
        {EMOTES.map(e => (
          <button key={e} onClick={() => sendEmote(e)} className="emote-btn">{e}</button>
        ))}
      </div>

      {floating.map(f => (
        <div
          key={f.id}
          style={{
            position: 'fixed',
            bottom: '80px',
            left: `${f.x}%`,
            zIndex: 9999,
            pointerEvents: 'none',
            animation: 'float-up 2.5s ease-out forwards',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '36px' }}>{f.emote}</div>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>{f.name}</div>
        </div>
      ))}
    </>
  );
}
