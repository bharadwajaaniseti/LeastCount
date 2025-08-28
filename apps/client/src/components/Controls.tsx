import React, { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import Timer from './Timer';

const Controls: React.FC = () => {
  const { 
    roomState, 
    playerId, 
    drawStock, 
    drawDiscard, 
    move, 
    show 
  } = useGameStore();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!roomState || roomState.activePlayerId !== playerId) return;

      switch (e.key.toLowerCase()) {
        case 'd':
          if (roomState.phase === 'turn-draw' && roomState.stockCount > 0) {
            drawStock();
          }
          break;
        case 'f':
          if (roomState.phase === 'turn-draw' && roomState.topDiscard?.cards.length) {
            drawDiscard('first');
          }
          break;
        case 'l':
          if (roomState.phase === 'turn-draw' && roomState.topDiscard?.cards.length) {
            drawDiscard('last');
          }
          break;
        case 'm':
          if (roomState.phase === 'await-move') {
            move();
          }
          break;
        case 's':
          if (roomState.phase === 'turn-discard' && roomState.canShow) {
            show();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [roomState, playerId, drawStock, drawDiscard, move, show]);

  if (!roomState || !playerId) return null;

  const isMyTurn = roomState.activePlayerId === playerId;
  const canShow = isMyTurn && roomState.phase === 'turn-discard' && roomState.canShow;
  
  // MOVE button logic: Allow if in await-move phase and has discarded
  // Don't require hasDrawn for first MOVE (card slot to discard transfer)
  const canMove = isMyTurn && roomState.phase === 'await-move' && 
                  roomState.turnActions?.hasDiscarded;
  
  // Check if player can draw from discard pile (not their own discarded cards)
  const canDrawDiscard = isMyTurn && roomState.phase === 'turn-draw' && 
                         roomState.topDiscard?.cards.length && 
                         !roomState.turnActions?.discardedFromCardSlot;

  return (
    <div className="h-full flex items-center justify-between px-6">
      {/* Left Side: Game Info, Timer & Utility Buttons */}
      <div className="flex items-center gap-6">
        {/* Timer */}
        <Timer />
        
        {/* Game Phase Indicator */}
        <div className="flex flex-col">
          <div className="text-gray-400 text-sm">Phase</div>
          <div className="text-white font-medium capitalize">
            {roomState.phase.replace('-', ' ')}
          </div>
          {isMyTurn && (
            <div className="text-yellow-400 text-sm">Your turn</div>
          )}
        </div>

        {/* Utility Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              // This will be handled by parent component
              const event = new CustomEvent('showScores');
              window.dispatchEvent(event);
            }}
            className="btn-secondary px-4 py-2 text-sm"
            title="View Scores"
          >
            Score
          </button>

          <button
            onClick={() => {
              // This will be handled by parent component
              const event = new CustomEvent('exitGame');
              window.dispatchEvent(event);
            }}
            className="btn-danger px-4 py-2 text-sm"
            title="Exit Game"
          >
            Exit
          </button>
        </div>
      </div>

      {/* Draw Instructions */}
      {isMyTurn && roomState.phase === 'turn-draw' && (
        <div className="text-center text-gray-300 text-sm">
          <div>Draw a card:</div>
          <div className="text-xs text-gray-400 mt-1">
            D = Stock
            {canDrawDiscard && (
              <span> • F = First discard • L = Last discard</span>
            )}
            {!canDrawDiscard && roomState.topDiscard?.cards.length && (
              <span className="text-red-400"> • Cannot draw your own discard</span>
            )}
          </div>
        </div>
      )}

      {/* Skip Draw Notification */}
      {isMyTurn && roomState.phase === 'await-move' && 
       roomState.turnActions?.hasDiscarded && roomState.turnActions?.hasDrawn && (
        <div className="text-center text-green-400 text-sm">
          <div className="flex items-center gap-2">
            <span>🎯</span>
            <span>Matching discard! Draw skipped</span>
          </div>
        </div>
      )}

      {/* Right Side: Game Action Buttons */}
      <div className="flex items-center gap-4">
        {/* Show Button */}
        <button
          onClick={show}
          disabled={!canShow}
          className="btn-secondary px-6 py-2 disabled:opacity-30"
          title="Declare (S)"
        >
          Show
        </button>

        {/* Move Button */}
        <button
          onClick={move}
          disabled={!canMove}
          className="btn-primary px-8 py-2 disabled:opacity-30"
          title="End Turn (M)"
        >
          Move
        </button>
      </div>

      {/* Turn Actions Status */}
      {isMyTurn && roomState.turnActions && (
        <div className="text-right text-sm">
          <div className="text-gray-400">Turn Progress:</div>
          <div className={`${roomState.turnActions.hasDiscarded ? 'text-green-400' : 'text-gray-500'}`}>
            ✓ Discard
          </div>
          <div className={`${roomState.turnActions.hasDrawn ? 'text-green-400' : 'text-gray-500'}`}>
            ✓ Draw
          </div>
        </div>
      )}
    </div>
  );
};

export default Controls;
