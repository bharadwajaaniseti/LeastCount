import React, { useState, useEffect } from 'react';
import { Player, Rank } from '@least-count/shared';

// Card values matching the updated shared package (J, Q, K = 10)
const CARD_VALUES: Record<string, number> = {
  'A': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'J': 10,
  'Q': 10,
  'K': 10,
  'JOKER': 0,
};

interface RoundEndModalProps {
  isOpen: boolean;
  roundScores: Record<string, number>;
  players: Player[];
  winnerId: string;
  currentJoker?: Rank;
  onNextRound: () => void;
}

const RoundEndModal: React.FC<RoundEndModalProps> = ({
  isOpen,
  roundScores,
  players,
  winnerId,
  currentJoker,
  onNextRound
}) => {
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(10);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onNextRound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onNextRound]);

  const calculateHandTotal = (hand: Player['hand']) => {
    return hand.reduce((total, card) => {
      if (card.rank === currentJoker) {
        return total; // Jokers are worth 0
      }
      return total + (CARD_VALUES[card.rank.toString()] || 0);
    }, 0);
  };

  if (!isOpen) return null;

  const sortedPlayers = [...players]
    .filter(p => p.status === 'active')
    .sort((a, b) => {
      const aScore = roundScores[a.id] || 0;
      const bScore = roundScores[b.id] || 0;
      return aScore - bScore;
    });

  const winner = players.find(p => p.id === winnerId);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 rounded-t-xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">🎉 Round Complete!</h2>
            <div className="text-green-100 text-lg">
              <span className="font-semibold">{winner?.name}</span> wins this round!
            </div>
            
            {/* Timer */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="bg-white/20 rounded-full px-4 py-2">
                <span className="text-white font-mono text-lg">
                  Next round in {timeLeft}s
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Round Results */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white mb-4 text-center">Round Results</h3>
            
            {sortedPlayers.map((player, index) => {
              const roundScore = roundScores[player.id] || 0;
              const handTotal = calculateHandTotal(player.hand);
              const isWinner = player.id === winnerId;
              
              return (
                <div
                  key={player.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isWinner
                      ? 'border-yellow-400 bg-yellow-500/10 shadow-lg'
                      : 'border-gray-600 bg-gray-700/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Position Badge */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500 text-black' :
                        index === 1 ? 'bg-gray-400 text-black' :
                        index === 2 ? 'bg-amber-600 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        {index + 1}
                      </div>

                      {/* Player Info */}
                      <div>
                        <div className={`font-semibold ${isWinner ? 'text-yellow-300' : 'text-white'}`}>
                          {player.name}
                          {isWinner && <span className="ml-2">👑</span>}
                        </div>
                        <div className="text-sm text-gray-400">
                          Hand: {handTotal} pts • Total: {player.score || 0} pts
                        </div>
                      </div>
                    </div>

                    {/* Round Score */}
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        isWinner ? 'text-green-400' : 'text-white'
                      }`}>
                        +{roundScore}
                      </div>
                      <div className="text-xs text-gray-400">this round</div>
                    </div>
                  </div>

                  {/* Hand Preview */}
                  <div className="mt-3 flex justify-center">
                    <div className="flex gap-1 max-w-full overflow-x-auto">
                      {player.hand.slice(0, 7).map((card, cardIndex) => {
                        const isJoker = card.rank === currentJoker;
                        const value = isJoker ? 0 : (CARD_VALUES[card.rank.toString()] || 0);
                        
                        return (
                          <div
                            key={cardIndex}
                            className={`w-8 h-12 rounded border text-xs flex flex-col items-center justify-center ${
                              isJoker 
                                ? 'bg-purple-600 border-purple-400 text-purple-100' 
                                : 'bg-white border-gray-300 text-gray-800'
                            }`}
                          >
                            <div className="font-bold">{card.rank}</div>
                            <div className="text-[10px]">{value}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Next Round Button */}
          <div className="mt-6 text-center">
            <button
              onClick={onNextRound}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Start Next Round Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoundEndModal;
