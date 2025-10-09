import React from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import GameUI from './components/GameUI';
import GameCanvas from './components/GameCanvas';
import useGameLogic from './hooks/useGameLogic';
import { useEffect } from 'react';

function App() {
  const gameLogic = useGameLogic();

  useEffect(() => {
    const initializeSDK = async () => {
      try {
        await sdk.actions.ready();
        console.log('Farcaster Mini App SDK initialized successfully');
        gameLogic.checkWalletConnection();
      } catch (error) {
        console.error('Failed to initialize Farcaster Mini App SDK:', error);
      }
    };
    initializeSDK();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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