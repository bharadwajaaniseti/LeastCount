// Simple test bot for testing the game
import { io, Socket } from 'socket.io-client';
import { ClientToServerEvents, ServerToClientEvents } from '@least-count/shared';

class TestBot {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  private name: string;
  private roomCode?: string;

  constructor(name: string) {
    this.name = name;
    this.socket = io('http://localhost:3001');
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.socket.on('connect', () => {
      console.log(`🤖 Bot ${this.name} connected`);
    });

    this.socket.on('room:state', (roomState: any) => {
      this.roomCode = roomState.roomCode;
      console.log(`🤖 Bot ${this.name} received room state: ${roomState.phase}`);
      
      // Auto-start game if host and enough players
      const currentPlayer = roomState.players.find((p: any) => p.id === this.socket.id);
      if (currentPlayer?.isHost && roomState.players.length >= 2 && roomState.phase === 'lobby') {
        setTimeout(() => {
          console.log(`🤖 Bot ${this.name} starting game`);
          this.socket.emit('game:start', { roomCode: this.roomCode! });
        }, 2000);
      }
    });

    this.socket.on('turn:begin', ({ canShow }: any) => {
      console.log(`🤖 Bot ${this.name} turn began, can show: ${canShow}`);
      
      // Bot logic: randomly decide to show or play
      if (canShow && Math.random() < 0.1) { // 10% chance to show
        setTimeout(() => {
          console.log(`🤖 Bot ${this.name} calling show`);
          this.socket.emit('turn:show', { roomCode: this.roomCode! });
        }, 1000);
      } else {
        // Play a turn
        this.playTurn();
      }
    });

    this.socket.on('error', ({ message }: any) => {
      console.log(`🤖 Bot ${this.name} error: ${message}`);
    });
  }

  private playTurn() {
    // Simple bot strategy: discard first card, then draw from stock
    setTimeout(() => {
      // Discard first card (assuming we have cards)
      // In a real bot, we'd track our hand and make smarter decisions
      console.log(`🤖 Bot ${this.name} discarding first card`);
      
      // For this simple bot, we'll just emit random actions
      // A real bot would need to track game state and make intelligent decisions
      
      // Try to draw from stock after a short delay
      setTimeout(() => {
        console.log(`🤖 Bot ${this.name} drawing from stock`);
        this.socket.emit('turn:drawStock', { roomCode: this.roomCode! });
        
        // Then move after another delay
        setTimeout(() => {
          console.log(`🤖 Bot ${this.name} moving`);
          this.socket.emit('turn:move', { roomCode: this.roomCode! });
        }, 1000);
      }, 1000);
    }, 1000);
  }

  joinRoom(roomCode: string) {
    this.socket.emit('room:join', { roomCode, name: this.name });
  }

  createRoom() {
    this.socket.emit('room:create', { name: this.name });
  }

  disconnect() {
    this.socket.disconnect();
  }
}

// Example usage
if (process.argv.includes('--run')) {
  const bot1 = new TestBot('Bot1');
  const bot2 = new TestBot('Bot2');
  
  // Create room with first bot
  bot1.createRoom();
  
  // Join with second bot after a delay
  setTimeout(() => {
    // You'd need to get the room code from bot1 in a real implementation
    // bot2.joinRoom('ROOMCODE');
  }, 3000);
  
  // Clean up after 60 seconds
  setTimeout(() => {
    bot1.disconnect();
    bot2.disconnect();
    process.exit(0);
  }, 60000);
}

export default TestBot;
