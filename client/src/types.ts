export type PlayerMode = 'kid' | 'grown-up';
export type GamePhase = 'lobby' | 'character_select' | 'battle' | 'game_over';
export type RoundPhase = 'announcing' | 'answering' | 'attacking' | 'resolving' | 'intermission';
export type AnswerStatus = 'correct' | 'wrong' | null;
export type AttackType = 'normal' | 'power' | 'ultimate';

export const CHARACTERS = ['carnage', 'green-ranger', 'leonardo', 'megatron', 'optimus', 'spiderman', 'venom', 'wolverine'] as const;
export type CharacterName = typeof CHARACTERS[number];

export interface Player {
  id: string;
  name: string;
  mode: PlayerMode;
  character: CharacterName | null;
  hp: number;
  maxHp: number;
  hype: number;
  isEliminated: boolean;
  isHost: boolean;
}

export interface Question {
  id: string;
  text: string;
  visual?: string;
  options: string[];
  correct: string;
  mode: PlayerMode;
}

export interface AttackDef {
  type: AttackType;
  name: string;
  damage: number;
  hypeCost: number;
  hypeRequired: number;
  emoji: string;
}

export interface AttackResult {
  attackerId: string;
  targetId: string;
  attack: AttackDef;
  damage: number;
  newTargetHp: number;
  targetEliminated: boolean;
}

export interface GameState {
  phase: GamePhase;
  roundPhase: RoundPhase;
  roundNumber: number;
  battleNumber: number;
  players: Player[];

  playerQuestions: Record<string, Question>;
  playerAnswerStatus: Record<string, AnswerStatus>;
  playerAttacks: Record<string, { targetId: string; attackType: AttackType } | null>;
  attackResults: AttackResult[];

  matchWins: Record<string, number>;
  winner: Player | null;
  hostId: string | null;
  serverUrl: string;
  message: string;
  timeLeft: number;
}

export interface EmoteEvent {
  playerId: string;
  emote: string;
}
