import React, { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';

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
  const canMove = isMyTurn && roomState.phase === 'await-move' && 
                  roomState.turnActions?.hasDiscarded && 
                  roomState.turnActions?.hasDrawn;

  return (
    <div className="h-full flex items-center justify-between px-4 py-2 max-w-full overflow-hidden">
      {/* Left Side: Game Info & Essential Buttons */}
      <div className="flex items-center gap-3">
        {/* Game Phase Indicator - Compact */}
        <div className="text-center min-w-0">
          <div className="text-gray-400 text-xs">Phase</div>
          <div className="text-white text-sm font-medium capitalize truncate">
            {roomState.phase.replace('-', ' ')}
          </div>
          {isMyTurn && (
            <div className="text-yellow-400 text-xs">Your turn</div>
          )}
        </div>

        {/* Essential Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              // This will be handled by parent component
              const event = new CustomEvent('showScores');
              window.dispatchEvent(event);
            }}
            className="btn-secondary px-3 py-1 text-sm"
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
            className="btn-danger px-3 py-1 text-sm"
            title="Exit Game"
          >
            Exit
          </button>
        </div>
      </div>

      {/* Center: Status Messages */}
      <div className="flex-1 text-center mx-4 min-w-0">
        {/* Draw Instructions */}
        {isMyTurn && roomState.phase === 'turn-draw' && (
          <div className="text-gray-300 text-sm">
            <div className="truncate">Draw a card</div>
            <div className="text-xs text-gray-400">
              D=Stock • F=First • L=Last
            </div>
          </div>
        )}

        {/* Skip Draw Notification */}
        {isMyTurn && roomState.phase === 'await-move' && 
         roomState.turnActions?.hasDiscarded && roomState.turnActions?.hasDrawn && (
          <div className="text-green-400 text-sm">
            <div className="flex items-center justify-center gap-1">
              <span>🎯</span>
              <span className="truncate">Matching discard!</span>
            </div>
          </div>
        )}
      </div>

      {/* Right Side: Game Action Buttons */}
      <div className="flex items-center gap-3">
        {/* Show Button */}
        <button
          onClick={show}
          disabled={!canShow}
          className="btn-secondary px-4 py-2 disabled:opacity-30 text-sm"
          title="Declare (S)"
        >
          Show
        </button>

        {/* Move Button */}
        <button
          onClick={move}
          disabled={!canMove}
          className="btn-primary px-6 py-2 disabled:opacity-30 text-sm"
          title="End Turn (M)"
        >
          Move
        </button>
      </div>
    </div>
  );
};

export default Controls;
