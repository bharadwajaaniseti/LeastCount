import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import {
  RoomState,
  ClientToServerEvents,
  ServerToClientEvents,
  SelectionInfo,
  Card,
  Rules,
} from '@least-count/shared';
import { validateSelection } from '@/utils/validators';

interface GameState {
  // Connection
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  connected: boolean;
  
  // Game state
  roomState: RoomState | null;
  roomCode: string | null;
  playerId: string | null;
  
  // UI state
  selectedCardIds: string[];
  selectionInfo: SelectionInfo | null;
  showRulesModal: boolean;
  error: string | null;
  
  // Actions
  connect: () => void;
  disconnect: () => void;
  createRoom: (name: string, eliminationPoints?: number) => void;
  joinRoom: (roomCode: string, name: string) => void;
  startGame: () => void;
  endRoom: () => void;
  updateRules: (rules: Partial<Rules>) => void;
  selectCard: (cardId: string) => void;
  confirmDiscard: () => void;
  drawStock: () => void;
  drawDiscard: (end: 'first' | 'last') => void;
  move: () => void;
  show: () => void;
  setShowRulesModal: (show: boolean) => void;
  clearError: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  socket: null,
  connected: false,
  roomState: null,
  roomCode: null,
  playerId: null,
  selectedCardIds: [],
  selectionInfo: null,
  showRulesModal: false,
  error: null,

  // Actions
  connect: () => {
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
    const socket = io(serverUrl, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      set({ connected: true, playerId: socket.id });
    });

    socket.on('disconnect', () => {
      set({ connected: false });
    });

    socket.on('room:state', (roomState) => {
      set({ roomState, roomCode: roomState.roomCode });
    });

    socket.on('error', ({ message }) => {
      set({ error: message });
    });

    socket.on('turn:begin', () => {
      // Clear selection when turn begins
      set({ selectedCardIds: [], selectionInfo: null });
    });

    socket.on('turn:updated', ({ skippedDraw }) => {
      // Clear selection after successful action
      set({ selectedCardIds: [], selectionInfo: null });
      
      // Show notification if draw was skipped
      if (skippedDraw) {
        // You can add a toast notification or temporary message here
        console.log('🎯 Matching discard! Draw skipped - you can move now.');
      }
    });

    socket.on('room:ended', ({ reason }) => {
      // Handle room ended by host
      set({ 
        error: reason,
        roomState: null,
        roomCode: null,
        selectedCardIds: [],
        selectionInfo: null 
      });
      
      // Optionally disconnect after a delay
      setTimeout(() => {
        socket.disconnect();
      }, 3000);
    });

    socket.on('room:rulesUpdated', ({ rules }) => {
      // Update room rules
      const { roomState } = get();
      if (roomState) {
        set({ 
          roomState: { 
            ...roomState, 
            rules 
          } 
        });
      }
    });

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
    }
    set({
      socket: null,
      connected: false,
      roomState: null,
      roomCode: null,
      playerId: null,
      selectedCardIds: [],
      selectionInfo: null,
    });
  },

  createRoom: (name: string, eliminationPoints?: number) => {
    const { socket } = get();
    if (socket) {
      socket.emit('room:create', { name, eliminationPoints });
    }
  },

  joinRoom: (roomCode: string, name: string) => {
    const { socket } = get();
    if (socket) {
      socket.emit('room:join', { roomCode, name });
    }
  },

  startGame: () => {
    const { socket, roomState } = get();
    if (socket && roomState) {
      socket.emit('game:start', { roomCode: roomState.roomCode });
    }
  },

  endRoom: () => {
    const { socket, roomState } = get();
    if (socket && roomState) {
      socket.emit('room:end', { roomCode: roomState.roomCode });
    }
  },

  updateRules: (rules: Partial<Rules>) => {
    const { socket, roomState } = get();
    if (socket && roomState) {
      socket.emit('room:updateRules', { roomCode: roomState.roomCode, rules });
    }
  },

  selectCard: (cardId: string) => {
    const { selectedCardIds, roomState } = get();
    const currentPlayer = roomState?.players.find((p: any) => p.id === get().playerId);
    if (!currentPlayer) return;

    let newSelectedCardIds: string[];
    
    if (selectedCardIds.includes(cardId)) {
      // Deselect card
      newSelectedCardIds = selectedCardIds.filter(id => id !== cardId);
    } else {
      // Select card
      newSelectedCardIds = [...selectedCardIds, cardId];
    }

    // Get selected cards and validate
    const selectedCards = newSelectedCardIds
      .map(id => currentPlayer.hand.find((c: any) => c.id === id))
      .filter(Boolean) as Card[];

    const selectionInfo = validateSelection(selectedCards);

    set({ 
      selectedCardIds: newSelectedCardIds,
      selectionInfo,
    });
  },

  confirmDiscard: () => {
    const { socket, roomState, selectedCardIds } = get();
    if (socket && roomState && selectedCardIds.length > 0) {
      socket.emit('turn:discard', {
        roomCode: roomState.roomCode,
        cardIds: selectedCardIds,
      });
    }
  },

  drawStock: () => {
    const { socket, roomState } = get();
    if (socket && roomState) {
      socket.emit('turn:drawStock', { roomCode: roomState.roomCode });
    }
  },

  drawDiscard: (end: 'first' | 'last') => {
    const { socket, roomState } = get();
    if (socket && roomState) {
      socket.emit('turn:drawDiscard', { roomCode: roomState.roomCode, end });
    }
  },

  move: () => {
    const { socket, roomState } = get();
    if (socket && roomState) {
      socket.emit('turn:move', { roomCode: roomState.roomCode });
    }
  },

  show: () => {
    const { socket, roomState } = get();
    if (socket && roomState) {
      socket.emit('turn:show', { roomCode: roomState.roomCode });
    }
  },

  setShowRulesModal: (show: boolean) => {
    set({ showRulesModal: show });
  },

  clearError: () => {
    set({ error: null });
  },
}));
