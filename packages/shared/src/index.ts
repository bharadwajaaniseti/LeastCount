export type Rank = 'A' | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 'J' | 'Q' | 'K' | 'JOKER';
export type Suit = 'S' | 'H' | 'D' | 'C';

export interface Card {
  id: string;
  rank: Rank;
  suit?: Suit; // undefined for JOKER
}

export type PlayerStatus = 'active' | 'dropped' | 'shown';

export interface Player {
  id: string;
  name: string;
  seat: number;
  status: PlayerStatus;
  hand: Card[];
  isHost: boolean;
  score?: number;
}

export type DiscardType = 'single' | 'set' | 'run';

export interface DiscardGroup {
  type: DiscardType;
  cards: Card[];
  ordered: boolean; // true for runs where order matters
}

export interface Rules {
  handSize: number;
  declareThreshold: number;
  badDeclarePenalty: number;
  endsOnlyPickup: boolean;
  jokersWildInRuns: boolean;
  eliminationAt: number;
}

export type GamePhase = 'lobby' | 'dealing' | 'turn-discard' | 'turn-draw' | 'await-move' | 'reveal' | 'game-over';

export interface RoomState {
  roomCode: string;
  players: Player[];
  hostId: string;
  stockCount: number;
  topDiscard?: DiscardGroup;
  cardSlotPreview?: string[]; // card IDs in the temporary card slot
  activePlayerId?: string;
  phase: GamePhase;
  round: number;
  rules: Rules;
  canShow?: boolean; // if current player can show at start of turn
  turnActions?: {
    hasDiscarded: boolean;
    hasDrawn: boolean;
  };
}

// Socket event types
export interface ClientToServerEvents {
  'room:create': (data: { name: string; eliminationPoints?: number }) => void;
  'room:join': (data: { roomCode: string; name: string }) => void;
  'room:end': (data: { roomCode: string }) => void;
  'room:updateRules': (data: { roomCode: string; rules: Partial<Rules> }) => void;
  'game:start': (data: { roomCode: string }) => void;
  'turn:discard': (data: { roomCode: string; cardIds: string[] }) => void;
  'turn:drawStock': (data: { roomCode: string }) => void;
  'turn:drawDiscard': (data: { roomCode: string; end: 'first' | 'last' }) => void;
  'turn:move': (data: { roomCode: string }) => void;
  'turn:show': (data: { roomCode: string }) => void;
}

export interface ServerToClientEvents {
  'room:state': (data: RoomState) => void;
  'room:ended': (data: { reason: string; hostLeft?: boolean }) => void;
  'room:rulesUpdated': (data: { rules: Rules }) => void;
  'game:started': () => void;
  'turn:begin': (data: { playerId: string; canShow: boolean }) => void;
  'turn:updated': (data: { discardGroup?: DiscardGroup; drewFrom?: 'stock' | 'discard-first' | 'discard-last' }) => void;
  'turn:ended': (data: { nextPlayerId: string }) => void;
  'show:result': (data: { 
    ok: boolean; 
    callerId: string; 
    scoresRound: Record<string, number>;
    penaltyApplied?: number;
  }) => void;
  'error': (data: { code: string; message: string }) => void;
}

// Default rules for Indian Least Count
export const DEFAULT_RULES: Rules = {
  handSize: 7,
  declareThreshold: 10,
  badDeclarePenalty: 40,
  endsOnlyPickup: true,
  jokersWildInRuns: true,
  eliminationAt: 200,
};

// Card values for scoring
export const CARD_VALUES: Record<Rank, number> = {
  'A': 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  'J': 11,
  'Q': 12,
  'K': 13,
  'JOKER': 0,
};

// Utility types for validation
export interface SelectionInfo {
  type: DiscardType | 'invalid';
  cards: Card[];
  isValid: boolean;
  description: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}
