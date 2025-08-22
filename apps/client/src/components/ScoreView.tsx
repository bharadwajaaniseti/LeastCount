import React from 'react';
import { useGameStore } from '@/store/gameStore';

interface ScoreViewProps {
  isOpen: boolean;
  onClose: () => void;
}

const ScoreView: React.FC<ScoreViewProps> = ({ isOpen, onClose }) => {
  const { roomState } = useGameStore();

  if (!isOpen || !roomState) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Game Scores</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-white">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="text-left py-2 px-3">Player</th>
                {Array.from({ length: roomState.round }, (_, i) => (
                  <th key={i} className="text-center py-2 px-2">
                    R{i + 1}
                  </th>
                ))}
                <th className="text-center py-2 px-3 font-bold">Total</th>
              </tr>
            </thead>
            <tbody>
              {roomState.players.map((player) => (
                <tr key={player.id} className="border-b border-gray-700">
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${player.status === 'dropped' ? 'text-red-400' : 'text-white'}`}>
                        {player.name}
                      </span>
                      {player.isHost && (
                        <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">Host</span>
                      )}
                      {player.status === 'dropped' && (
                        <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">Out</span>
                      )}
                    </div>
                  </td>
                  {Array.from({ length: roomState.round }, (_, roundIndex) => (
                    <td key={roundIndex} className="text-center py-2 px-2">
                      <span className={`${roundIndex < (player.roundScores?.length || 0) ? 'text-white' : 'text-gray-500'}`}>
                        {player.roundScores?.[roundIndex] || '-'}
                      </span>
                    </td>
                  ))}
                  <td className="text-center py-2 px-3 font-bold">
                    <span className={`${player.status === 'dropped' ? 'text-red-400' : 'text-white'}`}>
                      {player.score || 0}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="btn-secondary px-6 py-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScoreView;
