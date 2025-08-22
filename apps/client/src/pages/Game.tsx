import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { Card, Rank } from '@least-count/shared';
import Lobby from '@/components/Lobby';
import Table from '@/components/Table';
import Hand from '@/components/Hand';
import Controls from '@/components/Controls';
import RulesModal from '@/components/RulesModal';
import ScoreView from '@/components/ScoreView';

const Game: React.FC = () => {
  const { roomCode: urlRoomCode } = useParams();
  const navigate = useNavigate();
  
  const { 
    roomState, 
    playerId, 
    connected, 
    connect,
    showRulesModal,
    setShowRulesModal,
    showScoresModal,
    setShowScoresModal,
    scoresData,
    viewScores,
    exitRoom
  } = useGameStore();

  // Card values for scoring
  const getCardValue = (rank: Rank): number => {
    const values: Record<Rank, number> = {
      'A': 1,
      2: 2,
      3: 3,
      4: 4,
      5: 5,
      6: 6,
      7: 7,
      8: 8,
      9: 9,
      10: 10,
      'J': 11,
      'Q': 12,
      'K': 13,
      'JOKER': 0,
    };
    return values[rank] || 0;
  };

  // Helper function to calculate hand total
  const calculateHandTotal = (hand: Card[]) => {
    if (!hand || !Array.isArray(hand)) return 0;
    
    return hand.reduce((total, card) => {
      if (!card) return total;
      
      // If card is the current joker rank, it counts as 0
      if (roomState?.currentJoker && card.rank === roomState.currentJoker) {
        return total + 0;
      }
      return total + getCardValue(card.rank);
    }, 0);
  };

  useEffect(() => {
    if (!connected) {
      connect();
    }
  }, [connected, connect]);

  useEffect(() => {
    // Store room code in localStorage to persist across refreshes
    if (roomState?.roomCode) {
      localStorage.setItem('leastcount_room', roomState.roomCode);
    }
  }, [roomState?.roomCode]);

  useEffect(() => {
    if (!roomState && urlRoomCode) {
      // If we have a room code in URL but no room state, redirect to home
      // User probably refreshed the page or accessed directly
      navigate('/');
    } else if (!roomState && !urlRoomCode) {
      // Check if we have a stored room code from localStorage
      const storedRoomCode = localStorage.getItem('leastcount_room');
      if (storedRoomCode) {
        // Try to navigate back to the stored room
        navigate(`/game/${storedRoomCode}`);
      } else {
        navigate('/');
      }
    }
  }, [roomState, urlRoomCode, navigate]);

  useEffect(() => {
    const handleShowScores = () => {
      viewScores();
    };

    const handleExitGame = () => {
      if (confirm('Are you sure you want to exit the game?')) {
        exitRoom();
        navigate('/');
      }
    };

    window.addEventListener('showScores', handleShowScores);
    window.addEventListener('exitGame', handleExitGame);

    return () => {
      window.removeEventListener('showScores', handleShowScores);
      window.removeEventListener('exitGame', handleExitGame);
    };
  }, [viewScores, exitRoom, navigate]);

  if (!roomState || !playerId) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading game...</p>
        </div>
      </div>
    );
  }

  const currentPlayer = roomState.players.find(p => p.id === playerId);
  const isMyTurn = roomState.activePlayerId === playerId;

  return (
    <div className="h-screen w-screen bg-gray-900 overflow-hidden relative">
      {roomState.phase === 'lobby' ? (
        <Lobby />
      ) : (
        <>
          {/* Main Game Area */}
          <div className="h-full flex flex-col">
            {/* Table Area */}
            <div className="flex-1 relative">
              <Table />
            </div>

            {/* Hand Area */}
            <div className="h-48 bg-gradient-to-t from-gray-900 to-gray-800 border-t border-gray-700">
              <Hand />
            </div>

            {/* Controls Area */}
            <div className="h-20 bg-gray-900 border-t border-gray-700">
              <Controls />
            </div>
          </div>

          {/* Game Info Overlay */}
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-lg p-4 space-y-2">
              <div className="text-white font-semibold">Room: {roomState.roomCode}</div>
              <div className="text-gray-400 text-sm">Round: {roomState.round}</div>
              <div className="text-gray-400 text-sm">
                Players: {roomState.players.filter(p => p.status === 'active').length}
              </div>
              {isMyTurn && (
                <div className="text-yellow-400 text-sm font-medium">Your Turn!</div>
              )}
            </div>
          </div>

          {/* Rules Button */}
          <div className="absolute top-20 right-4 z-10">
            <button
              onClick={() => setShowRulesModal(true)}
              className="bg-gray-800/90 hover:bg-gray-700/90 backdrop-blur-sm border border-gray-700 rounded-lg p-3 text-gray-300 hover:text-white transition-colors"
              title="View Rules"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>

          {/* Score and Hand Count Display */}
          {currentPlayer && currentPlayer.hand && (
            <div className="absolute bottom-24 left-4 z-10">
              <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-lg p-3 space-y-2">
                <div>
                  <div className="text-gray-400 text-sm">Your Score</div>
                  <div className="text-white text-xl font-bold">{currentPlayer.score || 0}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Hand Count</div>
                  <div className="text-yellow-400 text-lg font-bold">
                    {calculateHandTotal(currentPlayer.hand)}
                  </div>
                </div>
                <div className="text-gray-500 text-xs">
                  {currentPlayer.name} • {currentPlayer.hand.length} cards
                </div>
              </div>
            </div>
          )}
          
          {/* Debug Info - Remove this after testing */}
          {!currentPlayer && (
            <div className="absolute bottom-24 left-4 z-10">
              <div className="bg-red-800/90 backdrop-blur-sm border border-red-700 rounded-lg p-3">
                <div className="text-red-300 text-sm">No Current Player Found</div>
                <div className="text-red-400 text-xs">Player ID: {playerId}</div>
                <div className="text-red-400 text-xs">Players: {roomState.players.length}</div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Rules Modal */}
      {showRulesModal && <RulesModal />}

      {/* Scores Modal */}
      {showScoresModal && scoresData && (
        <ScoreView 
          isOpen={showScoresModal}
          onClose={() => setShowScoresModal(false)}
        />
      )}
    </div>
  );
};

export default Game;
