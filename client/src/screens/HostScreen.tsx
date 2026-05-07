import { useEffect, useRef, useState } from 'react';
import { GameState, Player } from '../types';
import { socket } from '../socket';
import { QRCodeSVG } from 'qrcode.react';
import { FightingStage } from '../components/FightingStage';
import { CharacterSprite } from '../components/CharacterSprite';
import { HPBar } from '../components/HPBar';
import { HypeBar } from '../components/HypeBar';
import { sound } from '../utils/sound';
import { music, trackForBattle } from '../utils/music';

interface Props { state: GameState; }

export function HostScreen({ state }: Props) {
  // QR code always points to the frontend origin (Vercel in prod, localhost:3000 in dev)
  const joinUrl = `${window.location.origin}/join`;
  const [showSettings, setShowSettings] = useState(false);

  const prevPhase = useRef(state.phase);
  useEffect(() => {
    if (state.phase === 'game_over' && prevPhase.current !== 'game_over') {
      setTimeout(() => sound.play('victory'), 1200);
    }
    prevPhase.current = state.phase;
  }, [state.phase]);

  // ── Background music ──────────────────────────────────────────
  useEffect(() => {
    if (state.phase === 'lobby' || state.phase === 'character_select') {
      music.play('/music/lobby.mp3');
    } else if (state.phase === 'battle') {
      music.play(trackForBattle(state.battleNumber));
    } else if (state.phase === 'game_over') {
      music.stop();
    }
  }, [state.phase, state.battleNumber]);

  // Lobby gets its own full-screen layout
  if (state.phase === 'lobby') return <LobbyView state={state} joinUrl={joinUrl} />;
  if (state.phase === 'character_select') return <CharSelectView state={state} />;

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#e2e8f0', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <header style={{ display: 'flex', alignItems: 'center', position: 'relative', minHeight: 56 }}>
        {state.phase !== 'game_over' && (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <img src="/quiz-battle-logo.png" alt="Quiz Battle" style={{ height: 44, imageRendering: 'pixelated', filter: 'drop-shadow(0 2px 8px #000000cc)' }} />
          </div>
        )}
        <button
          onClick={() => setShowSettings(s => !s)}
          className="px-clip"
          style={{ position: 'absolute', right: 0, background: '#060d20cc', border: '3px solid #1e3050', boxShadow: '3px 3px 0 #000000bb', padding: '8px 12px', cursor: 'pointer', fontSize: 16, color: '#94a3b8', fontFamily: "'Press Start 2P', monospace" }}
        >⚙</button>
        {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      </header>

      {state.phase === 'battle'    && <BattleView state={state} />}
      {state.phase === 'game_over' && <GameOverView state={state} />}
    </div>
  );
}

// ── Settings panel ────────────────────────────────────────────

function SettingsPanel({ onClose }: { onClose: () => void }) {
  const [sfxMuted,   setSfxMuted]   = useState(sound.muted);
  const [sfxVol,     setSfxVol]     = useState(Math.round(sound.volume * 100));
  const [musicMuted, setMusicMuted] = useState(music.muted);
  const [musicVol,   setMusicVol]   = useState(Math.round(music.volume * 100));

  const px8: React.CSSProperties = { fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#94a3b8', lineHeight: 1.8 };
  const px8dim: React.CSSProperties = { fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#64748b', display: 'block', marginBottom: 8 };

  function PixelToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
    return (
      <div onClick={onToggle} className="px-clip" style={{
        width: 20, height: 20, flexShrink: 0, cursor: 'pointer',
        background: on ? '#22c55e' : '#1e293b',
        border: `2px solid ${on ? '#16a34a' : '#334155'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {on && <span style={{ color: '#fff', fontSize: 10, fontFamily: "'Press Start 2P', monospace" }}>✓</span>}
      </div>
    );
  }

  return (
    <div
      className="px-clip"
      style={{
        position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 200,
        background: '#060d20f0', border: '3px solid #1e3050',
        boxShadow: '4px 4px 0 #000000bb',
        padding: '16px 18px', minWidth: 250,
      }}
      onClick={e => e.stopPropagation()}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, lineHeight: 1 }}>⚙</span>
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: '#e2e8f0', letterSpacing: 1 }}>SETTINGS</span>
        </div>
        <button onClick={onClose} className="px-clip" style={{
          background: '#1e293b', border: '2px solid #334155', color: '#94a3b8',
          cursor: 'pointer', fontSize: 12, width: 24, height: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Press Start 2P', monospace", padding: 0,
        }}>✕</button>
      </div>

      {/* SFX row */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <PixelToggle on={!sfxMuted} onToggle={() => {
            const next = !sfxMuted;
            sound.setMuted(next);
            setSfxMuted(next);
          }} />
          <span style={px8}>SFX {sfxMuted ? 'OFF' : 'ON'}</span>
        </div>
        <span style={px8dim}>SFX VOLUME: {sfxVol}%</span>
        <input type="range" min={0} max={100} value={sfxVol}
          style={{ width: '100%', accentColor: '#6366f1', cursor: 'pointer' }}
          onChange={e => { sound.setVolume(+e.target.value / 100); setSfxVol(+e.target.value); }}
        />
      </div>

      {/* Music row */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <PixelToggle on={!musicMuted} onToggle={() => {
            const next = !musicMuted;
            music.setMuted(next);
            setMusicMuted(next);
          }} />
          <span style={px8}>MUSIC {musicMuted ? 'OFF' : 'ON'}</span>
        </div>
        <span style={px8dim}>MUSIC VOLUME: {musicVol}%</span>
        <input type="range" min={0} max={100} value={musicVol}
          style={{ width: '100%', accentColor: '#a855f7', cursor: 'pointer' }}
          onChange={e => { music.setVolume(+e.target.value / 100); setMusicVol(+e.target.value); }}
        />
      </div>

      <button onClick={() => sound.play('correct')} className="px-btn px-btn-dark"
        style={{ display: 'block', width: '100%', padding: '10px', fontSize: 8 }}>
        ▶ TEST SOUND
      </button>
    </div>
  );
}

// ── Story ─────────────────────────────────────────────────────

const STORY: { text: string; type?: 'divider' | 'title' | 'welcome' }[] = [
  { text: 'Somewhere beyond all worlds...' },
  { text: '◆', type: 'divider' },
  { text: 'There is a place where\nchampions gather.' },
  { text: '◆', type: 'divider' },
  { text: 'Not to fight with just swords...\nBut with their brains.' },
  { text: '◆', type: 'divider' },
  { text: 'The Quiz King has summoned\nthe greatest heroes and villains\nfrom every universe to compete.' },
  { text: '◆', type: 'divider' },
  { text: 'Only one can win.\nOnly one can prove\nthey are the smartest.' },
  { text: '◆', type: 'divider' },
  { text: 'Welcome to...', type: 'welcome' },
  { text: 'QUIZ BATTLE!', type: 'title' },
];

// Render a paragraph with heroes/villains coloring applied once fully revealed
function StoryParagraph({ text, type, revealed }: { text: string; type?: string; revealed: boolean }) {
  if (type === 'divider') {
    return <div style={{ color: '#6b21a8', fontSize: 14, lineHeight: 1, textAlign: 'center', opacity: 0.7 }}>◆</div>;
  }
  if (type === 'title') {
    return (
      <div style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 28, fontWeight: 700,
        background: 'linear-gradient(180deg, #fef08a 0%, #f59e0b 40%, #d97706 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        textShadow: 'none',
        textAlign: 'center', letterSpacing: 3,
        filter: 'drop-shadow(0 2px 8px #f59e0baa)',
        animation: revealed ? 'logo-bob 3s ease-in-out infinite' : 'none',
      }}>
        {text}
      </div>
    );
  }
  if (type === 'welcome') {
    return (
      <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 13, color: '#e2e8f0', textAlign: 'center', lineHeight: 2 }}>
        {text}
      </div>
    );
  }

  const baseStyle: React.CSSProperties = {
    fontFamily: "'Press Start 2P', monospace", fontSize: 12,
    color: '#cbd5e1', lineHeight: 2, whiteSpace: 'pre-line',
    width: '100%', textAlign: 'center',
  };

  // Color heroes/villains once fully revealed
  if (revealed && text.includes('heroes')) {
    const parts = text.split(/(heroes|villains)/g);
    return (
      <div style={baseStyle}>
        {parts.map((p, i) =>
          p === 'heroes'   ? <span key={i} style={{ color: '#60a5fa' }}>heroes</span>
          : p === 'villains' ? <span key={i} style={{ color: '#f87171' }}>villains</span>
          : p
        )}
      </div>
    );
  }

  return <div style={baseStyle}>{text}</div>;
}

function StoryView({ onClose }: { onClose: () => void }) {
  const [paraIdx,  setParaIdx]  = useState(0);
  const [charIdx,  setCharIdx]  = useState(0);
  const [revealed, setRevealed] = useState<boolean[]>(STORY.map(() => false));

  // Typewriter tick
  useEffect(() => {
    if (paraIdx >= STORY.length) return;
    const para = STORY[paraIdx];

    // Dividers appear instantly
    if (para.type === 'divider') {
      setRevealed(r => { const n = [...r]; n[paraIdx] = true; return n; });
      const t = setTimeout(() => { setParaIdx(i => i + 1); setCharIdx(0); }, 300);
      return () => clearTimeout(t);
    }

    if (charIdx < para.text.length) {
      const delay = para.type === 'title' ? 80 : 28;
      const t = setTimeout(() => setCharIdx(c => c + 1), delay);
      return () => clearTimeout(t);
    } else {
      // Paragraph done — mark revealed, pause briefly, advance
      setRevealed(r => { const n = [...r]; n[paraIdx] = true; return n; });
      const pause = para.type === 'title' ? 0 : para.type === 'welcome' ? 400 : 600;
      const t = setTimeout(() => { setParaIdx(i => i + 1); setCharIdx(0); }, pause);
      return () => clearTimeout(t);
    }
  }, [paraIdx, charIdx]);

  const skipAll = () => {
    setParaIdx(STORY.length);
    setCharIdx(0);
    setRevealed(STORY.map(() => true));
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      backgroundImage: "url('/lobby-bg.png')",
      backgroundSize: 'cover', backgroundPosition: 'center bottom',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Dark overlay */}
      <div style={{ position: 'absolute', inset: 0, background: '#000000aa', pointerEvents: 'none' }} />

      {/* Frame + content — size by height so text fits without scrolling */}
      <div style={{
        position: 'relative', zIndex: 10,
        height: '92vh',
        width: `calc(92vh * (1024 / 1536))`, // maintain frame aspect ratio
        margin: '0 auto',
        flexShrink: 0,
      }}>
        {/* Frame image */}
        <img
          src="/story-frame.png"
          alt=""
          style={{ width: '100%', display: 'block', imageRendering: 'pixelated' }}
        />

        {/* Text content — overlaid inside the frame */}
        <div style={{
          position: 'absolute',
          top: '13%', left: '10%', right: '10%', bottom: '6%',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 14, padding: '0 8px',
          overflow: 'hidden',
        }}>
          {STORY.map((para, i) => {
            if (i > paraIdx) return null;
            const isActive = i === paraIdx;
            const isFullyRevealed = revealed[i];
            const displayText = isActive && !isFullyRevealed
              ? para.text.slice(0, charIdx)
              : para.text;
            return (
              <StoryParagraph
                key={i}
                text={displayText}
                type={para.type}
                revealed={isFullyRevealed}
              />
            );
          })}
        </div>
      </div>

      {/* Bottom buttons */}
      <div style={{ position: 'absolute', bottom: 24, left: 0, right: 0, zIndex: 20, display: 'flex', justifyContent: 'center', gap: 12 }}>
        {paraIdx < STORY.length && (
          <button onClick={skipAll} className="px-btn px-btn-dark" style={{ fontSize: 9, padding: '10px 20px' }}>
            ⏩ Skip
          </button>
        )}
        <button onClick={onClose} className="px-btn px-btn-dark" style={{ fontSize: 9, padding: '10px 20px' }}>
          ✕ Close
        </button>
      </div>
    </div>
  );
}

// ── Lobby ─────────────────────────────────────────────────────

function LobbyView({ state, joinUrl }: { state: GameState; joinUrl: string }) {
  const [showSettings, setShowSettings] = useState(false);
  const [showStory,    setShowStory]    = useState(false);

  if (showStory) return <StoryView onClose={() => setShowStory(false)} />;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      backgroundImage: "url('/lobby-bg.png')",
      backgroundSize: 'cover',
      backgroundPosition: 'center bottom',
      color: '#e2e8f0',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* Subtle vignette to help UI elements pop */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 60% at 50% 100%, #00000066 0%, transparent 70%)',
      }} />

      {/* Top-right buttons: Story + Settings */}
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 200, display: 'flex', gap: 8 }}>
        <button onClick={() => setShowStory(true)} className="px-clip" style={{
          background: '#060d20cc',
          border: '3px solid #1e3050',
          boxShadow: '3px 3px 0 #000000bb',
          padding: '8px 12px',
          cursor: 'pointer',
          fontSize: 11,
          color: '#fbbf24',
          backdropFilter: 'blur(4px)',
          fontFamily: "'Press Start 2P', monospace",
          letterSpacing: 1,
        }}>📖</button>
        <button onClick={() => setShowSettings(s => !s)} className="px-clip" style={{
          background: '#060d20cc',
          border: '3px solid #1e3050',
          boxShadow: '3px 3px 0 #000000bb',
          padding: '8px 12px',
          cursor: 'pointer',
          fontSize: 16,
          color: '#94a3b8',
          backdropFilter: 'blur(4px)',
          fontFamily: "'Press Start 2P', monospace",
        }}>⚙</button>
        {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      </div>

      {/* Logo — sits in the upper sky area of the background */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', zIndex: 10,
        paddingTop: 16, paddingBottom: 8,
        // keep logo out of the banner columns (roughly 18% each side)
        paddingLeft: '18%', paddingRight: '18%',
      }}>
        <img
          src="/quiz-battle-logo.png"
          alt="Quiz Battle"
          style={{
            width: '100%',
            maxWidth: 560,
            height: 'auto',
            imageRendering: 'pixelated',
            filter: 'drop-shadow(0 6px 24px #000000cc)',
            animation: 'logo-bob 3.5s ease-in-out infinite',
          }}
        />
      </div>

      {/* Bottom: QR + Players — sits over the floor */}
      <div style={{
        position: 'relative', zIndex: 10,
        width: '100%', padding: '0 24px 44px',
      }}>
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 32,
        alignItems: 'flex-start',
        maxWidth: 720, margin: '0 auto',
      }}>
        {/* QR */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, textShadow: '0 2px 8px #000' }}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>📱</span>
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: '#e2e8f0', letterSpacing: 2 }}>SCAN TO JOIN</span>
          </div>
          <div className="px-clip" style={{
            background: '#060d20ee', border: '3px solid #1e3050',
            padding: '14px 14px 10px', boxShadow: '4px 4px 0 #000000bb',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          }}>
            <div style={{ background: '#fff', padding: 10 }}>
              <QRCodeSVG value={joinUrl} size={148} />
            </div>
            <p style={{ color: '#475569', fontSize: 11, margin: 0, wordBreak: 'break-all', maxWidth: 170, textAlign: 'center' }}>
              {joinUrl}
            </p>
          </div>
        </div>

        {/* Players */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, textShadow: '0 2px 8px #000', marginBottom: 10 }}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>👥</span>
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: '#e2e8f0', letterSpacing: 2 }}>PLAYERS ({state.players.length})</span>
          </div>

          <div className="px-clip" style={{
            background: '#060d20ee', border: '3px solid #1e3050',
            padding: '12px 14px', minHeight: 72, boxShadow: '4px 4px 0 #000000bb',
          }}>
            {state.players.length === 0
              ? <p style={{ color: '#475569', margin: 0, fontSize: 9, fontFamily: "'Press Start 2P', monospace", lineHeight: 1.8 }}>Waiting for players…</p>
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {state.players.map(p => (
                    <div key={p.id} className="px-clip" style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      background: '#0d1a30', padding: '8px 12px',
                      border: '2px solid #1e3050',
                    }}>
                      <span style={{ fontSize: 18 }}>{p.mode === 'kid' ? '🧒' : '🧑'}</span>
                      <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: '#e2e8f0' }}>{p.name}</span>
                      <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#475569', marginLeft: 2 }}>{p.mode === 'kid' ? 'KID' : 'ADULT'}</span>
                      <span style={{ marginLeft: 'auto', color: '#22c55e', fontFamily: "'Press Start 2P', monospace", fontSize: 9 }}>OK</span>
                    </div>
                  ))}
                </div>
              )
            }
          </div>

          <div className="px-clip" style={{
            marginTop: 10, padding: '9px 18px',
            background: '#060d20ee', border: '3px solid #1e3050',
            color: '#94a3b8', fontSize: 9, textAlign: 'center',
            boxShadow: '4px 4px 0 #000000bb',
            fontFamily: "'Press Start 2P', monospace",
          }}>
            {state.players.length < 2
              ? `Need ${2 - state.players.length} more player${2 - state.players.length === 1 ? '' : 's'} to start`
              : '⚔️ Game starts automatically…'
            }
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

// ── Character Select ──────────────────────────────────────────

function CharSelectView({ state }: { state: GameState }) {
  const allReady = state.players.length >= 2 && state.players.every(p => p.character);
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      backgroundImage: "url('/lobby-bg.png')",
      backgroundSize: 'cover',
      backgroundPosition: 'center bottom',
      color: '#e2e8f0',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 60% at 50% 100%, #00000066 0%, transparent 70%)',
      }} />

      {/* Logo */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', zIndex: 10,
        paddingTop: 16, paddingBottom: 8,
        paddingLeft: '18%', paddingRight: '18%',
      }}>
        <img
          src="/quiz-battle-logo.png"
          alt="Quiz Battle"
          style={{ width: '100%', maxWidth: 400, height: 'auto', imageRendering: 'pixelated', filter: 'drop-shadow(0 6px 24px #000000cc)' }}
        />
      </div>

      {/* Fighter cards */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', padding: '0 24px 44px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{
            fontFamily: "'Press Start 2P', monospace", fontSize: 11,
            color: '#e2e8f0', letterSpacing: 2, textShadow: '0 2px 8px #000',
          }}>⚔️ CHOOSE YOUR FIGHTER</div>

          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
            {state.players.map(p => (
              <div key={p.id} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                background: '#060d20ee', padding: 16, minWidth: 130,
                border: `3px solid ${p.character ? '#22c55e55' : '#1e3050'}`,
                boxShadow: '4px 4px 0 #000000bb',
                clipPath: 'polygon(6px 0,calc(100% - 6px) 0,100% 6px,100% calc(100% - 6px),calc(100% - 6px) 100%,6px 100%,0 calc(100% - 6px),0 6px)',
              }}>
                {allReady && p.character
                  ? <CharacterSprite character={p.character} size="lg" isActive />
                  : <div style={{ width: 96, height: 96, background: '#ffffff0d', borderRadius: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, border: '2px solid #1e3050' }}>❓</div>
                }
                <span style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</span>
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: allReady ? '#22c55e' : p.character ? '#fbbf24' : '#64748b' }}>
                  {allReady ? '✓ Ready!' : p.character ? '⏳ Locked' : 'Choosing…'}
                </span>
              </div>
            ))}
          </div>

          <div className="px-clip" style={{
            padding: '9px 20px',
            background: '#060d20ee', border: '2px solid #1e3050', fontSize: 9,
            color: allReady ? '#22c55e' : '#94a3b8',
            boxShadow: '4px 4px 0 #000000bb',
            fontFamily: "'Press Start 2P', monospace",
          }}>
            {allReady ? '⚔️ Battle starting…' : 'Waiting for all players to choose…'}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Battle ────────────────────────────────────────────────────

function WinPips({ wins }: { wins: number }) {
  return (
    <span style={{ letterSpacing: 2 }}>
      {[0, 1].map(i => (
        <span key={i} style={{ fontSize: 18, color: i < wins ? '#fbbf24' : '#1e293b', textShadow: i < wins ? '0 0 8px #fbbf24' : 'none' }}>★</span>
      ))}
    </span>
  );
}

function PlayerHUD({ player, wins, flip }: { player: Player; wins: number; flip: boolean }) {
  const borderColor = flip ? '#ef444455' : '#3b82f655';
  return (
    <div className="px-clip" style={{
      background: '#060d20ee', border: `3px solid ${borderColor}`,
      boxShadow: '4px 4px 0 #000000bb',
      padding: '10px 14px', width: 280, display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      {/* Name row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexDirection: flip ? 'row-reverse' : 'row' }}>
        <div className="px-clip" style={{
          background: flip ? '#1a0505' : '#050d1a',
          border: `2px solid ${flip ? '#ef4444' : '#3b82f6'}`,
          width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, lineHeight: 1,
        }}>⚔️</div>
        <span className="px" style={{ fontSize: 11, color: '#e2e8f0', letterSpacing: 1, flex: 1, textAlign: flip ? 'right' : 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {player.name.toUpperCase()}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
          {[0,1].map(i => <span key={i} style={{ fontSize: 16, lineHeight: 1, color: i < wins ? '#fbbf24' : '#1e293b', textShadow: i < wins ? '0 0 8px #fbbf24' : 'none' }}>★</span>)}
        </span>
      </div>
      {/* HP row — label + full-width bar + value */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: '#22c55e', lineHeight: 1 }}>HP</span>
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: '#e2e8f0', lineHeight: 1 }}>{player.hp} / {player.maxHp}</span>
        </div>
        <HPBar hp={player.hp} maxHp={player.maxHp} compact barHeight={16} />
      </div>
      {/* XP row */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: '#a855f7', lineHeight: 1 }}>XP</span>
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: '#e2e8f0', lineHeight: 1 }}>{player.hype} / 100</span>
        </div>
        <HypeBar hype={player.hype} compact barHeight={12} />
      </div>
    </div>
  );
}

function BattleView({ state }: { state: GameState }) {
  const [p1, p2] = state.players;
  const [confirmQuit, setConfirmQuit] = useState(false);
  const paused = state.paused ?? false;

  const handlePause  = () => { setConfirmQuit(false); socket.emit('pause_game'); };
  const handleResume = () => { setConfirmQuit(false); socket.emit('resume_game'); };
  const handleQuit   = () => { socket.emit('restart_game'); };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#020617', overflow: 'hidden' }}>

      {/* Top HUD — overlaid above the canvas */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 10px 0',
      }}>
        {p1 && <PlayerHUD player={p1} wins={state.matchWins[p1.id] ?? 0} flip={false} />}

        {/* Center — battle number */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="px-clip" style={{
            background: '#060d20ee', border: '3px solid #1e3050',
            boxShadow: '4px 4px 0 #000000bb',
            padding: '6px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: '#e2e8f0', letterSpacing: 2 }}>
              ⚔ BATTLE {state.battleNumber}
            </span>
          </div>
        </div>

        {p2 && <PlayerHUD player={p2} wins={state.matchWins[p2.id] ?? 0} flip={true} />}
      </div>

      {/* Pause button — bottom center */}
      <div style={{
        position: 'absolute', bottom: 16, left: 0, right: 0, zIndex: 20,
        display: 'flex', justifyContent: 'center',
      }}>
        <button
          onClick={paused ? handleResume : handlePause}
          className="px-clip"
          style={{
            background: paused ? '#052e16ee' : '#060d20cc',
            border: `2px solid ${paused ? '#22c55e' : '#1e3050'}`,
            boxShadow: '3px 3px 0 #000000bb',
            padding: '8px 20px', cursor: 'pointer',
            fontFamily: "'Press Start 2P', monospace", fontSize: 9,
            color: paused ? '#22c55e' : '#475569',
            letterSpacing: 1,
          }}
        >
          {paused ? '▶ RESUME' : '⏸ PAUSE'}
        </button>
      </div>

      {/* Pause overlay */}
      {paused && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 50,
          background: '#000000bb',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20,
        }}>
          <div className="px-clip" style={{
            background: '#060d20f0', border: '3px solid #1e3050',
            boxShadow: '6px 6px 0 #000000cc',
            padding: '36px 48px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
          }}>
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 28, color: '#e2e8f0', letterSpacing: 4 }}>
              ⏸ PAUSED
            </span>

            <button onClick={handleResume} className="px-btn px-btn-green" style={{ padding: '14px 36px', fontSize: 11, width: '100%' }}>
              ▶ Resume
            </button>

            {!confirmQuit ? (
              <button onClick={() => setConfirmQuit(true)} className="px-btn px-btn-dark" style={{ padding: '14px 36px', fontSize: 11, width: '100%' }}>
                ↩ Quit to Lobby
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', alignItems: 'center' }}>
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#ef4444', lineHeight: 1.8, textAlign: 'center' }}>
                  Are you sure? This ends the game!
                </span>
                <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                  <button onClick={() => setConfirmQuit(false)} className="px-btn px-btn-dark" style={{ flex: 1, fontSize: 9, padding: '12px 0' }}>
                    Cancel
                  </button>
                  <button onClick={handleQuit} className="px-btn px-btn-purple" style={{ flex: 1, fontSize: 9, padding: '12px 0' }}>
                    ✓ Quit
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FightingStage — fills full viewport */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <FightingStage
          players={state.players}
          roundPhase={state.roundPhase}
          playerAnswerStatus={state.playerAnswerStatus}
          attackResults={state.attackResults}
          timeLeft={state.timeLeft}
          roundNumber={state.roundNumber}
          battleNumber={state.battleNumber}
          message={state.message}
          hideHpBar
        />
      </div>

      {/* Answer status row */}
      {state.roundPhase === 'answering' && (
        <div style={{
          position: 'absolute', top: 110, left: 0, right: 0, zIndex: 20,
          display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap',
        }}>
          {state.players.filter(p => !p.isEliminated).map(p => {
            const status = state.playerAnswerStatus[p.id];
            return (
              <div key={p.id} className="px-clip" style={{
                padding: '6px 14px',
                background: status === 'correct' ? '#052e16ee' : status === 'wrong' ? '#1f0707ee' : '#060d20ee',
                border: `2px solid ${status === 'correct' ? '#22c55e' : status === 'wrong' ? '#ef4444' : '#1e3050'}`,
                fontSize: 13, fontWeight: 700, color: '#e2e8f0', display: 'flex', gap: 8, alignItems: 'center',
                boxShadow: '3px 3px 0 #000000aa',
              }}>
                <span>{status === 'correct' ? '✓' : status === 'wrong' ? '✗' : '💭'}</span>
                <span>{p.name}</span>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

// ── Game Over ─────────────────────────────────────────────────

function GameOverView({ state }: { state: GameState }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 20, textAlign: 'center' }}>
      <img src="/quiz-battle-logo.png" alt="Quiz Battle" style={{ width: '100%', maxWidth: 420, imageRendering: 'pixelated', filter: 'drop-shadow(0 4px 20px #000000cc)' }} />
      <div style={{ fontSize: 72, lineHeight: 1 }}>🏆</div>
      <h2 style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 22, fontWeight: 400, color: '#fbbf24', margin: 0, lineHeight: 1.6 }}>
        {state.winner ? `${state.winner.name} Wins!` : "Draw!"}
      </h2>
      <div style={{ display: 'flex', gap: 24 }}>
        {state.players.map(p => (
          <div key={p.id} className="px-clip" style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0f172a', padding: '10px 22px', border: '2px solid #1e293b' }}>
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: '#e2e8f0' }}>{p.name}</span>
            <WinPips wins={state.matchWins[p.id] ?? 0} />
          </div>
        ))}
      </div>
      {/* Plain sprite — no glow animation, no box */}
      {state.winner?.character && (
        <img
          src={`/sprites/${state.winner.character}.png`}
          alt={state.winner.character}
          style={{ height: 160, imageRendering: 'pixelated', filter: 'drop-shadow(0 4px 16px #000000cc)' }}
        />
      )}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}>
        <button onClick={() => socket.emit('rematch_game')} className="px-btn px-btn-purple" style={{ padding: '14px 28px' }}>
          ⚔ Rematch
        </button>
        <button onClick={() => socket.emit('new_characters')} className="px-btn px-btn-blue" style={{ padding: '14px 28px' }}>
          🎭 New Characters
        </button>
        <button onClick={() => socket.emit('restart_game')} className="px-btn px-btn-dark" style={{ padding: '14px 28px' }}>
          ↩ Lobby
        </button>
      </div>
    </div>
  );
}
