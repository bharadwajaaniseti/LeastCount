// Quick test for the new run validation logic

const testCards = {
  // Valid runs
  run3Cards: [
    { id: '1', rank: 'A', suit: 'S' },
    { id: '2', rank: 2, suit: 'S' },
    { id: '3', rank: 3, suit: 'S' }
  ],
  
  run4Cards: [
    { id: '1', rank: 5, suit: 'H' },
    { id: '2', rank: 6, suit: 'H' },
    { id: '3', rank: 7, suit: 'H' },
    { id: '4', rank: 8, suit: 'H' }
  ],
  
  runWithJoker: [
    { id: '1', rank: 'A', suit: 'S' },
    { id: '2', rank: 'JOKER' },  // Acts as 2 of Spades
    { id: '3', rank: 3, suit: 'S' }
  ],
  
  runWithMultipleJokers: [
    { id: '1', rank: 'A', suit: 'S' },
    { id: '2', rank: 'JOKER' },  // Acts as 2 of Spades
    { id: '3', rank: 'JOKER' },  // Acts as 3 of Spades
    { id: '4', rank: 4, suit: 'S' }
  ],
  
  // Invalid runs
  wrongSuit: [
    { id: '1', rank: 'A', suit: 'S' },
    { id: '2', rank: 2, suit: 'H' },  // Different suit
    { id: '3', rank: 3, suit: 'S' }
  ],
  
  gapWithoutJoker: [
    { id: '1', rank: 'A', suit: 'S' },
    { id: '2', rank: 3, suit: 'S' }  // Missing 2
  ],
  
  duplicate: [
    { id: '1', rank: 'A', suit: 'S' },
    { id: '2', rank: 'A', suit: 'S' },  // Duplicate rank
    { id: '3', rank: 2, suit: 'S' }
  ],
  
  // Valid sets  
  set3Cards: [
    { id: '1', rank: 'A', suit: 'S' },
    { id: '2', rank: 'A', suit: 'H' },
    { id: '3', rank: 'A', suit: 'D' }
  ],
  
  // Invalid sets
  setWithJoker: [
    { id: '1', rank: 'A', suit: 'S' },
    { id: '2', rank: 'JOKER' },
    { id: '3', rank: 'A', suit: 'D' }
  ]
};

// Helper functions (copy from validators.ts)
function getCardValue(card) {
  if (card.rank === 'JOKER') return 0;
  if (card.rank === 'A') return 1;
  if (card.rank === 'J') return 11;
  if (card.rank === 'Q') return 12;
  if (card.rank === 'K') return 13;
  return typeof card.rank === 'number' ? card.rank : parseInt(card.rank);
}

function isValidSet(cards) {
  if (cards.length < 2) return false;
  if (cards.some(c => c.rank === 'JOKER')) return false;
  const rank = cards[0].rank;
  return cards.every(c => c.rank === rank);
}

function isValidRun(cards) {
  if (cards.length < 3) return false;
  
  const nonJokerCards = cards.filter(card => card.rank !== 'JOKER');
  if (nonJokerCards.length === 0) return false;
  
  const suit = nonJokerCards[0].suit;
  if (!nonJokerCards.every(card => card.suit === suit)) return false;
  
  const sortedNonJokers = nonJokerCards
    .map(card => getCardValue(card))
    .sort((a, b) => a - b);
  
  const jokerCount = cards.length - nonJokerCards.length;
  
  if (sortedNonJokers.length === 1) {
    return jokerCount >= 2;
  }
  
  for (let i = 0; i < sortedNonJokers.length - 1; i++) {
    if (sortedNonJokers[i] === sortedNonJokers[i + 1]) return false;
  }
  
  let totalGaps = 0;
  for (let i = 0; i < sortedNonJokers.length - 1; i++) {
    const gap = sortedNonJokers[i + 1] - sortedNonJokers[i] - 1;
    totalGaps += gap;
  }
  
  return jokerCount === totalGaps;
}

// Test the validation
console.log('=== TESTING RUN VALIDATION ===');
console.log('Valid runs:');
console.log('3-card run A-2-3 spades:', isValidRun(testCards.run3Cards));
console.log('4-card run 5-6-7-8 hearts:', isValidRun(testCards.run4Cards));
console.log('Run with joker A-J-3 spades:', isValidRun(testCards.runWithJoker));
console.log('Run with 2 jokers A-J-J-4 spades:', isValidRun(testCards.runWithMultipleJokers));

console.log('\nInvalid runs:');
console.log('Wrong suit A♠-2♥-3♠:', isValidRun(testCards.wrongSuit));
console.log('Gap without joker A-3 spades:', isValidRun(testCards.gapWithoutJoker));
console.log('Duplicate ranks A-A-2 spades:', isValidRun(testCards.duplicate));

console.log('\n=== TESTING SET VALIDATION ===');
console.log('Valid sets:');
console.log('3 Aces different suits:', isValidSet(testCards.set3Cards));

console.log('\nInvalid sets:');
console.log('Set with joker A-J-A:', isValidSet(testCards.setWithJoker));
