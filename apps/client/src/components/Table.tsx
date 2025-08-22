import React from 'react';
import { useGameStore } from '@/store/gameStore';
import Card from './Card';
import Seat from './Seat';

const Table: React.FC = () => {
  const { roomState, drawStock, drawDiscard } = useGameStore();

  if (!roomState) return null;

  const { stockCount, topDiscard, cardSlotPreview } = roomState;

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

          {/* Player Seats - Arranged around the table */}
          {/* Seat positions: 0=bottom, 1=bottom-right, 2=right, 3=top-right, 4=top, 5=top-left, 6=left, 7=bottom-left */}
          
          {/* Bottom (Seat 0) */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <Seat seatNumber={0} />
          </div>

          {/* Bottom Right (Seat 1) */}
          <div className="absolute bottom-12 right-12">
            <Seat seatNumber={1} />
          </div>

          {/* Right (Seat 2) */}
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <Seat seatNumber={2} />
          </div>

          {/* Top Right (Seat 3) */}
          <div className="absolute top-12 right-12">
            <Seat seatNumber={3} />
          </div>

          {/* Top (Seat 4) */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
            <Seat seatNumber={4} />
          </div>

          {/* Top Left (Seat 5) */}
          <div className="absolute top-12 left-12">
            <Seat seatNumber={5} />
          </div>

          {/* Left (Seat 6) */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <Seat seatNumber={6} />
          </div>

          {/* Bottom Left (Seat 7) */}
          <div className="absolute bottom-12 left-12">
            <Seat seatNumber={7} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Table;
