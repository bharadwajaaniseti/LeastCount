import React, { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Card as CardType, Rank } from '@least-count/shared';
import Card from './Card';

const Hand: React.FC = () => {
  const { 
    roomState, 
    playerId, 
    selectedCardIds, 
    selectionInfo, 
    selectCard, 
    confirmDiscard 
  } = useGameStore();

  // Card values for scoring
  const getCardValue = (rank: Rank): number => {
    const values: Record<Rank, number> = {
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
    return values[rank] || 0;
  };

  // Helper function to calculate hand total
  const calculateHandTotal = (hand: CardType[]) => {
    if (!hand || !Array.isArray(hand)) return 0;
    
    return hand.reduce((total, card) => {
      if (!card) return total;
      
      // If card is the current joker rank, it counts as 0
      if (roomState?.currentJoker && card.rank === roomState.currentJoker) {
        return total + 0;
      }
      return total + getCardValue(card.rank);
    }, 0);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && selectionInfo?.isValid) {
        confirmDiscard();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectionInfo, confirmDiscard]);

  if (!roomState || !playerId) return null;

  const currentPlayer = roomState.players.find(p => p.id === playerId);
  if (!currentPlayer) return null;

  const isMyTurn = roomState.activePlayerId === playerId;
  const canDiscard = isMyTurn && roomState.phase === 'turn-discard';

  return (
    <div className="h-full flex flex-col justify-end p-4 relative z-40">
      {/* Hand Count Display */}
      <div className="mb-2 flex justify-center relative z-50">
        <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-lg px-4 py-2 relative z-50">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-gray-400 text-sm">Hand Count: </span>
              <span className="text-yellow-400 text-lg font-bold">
                {calculateHandTotal(currentPlayer.hand)}
              </span>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Cards: </span>
              <span className="text-white text-sm">{currentPlayer.hand.length}</span>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Score: </span>
              <span className="text-white text-sm">{currentPlayer.score || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selection Info Badge */}
      {selectionInfo && selectedCardIds.length > 0 && (
        <div className="mb-4 flex justify-center">
          <div className={`badge ${selectionInfo.isValid ? 'badge-success' : 'badge-error'}`}>
            {selectionInfo.description}
          </div>
        </div>
      )}

      {/* Confirm Discard Button */}
      {canDiscard && selectionInfo?.isValid && selectedCardIds.length > 0 && (
        <div className="mb-4 flex justify-center relative z-50">
          <button
            onClick={confirmDiscard}
            className="btn-primary px-8 py-2 relative z-50 shadow-lg"
            style={{ zIndex: 100 }}
          >
            Confirm Discard
          </button>
        </div>
      )}

      {/* Hand Cards */}
      <div className="flex justify-center w-full">
        <div className="flex -space-x-2 sm:-space-x-4 justify-center items-center flex-wrap px-2">
          {currentPlayer.hand.map((card) => (
            <Card
              key={card.id}
              card={card}
              selected={selectedCardIds.includes(card.id)}
              onClick={() => {
                if (canDiscard) {
                  selectCard(card.id);
                }
              }}
              className={`
                transition-all duration-200 
                ${canDiscard ? 'hover:cursor-pointer' : 'cursor-default opacity-75'}
                ${selectedCardIds.includes(card.id) ? 'transform -translate-y-4' : ''}
              `}
            />
          ))}
        </div>
      </div>

      {/* Hand Info */}
      <div className="mt-2 text-center text-gray-400 text-sm">
        {isMyTurn && roomState.phase === 'turn-discard' && (
          <span className="text-yellow-400">
            Double-click cards to select/deselect
          </span>
        )}
      </div>
    </div>
  );
};

export default Hand;
