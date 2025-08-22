import React from 'react';
import { useGameStore } from '@/store/gameStore';
import clsx from 'clsx';

interface SeatProps {
  seatNumber: number;
}

const Seat: React.FC<SeatProps> = ({ seatNumber }) => {
  const { roomState } = useGameStore();

  if (!roomState) return null;

  const player = roomState.players.find(p => p.seat === seatNumber);
  const isActive = player && roomState.activePlayerId === player.id;

  if (!player) {
    return (
      <div className="seat">
        <div className="seat-empty">
          <span className="text-sm">+</span>
        </div>
        <div className="text-gray-500 text-sm text-center">Empty Seat</div>
      </div>
    );
  }

  return (
    <div className="seat">
      {/* Avatar with timer ring if active */}
      <div className={clsx('seat-avatar', { 'active': isActive })}>
        {player.name.charAt(0).toUpperCase()}
      </div>

      {/* Player name */}
      <div className="text-white text-sm font-medium text-center max-w-20 truncate">
        {player.name}
      </div>

      {/* Status indicators */}
      <div className="flex flex-col items-center gap-1">
        {/* Status badge */}
        {player.status === 'dropped' && (
          <div className="badge bg-red-600 text-white text-xs">Dropped</div>
        )}
        {player.status === 'shown' && (
          <div className="badge bg-blue-600 text-white text-xs">Shown</div>
        )}
        {player.isHost && (
          <div className="badge bg-yellow-600 text-white text-xs">Host</div>
        )}

        {/* Score */}
        <div className="text-gray-400 text-xs">
          Score: {player.score || 0}
        </div>

        {/* Hand count */}
        <div className="text-gray-400 text-xs">
          Cards: {player.hand.length}
        </div>
      </div>
    </div>
  );
};

export default Seat;
