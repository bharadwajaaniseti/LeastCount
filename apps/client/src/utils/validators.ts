import {
  Card,
  SelectionInfo,
  Rank,
} from '@least-count/shared';

// Card values for scoring (copying from shared since import issue)
const CARD_VALUES: Record<Rank, number> = {
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

export function validateSelection(cards: Card[]): SelectionInfo {
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

  if (isValidSet(cards)) {
    const rank = cards[0].rank;
    return {
      type: 'set',
      cards: [...cards],
      isValid: true,
      description: `✅ SET x${cards.length} (${rank})`,
    };
  }

  return {
    type: 'invalid',
    cards: [...cards],
    isValid: false,
    description: '❌ Invalid combination - only single cards and sets allowed',
  };
}

export function calculateHandTotal(hand: Card[]): number {
  return hand.reduce((total, card) => total + CARD_VALUES[card.rank], 0);
}

function isValidSet(cards: Card[]): boolean {
  if (cards.length < 2) return false;

  // No jokers allowed in sets
  if (cards.some(c => c.rank === 'JOKER')) return false;

  // All cards must have same rank
  const rank = cards[0].rank;
  return cards.every(c => c.rank === rank);
}
