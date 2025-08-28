import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  RoomState,
  Player,
  Card,
  DiscardGroup,
  DEFAULT_RULES,
  GamePhase,
  ValidationResult,
  Rank,
} from '@least-count/shared';
import { Deck } from './Deck';
import { GameValidator } from './GameValidator';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export class GameManager {
  private rooms = new Map<string, RoomState>();
  private playerRooms = new Map<string, string>(); // socketId -> roomCode
  private deck = new Deck();
  private validator = new GameValidator();

  constructor(private io: Server<ClientToServerEvents, ServerToClientEvents>) {}

  createRoom(socket: TypedSocket, data: { name: string; eliminationPoints?: number }) {
    const roomCode = this.generateRoomCode();
    const player: Player = {
      id: socket.id,
      name: data.name,
      seat: 0,
      status: 'active',
      hand: [],
      isHost: true,
      score: 0,
    };

    const rules = { ...DEFAULT_RULES };
    if (data.eliminationPoints && data.eliminationPoints > 0) {
      rules.eliminationAt = data.eliminationPoints;
    }

    const room: RoomState = {
      roomCode,
      players: [player],
      hostId: socket.id,
      stockCount: 0,
      phase: 'lobby',
      round: 1,
      rules,
    };

    this.rooms.set(roomCode, room);
    this.playerRooms.set(socket.id, roomCode);
    
    socket.join(roomCode);
    socket.emit('room:state', room);
  }

  joinRoom(socket: TypedSocket, data: { roomCode: string; name: string }) {
    const room = this.rooms.get(data.roomCode);
    
    if (!room) {
      socket.emit('error', { code: 'ROOM_NOT_FOUND', message: 'Room not found' });
      return;
    }

    // Check if player with same name already exists (reconnection case)
    const existingPlayer = room.players.find(p => p.name === data.name);
    
    if (existingPlayer) {
      // Player is reconnecting - update their socket ID
      const oldSocketId = existingPlayer.id;
      existingPlayer.id = socket.id;
      
      // Update mappings
      this.playerRooms.delete(oldSocketId);
      this.playerRooms.set(socket.id, data.roomCode);
      
      // Update active player ID if it was this player
      if (room.activePlayerId === oldSocketId) {
        room.activePlayerId = socket.id;
      }
      
      // Update first player ID if it was this player  
      if (room.firstPlayerId === oldSocketId) {
        room.firstPlayerId = socket.id;
      }
      
      socket.join(data.roomCode);
      this.io.to(data.roomCode).emit('room:state', room);
      return;
    }

    if (room.phase !== 'lobby') {
      socket.emit('error', { code: 'GAME_IN_PROGRESS', message: 'Game already in progress' });
      return;
    }

    if (room.players.length >= 8) {
      socket.emit('error', { code: 'ROOM_FULL', message: 'Room is full' });
      return;
    }

    // Find next available seat
    const occupiedSeats = room.players.map(p => p.seat);
    let nextSeat = 0;
    while (occupiedSeats.includes(nextSeat)) {
      nextSeat++;
    }

    const player: Player = {
      id: socket.id,
      name: data.name,
      seat: nextSeat,
      status: 'active',
      hand: [],
      isHost: false,
      score: 0,
    };

    room.players.push(player);
    this.playerRooms.set(socket.id, data.roomCode);
    
    socket.join(data.roomCode);
    this.io.to(data.roomCode).emit('room:state', room);
  }

  startGame(socket: TypedSocket, data: { roomCode: string }) {
    const room = this.rooms.get(data.roomCode);
    
    if (!room) {
      socket.emit('error', { code: 'ROOM_NOT_FOUND', message: 'Room not found' });
      return;
    }

    if (room.hostId !== socket.id) {
      socket.emit('error', { code: 'NOT_HOST', message: 'Only host can start the game' });
      return;
    }

    if (room.players.length < 2) {
      socket.emit('error', { code: 'NOT_ENOUGH_PLAYERS', message: 'Need at least 2 players' });
      return;
    }

    this.dealCards(room);
    this.setRoundJoker(room);
    this.initializeDiscardPile(room);
    this.setRoundFirstPlayer(room);
    this.io.to(data.roomCode).emit('game:started');
    this.startTurn(room);
  }

  handleDiscard(socket: TypedSocket, data: { roomCode: string; cardIds: string[] }) {
    const room = this.rooms.get(data.roomCode);
    if (!this.validateTurn(socket, room, 'turn-discard')) return;

    const player = room!.players.find(p => p.id === socket.id)!;
    const cards = data.cardIds.map(id => player.hand.find(c => c.id === id)).filter(Boolean) as Card[];
    
    if (cards.length !== data.cardIds.length) {
      socket.emit('error', { code: 'INVALID_CARDS', message: 'Some cards not found in hand' });
      return;
    }

    const validation = this.validator.validateDiscard(cards);
    if (!validation.valid) {
      socket.emit('error', { code: 'INVALID_DISCARD', message: validation.error || 'Invalid discard' });
      return;
    }

    // Remove cards from hand and put them in card slot (staging area)
    player.hand = player.hand.filter(c => !data.cardIds.includes(c.id));
    
    // Put cards in card slot preview (staging area)
    room!.cardSlotPreview = cards;
    
    room!.turnActions = { 
      hasDiscarded: true, 
      hasDrawn: false,
      discardedFromCardSlot: false
    };
    
    room!.canShow = false; // No show after any action
    
    // Check if the discarded cards would match the top discard card
    const discardGroup: DiscardGroup = this.validator.createDiscardGroup(cards);
    const canSkipDraw = this.checkMatchingDiscard(room!.topDiscard, discardGroup);
    
    if (canSkipDraw) {
      // Player discarded matching card - skip draw but keep cards in card slot until MOVE
      room!.turnActions.hasDrawn = true; // Mark as "drawn" to allow MOVE
      room!.phase = 'await-move';
      
      this.io.to(data.roomCode).emit('room:state', room!);
      this.io.to(data.roomCode).emit('turn:updated', { 
        skippedDraw: true // Indicate they skipped draw due to matching discard
      });
    } else {
      // Normal flow - go to draw phase (cards stay in card slot until MOVE)
      room!.phase = 'turn-draw';
      
      this.io.to(data.roomCode).emit('room:state', room!);
      this.io.to(data.roomCode).emit('turn:updated', { 
        skippedDraw: false
      });
    }
  }

  handleDrawStock(socket: TypedSocket, data: { roomCode: string }) {
    const room = this.rooms.get(data.roomCode);
    if (!this.validateTurn(socket, room, 'turn-draw')) return;

    if (room!.stockCount <= 0) {
      socket.emit('error', { code: 'EMPTY_STOCK', message: 'Stock pile is empty' });
      return;
    }

    const player = room!.players.find(p => p.id === socket.id)!;
    const newCard = this.deck.drawCard();
    
    if (newCard) {
      player.hand.push(newCard);
      room!.stockCount--;
      room!.phase = 'await-move';
      room!.turnActions!.hasDrawn = true;

      this.io.to(data.roomCode).emit('room:state', room!);
      this.io.to(data.roomCode).emit('turn:updated', { drewFrom: 'stock' });
    }
  }

  handleDrawDiscard(socket: TypedSocket, data: { roomCode: string; end: 'first' | 'last' }) {
    const room = this.rooms.get(data.roomCode);
    if (!this.validateTurn(socket, room, 'turn-draw')) return;

    if (!room!.topDiscard) {
      socket.emit('error', { code: 'EMPTY_DISCARD', message: 'Discard pile is empty' });
      return;
    }

    const discardCards = room!.topDiscard.cards;
    if (discardCards.length === 0) {
      socket.emit('error', { code: 'EMPTY_DISCARD', message: 'Discard pile is empty' });
      return;
    }

    const player = room!.players.find(p => p.id === socket.id)!;
    const cardIndex = data.end === 'first' ? 0 : discardCards.length - 1;
    const drawnCard = discardCards[cardIndex];

    // Remove card from discard pile
    discardCards.splice(cardIndex, 1);
    
    // If discard pile becomes empty, clear it
    if (discardCards.length === 0) {
      room!.topDiscard = undefined;
    }

    player.hand.push(drawnCard);
    room!.phase = 'await-move';
    room!.turnActions!.hasDrawn = true;

    this.io.to(data.roomCode).emit('room:state', room!);
    this.io.to(data.roomCode).emit('turn:updated', { 
      drewFrom: data.end === 'first' ? 'discard-first' : 'discard-last' 
    });
  }

  handleMove(socket: TypedSocket, data: { roomCode: string }) {
    const room = this.rooms.get(data.roomCode);
    if (!this.validateTurn(socket, room, 'await-move')) return;

    if (!room!.turnActions?.hasDiscarded) {
      socket.emit('error', { 
        code: 'INCOMPLETE_TURN', 
        message: 'Must discard before moving' 
      });
      return;
    }

    // Move cards from card slot to discard pile
    if (room!.cardSlotPreview && room!.cardSlotPreview.length > 0) {
      // Create discard group from card slot cards
      const discardGroup: DiscardGroup = this.validator.createDiscardGroup(room!.cardSlotPreview);
      
      // Move cards from card slot to discard pile
      room!.topDiscard = discardGroup;
      
      // Clear card slot
      room!.cardSlotPreview = [];
      
      // Mark that player discarded from card slot (prevents drawing own discard in future)
      room!.turnActions!.discardedFromCardSlot = true;
    }

    // In the new flow, MOVE should only be pressed after drawing, so end turn
    if (room!.turnActions?.hasDrawn) {
      this.endTurn(room!);
    } else {
      socket.emit('error', { 
        code: 'INCOMPLETE_TURN', 
        message: 'Must draw a card before ending turn' 
      });
      return;
    }
  }

  handleShow(socket: TypedSocket, data: { roomCode: string }) {
    const room = this.rooms.get(data.roomCode);
    if (!this.validateTurn(socket, room, 'turn-discard')) return;

    if (!room!.canShow) {
      socket.emit('error', { 
        code: 'CANNOT_SHOW', 
        message: 'Can only show at start of turn before any actions' 
      });
      return;
    }

    const player = room!.players.find(p => p.id === socket.id)!;
    const handTotal = this.validator.calculateHandTotal(player.hand, room!.currentJoker);

    if (handTotal <= room!.rules.declareThreshold) {
      // Valid show
      this.resolveShow(room!, socket.id, true);
    } else {
      // Invalid show - apply penalty
      player.score = (player.score || 0) + room!.rules.badDeclarePenalty;
      this.resolveShow(room!, socket.id, false);
    }
  }

  private validateTurn(socket: TypedSocket, room: RoomState | undefined, expectedPhase: GamePhase): boolean {
    if (!room) {
      socket.emit('error', { code: 'ROOM_NOT_FOUND', message: 'Room not found' });
      return false;
    }

    if (room.activePlayerId !== socket.id) {
      socket.emit('error', { code: 'NOT_YOUR_TURN', message: 'Not your turn' });
      return false;
    }

    if (room.phase !== expectedPhase) {
      socket.emit('error', { 
        code: 'WRONG_PHASE', 
        message: `Cannot perform this action in phase: ${room.phase}` 
      });
      return false;
    }

    return true;
  }

  private checkMatchingDiscard(previousDiscard: DiscardGroup | undefined, newDiscard: DiscardGroup): boolean {
    // If there's no previous discard, can't match
    if (!previousDiscard) return false;
    
    // Currently only single cards can skip draw (player dropping one card)
    if (newDiscard.type !== 'single') return false;
    
    // Get the card being discarded by current player
    const newCard = newDiscard.cards[0];
    
    // Check if any card in the previous discard matches the new card's rank
    for (const previousCard of previousDiscard.cards) {
      if (previousCard.rank === newCard.rank) {
        return true; // Found a matching rank
      }
    }
    
    return false; // No matching rank found
  }

  private dealCards(room: RoomState) {
    // Determine number of decks based on player count
    const playerCount = room.players.length;
    let numberOfDecks: number;
    
    if (playerCount <= 3) {
      numberOfDecks = 1;  // 1-3 players: 1 deck (54 cards)
    } else if (playerCount <= 6) {
      numberOfDecks = 2;  // 4-6 players: 2 decks (108 cards)
    } else {
      numberOfDecks = 3;  // 7+ players: 3 decks (162 cards)
    }

    this.deck.reset(numberOfDecks);
    this.deck.shuffle();

    // Clear all players' hands first
    for (const player of room.players) {
      player.hand = [];
    }

    // Deal cards to each player
    for (let i = 0; i < room.rules.handSize; i++) {
      for (const player of room.players) {
        const card = this.deck.drawCard();
        if (card) {
          player.hand.push(card);
        }
      }
    }

    // Set up stock
    room.stockCount = this.deck.remainingCards();
    room.phase = 'turn-discard';
  }

  private setRoundJoker(room: RoomState) {
    // Random joker selection from all possible ranks
    const jokerSequence: Rank[] = ['A', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K'];
    const randomIndex = Math.floor(Math.random() * jokerSequence.length);
    room.currentJoker = jokerSequence[randomIndex];
  }

  private initializeDiscardPile(room: RoomState) {
    // Draw a card from stock to start the discard pile
    // Keep drawing until we get a card that is not a joker (rank doesn't match current joker)
    let initialCard: Card | null = null;
    
    do {
      initialCard = this.deck.drawCard();
      if (!initialCard) {
        // If we somehow run out of cards (shouldn't happen), break
        console.warn('Ran out of cards while trying to initialize discard pile');
        break;
      }
    } while (initialCard && initialCard.rank === room.currentJoker);
    
    if (initialCard) {
      // Create discard group for the initial card
      room.topDiscard = {
        type: 'single',
        cards: [initialCard],
        ordered: false
      };
      
      // Update stock count since we drew a card
      room.stockCount = this.deck.remainingCards();
      
      // Initialize card slot as empty
      room.cardSlotPreview = [];
    }
  }

  private setRoundFirstPlayer(room: RoomState) {
    const activePlayers = room.players.filter(p => p.status === 'active');
    if (activePlayers.length === 0) return;

    // If no first player set yet (first game), start with first active player
    if (!room.firstPlayerId) {
      room.firstPlayerId = activePlayers[0].id;
    } else {
      // Find current first player and move to next active player
      const currentFirstIndex = activePlayers.findIndex(p => p.id === room.firstPlayerId);
      const nextIndex = (currentFirstIndex + 1) % activePlayers.length;
      room.firstPlayerId = activePlayers[nextIndex].id;
    }
    
    room.activePlayerId = room.firstPlayerId;
  }

  private startTurn(room: RoomState) {
    if (room.players.length === 0) return;

    // Find next active player
    const activePlayers = room.players.filter(p => p.status === 'active');
    if (activePlayers.length === 0) return;

    // Only set activePlayerId if it's not already set (first turn of the game)
    if (!room.activePlayerId) {
      room.activePlayerId = activePlayers[0].id;
    }
    
    room.phase = 'turn-discard';
    
    // Check if player can show (hand total <= threshold)
    const activePlayer = activePlayers.find(p => p.id === room.activePlayerId);
    if (!activePlayer) return;
    
    const handTotal = this.validator.calculateHandTotal(activePlayer.hand, room.currentJoker);
    room.canShow = handTotal <= room.rules.declareThreshold;
    room.turnActions = { hasDiscarded: false, hasDrawn: false };

    this.io.to(room.roomCode).emit('room:state', room);
    this.io.to(room.roomCode).emit('turn:begin', { 
      playerId: room.activePlayerId, 
      canShow: room.canShow 
    });
  }

  private endTurn(room: RoomState) {
    const activePlayers = room.players.filter(p => p.status === 'active');
    const currentIndex = activePlayers.findIndex(p => p.id === room.activePlayerId);
    const nextIndex = (currentIndex + 1) % activePlayers.length;
    const nextPlayer = activePlayers[nextIndex];

    const previousPlayerId = room.activePlayerId;
    room.activePlayerId = nextPlayer.id;
    
    this.io.to(room.roomCode).emit('turn:ended', { nextPlayerId: nextPlayer.id });
    this.startTurn(room);
  }

  private resolveShow(room: RoomState, callerId: string, isValid: boolean) {
    const scores: Record<string, number> = {};
    const caller = room.players.find(p => p.id === callerId)!;
    
    // Save current joker before it gets changed for next round
    const currentRoundJoker = room.currentJoker;
    const callerHandTotal = this.validator.calculateHandTotal(caller.hand, currentRoundJoker);
    
    // Capture final hands before any modifications
    const finalHands: Record<string, Card[]> = {};
    for (const player of room.players) {
      finalHands[player.id] = [...player.hand]; // Deep copy the hands
    }
    
    // Calculate all hand totals first using current round's joker
    const handTotals: Record<string, number> = {};
    for (const player of room.players) {
      handTotals[player.id] = this.validator.calculateHandTotal(player.hand, currentRoundJoker);
    }
    
    // Find minimum hand total among all players
    const minHandTotal = Math.min(...Object.values(handTotals));
    
    // Determine if caller actually has the lowest count
    const callerHasLowest = callerHandTotal === minHandTotal;
    
    // Calculate round scores based on new rules
    for (const player of room.players) {
      // Initialize round scores array if not exists
      if (!player.roundScores) {
        player.roundScores = [];
      }
      
      if (callerHasLowest) {
        // Caller wins: caller gets 0, others get their actual count
        if (player.id === callerId) {
          scores[player.id] = 0;
          player.roundScores.push(0);
        } else {
          scores[player.id] = handTotals[player.id];
          player.roundScores.push(handTotals[player.id]);
          player.score = (player.score || 0) + handTotals[player.id];
        }
      } else {
        // Caller doesn't have lowest: caller gets 40 penalty, others get 0
        if (player.id === callerId) {
          scores[player.id] = 40;
          player.roundScores.push(40);
          player.score = (player.score || 0) + 40;
        } else {
          scores[player.id] = 0;
          player.roundScores.push(0);
        }
      }
    }

    // Check for eliminations
    for (const player of room.players) {
      if (player.score! >= room.rules.eliminationAt) {
        player.status = 'dropped';
      }
    }

    this.io.to(room.roomCode).emit('show:result', {
      ok: isValid,
      callerId,
      scoresRound: scores,
      finalHands: finalHands,
      penaltyApplied: isValid ? undefined : room.rules.badDeclarePenalty,
    });

    // Start new round or end game
    const activePlayers = room.players.filter(p => p.status === 'active');
    if (activePlayers.length <= 1) {
      room.phase = 'game-over';
    } else {
      room.round++;
      this.setRoundFirstPlayer(room); // Rotate starting player
      this.dealCards(room);
      this.setRoundJoker(room); // Set new joker for round
      this.initializeDiscardPile(room); // Initialize discard pile with non-joker card
      this.startTurn(room);
    }

    this.io.to(room.roomCode).emit('room:state', room);
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Ensure uniqueness
    if (this.rooms.has(result)) {
      return this.generateRoomCode();
    }
    
    return result;
  }

  endRoom(socket: TypedSocket, data: { roomCode: string }) {
    const room = this.rooms.get(data.roomCode);
    
    if (!room) {
      socket.emit('error', { code: 'ROOM_NOT_FOUND', message: 'Room not found' });
      return;
    }

    if (room.hostId !== socket.id) {
      socket.emit('error', { code: 'NOT_HOST', message: 'Only host can end the room' });
      return;
    }

    // Notify all players that room is ending
    this.io.to(data.roomCode).emit('room:ended', { 
      reason: 'Host ended the room',
      hostLeft: false 
    });

    // Clean up room and player mappings
    for (const player of room.players) {
      this.playerRooms.delete(player.id);
    }
    this.rooms.delete(data.roomCode);

    // Make all sockets leave the room
    this.io.in(data.roomCode).disconnectSockets();
  }

  updateRules(socket: TypedSocket, data: { roomCode: string; rules: Partial<any> }) {
    const room = this.rooms.get(data.roomCode);
    
    if (!room) {
      socket.emit('error', { code: 'ROOM_NOT_FOUND', message: 'Room not found' });
      return;
    }

    if (room.hostId !== socket.id) {
      socket.emit('error', { code: 'NOT_HOST', message: 'Only host can update rules' });
      return;
    }

    if (room.phase !== 'lobby') {
      socket.emit('error', { code: 'GAME_IN_PROGRESS', message: 'Cannot change rules during game' });
      return;
    }

    // Update rules (only allow specific fields)
    const allowedRuleUpdates = ['eliminationAt', 'declareThreshold', 'badDeclarePenalty', 'handSize'];
    for (const [key, value] of Object.entries(data.rules)) {
      if (allowedRuleUpdates.includes(key) && typeof value === 'number' && value > 0) {
        (room.rules as any)[key] = value;
      }
    }

    // Notify all players of rule changes
    this.io.to(data.roomCode).emit('room:rulesUpdated', { rules: room.rules });
    this.io.to(data.roomCode).emit('room:state', room);
  }

  handleExitRoom(socket: TypedSocket, data: { roomCode: string }) {
    const room = this.rooms.get(data.roomCode);
    
    if (!room) {
      socket.emit('error', { code: 'ROOM_NOT_FOUND', message: 'Room not found' });
      return;
    }

    // Remove player from room
    const playerIndex = room.players.findIndex(p => p.id === socket.id);
    if (playerIndex === -1) return;

    const leavingPlayer = room.players[playerIndex];
    room.players.splice(playerIndex, 1);
    this.playerRooms.delete(socket.id);

    // If the leaving player was host, assign new host or end room
    if (leavingPlayer.isHost) {
      if (room.players.length > 0) {
        room.players[0].isHost = true;
        room.hostId = room.players[0].id;
      } else {
        // No players left, delete room
        this.rooms.delete(data.roomCode);
        return;
      }
    }

    socket.leave(data.roomCode);
    this.io.to(data.roomCode).emit('room:state', room);
  }

  handleViewScores(socket: TypedSocket, data: { roomCode: string }) {
    const room = this.rooms.get(data.roomCode);
    
    if (!room) {
      socket.emit('error', { code: 'ROOM_NOT_FOUND', message: 'Room not found' });
      return;
    }

    // Build round scores data
    const roundScores: Record<string, number[]> = {};
    
    for (const player of room.players) {
      roundScores[player.id] = player.roundScores || [];
    }

    socket.emit('game:scores', { 
      players: room.players,
      roundScores 
    });
  }

  handleDisconnect(socket: TypedSocket) {
    const roomCode = this.playerRooms.get(socket.id);
    
    if (!roomCode) return;

    const room = this.rooms.get(roomCode);
    if (!room) return;

    // Remove player from room
    const playerIndex = room.players.findIndex(p => p.id === socket.id);
    if (playerIndex === -1) return;

    const disconnectedPlayer = room.players[playerIndex];
    const wasHost = disconnectedPlayer.isHost;

    // If host disconnects, end the room
    if (wasHost) {
      this.io.to(roomCode).emit('room:ended', { 
        reason: 'Host left the room',
        hostLeft: true 
      });

      // Clean up all players
      for (const player of room.players) {
        this.playerRooms.delete(player.id);
      }
      this.rooms.delete(roomCode);
      return;
    }

    // Remove non-host player
    room.players.splice(playerIndex, 1);
    this.playerRooms.delete(socket.id);

    // If it was their turn, move to next player
    if (room.activePlayerId === socket.id) {
      this.endTurn(room);
    }

    // Update all remaining players
    this.io.to(roomCode).emit('room:state', room);
  }
}
