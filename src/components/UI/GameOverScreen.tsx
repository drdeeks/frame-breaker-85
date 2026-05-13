/**
 * @fileoverview Game over screen component
 * @module components/UI/GameOverScreen
 */

import React, { useState } from 'react';
import { useResponsive } from '@/src/hooks/useResponsive';
import { getResponsiveFontSize } from '@/src/utils/responsive';

interface GameOverScreenProps {
  score: number;
  onSubmit: (initials: string) => void;
  onPlayAgain: () => void;
  onLeaderboard: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, onSubmit, onPlayAgain, onLeaderboard }) => {
  const [initials, setInitials] = useState('');
  const viewport = useResponsive();
  const titleSize = getResponsiveFontSize(40, viewport);
  const textSize = getResponsiveFontSize(20, viewport);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initials.trim()) {
      onSubmit(initials);
    }
  };

  return (
    <div className="game-ui">
      <h1 style={{ fontSize: `${titleSize}px` }}>Game Over</h1>
      <p style={{ fontSize: `${textSize}px` }}>Final Score: {score}</p>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="text"
            value={initials}
            onChange={(e) => setInitials(e.target.value.slice(0, 3))}
            maxLength={3}
            placeholder="AAA"
            autoFocus
            style={{ fontSize: `${textSize}px` }}
          />
          <button type="submit" style={{ fontSize: `${textSize * 0.8}px` }}>
            Save Score
          </button>
        </div>
      </form>

      <button onClick={onPlayAgain}>Play Again</button>
      <button onClick={onLeaderboard}>Leaderboard</button>
    </div>
  );
};

export default GameOverScreen;
