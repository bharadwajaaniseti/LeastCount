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
        return [0, 1, 2, 3, 4, 5, 6, 7]; // All positions
      default:
        return [0]; // Fallback
    }
  };

  const optimalPositions = getOptimalSeatPositions(roomState.players.length);

  // Map players to optimal positions with current player always at bottom
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
    <div className="table-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
      <div className="table-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
        <div className="game-table table-rim" style={{ margin: '0 auto', left: '50%', transform: 'translateX(-50%)', position: 'relative', zIndex: 1 }}>
          {/* Table Felt */}
          <div className="table-felt w-full h-full relative flex items-center justify-center" style={{ zIndex: 1 }}>
            {/* Center Area - Joker, Stock, Discard, Card Slot */}
            <div className="absolute inset-0 flex items-center justify-center z-30">
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 lg:gap-6 bg-black/20 p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl backdrop-blur-sm">
                {/* Joker Display - Left of Stock */}
                {roomState.currentJoker && (
                  <div className="flex flex-col items-center gap-1 bg-yellow-600 bg-opacity-20 p-1 sm:p-2 lg:p-3 rounded border border-yellow-400">
                    <div className="text-yellow-300 text-xs font-bold">JOKER</div>
                    <Card 
                      card={{ 
                        id: 'joker-display', 
                        rank: roomState.currentJoker, 
                        suit: 'S' 
                      }} 
                      size="lg" 
                      className="transform scale-90 sm:scale-100" 
                    />
                    <div className="text-yellow-300 text-xs">Round {roomState.round}</div>
                  </div>
                )}

                {/* Stock Pile */}
                <div className="flex flex-col items-center gap-1">
                  <div className="text-white text-xs sm:text-sm font-medium">Stock</div>
                  <div
                    className="relative cursor-pointer transition-transform hover:scale-105"
                    onClick={() => {
                      if (roomState.phase === 'turn-draw' && stockCount > 0) {
                        drawStock();
                      }
                    }}
                  >
                    <Card faceDown size="lg" />
                    {stockCount > 0 && (
                      <div className="absolute -bottom-4 sm:-bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-1 sm:px-2 py-1 rounded">
                        {stockCount}
                      </div>
                    )}
                  </div>
                </div>

                {/* Discard Pile */}
                <div className="flex flex-col items-center gap-1">
                  <div className="text-white text-xs sm:text-sm font-medium">Discard</div>
                  <div className="relative">
                    {topDiscard && topDiscard.cards.length > 0 ? (
                      <div className="flex justify-center">
                        {/* Only show the top (last) card from the discard pile */}
                        <Card
                          key={topDiscard.cards[topDiscard.cards.length - 1].id}
                          card={topDiscard.cards[topDiscard.cards.length - 1]}
                          size="lg"
                          className="cursor-pointer transition-transform hover:scale-105 hover:-translate-y-2"
                          onClick={() => {
                            if (roomState.phase === 'turn-draw') {
                              // Always draw the last card since that's what we're showing
                              drawDiscard('last');
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className="card-slot">
                        <div className="text-gray-500 text-xs">Empty</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Slot */}
                <div className="flex flex-col items-center gap-1">
                  <div className="text-white text-xs sm:text-sm font-medium">
                    Card Slot
                    {roomState.phase === 'turn-discard' && roomState.activePlayerId === playerId && (
                      <div className="text-yellow-400 text-xs mt-1">Drop cards here</div>
                    )}
                  </div>
                  <div className={`card-slot ${
                    roomState.phase === 'turn-discard' && roomState.activePlayerId === playerId 
                      ? 'border-yellow-400 border-2 animate-pulse' 
                      : ''
                  }`}>
                    {cardSlotPreview && cardSlotPreview.length > 0 ? (
                      <div className="flex -space-x-1 sm:-space-x-2">
                        {cardSlotPreview.map((card, index) => (
                          <Card
                            key={card.id || index}
                            card={card}
                            size="md"
                            className="transform scale-75 sm:scale-100"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500 text-xs text-center">
                        {roomState.phase === 'turn-discard' && roomState.activePlayerId === playerId 
                          ? 'Drop cards here\nfirst!' 
                          : 'Temporary\ncard area'
                        }
                      </div>
                    )}
                  </div>
                  
                  {/* Flow indicator */}
                  {cardSlotPreview && cardSlotPreview.length > 0 && roomState.activePlayerId === playerId && (
                    <div className="text-xs text-blue-400 text-center mt-1">
                      Hit MOVE to place in discard →
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
                  seatClass = 'absolute bottom-1 sm:bottom-2 lg:bottom-4 left-1/2 transform -translate-x-1/2';
                  break;
                case 1:
                  seatClass = 'absolute bottom-4 right-1 sm:bottom-8 sm:right-2 lg:bottom-16 lg:right-4';
                  break;
                case 2:
                  seatClass = 'absolute right-1 top-1/2 transform -translate-y-1/2 sm:right-2 lg:right-4';
                  break;
                case 3:
                  seatClass = 'absolute top-4 right-1 sm:top-8 sm:right-2 lg:top-16 lg:right-4';
                  break;
                case 4:
                  seatClass = 'absolute top-1 sm:top-2 lg:top-4 left-1/2 transform -translate-x-1/2';
                  break;
                case 5:
                  seatClass = 'absolute top-4 left-1 sm:top-8 sm:left-2 lg:top-16 lg:left-4';
                  break;
                case 6:
                  seatClass = 'absolute left-1 top-1/2 transform -translate-y-1/2 sm:left-2 lg:left-4';
                  break;
                case 7:
                  seatClass = 'absolute bottom-4 left-1 sm:bottom-8 sm:left-2 lg:bottom-16 lg:left-4';
                  break;
              }
              return (
                <div key={player.id} className={`${seatClass} max-w-[80px] sm:max-w-[100px] lg:max-w-[120px] z-10`}>
                  <Seat playerId={player.id} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Table;
