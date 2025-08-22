// Enhanced Test Bot for Least Count Game
import { io, Socket } from 'socket.io-client';
import { ClientToServerEvents, ServerToClientEvents, RoomState, Card } from '@least-count/shared';

interface BotOptions {
  name: string;
  serverUrl?: string;
  autoPlay?: boolean;
  playSpeed?: number; // milliseconds between actions
}

class LeastCountBot {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  private name: string;
  private roomCode?: string;
  private hand: Card[] = [];
  private autoPlay: boolean;
  private playSpeed: number;
  private isMyTurn = false;
  private gameState?: RoomState;

  constructor(options: BotOptions) {
    this.name = options.name;
    this.autoPlay = options.autoPlay ?? true;
    this.playSpeed = options.playSpeed ?? 2000;
    
    console.log(`🤖 Creating bot: ${this.name}`);
    this.socket = io(options.serverUrl || 'http://localhost:3001', {
      transports: ['websocket'],
    });
    
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.socket.on('connect', () => {
      console.log(`🤖 ${this.name}: Connected to server`);
    });

    this.socket.on('disconnect', () => {
      console.log(`🤖 ${this.name}: Disconnected from server`);
    });

    this.socket.on('room:state', (roomState) => {
      this.gameState = roomState;
      this.roomCode = roomState.roomCode;
      
      // Update our hand
      const me = roomState.players.find(p => p.id === this.socket.id);
      if (me) {
        this.hand = me.hand;
      }
      
      console.log(`🤖 ${this.name}: Room state updated - Phase: ${roomState.phase}, Players: ${roomState.players.length}`);
      
      // Auto-start game if we're host and have enough players
      if (me?.isHost && roomState.players.length >= 2 && roomState.phase === 'lobby') {
        console.log(`🤖 ${this.name}: Auto-starting game as host`);
        setTimeout(() => this.startGame(), 3000);
      }
    });

    this.socket.on('turn:begin', ({ canShow }) => {
      this.isMyTurn = true;
      console.log(`🤖 ${this.name}: My turn! Can show: ${canShow}, Hand: ${this.hand.length} cards`);
      
      if (this.autoPlay) {
        this.planTurn(canShow);
      }
    });

    this.socket.on('turn:ended', ({ nextPlayerId }) => {
      this.isMyTurn = false;
      const nextPlayer = this.gameState?.players.find(p => p.id === nextPlayerId);
      console.log(`🤖 ${this.name}: Turn ended, next player: ${nextPlayer?.name || 'Unknown'}`);
    });

    this.socket.on('turn:updated', ({ discardGroup, drewFrom }) => {
      if (discardGroup) {
        console.log(`🤖 ${this.name}: Cards discarded: ${discardGroup.type} (${discardGroup.cards.length} cards)`);
      }
      if (drewFrom) {
        console.log(`🤖 ${this.name}: Card drawn from: ${drewFrom}`);
      }
    });

    this.socket.on('show:result', ({ ok, callerId, scoresRound, penaltyApplied }) => {
      const caller = this.gameState?.players.find(p => p.id === callerId);
      console.log(`🤖 ${this.name}: Show called by ${caller?.name}, Result: ${ok ? 'VALID' : 'INVALID'}`);
      if (penaltyApplied) {
        console.log(`🤖 ${this.name}: Penalty applied: ${penaltyApplied} points`);
      }
      console.log(`🤖 ${this.name}: Round scores:`, scoresRound);
    });

    this.socket.on('error', ({ code, message }) => {
      console.log(`🤖 ${this.name}: Error [${code}]: ${message}`);
    });
  }

  private planTurn(canShow: boolean) {
    setTimeout(() => {
      if (!this.isMyTurn || !this.gameState) return;

      // Simple bot strategy
      const handTotal = this.calculateHandTotal();
      
      // 1. Consider showing if hand is low enough
      if (canShow && handTotal <= this.gameState.rules.declareThreshold) {
        if (Math.random() < 0.3) { // 30% chance to show when possible
          console.log(`🤖 ${this.name}: Deciding to SHOW (hand total: ${handTotal})`);
          this.show();
          return;
        }
      }

      // 2. Otherwise play normally
      this.playNormalTurn();
    }, this.playSpeed);
  }

  private playNormalTurn() {
    if (!this.gameState || !this.isMyTurn) return;

    // Phase 1: Discard
    if (this.gameState.phase === 'turn-discard') {
      this.makeDiscard();
    }
    // Phase 2: Draw  
    else if (this.gameState.phase === 'turn-draw') {
      this.makeDraw();
    }
    // Phase 3: Move
    else if (this.gameState.phase === 'await-move') {
      this.makeMove();
    }
  }

  private makeDiscard() {
    if (!this.hand.length) return;

    // Simple strategy: discard highest value card
    const sortedHand = [...this.hand].sort((a, b) => this.getCardValue(b) - this.getCardValue(a));
    const cardToDiscard = sortedHand[0];
    
    console.log(`🤖 ${this.name}: Discarding ${this.cardToString(cardToDiscard)}`);
    
    setTimeout(() => {
      if (this.gameState?.phase === 'turn-discard' && this.isMyTurn) {
        this.discard([cardToDiscard.id]);
      }
    }, this.playSpeed / 2);
  }

  private makeDraw() {
    if (!this.gameState) return;

    // Simple strategy: prefer stock unless discard has low-value end cards
    let drawFromStock = true;
    
    if (this.gameState.topDiscard?.cards.length) {
      const firstCard = this.gameState.topDiscard.cards[0];
      const lastCard = this.gameState.topDiscard.cards[this.gameState.topDiscard.cards.length - 1];
      
      const firstValue = this.getCardValue(firstCard);
      const lastValue = this.getCardValue(lastCard);
      
      // Take from discard if either end card is low value
      if (firstValue <= 3 || lastValue <= 3) {
        drawFromStock = false;
        const useFirst = firstValue <= lastValue;
        
        console.log(`🤖 ${this.name}: Drawing ${this.cardToString(useFirst ? firstCard : lastCard)} from discard (${useFirst ? 'first' : 'last'})`);
        
        setTimeout(() => {
          if (this.gameState?.phase === 'turn-draw' && this.isMyTurn) {
            this.drawDiscard(useFirst ? 'first' : 'last');
          }
        }, this.playSpeed / 2);
        return;
      }
    }

    console.log(`🤖 ${this.name}: Drawing from stock`);
    setTimeout(() => {
      if (this.gameState?.phase === 'turn-draw' && this.isMyTurn) {
        this.drawStock();
      }
    }, this.playSpeed / 2);
  }

  private makeMove() {
    console.log(`🤖 ${this.name}: Ending turn`);
    setTimeout(() => {
      if (this.gameState?.phase === 'await-move' && this.isMyTurn) {
        this.move();
      }
    }, this.playSpeed / 2);
  }

  private calculateHandTotal(): number {
    return this.hand.reduce((total, card) => total + this.getCardValue(card), 0);
  }

  private getCardValue(card: Card): number {
    if (card.rank === 'JOKER') return 0;
    if (card.rank === 'A') return 1;
    if (typeof card.rank === 'number') return card.rank;
    if (card.rank === 'J') return 11;
    if (card.rank === 'Q') return 12;
    if (card.rank === 'K') return 13;
    return 0;
  }

  private cardToString(card: Card): string {
    const suitSymbol = card.suit ? { S: '♠', H: '♥', D: '♦', C: '♣' }[card.suit] : '';
    return `${card.rank}${suitSymbol}`;
  }

  // Public API methods
  createRoom(): void {
    console.log(`🤖 ${this.name}: Creating room`);
    this.socket.emit('room:create', { name: this.name });
  }

  joinRoom(roomCode: string): void {
    console.log(`🤖 ${this.name}: Joining room ${roomCode}`);
    this.socket.emit('room:join', { roomCode, name: this.name });
  }

  startGame(): void {
    if (this.roomCode) {
      console.log(`🤖 ${this.name}: Starting game`);
      this.socket.emit('game:start', { roomCode: this.roomCode });
    }
  }

  discard(cardIds: string[]): void {
    if (this.roomCode) {
      this.socket.emit('turn:discard', { roomCode: this.roomCode, cardIds });
    }
  }

  drawStock(): void {
    if (this.roomCode) {
      this.socket.emit('turn:drawStock', { roomCode: this.roomCode });
    }
  }

  drawDiscard(end: 'first' | 'last'): void {
    if (this.roomCode) {
      this.socket.emit('turn:drawDiscard', { roomCode: this.roomCode, end });
    }
  }

  move(): void {
    if (this.roomCode) {
      this.socket.emit('turn:move', { roomCode: this.roomCode });
    }
  }

  show(): void {
    if (this.roomCode) {
      this.socket.emit('turn:show', { roomCode: this.roomCode });
    }
  }

  disconnect(): void {
    console.log(`🤖 ${this.name}: Disconnecting`);
    this.socket.disconnect();
  }

  // Getters for external control
  get connected(): boolean {
    return this.socket.connected;
  }

  get currentRoomCode(): string | undefined {
    return this.roomCode;
  }

  get handSize(): number {
    return this.hand.length;
  }

  get currentHandTotal(): number {
    return this.calculateHandTotal();
  }
}

export default LeastCountBot;
