import { useEffect, useRef, useState } from 'react';
import { GameState, PlayerMode, CharacterName, AttackType } from '../types';
import { socket } from '../socket';
import { haptic } from '../utils/haptics';
import { sound } from '../utils/sound';
import { CharacterSelector } from '../components/CharacterSprite';
import { QuestionCard } from '../components/QuestionCard';
import { AttackMenu } from '../components/AttackMenu';
import { EmotePanel } from '../components/EmotePanel';
import { HPBar } from '../components/HPBar';
import { HypeBar } from '../components/HypeBar';

interface Props { state: GameState; myId: string; }

export function PlayerScreen({ state, myId }: Props) {
  const me = state.players.find(p => p.id === myId);

  // Lock to portrait orientation on mobile
  useEffect(() => {
    try {
      (screen.orientation as { lock?: (o: string) => Promise<void> })?.lock?.('portrait');
    } catch { /* not supported */ }
  }, []);

  const [isLandscape, setIsLandscape] = useState(
    typeof window !== 'undefined' && window.innerWidth > window.innerHeight
  );
  useEffect(() => {
    const check = () => setIsLandscape(window.innerWidth > window.innerHeight);
    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);
    return () => { window.removeEventListener('resize', check); window.removeEventListener('orientationchange', check); };
  }, []);

  if (isLandscape) return (
    <div style={{ position: 'fixed', inset: 0, background: '#020617', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, zIndex: 9999 }}>
      <div style={{ fontSize: 48 }}>📱</div>
      <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: '#e2e8f0', textAlign: 'center', lineHeight: 1.8, padding: '0 24px' }}>
        Please rotate your phone to portrait mode
      </p>
    </div>
  );

  if (state.phase === 'lobby' && !me)        return <JoinForm />;
  if (state.phase === 'lobby' && me)         return <Waiting state={state} me={me} label="Waiting for host to start…" />;
  if (state.phase === 'character_select' && me && !me.character) return <CharSelectView />;
  if (state.phase === 'character_select' && me)  return <Waiting state={state} me={me} label="Waiting for battle to start…" />;
  if (state.phase === 'battle' && me)        return <BattleView state={state} me={me} />;
  if (state.phase === 'game_over')           return <GameOverView state={state} me={me ?? null} />;
  return <Waiting state={state} me={me ?? null} label="Loading…" />;
}

// ── Join ──────────────────────────────────────────────────────

function JoinForm() {
  const [name, setName] = useState(() => sessionStorage.getItem('bq_name') ?? '');
  const [mode, setMode] = useState<PlayerMode>(() => (sessionStorage.getItem('bq_mode') as PlayerMode) ?? 'kid');
  const [sent, setSent] = useState(false);

  const join = () => {
    if (!name.trim() || sent) return;
    sessionStorage.setItem('bq_name', name.trim());
    sessionStorage.setItem('bq_mode', mode);
    setSent(true);
    socket.emit('join_lobby', { name: name.trim(), mode });
  };

  return (
    <div style={page}>
      <img src="/quiz-battle-logo.png" alt="Quiz Battle" style={{ width: '80%', maxWidth: 300, imageRendering: 'pixelated', filter: 'drop-shadow(0 4px 16px #000000cc)', marginBottom: 8 }} />
      <div className="px-card" style={{ width: '100%', maxWidth: 400 }}>
        <h2 className="px" style={{ color: '#e2e8f0', marginBottom: 24, textAlign: 'center', fontSize: 13 }}>▶ Join!</h2>
        <label className="px-lbl">Your Name</label>
        <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && join()}
          maxLength={16} placeholder="Enter your name…" autoFocus className="px-input" />

        <label className="px-lbl" style={{ marginTop: 20 }}>I am a…</label>
        <div style={{ display: 'flex', gap: 12 }}>
          {(['kid', 'grown-up'] as PlayerMode[]).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-btn ${mode === m ? 'px-btn-purple' : 'px-btn-dark'}`}
              style={{ flex: 1, fontSize: 10 }}
            >
              {m === 'kid' ? '🧒 Kid' : '🧑 Adult'}
            </button>
          ))}
        </div>

        <button onClick={join} disabled={!name.trim() || sent}
          className={`px-btn ${name.trim() ? 'px-btn-green' : 'px-btn-dark'}`}
          style={{ display: 'block', width: '100%', marginTop: 20, fontSize: 10 }}
        >
          {sent ? '✓  Joined!' : '▶  Join Battle!'}
        </button>
      </div>
    </div>
  );
}

// ── Character Select ──────────────────────────────────────────

function CharSelectView() {
  const [selected, setSelected] = useState<CharacterName | null>(null);
  const confirm = () => { if (selected) socket.emit('select_character', { character: selected }); };
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#020617',
      display: 'flex',
      flexDirection: 'column',
      padding: '12px 10px',
      paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
      gap: 10,
      overflow: 'hidden',
    }}>
      <h2 style={{
        color: '#fbbf24', fontWeight: 400, margin: 0,
        fontFamily: "'Press Start 2P', monospace", fontSize: 10,
        lineHeight: 1.8, textAlign: 'center', flexShrink: 0,
      }}>
        ⚔️ Choose Your Fighter!
      </h2>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center' }}>
        <CharacterSelector selected={selected} onSelect={setSelected} />
      </div>
      <button onClick={confirm} disabled={!selected}
        className={`px-btn ${selected ? 'px-btn-purple' : 'px-btn-dark'}`}
        style={{ flexShrink: 0, padding: '14px 32px' }}
      >
        {selected ? '▶  Ready!' : 'Pick a fighter'}
      </button>
    </div>
  );
}

// ── Battle ────────────────────────────────────────────────────

function BattleView({ state, me }: { state: GameState; me: NonNullable<ReturnType<typeof state.players.find>> }) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const myAnswerStatus = state.playerAnswerStatus[me.id];
  const myQuestion     = state.playerQuestions[me.id];
  const opponents      = state.players.filter(p => p.id !== me.id && !p.isEliminated);

  const handleAnswer = (answer: string) => {
    if (selectedAnswer || myAnswerStatus !== null) return;
    setSelectedAnswer(answer);
    socket.emit('submit_answer', { answerId: answer });
  };

  // Reset local selection when a new round starts (questions change)
  const questionId = myQuestion?.id;
  const [lastQuestionId, setLastQuestionId] = useState<string | undefined>(questionId);
  if (questionId !== lastQuestionId) { setLastQuestionId(questionId); setSelectedAnswer(null); }

  // ── Sounds & haptics ──────────────────────────────────────────
  const prevAnswerStatus = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (myAnswerStatus === prevAnswerStatus.current) return;
    prevAnswerStatus.current = myAnswerStatus;
    if (myAnswerStatus === 'correct') {
      sound.play('correct');
      haptic('correct');
    } else if (myAnswerStatus === 'wrong') {
      sound.play('wrong');
      if (me.mode === 'grown-up') haptic('wrong_grownup');
    }
  }, [myAnswerStatus, me.mode]);

  const prevRoundPhase = useRef(state.roundPhase);
  useEffect(() => {
    if (state.roundPhase === 'announcing' && prevRoundPhase.current !== 'announcing') {
      sound.play('round_start');
    }
    prevRoundPhase.current = state.roundPhase;
  }, [state.roundPhase]);

  const prevAttackKey = useRef('');
  useEffect(() => {
    if (state.roundPhase !== 'resolving') return;
    const key = state.attackResults.map(r => `${r.attackerId}>${r.targetId}`).join('|');
    if (key === prevAttackKey.current) return;
    prevAttackKey.current = key;
    const hit = state.attackResults.find(r => r.targetId === me.id);
    if (hit) {
      const snd = hit.attack.type === 'ultimate' ? 'attack_ultimate'
        : hit.attack.type === 'power' ? 'attack_power' : 'attack_normal';
      sound.play(snd);
      hit.targetEliminated ? haptic('ko') : haptic('attacked');
    }
  }, [state.attackResults, state.roundPhase, me.id]);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#020617', display: 'flex', flexDirection: 'column',
      padding: '10px 14px',
      paddingBottom: 'max(10px, env(safe-area-inset-bottom))',
      gap: 8, overflow: 'hidden',
    }}>
      {/* My stats bar */}
      <div className="px-panel" style={{ padding: '8px 12px', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 800, color: '#e2e8f0', fontSize: 10, fontFamily: "'Press Start 2P', monospace" }}>{me.name}</span>
            <span>
              {[0, 1].map(i => (
                <span key={i} style={{ fontSize: 13, color: i < (state.matchWins[me.id] ?? 0) ? '#fbbf24' : '#1e293b' }}>★</span>
              ))}
            </span>
          </div>
          <span style={{ fontSize: 8, color: '#64748b', fontFamily: "'Press Start 2P', monospace" }}>❤️ {me.hp}  ✨ {me.hype}</span>
        </div>
        <HPBar hp={me.hp} maxHp={me.maxHp} compact />
        <div style={{ height: 3 }} />
        <HypeBar hype={me.hype} compact />
      </div>

      {/* Main content area — scrolls internally if content is too tall */}
      <div style={{ flex: 1, overflow: 'hidden', overflowY: 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
        {/* ANSWERING phase */}
        {state.roundPhase === 'answering' && myQuestion && myAnswerStatus === null && (
          <QuestionCard
            question={myQuestion} timeLeft={state.timeLeft}
            onAnswer={handleAnswer} disabled={!!selectedAnswer}
            selectedAnswer={selectedAnswer}
          />
        )}

        {state.roundPhase === 'answering' && myAnswerStatus !== null && (
          <StatusCard icon={myAnswerStatus === 'correct' ? '✓' : '✗'}
            color={myAnswerStatus === 'correct' ? '#22c55e' : '#ef4444'}
            title={myAnswerStatus === 'correct' ? 'Correct!' : 'Wrong answer!'}
            sub="Waiting for others…"
            others={state.players.filter(p => p.id !== me.id && !p.isEliminated).map(p => ({
              name: p.name,
              status: state.playerAnswerStatus[p.id],
            }))}
          />
        )}

        {/* ATTACKING phase */}
        {state.roundPhase === 'attacking' && myAnswerStatus === 'correct' && !state.playerAttacks[me.id] && (
          <AttackMenu
            targets={opponents} myHype={me.hype} timeLeft={state.timeLeft}
            onAttack={(targetId, attackType) => socket.emit('submit_attack', { targetId, attackType })}
          />
        )}

        {state.roundPhase === 'attacking' && myAnswerStatus === 'correct' && state.playerAttacks[me.id] && (
          <StatusCard icon="⚔️" color="#fbbf24" title="Attack locked in!" sub="Waiting for battle…" />
        )}

        {state.roundPhase === 'attacking' && myAnswerStatus === 'wrong' && (
          <StatusCard icon="😅" color="#64748b" title="Nice try!" sub="Watch the battle…" />
        )}

        {/* RESOLVING phase */}
        {state.roundPhase === 'resolving' && (
          <div className="px-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚔️</div>
            {state.attackResults.map((r, i) => {
              const attacker = state.players.find(p => p.id === r.attackerId)?.name ?? '?';
              const target   = state.players.find(p => p.id === r.targetId)?.name ?? '?';
              return (
                <p key={i} style={{ color: '#f472b6', fontFamily: "'Press Start 2P', monospace", fontSize: 10, lineHeight: 1.8, marginBottom: 8 }}>
                  {r.attack.emoji} {attacker} → {target}: <span style={{ color: '#ef4444' }}>-{r.damage} HP</span>
                  {r.targetEliminated && ' 💀'}
                </p>
              );
            })}
            {state.attackResults.length === 0 && (
              <p style={{ color: '#94a3b8', fontFamily: "'Press Start 2P', monospace", fontSize: 9, lineHeight: 1.8 }}>No attacks this round!</p>
            )}
          </div>
        )}

        {/* ANNOUNCING / INTERMISSION */}
        {(state.roundPhase === 'announcing' || state.roundPhase === 'intermission') && (
          <StatusCard icon="🥊" color="#818cf8" title={state.message} sub="" />
        )}
      </div>

      {/* Emotes always visible at bottom */}
      <div style={{ flexShrink: 0, paddingBottom: 0 }}>
        <p style={{ color: '#334155', fontSize: 10, textAlign: 'center', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 1, fontFamily: "'Press Start 2P', monospace" }}>EMOTES</p>
        <EmotePanel players={state.players} />
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────

function StatusCard({ icon, color, title, sub, others }: {
  icon: string; color: string; title: string; sub: string;
  others?: { name: string; status: string | null }[];
}) {
  return (
    <div className="px-card" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 52, color, marginBottom: 8 }}>{icon}</div>
      <p style={{ fontWeight: 800, fontSize: 12, color: '#e2e8f0', marginBottom: 4, fontFamily: "'Press Start 2P', monospace" }}>{title}</p>
      {sub && <p style={{ color: '#64748b', fontSize: 9, fontFamily: "'Press Start 2P', monospace" }}>{sub}</p>}
      {others && others.length > 0 && (
        <div style={{ marginTop: 16, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {others.map(o => (
            <div key={o.name} className="px-clip" style={{
              padding: '6px 14px',
              background: o.status === 'correct' ? '#052e16' : o.status === 'wrong' ? '#1f0707' : '#0f1e35',
              border: `2px solid ${o.status === 'correct' ? '#22c55e' : o.status === 'wrong' ? '#ef4444' : '#1e3050'}`,
              fontSize: 9, color: '#e2e8f0', fontFamily: "'Press Start 2P', monospace",
            }}>
              {o.status === 'correct' ? '✓' : o.status === 'wrong' ? '✗' : '💭'} {o.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Waiting({ state, me, label }: { state: GameState; me: { name: string; mode: string } | null; label: string }) {
  return (
    <div style={page}>
      <img src="/quiz-battle-logo.png" alt="Quiz Battle" style={{ width: '80%', maxWidth: 300, imageRendering: 'pixelated', filter: 'drop-shadow(0 4px 16px #000000cc)', marginBottom: 8 }} />
      {me && <p style={{ color: '#475569', marginBottom: 8, fontSize: 8, fontFamily: "'Press Start 2P', monospace", lineHeight: 1.8 }}>{me.mode === 'kid' ? '🧒 Kid' : '🧑 Adult'} — {me.name}</p>}
      <div className="px-card" style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16, animation: 'spin 2s linear infinite' }}>⚙️</div>
        <p style={{ color: '#94a3b8', fontSize: 10, fontFamily: "'Press Start 2P', monospace" }}>{label}</p>
        {state.message && <p style={{ color: '#475569', fontSize: 8, fontFamily: "'Press Start 2P', monospace", marginTop: 8 }}>{state.message}</p>}
      </div>
    </div>
  );
}

function GameOverView({ state, me }: { state: GameState; me: { name: string } | null }) {
  const iWon = me && state.winner?.name === me.name;
  useEffect(() => {
    if (iWon) { sound.play('victory'); haptic('victory'); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div style={{ ...page, gap: 16 }}>
      <img src="/quiz-battle-logo.png" alt="Quiz Battle" style={{ width: '80%', maxWidth: 280, imageRendering: 'pixelated', filter: 'drop-shadow(0 4px 16px #000000cc)' }} />
      <div style={{ fontSize: 64 }}>{iWon ? '🏆' : '💀'}</div>
      <div className="px-card" style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
        <p className="px" style={{ fontSize: 13, color: iWon ? '#fbbf24' : '#94a3b8', marginBottom: 8 }}>
          {iWon ? '★ YOU WIN! ★' : state.winner ? `${state.winner.name} wins!` : "Draw!"}
        </p>
        <p style={{ color: '#475569', fontSize: 8, fontFamily: "'Press Start 2P', monospace", lineHeight: 1.8 }}>Waiting for host…</p>
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────

const page: React.CSSProperties = {
  minHeight: '100vh', height: '100dvh',
  background: '#020617', display: 'flex',
  flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  padding: '24px 16px', gap: 8, overflow: 'hidden',
};
const title: React.CSSProperties = {
  fontSize: 16, fontWeight: 400, margin: 0, marginBottom: 12,
  fontFamily: "'Press Start 2P', monospace",
  background: 'linear-gradient(90deg, #818cf8, #a78bfa, #f472b6)',
  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  lineHeight: 1.8,
};
