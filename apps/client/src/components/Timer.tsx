import React from 'react';
import { useGameStore } from '@/store/gameStore';

const Timer: React.FC = () => {
  const { roomState, playerId } = useGameStore();

  if (!roomState || !roomState.turnTimer || !roomState.activePlayerId) {
    return null;
  }

  const { timeLeft, isRunning, maxTime } = roomState.turnTimer;
  const isMyTurn = roomState.activePlayerId === playerId;
  
  // Calculate percentage for progress bar
  const percentage = (timeLeft / maxTime) * 100;
  
  // Color coding based on time left
  const getTimerColor = () => {
    if (timeLeft <= 10) return 'text-red-400';
    if (timeLeft <= 30) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getProgressColor = () => {
    if (timeLeft <= 10) return 'bg-red-500';
    if (timeLeft <= 30) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="flex flex-col items-center gap-2 min-w-[80px]">
      {/* Timer Display */}
      <div className={`text-2xl font-bold ${getTimerColor()} ${timeLeft <= 10 && isRunning ? 'animate-pulse' : ''}`}>
        {Math.ceil(timeLeft)}
      </div>
      
      {/* Progress Bar */}
      <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${getProgressColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {/* Turn Indicator */}
      <div className="text-xs text-gray-400 text-center">
        {isMyTurn ? 'Your Turn' : 'Waiting'}
      </div>
      
      {/* Warning when time is low */}
      {isMyTurn && timeLeft <= 10 && isRunning && (
        <div className="text-xs text-red-400 text-center font-medium animate-pulse">
          Time Running Out!
        </div>
      )}
    </div>
  );
};

export default Timer;
