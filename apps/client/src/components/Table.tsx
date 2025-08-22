import React from 'react';
import { useGameStore } from '@/store/gameStore';
import Card from './Card';
import Seat from './Seat';

const Table: React.FC = () => {
  const { roomState, drawStock, drawDiscard, playerId } = useGameStore();

  if (!roomState || !playerId) return null;

  const { stockCount, topDiscard, cardSlotPreview } = roomState;

  // Create dynamic seat arrangement with current player at bottom (seat 0)
  const currentPlayer = roomState.players.find(p => p.id === playerId);
  const currentPlayerSeat = currentPlayer?.seat || 0;
  
  // Calculate relative seat positions with current player at bottom
  const getRelativeSeat = (absoluteSeat: number): number => {
    const totalSeats = 8;
    const relativeSeat = (absoluteSeat - currentPlayerSeat + totalSeats) % totalSeats;
    return relativeSeat;
  };

  return (
    <div className="h-full w-full relative flex items-center justify-center p-8">
      {/* Table Rim */}
      <div className="table-rim w-full max-w-6xl aspect-[16/10]">
        {/* Table Felt */}
        <div className="table-felt w-full h-full relative flex items-center justify-center">
          
          {/* Center Area - Stock, Discard, Card Slot */}
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 flex items-center gap-6">
            {/* Stock Pile */}
            <div className="flex flex-col items-center gap-2">
              <div className="text-white text-sm font-medium">Stock</div>
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
            <div className="flex flex-col items-center gap-2">
              <div className="text-white text-sm font-medium">Discard</div>
              <div className="relative">
                {topDiscard && topDiscard.cards.length > 0 ? (
                  <div className="flex -space-x-4">
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
            <div className="flex flex-col items-center gap-2">
              <div className="text-white text-sm font-medium">Card Slot</div>
              <div className="card-slot">
                {cardSlotPreview && cardSlotPreview.length > 0 ? (
                  <div className="flex -space-x-2">
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

          {/* Player Seats - Arranged dynamically around the table with current player at bottom */}
          {/* Current player always at bottom (seat 0) */}
          {roomState.players.map((player) => {
            const relativeSeat = getRelativeSeat(player.seat);
            let seatClass = '';
            
            switch (relativeSeat) {
              case 0: // Bottom (current player)
                seatClass = 'absolute bottom-4 left-1/2 transform -translate-x-1/2';
                break;
              case 1: // Bottom Right
                seatClass = 'absolute bottom-12 right-12';
                break;
              case 2: // Right
                seatClass = 'absolute right-4 top-1/2 transform -translate-y-1/2';
                break;
              case 3: // Top Right
                seatClass = 'absolute top-12 right-12';
                break;
              case 4: // Top
                seatClass = 'absolute top-4 left-1/2 transform -translate-x-1/2';
                break;
              case 5: // Top Left
                seatClass = 'absolute top-12 left-12';
                break;
              case 6: // Left
                seatClass = 'absolute left-4 top-1/2 transform -translate-y-1/2';
                break;
              case 7: // Bottom Left
                seatClass = 'absolute bottom-12 left-12';
                break;
            }

            return (
              <div key={player.id} className={seatClass}>
                <Seat playerId={player.id} />
              </div>
            );
          })}
          
          {/* Empty seats */}
          {Array.from({ length: 8 - roomState.players.length }).map((_, index) => {
            const emptySeatIndex = roomState.players.length + index;
            const relativeSeat = getRelativeSeat(emptySeatIndex);
            let seatClass = '';
            
            switch (relativeSeat) {
              case 0:
                seatClass = 'absolute bottom-4 left-1/2 transform -translate-x-1/2';
                break;
              case 1:
                seatClass = 'absolute bottom-12 right-12';
                break;
              case 2:
                seatClass = 'absolute right-4 top-1/2 transform -translate-y-1/2';
                break;
              case 3:
                seatClass = 'absolute top-12 right-12';
                break;
              case 4:
                seatClass = 'absolute top-4 left-1/2 transform -translate-x-1/2';
                break;
              case 5:
                seatClass = 'absolute top-12 left-12';
                break;
              case 6:
                seatClass = 'absolute left-4 top-1/2 transform -translate-y-1/2';
                break;
              case 7:
                seatClass = 'absolute bottom-12 left-12';
                break;
            }

            return (
              <div key={`empty-${index}`} className={seatClass}>
                <Seat playerId={null} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Table;
