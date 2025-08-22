import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { HostControls } from './HostControls';

const Lobby: React.FC = () => {
  const { roomState, playerId, startGame } = useGameStore();

  if (!roomState || !playerId) return null;

  const currentPlayer = roomState.players.find(p => p.id === playerId);
  const isHost = currentPlayer?.isHost;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Least Count</h1>
          <div className="text-xl text-blue-400 font-mono tracking-wider">
            Room: {roomState.roomCode}
          </div>
          <p className="text-gray-400 mt-2">
            Share this room code with other players
          </p>
        </div>

        {/* Players List */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Players ({roomState.players.length}/8)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {roomState.players.map((player: any) => (
              <div
                key={player.id}
                className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-white font-medium">{player.name}</div>
                    <div className="text-gray-400 text-sm">Seat {player.seat + 1}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {player.isHost && (
                    <span className="badge bg-yellow-600 text-white text-xs">Host</span>
                  )}
                  {player.id === playerId && (
                    <span className="badge bg-blue-600 text-white text-xs">You</span>
                  )}
                </div>
              </div>
            ))}
            
            {/* Empty slots */}
            {Array.from({ length: 8 - roomState.players.length }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="flex items-center gap-3 bg-gray-700/25 rounded-lg p-3 border-2 border-dashed border-gray-600"
              >
                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-gray-400">
                  +
                </div>
                <div className="text-gray-500">Waiting for player...</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content with Sidebar Layout */}
        <div className="flex gap-6">
          {/* Left Side - Game Info and Actions */}
          <div className="flex-1 space-y-6">
            {/* Game Rules Summary */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Game Rules</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-gray-300">
                  <div className="font-medium text-white">Hand Size:</div>
                  <div>{roomState.rules.handSize} cards</div>
                </div>
                <div className="text-gray-300">
                  <div className="font-medium text-white">Declare Threshold:</div>
                  <div>≤ {roomState.rules.declareThreshold} points</div>
                </div>
                <div className="text-gray-300">
                  <div className="font-medium text-white">Bad Declare Penalty:</div>
                  <div>{roomState.rules.badDeclarePenalty} points</div>
                </div>
                <div className="text-gray-300">
                  <div className="font-medium text-white">Elimination:</div>
                  <div>At {roomState.rules.eliminationAt} points</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="text-center space-y-4">
              {isHost ? (
                <button
                  onClick={startGame}
                  disabled={roomState.players.length < 2}
                  className="btn-primary px-8 py-3 text-lg disabled:opacity-50"
                >
                  {roomState.players.length < 2 
                    ? 'Need at least 2 players' 
                    : `Start Game (${roomState.players.length} players)`
                  }
                </button>
              ) : (
                <div className="text-gray-400">
                  Waiting for host to start the game...
                </div>
              )}
              
              <div className="text-gray-500 text-sm">
                {isHost ? 'You can start the game when ready' : 'Only the host can start the game'}
              </div>
            </div>
          </div>

          {/* Right Side - Host Controls */}
          {isHost && (
            <div className="w-72">
              <HostControls />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lobby;
