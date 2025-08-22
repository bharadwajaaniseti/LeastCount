import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';

const Home: React.FC = () => {
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('leastcount_player_name') || '');
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [eliminationPoints, setEliminationPoints] = useState(200);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const navigate = useNavigate();
  const { 
    connect, 
    connected, 
    createRoom, 
    joinRoom, 
    roomState, 
    error, 
    clearError 
  } = useGameStore();

  useEffect(() => {
    if (!connected) {
      connect();
    }
  }, [connected, connect]);

  useEffect(() => {
    // Check if we should attempt automatic reconnection
    const storedRoomCode = localStorage.getItem('leastcount_room');
    const storedPlayerName = localStorage.getItem('leastcount_player_name');
    if (connected && storedRoomCode && storedPlayerName && !roomState) {
      setPlayerName(storedPlayerName);
      setRoomCode(storedRoomCode);
      setIsReconnecting(true);
      joinRoom(storedRoomCode, storedPlayerName);
      // Give some time for the auto-reconnection to work
      const timeout = setTimeout(() => {
        setIsReconnecting(false);
      }, 3000); // 3 second timeout for reconnection
      return () => clearTimeout(timeout);
    }
  }, [connected, roomState, joinRoom]);

  useEffect(() => {
    if (roomState) {
      setIsReconnecting(false);
      navigate(`/game/${roomState.roomCode}`);
    }
  }, [roomState, navigate]);

  const handleCreateRoom = () => {
    if (!playerName.trim()) return;
    clearError();
    setIsCreating(true);
    createRoom(playerName.trim(), eliminationPoints);
  };

  const handleJoinRoom = () => {
    if (!playerName.trim() || !roomCode.trim()) return;
    clearError();
    joinRoom(roomCode.toUpperCase().trim(), playerName.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Least Count</h1>
          <p className="text-gray-400">Multiplayer card game</p>
        </div>

        {/* Connection Status */}
        <div className="text-center">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
            connected 
              ? 'bg-green-600/20 text-green-400 border border-green-600/30' 
              : 'bg-red-600/20 text-red-400 border border-red-600/30'
          }`}>
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
            {connected ? 'Connected' : 'Connecting...'}
          </div>
        </div>

        {/* Reconnecting State or Error Display */}
        {isReconnecting ? (
          <div className="bg-blue-600/20 border border-blue-600/30 text-blue-400 px-4 py-3 rounded-lg text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <span>Reconnecting to your game...</span>
            </div>
          </div>
        ) : error && (
          <div className="bg-red-600/20 border border-red-600/30 text-red-400 px-4 py-3 rounded-lg">
            {error === 'Game already in progress'
              ? `You are already in this game as "${localStorage.getItem('leastcount_player_name') || ''}". Please use the same name to reconnect.`
              : error}
          </div>
        )}

        {/* Only show form when not reconnecting */}
        {!isReconnecting && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 space-y-6">
            {/* Player Name */}
            <div>
              <label htmlFor="playerName" className="block text-sm font-medium text-gray-300 mb-2">
                Your Name
              </label>
              <input
                id="playerName"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, isCreating ? handleCreateRoom : handleJoinRoom)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={20}
              />
            </div>

            {/* Room Code (for joining) */}
            {!isCreating && (
              <div>
                <label htmlFor="roomCode" className="block text-sm font-medium text-gray-300 mb-2">
                  Room Code
                </label>
                <input
                  id="roomCode"
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  onKeyPress={(e) => handleKeyPress(e, handleJoinRoom)}
                  placeholder="ENTER 6-DIGIT ROOM CODE"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase tracking-wider"
                  maxLength={6}
                />
              </div>
            )}

            {/* Elimination Points (for creating) */}
            {isCreating && (
              <div>
                <label htmlFor="eliminationPoints" className="block text-sm font-medium text-gray-300 mb-2">
                  Elimination Points
                </label>
                <select
                  id="eliminationPoints"
                  value={eliminationPoints}
                  onChange={(e) => setEliminationPoints(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={100}>100 points</option>
                  <option value={150}>150 points</option>
                  <option value={200}>200 points (default)</option>
                  <option value={250}>250 points</option>
                  <option value={300}>300 points</option>
                </select>
                <p className="text-gray-400 text-xs mt-1">
                  Players are eliminated when they reach this score
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {isCreating ? (
                <>
                  <button
                    onClick={handleCreateRoom}
                    disabled={!connected || !playerName.trim()}
                    className="w-full btn-primary"
                  >
                    Create Room
                  </button>
                  <button
                    onClick={() => setIsCreating(false)}
                    className="w-full btn-secondary"
                  >
                    Join Existing Room
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleJoinRoom}
                    disabled={!connected || !playerName.trim() || !roomCode.trim()}
                    className="w-full btn-primary"
                  >
                    Join Room
                  </button>
                  <button
                    onClick={() => setIsCreating(true)}
                    className="w-full btn-secondary"
                  >
                    Create New Room
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Game Rules Link */}
        <div className="text-center">
          <button
            onClick={() => {/* Open rules modal */}}
            className="text-blue-400 hover:text-blue-300 text-sm underline"
          >
            View Game Rules
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
