import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import type { Rules } from '@least-count/shared';

export const HostControls: React.FC = () => {
  const { socket, roomState, playerId } = useGameStore();
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [tempRules, setTempRules] = useState<Partial<Rules>>(roomState?.rules || {});

  const room = roomState;
  const isHost = room?.players.find(p => p.id === playerId)?.isHost;

  if (!isHost || !room || !socket) return null;

  const handleEndRoom = () => {
    if (showEndConfirm) {
      socket.emit('room:end', { roomCode: room.roomCode });
      setShowEndConfirm(false);
    } else {
      setShowEndConfirm(true);
    }
  };

  const handleUpdateRules = () => {
    const updates: any = {};
    
    // Only send changed values
    Object.keys(tempRules).forEach((key) => {
      const typedKey = key as keyof Rules;
      if (tempRules[typedKey] !== room.rules[typedKey]) {
        updates[typedKey] = tempRules[typedKey];
      }
    });

    if (Object.keys(updates).length > 0) {
      socket.emit('room:updateRules', { roomCode: room.roomCode, rules: updates });
    }
    
    setShowRulesModal(false);
  };

  const isGameActive = room.phase !== 'lobby';
  const playerCount = room.players.length;

  return (
    <>
      <div className="bg-green-800 rounded-lg p-4 border-2 border-yellow-600 shadow-lg">
        <h3 className="text-yellow-400 font-bold text-lg mb-3 text-center">Host Controls</h3>
        
        <div className="space-y-3">
          {/* Room Info */}
          <div className="text-white text-sm bg-green-900/50 rounded p-2">
            <div>Room: <span className="font-mono text-yellow-300">{room.roomCode}</span></div>
            <div>Players: <span className="text-yellow-300">{playerCount}/8</span></div>
            <div>Elimination: <span className="text-yellow-300">{room.rules.eliminationAt} pts</span></div>
          </div>

          {/* Rules Button - Only in lobby */}
          {!isGameActive && (
            <button
              onClick={() => setShowRulesModal(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded font-medium transition-colors text-sm"
            >
              ⚙️ Game Rules
            </button>
          )}

          {/* End Room Button */}
          <button
            onClick={handleEndRoom}
            className={`w-full px-3 py-2 rounded font-medium transition-colors text-sm ${
              showEndConfirm
                ? 'bg-red-700 hover:bg-red-800 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {showEndConfirm ? '⚠️ Confirm End Room' : '🚪 End Room'}
          </button>

          {showEndConfirm && (
            <button
              onClick={() => setShowEndConfirm(false)}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-green-900 border-2 border-yellow-600 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-yellow-400 text-xl font-bold mb-4">Game Rules</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-1">
                  Elimination Points
                </label>
                <input
                  type="number"
                  min="50"
                  max="500"
                  step="10"
                  value={tempRules.eliminationAt || room.rules.eliminationAt}
                  onChange={(e) => setTempRules(prev => ({ 
                    ...prev, 
                    eliminationAt: parseInt(e.target.value) || room.rules.eliminationAt 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black"
                />
                <p className="text-gray-300 text-xs mt-1">
                  Players are eliminated when they reach this score
                </p>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-1">
                  Declare Threshold
                </label>
                <input
                  type="number"
                  min="5"
                  max="25"
                  value={tempRules.declareThreshold || room.rules.declareThreshold}
                  onChange={(e) => setTempRules(prev => ({ 
                    ...prev, 
                    declareThreshold: parseInt(e.target.value) || room.rules.declareThreshold 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black"
                />
                <p className="text-gray-300 text-xs mt-1">
                  Maximum hand value to declare/show
                </p>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-1">
                  Bad Declare Penalty
                </label>
                <input
                  type="number"
                  min="20"
                  max="80"
                  step="10"
                  value={tempRules.badDeclarePenalty || room.rules.badDeclarePenalty}
                  onChange={(e) => setTempRules(prev => ({ 
                    ...prev, 
                    badDeclarePenalty: parseInt(e.target.value) || room.rules.badDeclarePenalty 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black"
                />
                <p className="text-gray-300 text-xs mt-1">
                  Penalty for invalid declare/show
                </p>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-1">
                  Hand Size
                </label>
                <input
                  type="number"
                  min="5"
                  max="10"
                  value={tempRules.handSize || room.rules.handSize}
                  onChange={(e) => setTempRules(prev => ({ 
                    ...prev, 
                    handSize: parseInt(e.target.value) || room.rules.handSize 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black"
                />
                <p className="text-gray-300 text-xs mt-1">
                  Number of cards dealt to each player
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpdateRules}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-medium"
              >
                Update Rules
              </button>
              <button
                onClick={() => {
                  setShowRulesModal(false);
                  setTempRules(room.rules);
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
