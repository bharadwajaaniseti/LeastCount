import React from 'react';
import { useGameStore } from '@/store/gameStore';
import Card from './Card';
import Seat from './Seat';

const Table: React.FC = () => {
  const { roomState, drawStock, drawDiscard, playerId } = useGameStore();

  if (!roomState || !playerId) return null;

  const { stockCount, topDiscard, cardSlotPreview } = roomState;

  // Calculate optimal seat positions based on player count
  const getOptimalSeatPositions = (playerCount: number): number[] => {
    switch (playerCount) {
      case 2:
        return [0, 4]; // Bottom and top
      case 3:
        return [0, 2, 6]; // Bottom, right, left (triangle)
      case 4:
        return [0, 2, 4, 6]; // Bottom, right, top, left (square)
      case 5:
        return [0, 1, 3, 5, 7]; // Bottom, bottom-right, top-right, top-left, bottom-left
      case 6:
        return [0, 1, 2, 4, 5, 6]; // All except top corners
      case 7:
        return [0, 1, 2, 3, 5, 6, 7]; // All except top-left
      case 8:
      default:
        return [0, 1, 2, 3, 4, 5, 6, 7]; // All positions
    }
  };

  const optimalPositions = getOptimalSeatPositions(roomState.players.length);
  
  // Map each player to their optimal position, ensuring current player is at position 0 (bottom)
  const playersWithOptimalPositions = roomState.players.map((player, index) => {
    let positionIndex = index;
    
    // If this is the current player, put them at position 0 (bottom)
    if (player.id === playerId) {
      positionIndex = 0;
    } else {
      // For other players, shift index if current player is not already at index 0
      const currentPlayerIndex = roomState.players.findIndex(p => p.id === playerId);
      if (currentPlayerIndex !== 0) {
        if (index < currentPlayerIndex) {
          positionIndex = index + 1;
        } else {
          positionIndex = index;
        }
        if (positionIndex >= optimalPositions.length) {
          positionIndex = positionIndex % optimalPositions.length;
        }
      }
    }
    
    const optimalPosition = optimalPositions[positionIndex];
    return {
      ...player,
      displayPosition: optimalPosition
    };
  });

  return (
    <div className="h-full w-full relative flex items-center justify-center p-2 md:p-8 overflow-x-auto">
      {/* Table Rim */}
      <div className="table-rim w-full max-w-6xl aspect-[16/10] min-w-[340px] md:min-w-[600px] lg:min-w-[900px]">
        {/* Table Felt */}
        <div className="table-felt w-full h-full relative flex items-center justify-center">
          {/* Joker Display */}
          {roomState.currentJoker && (
            <div className="absolute top-2 right-2 md:top-4 md:right-4 flex flex-col items-center gap-2 bg-yellow-600 bg-opacity-20 p-2 md:p-3 rounded-lg border border-yellow-400">
              <div className="text-yellow-300 text-xs font-bold">JOKER</div>
              <Card 
                card={{ 
                  id: 'joker-display', 
                  rank: roomState.currentJoker, 
                  suit: 'S' 
                }} 
                size="sm" 
                className="transform scale-75" 
              />
              <div className="text-yellow-300 text-xs">Round {roomState.round}</div>
            </div>
          )}
          {/* Center Area - Stock, Discard, Card Slot */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex flex-col md:flex-row items-center gap-2 md:gap-6 w-full max-w-xl">
            {/* Stock Pile */}
            <div className="flex flex-col items-center gap-1 md:gap-2">
              <div className="text-white text-xs md:text-sm font-medium">Stock</div>
              <div
                className="relative cursor-pointer"
                onClick={() => {
                  if (roomState.phase === 'turn-draw' && stockCount > 0) {
                    drawStock();
                  }
                }}
              >
                <Card faceDown size="lg" />
                {stockCount > 0 && (
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                    {stockCount}
                  </div>
                )}
              </div>
            </div>
            {/* Discard Pile */}
            <div className="flex flex-col items-center gap-1 md:gap-2">
              <div className="text-white text-xs md:text-sm font-medium">Discard</div>
              <div className="relative">
                {topDiscard && topDiscard.cards.length > 0 ? (
                  <div className="flex -space-x-2 md:-space-x-4">
                    {topDiscard.cards.map((card, index) => (
                      <Card
                        key={card.id}
                        card={card}
                        size="lg"
                        className={`cursor-pointer transition-transform hover:scale-105 ${
                          index === 0 || index === topDiscard.cards.length - 1
                            ? 'hover:-translate-y-2'
                            : ''
                        }`}
                        onClick={() => {
                          if (roomState.phase === 'turn-draw') {
                            if (index === 0) {
                              drawDiscard('first');
                            } else if (index === topDiscard.cards.length - 1) {
                              drawDiscard('last');
                            }
                          }
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="card-slot">
                    <div className="text-gray-500 text-xs">Empty</div>
                  </div>
                )}
              </div>
            </div>
            {/* Card Slot */}
            <div className="flex flex-col items-center gap-1 md:gap-2">
              <div className="text-white text-xs md:text-sm font-medium">Card Slot</div>
              <div className="card-slot">
                {cardSlotPreview && cardSlotPreview.length > 0 ? (
                  <div className="flex -space-x-1 md:-space-x-2">
                    {cardSlotPreview.map((cardId) => {
                      // Find the card in the current player's hand
                      const currentPlayer = roomState.players.find(p => p.id === roomState.activePlayerId);
                      const card = currentPlayer?.hand.find(c => c.id === cardId);
                      return card ? (
                        <Card
                          key={cardId}
                          card={card}
                          size="md"
                          className="transform scale-75"
                        />
                      ) : null;
                    })}
                  </div>
                ) : (
                  <div className="text-gray-500 text-xs text-center">
                    Place cards<br />here
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Player Seats - Responsive arrangement */}
          {playersWithOptimalPositions.map((player) => {
            const displayPosition = player.displayPosition;
            let seatClass = '';
            switch (displayPosition) {
              case 0:
                seatClass = 'absolute bottom-2 left-1/2 transform -translate-x-1/2';
                break;
              case 1:
                seatClass = 'absolute bottom-8 right-2 md:bottom-12 md:right-12';
                break;
              case 2:
                seatClass = 'absolute right-2 top-1/2 transform -translate-y-1/2 md:right-4';
                break;
              case 3:
                seatClass = 'absolute top-8 right-2 md:top-12 md:right-12';
                break;
              case 4:
                seatClass = 'absolute top-2 left-1/2 transform -translate-x-1/2';
                break;
              case 5:
                seatClass = 'absolute top-8 left-2 md:top-12 md:left-12';
                break;
              case 6:
                seatClass = 'absolute left-2 top-1/2 transform -translate-y-1/2 md:left-4';
                break;
              case 7:
                seatClass = 'absolute bottom-8 left-2 md:bottom-12 md:left-12';
                break;
            }
            return (
              <div key={player.id} className={seatClass + ' max-w-[120px] md:max-w-[180px]'}>
                <Seat playerId={player.id} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Table;
