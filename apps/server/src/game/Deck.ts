import { Card, Rank, Suit } from '@least-count/shared';
import { v4 as uuidv4 } from 'uuid';

export class Deck {
  private cards: Card[] = [];

  constructor() {
    this.reset();
  }

  reset(numberOfDecks: number = 1): void {
    this.cards = [];
    
    // Create the specified number of decks
    for (let deckIndex = 0; deckIndex < numberOfDecks; deckIndex++) {
      // Standard 52 cards per deck
      const suits: Suit[] = ['S', 'H', 'D', 'C'];
      const ranks: Rank[] = ['A', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K'];

      for (const suit of suits) {
        for (const rank of ranks) {
          this.cards.push({
            id: uuidv4(),
            rank,
            suit,
          });
        }
      }

      // Add 2 jokers per deck
      this.cards.push({
        id: uuidv4(),
        rank: 'JOKER',
      });
      this.cards.push({
        id: uuidv4(),
        rank: 'JOKER',
      });
    }
  }

  shuffle(): void {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  drawCard(): Card | null {
    return this.cards.pop() || null;
  }

  remainingCards(): number {
    return this.cards.length;
  }

  isEmpty(): boolean {
    return this.cards.length === 0;
  }
}
