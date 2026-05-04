import { Server, Socket } from 'socket.io';
import {
  GameState, Player, PlayerMode, CharacterName,
  AttackType, AttackDef, AnswerStatus, CHARACTERS,
} from './types';
import { getNextQuestion, resetQueues } from './questions';

const ATTACKS: Record<AttackType, AttackDef> = {
  normal:   { type: 'normal',   name: 'Quick Strike', damage: 22, hypeCost: 0,   hypeRequired: 0,   emoji: '⚡' },
  power:    { type: 'power',    name: 'Power Blast',  damage: 38, hypeCost: 50,  hypeRequired: 50,  emoji: '💥' },
  ultimate: { type: 'ultimate', name: 'ULTIMATE!',    damage: 58, hypeCost: 100, hypeRequired: 100, emoji: '🌟' },
};

const ANSWER_TIME    = 18;
const ATTACK_TIME    = 10;
const ANNOUNCE_TIME  = 2000;
const PRE_RESOLVE    = 2500;  // pause after attacks locked so players look up
const RESOLVE_TIME   = 3000;
const INTERMISSION   = 1500;

const RECONNECT_GRACE_MS = 30_000;

export class GameEngine {
  private io: Server;
  private state: GameState;
  private timer: NodeJS.Timeout | null = null;
  private countdown: NodeJS.Timeout | null = null;

  // Reconnection tracking (server-side only — tokens never leave the server)
  private socketTokens   = new Map<string, string>(); // socketId  → token
  private tokenToId      = new Map<string, string>(); // token     → current socketId
  private gracePeriods   = new Map<string, NodeJS.Timeout>(); // token → expiry timer

  constructor(io: Server, serverUrl: string) {
    this.io = io;
    this.state = this.blank(serverUrl);
  }

  private blank(serverUrl: string): GameState {
    return {
      phase: 'lobby', roundPhase: 'intermission', roundNumber: 0, battleNumber: 0,
      players: [], playerQuestions: {}, playerAnswerStatus: {},
      playerAttacks: {}, attackResults: [],
      matchWins: {}, winner: null, hostId: null, serverUrl,
      message: 'Scan the QR code to join!', timeLeft: 0,
    };
  }

  handleConnection(socket: Socket) {
    socket.emit('game_state', this.state);

    socket.on('set_host', () => {
      // Accept if no host, or the previous host disconnected (socket gone)
      const prevAlive = this.state.hostId && this.io.sockets.sockets.has(this.state.hostId);
      if (!prevAlive) { this.state.hostId = socket.id; this.broadcast(); }
    });

    socket.on('join_lobby', ({ name, mode, token }: { name: string; mode: PlayerMode; token?: string }) => {
      // ── Reconnection path ───────────────────────────────────────
      if (token && this.gracePeriods.has(token)) {
        const oldId = this.tokenToId.get(token);
        const player = oldId ? this.state.players.find(p => p.id === oldId) : undefined;
        if (player?.isDisconnected) {
          clearTimeout(this.gracePeriods.get(token)!);
          this.gracePeriods.delete(token);
          if (oldId) this.socketTokens.delete(oldId);
          // Remap to new socket
          player.id = socket.id;
          player.isDisconnected = false;
          this.socketTokens.set(socket.id, token);
          this.tokenToId.set(token, socket.id);
          this.state.message = `${player.name} reconnected!`;
          this.broadcast();
          return;
        }
      }

      // ── Normal join ─────────────────────────────────────────────
      if (this.state.phase !== 'lobby' && this.state.phase !== 'character_select') return;
      if (this.state.players.find(p => p.id === socket.id)) return;
      this.state.players.push({
        id: socket.id, name: name.trim().slice(0, 16) || 'Player', mode,
        character: null, hp: 100, maxHp: 100, hype: 0,
        isEliminated: false, isHost: false,
      });
      if (token) {
        this.socketTokens.set(socket.id, token);
        this.tokenToId.set(token, socket.id);
      }
      this.state.message = `${name} joined!`;
      this.broadcast();

      // Auto-start character select when 2+ players are in lobby
      if (this.state.phase === 'lobby' && this.state.players.length >= 2) {
        this.clearAll();
        this.state.phase = 'character_select';
        this.state.message = 'Choose your fighter!';
        this.broadcast();
      }
    });

    socket.on('select_character', ({ character }: { character: CharacterName }) => {
      if (!CHARACTERS.includes(character)) return;
      const p = this.state.players.find(p => p.id === socket.id);
      if (!p) return;
      p.character = character;
      const allReady = this.state.players.length >= 2 && this.state.players.every(p => p.character);
      if (allReady) {
        this.clearAll();
        this.state.message = 'All fighters ready! Battle starts in 3…';
        this.broadcast();
        this.timer = setTimeout(() => {
          this.state.players.forEach(q => { if (!q.character) q.character = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)]; });
          this.startBattle();
        }, 3000);
      } else {
        this.state.message = `${p.name} chose their fighter!`;
        this.broadcast();
      }
    });

    socket.on('start_game', () => {
      if (socket.id !== this.state.hostId) return;
      if (this.state.phase === 'lobby') {
        if (this.state.players.length < 2) return;
        this.state.phase = 'character_select';
        this.state.message = 'Choose your fighter!';
        this.broadcast();
      } else if (this.state.phase === 'character_select') {
        this.clearAll();
        this.state.players.forEach(p => {
          if (!p.character) p.character = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
        });
        this.startBattle();
      }
    });

    socket.on('submit_answer', ({ answerId }: { answerId: string }) => {
      this.handleAnswer(socket.id, answerId);
    });

    socket.on('submit_attack', ({ targetId, attackType }: { targetId: string; attackType: AttackType }) => {
      this.handleAttack(socket.id, targetId, attackType);
    });

    socket.on('send_emote', ({ emote }: { emote: string }) => {
      this.io.emit('emote_received', { playerId: socket.id, emote });
    });

    socket.on('restart_game', () => {
      if (socket.id !== this.state.hostId) return;
      this.restartGame();
    });

    socket.on('rematch_game', () => {
      if (socket.id !== this.state.hostId) return;
      if (this.state.phase !== 'game_over') return;
      this.startRematch();
    });

    socket.on('new_characters', () => {
      if (socket.id !== this.state.hostId) return;
      if (this.state.phase !== 'game_over') return;
      this.clearAll();
      // Reset match state but keep players connected
      this.state.players.forEach(p => {
        p.character = null;
        p.hp = 100; p.maxHp = 100; p.hype = 0; p.isEliminated = false;
      });
      Object.keys(this.state.matchWins).forEach(id => { this.state.matchWins[id] = 0; });
      this.state.winner = null;
      this.state.battleNumber = 0;
      this.state.phase = 'character_select';
      this.state.message = 'Choose your fighter!';
      this.broadcast();
    });

    socket.on('disconnect', () => this.handleDisconnect(socket.id));
  }

  // ── Reconnection grace period ──────────────────────────────────

  private startGracePeriod(player: Player, token: string) {
    player.isDisconnected = true;

    // If we're mid-answering, force a null answer so the round isn't stuck
    if (this.state.phase === 'battle' && this.state.roundPhase === 'answering') {
      if (this.state.playerAnswerStatus[player.id] === null) {
        this.state.playerAnswerStatus[player.id] = 'wrong';
        const connected = this.state.players.filter(p => !p.isEliminated && !p.isDisconnected);
        const allDone = connected.every(p => this.state.playerAnswerStatus[p.id] !== null);
        if (allDone) { this.clearAll(); this.endAnswering(); return; }
      }
    }

    this.state.message = `${player.name} disconnected — 30s to reconnect…`;
    this.broadcast();

    const timer = setTimeout(() => {
      this.gracePeriods.delete(token);
      this.tokenToId.delete(token);
      // Grace period expired — run normal removal
      this.removePlayer(player.id);
    }, RECONNECT_GRACE_MS);
    this.gracePeriods.set(token, timer);
  }

  // ── Battle lifecycle ───────────────────────────────────────────

  private startBattle() {
    if (this.state.players.length < 2) { this.goToLobby(); return; }
    this.state.phase = 'battle';
    this.state.roundNumber = 0;
    this.state.battleNumber++;
    this.state.players.forEach(p => {
      p.hp = 100; p.maxHp = 100; p.hype = 0; p.isEliminated = false;
      if (!(p.id in this.state.matchWins)) this.state.matchWins[p.id] = 0;
    });
    resetQueues();
    this.startRound();
  }

  private startRound() {
    this.clearAll();
    this.state.roundNumber++;
    this.state.roundPhase = 'announcing';
    this.state.playerQuestions = {};
    this.state.playerAnswerStatus = {};
    this.state.playerAttacks = {};
    this.state.attackResults = [];
    this.state.message = `Round ${this.state.roundNumber}!`;
    this.broadcast();

    this.timer = setTimeout(() => {
      // Deal questions
      this.active().forEach(p => {
        this.state.playerQuestions[p.id] = getNextQuestion(p.mode);
        this.state.playerAnswerStatus[p.id] = null;
      });
      this.state.roundPhase = 'answering';
      this.state.timeLeft = ANSWER_TIME;
      this.state.message = 'Answer your question!';
      this.broadcast();
      this.startCountdown(ANSWER_TIME, () => this.endAnswering());
    }, ANNOUNCE_TIME);
  }

  private handleAnswer(playerId: string, answerId: string) {
    if (this.state.roundPhase !== 'answering') return;
    if (this.state.playerAnswerStatus[playerId] !== null) return; // already answered
    const q = this.state.playerQuestions[playerId];
    if (!q) return;

    const correct = answerId === q.correct;
    this.state.playerAnswerStatus[playerId] = correct ? 'correct' : 'wrong';

    if (correct) {
      const p = this.state.players.find(p => p.id === playerId);
      if (p) p.hype = Math.min(100, p.hype + 30);
    }

    const allAnswered = this.active().every(p => this.state.playerAnswerStatus[p.id] !== null);
    if (allAnswered) { this.clearAll(); this.endAnswering(); }
    else this.broadcast();
  }

  private endAnswering() {
    const correct = this.active().filter(p => this.state.playerAnswerStatus[p.id] === 'correct');

    if (correct.length === 0) {
      this.state.roundPhase = 'intermission';
      this.state.message = 'Nobody got it right! Next round...';
      this.broadcast();
      this.timer = setTimeout(() => this.startRound(), INTERMISSION + 500);
      return;
    }

    // Pre-fill null attacks (auto-target) so they don't need to act
    correct.forEach(p => { this.state.playerAttacks[p.id] = null; });

    this.state.roundPhase = 'attacking';
    this.state.timeLeft = ATTACK_TIME;
    this.state.message = correct.length === 1
      ? `${correct[0].name} got it! Choose your attack!`
      : `${correct.length} players got it! Choose your attacks!`;
    this.broadcast();

    this.startCountdown(ATTACK_TIME, () => {
      // Auto-assign any remaining
      correct.forEach(p => {
        if (this.state.playerAttacks[p.id] === null) {
          const targets = this.active().filter(t => t.id !== p.id);
          if (targets.length) {
            const t = targets[Math.floor(Math.random() * targets.length)];
            this.state.playerAttacks[p.id] = { targetId: t.id, attackType: 'normal' };
          }
        }
      });
      this.beginResolve();
    });
  }

  private handleAttack(playerId: string, targetId: string, attackType: AttackType) {
    if (this.state.roundPhase !== 'attacking') return;
    if (this.state.playerAnswerStatus[playerId] !== 'correct') return;
    if (this.state.playerAttacks[playerId] !== null && this.state.playerAttacks[playerId] !== undefined) return;

    const attacker = this.state.players.find(p => p.id === playerId);
    const def = ATTACKS[attackType];
    if (!attacker || attacker.hype < def.hypeRequired) return;

    this.state.playerAttacks[playerId] = { targetId, attackType };

    const correct = this.active().filter(p => this.state.playerAnswerStatus[p.id] === 'correct');
    const allChosen = correct.every(p => this.state.playerAttacks[p.id] !== null);
    if (allChosen) { this.beginResolve(); }
    else this.broadcast();
  }

  private beginResolve() {
    this.clearAll();
    this.state.message = '⚔️ Attacks locked in! Look up at the screen…';
    this.broadcast();
    this.timer = setTimeout(() => this.resolveAttacks(), PRE_RESOLVE);
  }

  private resolveAttacks() {
    this.clearAll();
    const results = [];

    for (const [attackerId, choice] of Object.entries(this.state.playerAttacks)) {
      if (!choice) continue;
      const attacker = this.state.players.find(p => p.id === attackerId);
      const target   = this.state.players.find(p => p.id === choice.targetId && !p.isEliminated);
      if (!attacker || !target) continue;

      const def = ATTACKS[choice.attackType];
      attacker.hype = Math.max(0, attacker.hype - def.hypeCost);
      target.hp = Math.max(0, target.hp - def.damage);
      const targetEliminated = target.hp === 0;
      if (targetEliminated) target.isEliminated = true;

      results.push({ attackerId, targetId: choice.targetId, attack: def, damage: def.damage, newTargetHp: target.hp, targetEliminated });
    }

    this.state.attackResults = results;
    this.state.roundPhase = 'resolving';
    this.state.message = results.map(r => {
      const a = this.state.players.find(p => p.id === r.attackerId)?.name ?? '?';
      const t = this.state.players.find(p => p.id === r.targetId)?.name ?? '?';
      return `${r.attack.emoji} ${a} hit ${t} for ${r.damage}!`;
    }).join('  ');
    this.broadcast();

    this.timer = setTimeout(() => {
      const alive = this.active();
      if (alive.length <= 1) { this.endGame(alive[0] ?? null); return; }
      this.state.roundPhase = 'intermission';
      this.state.attackResults = [];
      this.broadcast();
      this.timer = setTimeout(() => this.startRound(), INTERMISSION);
    }, RESOLVE_TIME);
  }

  private endGame(winner: Player | null) {
    this.clearAll();
    if (this.state.players.length === 0) { this.goToLobby(); return; }

    if (winner) {
      this.state.matchWins[winner.id] = (this.state.matchWins[winner.id] ?? 0) + 1;
      const wins = this.state.matchWins[winner.id];

      if (wins >= 2) {
        this.state.phase = 'game_over';
        this.state.winner = winner;
        this.state.roundPhase = 'intermission';
        this.state.message = `🏆 ${winner.name} WINS THE MATCH!`;
        this.state.timeLeft = 0;
        this.broadcast();
        // No auto-restart — host must choose: Back to Lobby, Rematch, or New Characters
        return;
      }

      // Battle won but match continues
      const scoreStr = this.state.players
        .map(p => `${p.name} ${this.state.matchWins[p.id] ?? 0}`)
        .join(' – ');
      this.state.roundPhase = 'intermission';
      this.state.message = `🏆 ${winner.name} wins Battle ${this.state.battleNumber}!  ${scoreStr}  Next battle starting…`;
      this.broadcast();
      this.timer = setTimeout(() => this.startBattle(), 4000);
    } else {
      this.state.roundPhase = 'intermission';
      this.state.message = "It's a Draw! Starting next battle…";
      this.broadcast();
      this.timer = setTimeout(() => this.startBattle(), 4000);
    }
  }

  private startRematch() {
    this.clearAll();
    if (this.state.players.length < 2) { this.goToLobby(); return; }
    this.state.players.forEach(p => { p.hp = 100; p.maxHp = 100; p.hype = 0; p.isEliminated = false; });
    Object.keys(this.state.matchWins).forEach(id => { this.state.matchWins[id] = 0; });
    this.state.winner = null;
    this.startBattle();
  }

  private restartGame() { this.goToLobby(); }

  private handleDisconnect(id: string) {
    if (id === this.state.hostId) this.state.hostId = null;

    const player = this.state.players.find(p => p.id === id);
    if (!player) { this.broadcast(); return; }

    const token = this.socketTokens.get(id);
    this.socketTokens.delete(id);

    // Mid-game with a token → enter grace period instead of removing immediately
    const midGame = this.state.phase === 'battle'
      || this.state.phase === 'character_select'
      || this.state.phase === 'game_over';

    if (token && midGame && !player.isDisconnected) {
      this.startGracePeriod(player, token);
      return;
    }

    // No token, lobby phase, or already in grace period expiry → remove now
    this.removePlayer(id);
  }

  private removePlayer(id: string) {
    const idx = this.state.players.findIndex(p => p.id === id);
    if (idx === -1) { this.broadcast(); return; }

    const name = this.state.players[idx].name;
    this.state.players.splice(idx, 1);

    if (this.state.phase === 'battle') {
      const alive = this.active();
      if (alive.length <= 1) { this.endGame(alive[0] ?? null); return; }
      if (this.state.roundPhase === 'answering') {
        const allAnswered = alive.every(p => this.state.playerAnswerStatus[p.id] !== null);
        if (allAnswered) { this.clearAll(); this.endAnswering(); return; }
      }
    } else if (this.state.phase === 'game_over' || this.state.phase === 'character_select') {
      if (this.state.players.length < 2) { this.goToLobby(); return; }
    }

    this.state.message = `${name} left.`;
    this.broadcast();
  }

  private goToLobby() {
    this.clearAll();
    const { hostId, serverUrl } = this.state;
    this.state = this.blank(serverUrl);
    this.state.hostId = hostId;
    this.broadcast();
  }

  // ── Helpers ────────────────────────────────────────────────────

  private active() { return this.state.players.filter(p => !p.isEliminated); }

  private clearAll() {
    if (this.timer)    { clearTimeout(this.timer);    this.timer    = null; }
    if (this.countdown){ clearInterval(this.countdown); this.countdown = null; }
  }

  private startCountdown(secs: number, onDone: () => void) {
    this.state.timeLeft = secs;
    this.countdown = setInterval(() => {
      this.state.timeLeft = Math.max(0, this.state.timeLeft - 1);
      this.broadcast();
      if (this.state.timeLeft <= 0) { clearInterval(this.countdown!); this.countdown = null; onDone(); }
    }, 1000);
  }

  private broadcast() { this.io.emit('game_state', this.state); }
}
