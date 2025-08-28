import React from 'react';
import { useGameStore } from '@/store/gameStore';

const RulesModal: React.FC = () => {
  const { setShowRulesModal } = useGameStore();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto text-white">{/* Added text-white */}
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Least Count Rules</h2>
          <button
            onClick={() => setShowRulesModal(false)}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-white">{/* Added explicit text-white */}
          {/* Game Overview */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">Game Overview</h3>
            <p className="text-gray-300">
              Least Count is a card game where the goal is to get the lowest total points in your hand.
              Players can discard single cards, sets, or runs, and must draw cards to maintain their hand.
            </p>
          </section>

          {/* Setup */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">Setup</h3>
            <ul className="text-gray-300 space-y-2">
              <li>• Each player receives 7 cards</li>
              <li>• Remaining cards form the stock pile</li>
              <li>• Game supports 2-8 players</li>
            </ul>
          </section>

          {/* Turn Structure */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">Turn Structure</h3>
            <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-blue-400 mb-2">🔄 New Card Slot Flow</h4>
              <div className="text-gray-300 space-y-2 text-sm">
                <div><strong className="text-white">1. Discard:</strong> Drop cards into the <span className="text-yellow-400">Card Slot</span> (temporary area)</div>
                <div><strong className="text-white">2. Draw:</strong> Pick from stock or discard pile (can't pick your own discarded cards)</div>
                <div><strong className="text-white">3. Move:</strong> Cards move from Card Slot to Discard pile and end turn</div>
                <div className="text-blue-400 text-xs mt-2">⏱️ You have 60 seconds per turn - timer will auto-move if time runs out!</div>
              </div>
            </div>
            <div className="text-gray-300 space-y-2">
              <div><strong className="text-white">Discard Phase:</strong> Select and place valid card combinations</div>
              <div><strong className="text-white">Draw Phase:</strong> Choose from stock pile or discard pile ends</div>
              <div><strong className="text-white">Move Phase:</strong> Confirm your turn and pass to next player</div>
            </div>
          </section>

          {/* Valid Discards */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">Valid Discards</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Single Card</h4>
                <p className="text-gray-300 text-sm">Any single card from your hand</p>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Set</h4>
                <p className="text-gray-300 text-sm">2+ cards of same rank (no jokers allowed)</p>
                <p className="text-gray-400 text-xs mt-1">Example: 7♠ 7♥ 7♦</p>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Run</h4>
                <p className="text-gray-300 text-sm">3+ consecutive cards, same suit (jokers as wilds)</p>
                <p className="text-gray-400 text-xs mt-1">Example: 4♠ 5♠ 6♠</p>
              </div>
            </div>
          </section>

          {/* Special Rules */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">Special Rules</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-blue-400 mb-2">Jokers</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Worth 0 points</li>
                  <li>• Can only be used as wilds in runs</li>
                  <li>• Cannot be used in sets</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-400 mb-2">Aces</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Always low (A-2-3, not Q-K-A)</li>
                  <li>• Worth 1 point</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-400 mb-2">Ends-Only Pickup</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Can only pick first or last card from discard</li>
                  <li>• Cannot pick from middle of discard group</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-400 mb-2">Show/Declare</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Only at start of turn (≤10 points)</li>
                  <li>• Disabled after any action</li>
                  <li>• Wrong call = 40 point penalty</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Card Values */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">Card Values</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-center text-sm">
              <div className="bg-gray-700/50 p-2 rounded">A = 1</div>
              <div className="bg-gray-700/50 p-2 rounded">2-10 = Face</div>
              <div className="bg-gray-700/50 p-2 rounded">J = 10</div>
              <div className="bg-gray-700/50 p-2 rounded">Q = 10</div>
              <div className="bg-gray-700/50 p-2 rounded">K = 10</div>
              <div className="bg-gray-700/50 p-2 rounded text-purple-400">Joker = 0</div>
            </div>
          </section>

          {/* Controls */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">Keyboard Controls</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-white mb-2">General:</div>
                <ul className="text-gray-300 space-y-1">
                  <li><kbd className="bg-gray-600 px-2 py-1 rounded text-xs">Enter</kbd> Confirm discard</li>
                  <li><kbd className="bg-gray-600 px-2 py-1 rounded text-xs">M</kbd> Move (end turn)</li>
                  <li><kbd className="bg-gray-600 px-2 py-1 rounded text-xs">S</kbd> Show (declare)</li>
                </ul>
              </div>
              <div>
                <div className="font-medium text-white mb-2">Drawing:</div>
                <ul className="text-gray-300 space-y-1">
                  <li><kbd className="bg-gray-600 px-2 py-1 rounded text-xs">D</kbd> Draw from stock</li>
                  <li><kbd className="bg-gray-600 px-2 py-1 rounded text-xs">F</kbd> Draw first discard</li>
                  <li><kbd className="bg-gray-600 px-2 py-1 rounded text-xs">L</kbd> Draw last discard</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Winning */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">Winning</h3>
            <div className="text-gray-300 space-y-2">
              <p>• Game continues until only one player remains active</p>
              <p>• Players are eliminated when they reach 200 points</p>
              <p>• Last player standing wins the game</p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 p-4 text-center">
          <button
            onClick={() => setShowRulesModal(false)}
            className="btn-primary px-6 py-2"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default RulesModal;
