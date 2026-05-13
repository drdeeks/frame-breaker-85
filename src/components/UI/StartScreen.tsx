/**
 * @fileoverview Start screen component
 * @module components/UI/StartScreen
 */

import React from 'react';
import { useResponsive } from '@/src/hooks/useResponsive';
import { getResponsiveFontSize } from '@/src/utils/responsive';

interface StartScreenProps {
  onStart: () => void;
  onLeaderboard: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, onLeaderboard }) => {
  const viewport = useResponsive();
  const titleSize = getResponsiveFontSize(48, viewport);
  const subtitleSize = getResponsiveFontSize(20, viewport);

  return (
    <div className="game-ui">
      <h1 style={{ fontSize: `${titleSize}px` }}>Frame Breaker '85</h1>
      <p style={{ fontSize: `${subtitleSize}px` }}>An AI-Powered Brick Smasher</p>
      <button onClick={onStart}>Start Game</button>
      <button onClick={onLeaderboard}>Leaderboard</button>
    </div>
  );
};

export default StartScreen;
