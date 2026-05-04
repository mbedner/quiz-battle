import { useEffect, useState } from 'react';
import { socket } from './socket';
import { GameState } from './types';
import { HostScreen } from './screens/HostScreen';
import { PlayerScreen } from './screens/PlayerScreen';

const isJoinPage = window.location.pathname.startsWith('/join');

const BLANK: GameState = {
  phase: 'lobby', roundPhase: 'intermission', roundNumber: 0, battleNumber: 0,
  players: [], playerQuestions: {}, playerAnswerStatus: {},
  playerAttacks: {}, attackResults: [],
  matchWins: {}, winner: null, hostId: null, serverUrl: '', message: '', timeLeft: 0,
};

export default function App() {
  const [state, setState] = useState<GameState>(BLANK);
  const [myId, setMyId] = useState<string>(socket.id ?? '');

  useEffect(() => {
    const onConnect = () => {
      setMyId(socket.id ?? '');
      if (!isJoinPage) {
        // Always re-register as host on (re)connect so restarts work cleanly
        socket.emit('set_host');
      } else {
        // Player: auto-rejoin on reconnect using stored credentials + token
        const name  = sessionStorage.getItem('bq_name');
        const mode  = sessionStorage.getItem('bq_mode');
        const token = localStorage.getItem('bq_token');
        if (name && mode && token) {
          socket.emit('join_lobby', { name, mode, token });
        }
      }
    };
    const onState = (s: GameState) => setState(s);

    if (socket.connected) onConnect();
    socket.on('connect', onConnect);
    socket.on('game_state', onState);
    return () => { socket.off('connect', onConnect); socket.off('game_state', onState); };
  }, []);

  if (!myId) {
    return (
      <div style={{ minHeight: '100vh', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
        <div className="spinner" />
        <p style={{ color: '#475569', fontSize: '16px' }}>Connecting…</p>
      </div>
    );
  }

  return isJoinPage
    ? <PlayerScreen state={state} myId={myId} />
    : <HostScreen state={state} />;
}
