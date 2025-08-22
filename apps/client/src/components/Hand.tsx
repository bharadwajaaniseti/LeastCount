import React, { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
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
    <div className="h-full flex flex-col justify-end p-4">
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
        <div className="mb-4 flex justify-center">
          <button
            onClick={confirmDiscard}
            className="btn-primary px-8 py-2"
          >
            Confirm Discard
          </button>
        </div>
      )}

      {/* Hand Cards */}
      <div className="flex justify-center">
        <div className="flex -space-x-4 max-w-full overflow-x-auto px-4">
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
        {currentPlayer.hand.length} cards
        {isMyTurn && roomState.phase === 'turn-discard' && (
          <span className="ml-4 text-yellow-400">
            Double-click cards to select/deselect
          </span>
        )}
      </div>
    </div>
  );
};

export default Hand;
