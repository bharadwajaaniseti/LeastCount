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
          // F key now draws from discard pile (always the top card)
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
  
  // MOVE button logic: Allow only after both discard and draw are complete
  const canMove = isMyTurn && roomState.phase === 'await-move' && 
                  roomState.turnActions?.hasDiscarded && 
                  roomState.turnActions?.hasDrawn;
  
  // Check if player can draw from discard pile  
  const canDrawDiscard = isMyTurn && roomState.phase === 'turn-draw' && 
                         roomState.topDiscard?.cards.length;

  return (
    <div className="h-full flex items-center justify-between px-2 sm:px-4 lg:px-6">
      {/* Left Side: Game Info, Timer & Utility Buttons */}
      <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
        {/* Timer */}
        <Timer />
        
        {/* Game Phase Indicator - Hidden on mobile */}
        <div className="hidden sm:flex flex-col">
          <div className="text-gray-400 text-sm">Phase</div>
          <div className="text-white font-medium capitalize">
            {roomState.phase.replace('-', ' ')}
          </div>
          {isMyTurn && (
            <div className="text-yellow-400 text-sm">Your turn</div>
          )}
        </div>

        {/* Compact mobile phase indicator */}
        <div className="sm:hidden text-center">
          <div className="text-yellow-400 text-xs font-medium capitalize">
            {roomState.phase.replace('-', ' ')}
          </div>
          {isMyTurn && (
            <div className="text-yellow-300 text-xs">Your turn</div>
          )}
        </div>

        {/* Utility Buttons */}
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
          <button
            onClick={() => {
              // This will be handled by parent component
              const event = new CustomEvent('showScores');
              window.dispatchEvent(event);
            }}
            className="btn-secondary px-2 py-1 sm:px-3 sm:py-2 lg:px-4 lg:py-2 text-xs sm:text-sm"
            title="View Scores"
          >
            <span className="hidden sm:inline">Score</span>
            <span className="sm:hidden">📊</span>
          </button>

          <button
            onClick={() => {
              // This will be handled by parent component
              const event = new CustomEvent('exitGame');
              window.dispatchEvent(event);
            }}
            className="btn-danger px-2 py-1 sm:px-3 sm:py-2 lg:px-4 lg:py-2 text-xs sm:text-sm"
            title="Exit Game"
          >
            <span className="hidden sm:inline">Exit</span>
            <span className="sm:hidden">✕</span>
          </button>
        </div>
      </div>

      {/* Draw Instructions - Hidden on small mobile */}
      {isMyTurn && roomState.phase === 'turn-draw' && (
        <div className="hidden md:block text-center text-gray-300 text-xs sm:text-sm">
          <div>Draw a card:</div>
          <div className="text-xs text-gray-400 mt-1">
            D = Stock
            {canDrawDiscard && (
              <span> • F = Discard pile</span>
            )}
            {!canDrawDiscard && roomState.topDiscard?.cards.length && (
              <span className="text-red-400"> • Cannot draw your own discard</span>
            )}
          </div>
        </div>
      )}

      {/* Compact draw instructions for mobile */}
      {isMyTurn && roomState.phase === 'turn-draw' && (
        <div className="md:hidden text-center text-gray-300 text-xs">
          <div>D=Stock{canDrawDiscard && ' • F=Discard'}</div>
        </div>
      )}

      {/* Skip Draw Notification */}
      {isMyTurn && roomState.phase === 'await-move' && 
       roomState.turnActions?.hasDiscarded && roomState.turnActions?.hasDrawn && (
        <div className="text-center text-green-400 text-xs sm:text-sm">
          <div className="flex items-center gap-1 sm:gap-2">
            <span>🎯</span>
            <span className="hidden sm:inline">Matching discard! Draw skipped</span>
            <span className="sm:hidden">Match! Skip draw</span>
          </div>
        </div>
      )}

      {/* Right Side: Game Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
        {/* Show Button */}
        <button
          onClick={show}
          disabled={!canShow}
          className="btn-secondary px-3 py-1 sm:px-4 sm:py-2 lg:px-6 lg:py-2 disabled:opacity-30 text-xs sm:text-sm"
          title="Declare (S)"
        >
          <span className="hidden sm:inline">Show</span>
          <span className="sm:hidden">S</span>
        </button>

        {/* Move Button */}
        <button
          onClick={move}
          disabled={!canMove}
          className="btn-primary px-4 py-1 sm:px-6 sm:py-2 lg:px-8 lg:py-2 disabled:opacity-30 text-xs sm:text-sm font-semibold"
          title="End Turn (M)"
        >
          <span className="hidden sm:inline">Move</span>
          <span className="sm:hidden">M</span>
        </button>
      </div>

      {/* Turn Actions Status - Hidden on mobile */}
      {isMyTurn && roomState.turnActions && (
        <div className="hidden lg:block text-right text-sm">
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
