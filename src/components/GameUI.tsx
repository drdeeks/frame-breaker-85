import React from 'react';

const GameUI = ({
  gameState,
  loading,
  level,
  score,
  wagmiIsConnected,
  wagmiAddress,
  wagmiChain,
  currentTokenSymbol,
  connectWallet,
  initials,
  setInitials,
  handleInitialsSubmit,
  submittingScore,
  scoreSubmissionError,
  startGame,
  leaderboard,
  setGameState,
  wagmiChains,
  wagmiSwitchNetwork,
  COLORS,
  handleColorSelect,
}) => {
  if (gameState === 'playing') return null;

  if (loading) {
    return (
      <div className="game-ui">
        <h2>Generating Level {level}...</h2>
        <div className="loader"></div>
      </div>
    );
  }

  switch (gameState) {
    case 'start':
      return (
        <div className="game-ui">
          <h1>Frame Breaker '85</h1>
          <p>An AI-Powered Brick Smasher</p>
          <button onClick={startGame}>Start Game</button>
          <button onClick={() => setGameState('leaderboard')}>Leaderboard</button>
          {wagmiChains.length > 1 && (
            <div className="chain-switcher-start">
              <label htmlFor="chain-select-start">Network:</label>
              <select
                id="chain-select-start"
                onChange={(e) => wagmiSwitchNetwork?.({ chainId: parseInt(e.target.value) })}
                value={wagmiChain?.id || ''}
              >
                {wagmiChains.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      );
    case 'paused':
      return (
        <div className="game-ui paused">
          <h2>Paused</h2>
          <button onClick={(e) => { e.stopPropagation(); setGameState('playing'); }}>Resume</button>
          <button onClick={(e) => { e.stopPropagation(); startGame(); }}>Restart Game</button>
          <button onClick={(e) => { e.stopPropagation(); setGameState('start'); }}>Main Menu</button>
        </div>
      );
    case 'level-complete':
      return (
        <div className="game-ui">
          <h2>Level {level - 1} Complete!</h2>
          <p>Get ready for the next level!</p>
        </div>
      );
    case 'game-over':
        return (
          <div className="game-ui">
            <h1>Game Over</h1>
            <p>Final Score: {score}</p>

            <form onSubmit={handleInitialsSubmit} className="initials-form">
              <input
                type="text"
                value={initials}
                  onChange={(e) => setInitials(e.target.value.slice(0, 16))}
                  maxLength={16}
                  placeholder="YOUR NAME"
                autoFocus
                className="initials-input"
              />

              <div className="submission-options">
                {/* On-chain submission */}
                <div className="submission-card blockchain-card">
                  <h2>On-Chain Leaderboard</h2>
                  {wagmiIsConnected ? (
                    <>
                      <div className="wallet-info">
                        <p>✅ {wagmiAddress?.slice(0, 6)}...{wagmiAddress?.slice(-4)}</p>
                        <p>Network: {wagmiChain?.name}</p>
                      </div>
                      <button type="submit" disabled={submittingScore || !initials} className="submit-btn">
                        {submittingScore ? 'Submitting...' : `Submit to ${wagmiChain?.name}`}
                      </button>
                      <p className="gas-info">Gas fee required</p>
                    </>
                  ) : (
                    <>
                      <p>Connect wallet to submit your score on-chain.</p>
                      <button type="button" onClick={connectWallet} className="connect-btn">
                        Connect Wallet
                      </button>
                    </>
                  )}
                </div>

                {/* Local submission */}
                <div className="submission-card local-card">
                  <h2>Local Leaderboard</h2>
                  <p>Save your score on this device.</p>
                  <button
                    type="button" // Important: prevent form submission
                    onClick={() => handleInitialsSubmit({ preventDefault: () => {} })} // Pass a dummy event
                    disabled={!initials}
                    className="submit-btn"
                  >
                    Save Locally
                  </button>
                  <p className="gas-info">No gas fee</p>
                </div>
              </div>

              {scoreSubmissionError && <p className="error-message">{scoreSubmissionError}</p>}
            </form>

            <div className="game-over-actions">
              <button onClick={startGame}>Play Again</button>
              <button onClick={() => setGameState('leaderboard')}>View Leaderboard</button>
            </div>
          </div>
        );
    case 'leaderboard':
      return (
        <div className="game-ui">
          <h1>High Scores</h1>
          <ol className="leaderboard">
            {leaderboard.length > 0 ? leaderboard.map((entry, index) => (
              <li key={index}>
                <span className="leaderboard-name">{entry.name}</span>
                <span className="leaderboard-score">{entry.score}</span>
                {entry.txHash && (
                  <span className="blockchain-badge">
                    🔗 <a
                      href={`https://basescan.org/tx/${entry.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View on Base
                    </a>
                  </span>
                )}
              </li>
            )) : <p>No scores yet. Be the first!</p>}
          </ol>
          <button onClick={() => setGameState('start')}>Main Menu</button>
        </div>
      );
    case 'color-picker':
      return (
        <div className="game-ui">
          <h2>Paint Palette!</h2>
          <p>Choose a color to eliminate all bricks of that type.</p>
          <div className="color-picker-buttons">
            {COLORS.BRICK.map(color => (
              <button
                key={color}
                style={{
                  backgroundColor: color,
                  borderColor: color,
                  textShadow: '0 0 5px #000',
                  width: '100px',
                  height: '50px'
                }}
                onClick={() => handleColorSelect(color)}
              >
              </button>
            ))}
          </div>
        </div>
      );
    default:
      return null;
  }
};

export default GameUI;