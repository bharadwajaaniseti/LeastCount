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
  showScoresModal: boolean;
  showRoundEndModal: boolean;
  roundEndData: { 
    roundScores: Record<string, number>; 
    winnerId: string;
  } | null;
  scoresData: { players: any[]; roundScores: Record<string, number[]> } | null;
  error: string | null;
  
  // Actions
  connect: () => void;
  disconnect: () => void;
  createRoom: (name: string, eliminationPoints?: number) => void;
  joinRoom: (roomCode: string, name: string) => void;
  startGame: () => void;
  endRoom: () => void;
  updateRules: (rules: Partial<Rules>) => void;
  exitRoom: () => void;
  viewScores: () => void;
  setShowScoresModal: (show: boolean) => void;
  setShowRoundEndModal: (show: boolean) => void;
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
  showScoresModal: false,
  showRoundEndModal: false,
  roundEndData: null,
  scoresData: null,
  error: null,

  // Actions
  connect: () => {
    const { socket: existingSocket } = get();
    
    // Don't create a new connection if already connected
    if (existingSocket?.connected) {
      return;
    }
    
    // Clean up existing socket if any
    if (existingSocket) {
      existingSocket.disconnect();
    }

    const serverUrl = import.meta.env.VITE_SERVER_URL || 
      (import.meta.env.MODE === 'production' ? 'https://leastcount.onrender.com' : 'http://localhost:3001');
    const socket = io(serverUrl, {
      transports: ['websocket'],
    });

    // Store socket immediately
    set({ socket });

    socket.on('connect', () => {
      set({ connected: true, playerId: socket.id });
      
      // Try to restore room state from localStorage if available
      const storedRoomCode = localStorage.getItem('leastcount_room');
      const storedPlayerName = localStorage.getItem('leastcount_player_name');
      
      if (storedRoomCode && storedPlayerName) {
        // Attempt to rejoin the stored room
        socket.emit('room:join', { roomCode: storedRoomCode, name: storedPlayerName });
      }
    });

    socket.on('disconnect', () => {
      set({ connected: false });
    });

    socket.on('room:state', (roomState: any) => {
      set({ roomState, roomCode: roomState.roomCode });
    });

    socket.on('error', ({ message }: { code?: string; message: string }) => {
      set({ error: message });
    });

    socket.on('turn:begin', () => {
      // Clear selection when turn begins
      set({ selectedCardIds: [], selectionInfo: null });
    });

    socket.on('turn:updated', ({ skippedDraw }: { skippedDraw?: boolean }) => {
      // Clear selection after successful action
      set({ selectedCardIds: [], selectionInfo: null });
      
      // Show notification if draw was skipped
      if (skippedDraw) {
        // You can add a toast notification or temporary message here
        console.log('🎯 Matching discard! Draw skipped - you can move now.');
      }
    });

    socket.on('room:ended', ({ reason }: { reason: string }) => {
      // Handle room ended by host
      set({ 
        error: reason,
        roomState: null,
        roomCode: null,
        selectedCardIds: [],
        selectionInfo: null 
      });
      
      // Clear stored room data
      localStorage.removeItem('leastcount_room');
      localStorage.removeItem('leastcount_player_name');
      
      // Optionally disconnect after a delay
      setTimeout(() => {
        socket.disconnect();
      }, 3000);
    });

    socket.on('room:rulesUpdated', ({ rules }: { rules: any }) => {
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

    socket.on('game:scores', ({ players, roundScores }: { players: any[]; roundScores: Record<string, number[]> }) => {
      set({ 
        scoresData: { players, roundScores },
        showScoresModal: true 
      });
    });

    socket.on('show:result', ({ callerId, scoresRound }: { callerId: string; scoresRound: Record<string, number> }) => {
      // Show round end modal with results
      set({
        showRoundEndModal: true,
        roundEndData: {
          roundScores: scoresRound,
          winnerId: callerId // The person who showed/declared
        }
      });
    });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      // Remove all listeners to prevent memory leaks
      socket.removeAllListeners();
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
      showRulesModal: false,
      showScoresModal: false,
      showRoundEndModal: false,
      roundEndData: null,
      scoresData: null,
      error: null,
    });
    // Clear localStorage
    localStorage.removeItem('leastcount_room');
    localStorage.removeItem('leastcount_player_name');
  },

  createRoom: (name: string, eliminationPoints?: number) => {
    const { socket } = get();
    if (socket?.connected) {
      // Store player name for potential rejoin
      localStorage.setItem('leastcount_player_name', name);
      socket.emit('room:create', { name, eliminationPoints });
    } else {
      set({ error: 'Not connected to server. Please refresh and try again.' });
    }
  },

  joinRoom: (roomCode: string, name: string) => {
    const { socket } = get();
    if (socket?.connected) {
      // Store player name for potential rejoin
      localStorage.setItem('leastcount_player_name', name);
      socket.emit('room:join', { roomCode, name });
    } else {
      set({ error: 'Not connected to server. Please refresh and try again.' });
    }
  },

  startGame: () => {
    const { socket, roomState } = get();
    if (socket?.connected && roomState) {
      socket.emit('game:start', { roomCode: roomState.roomCode });
    } else {
      set({ error: 'Cannot start game. Connection or room state issue.' });
    }
  },

  endRoom: () => {
    const { socket, roomState } = get();
    if (socket?.connected && roomState) {
      socket.emit('room:end', { roomCode: roomState.roomCode });
    }
  },

  updateRules: (rules: Partial<Rules>) => {
    const { socket, roomState } = get();
    if (socket?.connected && roomState) {
      socket.emit('room:updateRules', { roomCode: roomState.roomCode, rules });
    }
  },

  exitRoom: () => {
    const { socket, roomState } = get();
    if (socket?.connected && roomState) {
      socket.emit('room:exit', { roomCode: roomState.roomCode });
    }
    // Clear all client state and localStorage
    set({
      roomState: null,
      roomCode: null,
      playerId: null,
      selectedCardIds: [],
      selectionInfo: null,
      showRulesModal: false,
      showScoresModal: false,
      showRoundEndModal: false,
      roundEndData: null,
      scoresData: null,
      error: null,
    });
    localStorage.removeItem('leastcount_room');
    localStorage.removeItem('leastcount_player_name');
  },

  viewScores: () => {
    const { socket, roomState } = get();
    if (socket?.connected && roomState) {
      socket.emit('game:viewScores', { roomCode: roomState.roomCode });
    }
  },

  selectCard: (cardId: string) => {
    const { selectedCardIds, roomState } = get();
    const currentPlayer = roomState?.players.find((p: any) => p.id === get().playerId);
    if (!currentPlayer) {
      set({ error: 'Cannot select cards: Player not found in room.' });
      return;
    }

    let newSelectedCardIds: string[];
    
    if (selectedCardIds.includes(cardId)) {
      // Deselect card
      newSelectedCardIds = selectedCardIds.filter((id: string) => id !== cardId);
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
    if (!socket?.connected) {
      set({ error: 'Not connected to server.' });
      return;
    }
    if (!roomState) {
      set({ error: 'No active room.' });
      return;
    }
    if (selectedCardIds.length === 0) {
      set({ error: 'No cards selected.' });
      return;
    }
    
    socket.emit('turn:discard', {
      roomCode: roomState.roomCode,
      cardIds: selectedCardIds,
    });
  },

  drawStock: () => {
    const { socket, roomState } = get();
    if (socket?.connected && roomState) {
      socket.emit('turn:drawStock', { roomCode: roomState.roomCode });
    } else {
      set({ error: 'Cannot draw from stock: Connection or room issue.' });
    }
  },

  drawDiscard: (end: 'first' | 'last') => {
    const { socket, roomState } = get();
    if (socket?.connected && roomState) {
      socket.emit('turn:drawDiscard', { roomCode: roomState.roomCode, end });
    } else {
      set({ error: 'Cannot draw from discard: Connection or room issue.' });
    }
  },

  move: () => {
    const { socket, roomState } = get();
    if (socket?.connected && roomState) {
      socket.emit('turn:move', { roomCode: roomState.roomCode });
    } else {
      set({ error: 'Cannot move: Connection or room issue.' });
    }
  },

  show: () => {
    const { socket, roomState } = get();
    if (socket?.connected && roomState) {
      socket.emit('turn:show', { roomCode: roomState.roomCode });
    } else {
      set({ error: 'Cannot show: Connection or room issue.' });
    }
  },

  setShowRulesModal: (show: boolean) => {
    set({ showRulesModal: show });
  },

  setShowScoresModal: (show: boolean) => {
    set({ showScoresModal: show });
  },

  setShowRoundEndModal: (show: boolean) => {
    set({ showRoundEndModal: show });
  },

  clearError: () => {
    set({ error: null });
  },
}));
