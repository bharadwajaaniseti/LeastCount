// Test script to run multiple bots for testing the Least Count game
import LeastCountBot from './LeastCountBot.js';

class GameTester {
  private bots: LeastCountBot[] = [];
  private roomCode?: string;

  async testWithBots(numBots: number = 3) {
    console.log(`🧪 Starting game test with ${numBots} bots...`);
    
    // Create bots
    for (let i = 1; i <= numBots; i++) {
      const bot = new LeastCountBot({
        name: `Bot${i}`,
        autoPlay: true,
        playSpeed: 1500 + (Math.random() * 1000), // Random speed between 1.5-2.5s
      });
      this.bots.push(bot);
    }

    // Wait for connections
    await this.waitForConnections();

    // First bot creates room
    console.log(`🧪 Bot1 creating room...`);
    this.bots[0].createRoom();

    // Wait for room creation
    await this.sleep(2000);
    this.roomCode = this.bots[0].currentRoomCode;

    if (!this.roomCode) {
      console.error('❌ Failed to create room');
      return;
    }

    console.log(`🧪 Room created: ${this.roomCode}`);

    // Other bots join
    for (let i = 1; i < this.bots.length; i++) {
      console.log(`🧪 Bot${i + 1} joining room...`);
      this.bots[i].joinRoom(this.roomCode);
      await this.sleep(1000);
    }

    console.log(`🧪 All bots joined! Game will start automatically...`);
    console.log(`🎮 You can also join at: http://localhost:5173 with room code: ${this.roomCode}`);

    // Monitor game
    this.monitorGame();
  }

  private async waitForConnections() {
    console.log('🧪 Waiting for bot connections...');
    
    while (this.bots.some(bot => !bot.connected)) {
      await this.sleep(100);
    }
    
    console.log('🧪 All bots connected!');
  }

  private monitorGame() {
    // Keep the script running and provide status updates
    const interval = setInterval(() => {
      const activeBots = this.bots.filter(bot => bot.connected);
      if (activeBots.length === 0) {
        console.log('🧪 All bots disconnected, ending test...');
        clearInterval(interval);
        process.exit(0);
      }

      // Show bot statuses
      console.log('\n📊 Bot Status:');
      activeBots.forEach(bot => {
        console.log(`   ${(bot as any).name}: ${bot.handSize} cards, ${bot.currentHandTotal} points`);
      });
    }, 10000); // Every 10 seconds

    // Auto-cleanup after 5 minutes
    setTimeout(() => {
      console.log('🧪 Test time limit reached, cleaning up...');
      this.cleanup();
    }, 300000);
  }

  cleanup() {
    console.log('🧪 Cleaning up bots...');
    this.bots.forEach(bot => bot.disconnect());
    process.exit(0);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Quick test functions
export function testQuick() {
  console.log('🧪 Starting quick test with 2 bots...');
  const tester = new GameTester();
  tester.testWithBots(2);
}

export function testMedium() {
  console.log('🧪 Starting medium test with 4 bots...');
  const tester = new GameTester();
  tester.testWithBots(4);
}

export function testFull() {
  console.log('🧪 Starting full test with 6 bots...');
  const tester = new GameTester();
  tester.testWithBots(6);
}

// Manual bot creation for advanced testing
export function createBot(name: string, options: any = {}) {
  return new LeastCountBot({
    name,
    autoPlay: options.autoPlay ?? true,
    playSpeed: options.playSpeed ?? 2000,
    ...options
  });
}

// Run based on command line args
if (process.argv.includes('--quick')) {
  testQuick();
} else if (process.argv.includes('--medium')) {
  testMedium();
} else if (process.argv.includes('--full')) {
  testFull();
} else if (process.argv.includes('--help')) {
  console.log(`
🤖 Least Count Bot Tester

Usage:
  npm run test-bots -- --quick     # 2 bots
  npm run test-bots -- --medium    # 4 bots  
  npm run test-bots -- --full      # 6 bots

Or in code:
  import { testQuick, createBot } from './GameTester.js';
  testQuick();
  
  // Create custom bot
  const bot = createBot('MyBot', { playSpeed: 1000 });
  bot.createRoom();
`);
} else {
  console.log('🤖 Bot tester loaded. Use --help for usage info.');
  testQuick(); // Default to quick test
}
