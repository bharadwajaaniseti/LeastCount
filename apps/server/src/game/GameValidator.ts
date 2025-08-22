import {
  Card,
  Rank,
  DiscardGroup,
  DiscardType,
  ValidationResult,
  SelectionInfo,
  CARD_VALUES,
} from '@least-count/shared';

export class GameValidator {
  
  validateDiscard(cards: Card[]): ValidationResult {
    if (cards.length === 0) {
      return { valid: false, error: 'No cards selected' };
    }

    if (cards.length === 1) {
      return { valid: true };
    }

    // Check for set only (runs are not allowed)
    if (this.isValidSet(cards)) {
      return { valid: true };
    }

    return { valid: false, error: 'Invalid combination - must be single card or set only' };
  }

  createDiscardGroup(cards: Card[]): DiscardGroup {
    if (cards.length === 1) {
      return {
        type: 'single',
        cards: [...cards],
        ordered: false,
      };
    }

    if (this.isValidSet(cards)) {
      return {
        type: 'set',
        cards: [...cards],
        ordered: false,
      };
    }

    throw new Error('Invalid discard group - only single cards and sets allowed');
  }

  classifySelection(cards: Card[]): SelectionInfo {
    if (cards.length === 0) {
      return {
        type: 'invalid',
        cards: [],
        isValid: false,
        description: 'No cards selected',
      };
    }

    if (cards.length === 1) {
      return {
        type: 'single',
        cards: [...cards],
        isValid: true,
        description: 'Single card',
      };
    }

    if (this.isValidSet(cards)) {
      const rank = cards[0].rank;
      return {
        type: 'set',
        cards: [...cards],
        isValid: true,
        description: `SET x${cards.length} (${rank})`,
      };
    }

    return {
      type: 'invalid',
      cards: [...cards],
      isValid: false,
      description: 'Invalid combination - only single cards and sets allowed',
    };
  }

  calculateHandTotal(hand: Card[]): number {
    return hand.reduce((total, card) => total + CARD_VALUES[card.rank], 0);
  }

  private isValidSet(cards: Card[]): boolean {
    if (cards.length < 2) return false;

    // No jokers allowed in sets
    if (cards.some(c => c.rank === 'JOKER')) return false;

    // All cards must have same rank
    const rank = cards[0].rank;
    return cards.every(c => c.rank === rank);
  }

  private isValidRun(cards: Card[]): boolean {
    if (cards.length < 3) return false;

    // All non-joker cards must have same suit
    const nonJokers = cards.filter(c => c.rank !== 'JOKER');
    if (nonJokers.length === 0) return false; // Can't have all jokers

    const suit = nonJokers[0].suit;
    if (!nonJokers.every(c => c.suit === suit)) return false;

    // Sort cards by rank
    const sortedCards = this.sortRunCards(cards);
    
    // Check if cards form a consecutive sequence
    const ranks = sortedCards.map(c => this.getNumericRank(c.rank));
    
    for (let i = 1; i < ranks.length; i++) {
      if (ranks[i] !== ranks[i - 1] + 1) {
        return false;
      }
    }

    return true;
  }

  private sortRunCards(cards: Card[]): Card[] {
    return [...cards].sort((a, b) => {
      const rankA = this.getNumericRank(a.rank);
      const rankB = this.getNumericRank(b.rank);
      return rankA - rankB;
    });
  }

  private getNumericRank(rank: Rank): number {
    if (typeof rank === 'number') return rank;
    
    switch (rank) {
      case 'A': return 1;
      case 'J': return 11;
      case 'Q': return 12;
      case 'K': return 13;
      case 'JOKER': return 0; // Jokers will be handled specially
      default: return 0;
    }
  }

  private rankToString(numericRank: number): string {
    switch (numericRank) {
      case 1: return 'A';
      case 11: return 'J';
      case 12: return 'Q';
      case 13: return 'K';
      default: return numericRank.toString();
    }
  }
}
