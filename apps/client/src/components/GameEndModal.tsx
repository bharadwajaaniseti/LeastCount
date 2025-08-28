import React, { useState, useEffect } from 'react';

interface GameEndModalProps {
  isOpen: boolean;
  finalScores: Array<{ id: string; name: string; finalScore: number; status: string }>;
  winner: any | null;
  onReturnToLobby: () => void;
}

const GameEndModal: React.FC<GameEndModalProps> = ({
  isOpen,
  finalScores,
  winner,
  onReturnToLobby
}) => {
  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(5);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onReturnToLobby();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onReturnToLobby]);

  if (!isOpen) return null;

  // Sort players by final score (lowest first)
  const sortedPlayers = [...finalScores].sort((a, b) => a.finalScore - b.finalScore);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-2xl w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 rounded-t-xl text-center">
          <div className="text-4xl mb-2">🎉</div>
          <h2 className="text-2xl font-bold text-white">Game Complete!</h2>
          {winner && (
            <p className="text-green-200 mt-2">
              {winner.name} wins with the lowest score!
            </p>
          )}
          <div className="mt-4 bg-white/20 rounded-lg p-2">
            <p className="text-white text-sm">
              Returning to lobby in {timeLeft}s
            </p>
          </div>
        </div>

        {/* Final Scoreboard */}
        <div className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4 text-center">Final Scores</h3>
          
          <div className="space-y-3">
            {sortedPlayers.map((player, index) => {
              const isWinner = index === 0 && player.status === 'active';
              const position = index + 1;
              
              return (
                <div
                  key={player.id}
                  className={`flex justify-between items-center p-4 rounded-lg border ${
                    isWinner 
                      ? 'bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 border-yellow-600' 
                      : player.status === 'dropped'
                      ? 'bg-red-900/20 border-red-700/50'
                      : 'bg-gray-700/50 border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isWinner ? 'bg-yellow-500 text-black' : 'bg-gray-600 text-white'
                    }`}>
                      {position}
                    </div>
                    <div>
                      <div className={`font-semibold ${isWinner ? 'text-yellow-400' : 'text-white'}`}>
                        {player.name}
                        {isWinner && ' 👑'}
                      </div>
                      <div className="text-sm text-gray-400">
                        {player.status === 'dropped' ? 'Eliminated' : 'Active'}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`text-xl font-bold ${
                    isWinner ? 'text-yellow-400' : 'text-white'
                  }`}>
                    {player.finalScore} pts
                  </div>
                </div>
              );
            })}
          </div>

          {/* Return Button */}
          <div className="mt-6 text-center">
            <button
              onClick={onReturnToLobby}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Return to Lobby Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameEndModal;
