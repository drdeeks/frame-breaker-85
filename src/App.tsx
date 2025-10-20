import React, { useEffect } from 'react';
import GameUI from './components/GameUI';
import GameCanvas from './components/GameCanvas';
import useGameLogic from './hooks/useGameLogic';
import { useMiniApp } from '@neynar/react';

function App() {
  const gameLogic = useGameLogic();
  const { isSDKLoaded } = useMiniApp();

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      (window as any).gameLogic = gameLogic;
    }
  }, [gameLogic]);

  return (
    <div id="game-container">
      <div
        id="game-wrapper"
        onMouseMove={gameLogic.handleMouseMove}
        onTouchMove={gameLogic.handleTouchMove}
        onClick={gameLogic.handleClick}
        onTouchStart={gameLogic.handleClick}
        onMouseEnter={gameLogic.handleMouseEnter}
        onMouseLeave={gameLogic.handleMouseLeave}
        style={{
          cursor:
            gameLogic.gameState === 'playing' || gameLogic.gameState === 'paused'
              ? 'none'
              : 'auto',
        }}
      >
        <div className="scanlines"></div>
        <GameUI {...gameLogic} />
        <GameCanvas {...gameLogic} />
        {(gameLogic.gameState === 'playing' ||
          gameLogic.gameState === 'paused') && (
          <button
            className="pause-button"
            onClick={gameLogic.togglePause}
            aria-label={
              gameLogic.gameState === 'playing' ? 'Pause Game' : 'Resume Game'
            }
          >
            {gameLogic.gameState === 'playing' ? 'PAUSE' : 'RESUME'}
          </button>
        )}
      </div>
    </div>
  );
}

export default App;