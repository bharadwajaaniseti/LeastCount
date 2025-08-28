import React from 'react';
import { Card as CardType, Rank, Suit } from '@least-count/shared';
import clsx from 'clsx';

interface CardProps {
  card?: CardType;
  faceDown?: boolean;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  isJokerRank?: boolean; // Highlight if this card matches the current joker rank
}

const Card: React.FC<CardProps> = ({
  card,
  faceDown = false,
  selected = false,
  onClick,
  className,
  size = 'md',
  isJokerRank = false
}) => {
  const sizeClasses = {
    sm: 'w-12 h-18 text-xs',
    md: 'w-16 h-24 text-sm',
    lg: 'w-20 h-28 text-base'
  };

  if (faceDown || !card) {
    return (
      <div
        className={clsx(
          'card-back',
          sizeClasses[size],
          { 'cursor-pointer': onClick },
          className
        )}
        onClick={onClick}
      >
        <div className="text-blue-300 font-bold text-center">
          <div className="text-lg">♠</div>
          <div className="text-xs">LC</div>
        </div>
      </div>
    );
  }

  const isRed = card.suit === 'H' || card.suit === 'D';
  const suitSymbol = getSuitSymbol(card.suit);
  const rankDisplay = getRankDisplay(card.rank);

  return (
    <div
      className={clsx(
        'card',
        sizeClasses[size],
        {
          'selected': selected,
          'cursor-pointer': onClick,
          'text-red-600': isRed && card.rank !== 'JOKER',
          'text-black': !isRed && card.rank !== 'JOKER',
          'text-purple-600': card.rank === 'JOKER',
          'ring-2 ring-yellow-400 ring-opacity-75 shadow-lg shadow-yellow-400/50 bg-yellow-50/10': isJokerRank && card.rank !== 'JOKER'
        },
        className
      )}
      onClick={onClick}
    >
      {card.rank === 'JOKER' ? (
        <div className="text-center font-bold">
          <div className="text-lg">🃏</div>
          <div className="text-xs">JOKER</div>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col justify-between p-1">
          {/* Top left rank and suit */}
          <div className="text-left leading-none">
            <div className="font-bold">{rankDisplay}</div>
            <div className="text-lg leading-none">{suitSymbol}</div>
          </div>

          {/* Center suit */}
          <div className="text-center text-2xl">
            {suitSymbol}
          </div>

          {/* Bottom right rank and suit (rotated) */}
          <div className="text-right leading-none transform rotate-180">
            <div className="font-bold">{rankDisplay}</div>
            <div className="text-lg leading-none">{suitSymbol}</div>
          </div>
        </div>
      )}
    </div>
  );
};

function getSuitSymbol(suit?: Suit): string {
  switch (suit) {
    case 'S': return '♠';
    case 'H': return '♥';
    case 'D': return '♦';
    case 'C': return '♣';
    default: return '';
  }
}

function getRankDisplay(rank: Rank): string {
  if (typeof rank === 'number') {
    return rank.toString();
  }
  return rank;
}

export default Card;
