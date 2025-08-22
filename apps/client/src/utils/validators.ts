import {
  Card,
  SelectionInfo,
  Rank,
} from '@least-count/shared';

// Card values for scoring (matching shared package)
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
  'J': 10,
  'Q': 10,
  'K': 10,
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

  // Check for valid set first (≥2 cards, same rank, no jokers)
  if (isValidSet(cards)) {
    const rank = cards[0].rank;
    return {
      type: 'set',
      cards: [...cards],
      isValid: true,
      description: `✅ SET x${cards.length} (${rank})`,
    };
  }

  // Check for valid run (≥3 cards, consecutive ranks, same suit, jokers allowed)
  if (isValidRun(cards)) {
    const suit = cards.find(c => c.rank !== 'JOKER')?.suit || '?';
    const sortedCards = [...cards].sort((a, b) => getCardValue(a) - getCardValue(b));
    const lowCard = sortedCards[0];
    const highCard = sortedCards[sortedCards.length - 1];
    return {
      type: 'run',
      cards: [...cards],
      isValid: true,
      description: `✅ RUN ${suit} ${lowCard.rank}–${highCard.rank}`,
    };
  }

  return {
    type: 'invalid',
    cards: [...cards],
    isValid: false,
    description: '❌ Invalid - must be single card, set (≥2 same rank), or run (≥3 consecutive same suit)',
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

// Helper function to get numeric value of a card for run sequence ordering
function getCardValue(card: Card): number {
  if (card.rank === 'JOKER') return 0; // Jokers are wild, value determined by context
  if (card.rank === 'A') return 1; // Ace is always low (value 1)
  if (card.rank === 'J') return 11; // For sequence ordering (not scoring)
  if (card.rank === 'Q') return 12; // For sequence ordering (not scoring)
  if (card.rank === 'K') return 13; // For sequence ordering (not scoring)
  return typeof card.rank === 'number' ? card.rank : parseInt(card.rank);
}

function isValidRun(cards: Card[]): boolean {
  if (cards.length < 3) return false;
  
  // All non-joker cards must be the same suit
  const nonJokerCards = cards.filter(card => card.rank !== 'JOKER');
  if (nonJokerCards.length === 0) return false; // Can't have a run of only jokers
  
  const suit = nonJokerCards[0].suit;
  if (!nonJokerCards.every(card => card.suit === suit)) return false;
  
  // Sort non-joker cards by value
  const sortedNonJokers = nonJokerCards
    .map(card => getCardValue(card))
    .sort((a, b) => a - b);
  
  // Check if we can form a consecutive sequence with jokers filling gaps
  const jokerCount = cards.length - nonJokerCards.length;
  
  if (sortedNonJokers.length === 1) {
    // Only one real card + jokers - valid if we have at least 2 jokers
    return jokerCount >= 2;
  }
  
  // Check for duplicates in non-joker cards (invalid for runs)
  for (let i = 0; i < sortedNonJokers.length - 1; i++) {
    if (sortedNonJokers[i] === sortedNonJokers[i + 1]) return false;
  }
  
  // Calculate gaps between consecutive non-joker cards
  let totalGaps = 0;
  for (let i = 0; i < sortedNonJokers.length - 1; i++) {
    const gap = sortedNonJokers[i + 1] - sortedNonJokers[i] - 1;
    totalGaps += gap;
  }
  
  // Check if we have enough jokers to fill all gaps
  return jokerCount === totalGaps;
}
