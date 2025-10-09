import React, { useState, useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import GameUI from './components/GameUI';
import GameCanvas from './components/GameCanvas';
import useGameLogic from './hooks/useGameLogic';

// --- Wagmi Imports for Multi-chain Support ---
import { useAccount, useConfig, useSwitchChain, useWriteContract } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains'; // Import chains used in main.tsx
import {
  BASE_CHAIN_ID,
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  COLORS,
} from './constants';

function App() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [initials, setInitials] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [submittingScore, setSubmittingScore] = useState(false);
  const [scoreSubmissionError, setScoreSubmissionError] = useState('');
  const [farcasterUser, setFarcasterUser] = useState(null);

  const {
    canvasRef,
    gameState,
    setGameState,
    loading,
    level,
    score,
    lives,
    PADDLE_Y,
    paddleX,
    paddleWidth,
    bricks,
    ball,
    powerUps,
    screenShake,
    startGame,
    handleMouseMove,
    handleTouchMove,
    handleClick,
    togglePause,
    handleColorSelect,
    handleMouseEnter,
    handleMouseLeave,
  } = useGameLogic();

  const {
    canvasRef,
    gameState,
    setGameState,
    loading,
    level,
    score,
    lives,
    PADDLE_Y,
    paddleX,
    paddleWidth,
    bricks,
    ball,
    powerUps,
    screenShake,
    startGame,
    handleMouseMove,
    handleTouchMove,
    handleClick,
    togglePause,
    handleColorSelect,
  } = useGameLogic();

  // --- Wagmi Hooks ---
  const { address: wagmiAddress, isConnected: wagmiIsConnected, chain: wagmiChain } = useAccount();
  const { chains: wagmiChains } = useConfig();
  const { switchChain: wagmiSwitchNetwork } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  // Define a mapping for token symbols based on chain ID
  const tokenSymbols: { [key: number]: string } = {
    [base.id]: 'ETH', // Base uses ETH as its native token
    [baseSepolia.id]: 'ETH', // Base Sepolia also uses ETH
    10143: 'MONAD', // Monad Testnet
  };

  const currentTokenSymbol = wagmiChain ? tokenSymbols[wagmiChain.id] : 'N/A';

  // Initialize Farcaster Mini App SDK
  useEffect(() => {
    const initializeSDK = async () => {
      try {
        await sdk.actions.ready();
        console.log('Farcaster Mini App SDK initialized successfully');
        await checkWalletConnection();
      } catch (error) {
        console.error('Failed to initialize Farcaster Mini App SDK:', error);
      }
    };
    initializeSDK();
  }, []);

  const checkWalletConnection = async () => {
    try {
      const provider = await sdk.wallet.getEthereumProvider();
      const accounts = await provider.request({ method: 'eth_accounts' }) as string[];
      if (accounts && accounts.length > 0) {
        setWalletConnected(true);
        setWalletAddress(accounts[0]);
        console.log('Wallet connected:', accounts[0]);
      }
    } catch (error) {
      console.log('No wallet connected or wallet not available');
      setWalletConnected(false);
      setWalletAddress('');
    }
  };

  // Load leaderboard from localStorage
  useEffect(() => {
    try {
      const savedLeaderboard = localStorage.getItem('frameBreakerLeaderboard');
      if (savedLeaderboard) {
        setLeaderboard(JSON.parse(savedLeaderboard));
      }
    } catch (e) {
      console.error("Could not load leaderboard", e);
    }
  }, []);

  // Save leaderboard to localStorage
  const saveLeaderboard = (newLeaderboard) => {
    try {
      setLeaderboard(newLeaderboard);
      localStorage.setItem('frameBreakerLeaderboard', JSON.stringify(newLeaderboard));
    } catch (e) {
      console.error("Could not save leaderboard", e);
    }
  };

  // Connect wallet (using Farcaster SDK)
  const connectWallet = async () => {
    try {
      const provider = await sdk.wallet.getEthereumProvider();
      const accounts = await provider.request({ method: 'eth_requestAccounts' }) as string[];
      if (accounts && accounts.length > 0) {
        setWalletConnected(true);
        setWalletAddress(accounts[0]);
        console.log('Wallet connected:', accounts[0]);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setScoreSubmissionError('Failed to connect wallet. Please try again.');
    }
  };

  // Submit score to blockchain using wagmi's writeContract
  const submitScoreToBlockchain = async (playerName, playerScore) => {
    setSubmittingScore(true);
    setScoreSubmissionError('');
    try {
      if (!wagmiIsConnected) {
        throw new Error('Wallet not connected');
      }

      if (wagmiChain?.id !== BASE_CHAIN_ID) {
        await wagmiSwitchNetwork?.({ chainId: BASE_CHAIN_ID });
      }

      const txHash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'submitScore',
        args: [playerName, BigInt(playerScore)],
      });

      console.log('Score submission transaction hash:', txHash);

      const newEntry = { name: playerName.toUpperCase(), score: playerScore, txHash };
      const newLeaderboard = [...leaderboard, newEntry]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      saveLeaderboard(newLeaderboard);

      setGameState('leaderboard');
    } catch (error) {
      console.error('Failed to submit score to blockchain:', error);
      setScoreSubmissionError(`Failed to submit score: ${error.message}`);
    } finally {
      setSubmittingScore(false);
    }
  };

  const handleInitialsSubmit = (e) => {
    e.preventDefault();
    if (!initials) return;

    if (wagmiIsConnected) {
      submitScoreToBlockchain(initials, score);
    } else {
      const newEntry = { name: initials.toUpperCase(), score };
      const newLeaderboard = [...leaderboard, newEntry]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      saveLeaderboard(newLeaderboard);
      setGameState('leaderboard');
    }
  };

  return (
    <div id="game-container">
      <div
        id="game-wrapper"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onClick={handleClick}
        onTouchStart={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          cursor: (gameState === 'playing' || gameState === 'paused') ? 'none' : 'auto',
        }}
      >
        <div className="scanlines"></div>
        <GameUI
          gameState={gameState}
          loading={loading}
          level={level}
          score={score}
          wagmiIsConnected={wagmiIsConnected}
          wagmiAddress={wagmiAddress}
          wagmiChain={wagmiChain}
          currentTokenSymbol={currentTokenSymbol}
          connectWallet={connectWallet}
          initials={initials}
          setInitials={setInitials}
          handleInitialsSubmit={handleInitialsSubmit}
          submittingScore={submittingScore}
          scoreSubmissionError={scoreSubmissionError}
          startGame={startGame}
          leaderboard={leaderboard}
          setGameState={setGameState}
          wagmiChains={wagmiChains}
          wagmiSwitchNetwork={wagmiSwitchNetwork}
          COLORS={COLORS}
          handleColorSelect={handleColorSelect}
        />
        <GameCanvas
          canvasRef={canvasRef}
          screenShake={screenShake}
          paddleX={paddleX}
          paddleWidth={paddleWidth}
          PADDLE_Y={PADDLE_Y}
          bricks={bricks}
          ball={ball}
          powerUps={powerUps}
          score={score}
          level={level}
          lives={lives}
        />
        {(gameState === 'playing' || gameState === 'paused') && (
          <button className="pause-button" onClick={togglePause} aria-label={gameState === 'playing' ? 'Pause Game' : 'Resume Game'}>
            {gameState === 'playing' ? 'PAUSE' : 'RESUME'}
          </button>
        )}
      </div>
    </div>
  );
}

export default App;