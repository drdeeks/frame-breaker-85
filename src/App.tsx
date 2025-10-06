/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Type } from '@google/genai';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

// --- Wagmi Imports for Multi-chain Support ---
import { useAccount, useConfig, useSwitchChain, useWriteContract } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains'; // Import chains used in main.tsx

// --- BASE CHAIN CONFIGURATION ---
const BASE_CHAIN_ID = 8453; // Base mainnet
const BASE_RPC_URL = 'https://mainnet.base.org';
const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'; // IMPORTANT: Placeholder - replace with your deployed contract address
const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "playerName", "type": "string" },
      { "internalType": "uint256", "name": "score", "type": "uint256" }
    ],
    "name": "submitScore",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_topN", "type": "uint256" }
    ],
    "name": "getLeaderboard",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "playerName", "type": "string" },
          { "internalType": "uint256", "name": "score", "type": "uint256" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "address", "name": "player", "type": "address" }
        ],
        "internalType": "struct FrameBreaker.Score[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// --- GAME CONFIGURATION ---
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_WIDTH_DEFAULT = 120;
const PADDLE_HEIGHT = 22; // Slightly thicker paddle
const PADDLE_Y = CANVAS_HEIGHT - 40;
const BALL_RADIUS = 11; // Slightly larger ball
const BRICK_COLS = 18;
const BRICK_ROWS = 10;
const BRICK_HEIGHT = 18;
const BRICK_GAP = 3;
const BRICK_WIDTH = (CANVAS_WIDTH - BRICK_GAP * (BRICK_COLS + 1)) / BRICK_COLS;
const INITIAL_LIVES = 3;
const POWER_UP_CHANCE = 0.15; // 15% chance for a brick to have a power-up
const POWER_UP_SIZE = 15;
const POWER_UP_SPEED = 2;


// --- COLOR PALETTE ---
const COLORS = {
  PADDLE: '#00ffff',
  BALL: '#f21170',
  BRICK: ['#ff00ff', '#70ff00', '#f89a1d', '#3d25b5'],
  TEXT: '#ffffff',
  BORDER: '#00ffff',
  SHADOW: '#f21170',
  POWER_UP: {
    'sticky': '#f89a1d',      // Orange for Sticky
    'paint': '#ff00ff',       // Magenta for Paint
    'invincible': '#70ff00',  // Green for Invincible
  },
  POWER_DOWN: {
    'add-bricks': '#3d25b5',  // Purple for Add Bricks
    'shrink-paddle': '#f21170' // Red for Shrink
  },
  BRICK_DAMAGED: '#999999',
};

const POWER_UP_TYPES = {
  STICKY: 'sticky',
  PAINT: 'paint',
  INVINCIBLE: 'invincible',
};

const POWER_DOWN_TYPES = {
  ADD_BRICKS: 'add-bricks',
  SHRINK_PADDLE: 'shrink-paddle',
};

const ALL_POWER_TYPES = [...Object.values(POWER_UP_TYPES), ...Object.values(POWER_DOWN_TYPES)];

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- HELPER FUNCTIONS ---
const generateLevel = async () => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a 2D array of numbers for a brick breaker game level layout. The grid must be ${BRICK_ROWS} rows by ${BRICK_COLS} columns. 
      Use numbers 1-4 for different brick types and 0 for empty space.
      The output should be a fun, challenging, and aesthetically pleasing pattern, like a simple spaceship, face, or geometric design.
      Only output the JSON array.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          description: `A 2D array representing the brick layout, ${BRICK_ROWS} rows and ${BRICK_COLS} columns. Each inner array is a row.`,
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.INTEGER,
              description: "A number from 0 to 4 representing a brick type or empty space."
            },
          },
        },
      },
    });

    const layout = JSON.parse(response.text);

    if (!Array.isArray(layout) || layout.length === 0 || !Array.isArray(layout[0])) {
      throw new Error("Invalid level format from AI");
    }

    const bricks = [];
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        if (layout[r] && layout[r][c] > 0) {
          const hasPowerUp = Math.random() < POWER_UP_CHANCE;
          const color = COLORS.BRICK[layout[r][c] - 1] || COLORS.BRICK[0];
          bricks.push({
            x: BRICK_GAP + c * (BRICK_WIDTH + BRICK_GAP),
            y: BRICK_GAP + 50 + r * (BRICK_HEIGHT + BRICK_GAP),
            w: BRICK_WIDTH,
            h: BRICK_HEIGHT,
            hp: 2, // All bricks are solid
            color: color,
            originalColor: color,
            visible: true,
            powerUpType: hasPowerUp ? ALL_POWER_TYPES[Math.floor(Math.random() * ALL_POWER_TYPES.length)] : null,
          });
        }
      }
    }
    return bricks;
  } catch (error) {
    console.error("Failed to generate level, creating a default one.", error);
    // Fallback to a default pattern if API fails
    const bricks = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        const hasPowerUp = Math.random() < POWER_UP_CHANCE;
        const color = COLORS.BRICK[r % COLORS.BRICK.length];
        bricks.push({
          x: BRICK_GAP + c * (BRICK_WIDTH + BRICK_GAP),
          y: BRICK_GAP + 50 + r * (BRICK_HEIGHT + BRICK_GAP),
          w: BRICK_WIDTH,
          h: BRICK_HEIGHT,
          hp: 2, // All bricks are solid
          color: color,
          originalColor: color,
          visible: true,
          powerUpType: hasPowerUp ? ALL_POWER_TYPES[Math.floor(Math.random() * ALL_POWER_TYPES.length)] : null,
        });
      }
    }
    return bricks;
  }
};


function App() {
  const canvasRef = useRef(null);
  // start, playing, paused, level-complete, game-over, leaderboard, color-picker, respawning
  const [gameState, setGameState] = useState('start');
  const [paddleX, setPaddleX] = useState((CANVAS_WIDTH - PADDLE_WIDTH_DEFAULT) / 2);
  const [paddleWidth, setPaddleWidth] = useState(PADDLE_WIDTH_DEFAULT);
  const [ball, setBall] = useState({
    x: CANVAS_WIDTH / 2,
    y: PADDLE_Y - BALL_RADIUS,
    dx: 4,
    dy: -4,
    attached: true
  });
  const [bricks, setBricks] = useState([]);
  const [powerUps, setPowerUps] = useState([]);
  const [activePowerUps, setActivePowerUps] = useState({
    sticky: 0, // uses
    shrinkEndTime: 0, // timestamp
    invincibleEndTime: 0, // timestamp
  });
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [level, setLevel] = useState(1);
  const [leaderboard, setLeaderboard] = useState([]);
  const [initials, setInitials] = useState('');
  const [loading, setLoading] = useState(false);
  const [screenShake, setScreenShake] = useState({ endTime: 0, magnitude: 0 });
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [submittingScore, setSubmittingScore] = useState(false);
  const [scoreSubmissionError, setScoreSubmissionError] = useState('');

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
        // Call ready() to hide splash screen and display content
        // This is CRITICAL - without this, users see infinite loading screen
        await sdk.actions.ready();
        console.log('Farcaster Mini App SDK initialized successfully');

        // Check if wallet is available
        // Using Farcaster SDK's check for initial connection
        await checkWalletConnection();
      } catch (error) {
        console.error('Failed to initialize Farcaster Mini App SDK:', error);
        // Continue without SDK if it fails - app will still work in browser
      }
    };

    // Initialize SDK after app is fully loaded and ready to display
    initializeSDK();
  }, []);

  // Check wallet connection (using Farcaster SDK)
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

  // Pause Handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (gameState === 'playing') {
          setGameState('paused');
        } else if (gameState === 'paused') {
          setGameState('playing');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState]);

  // Save leaderboard to localStorage
  const saveLeaderboard = (newLeaderboard) => {
    try {
      setLeaderboard(newLeaderboard);
      localStorage.setItem('frameBreakerLeaderboard', JSON.stringify(newLeaderboard));
    } catch (e) {
      console.error("Could not save leaderboard", e);
    }
  };

  const resetBallAndPaddle = useCallback(() => {
    setPaddleWidth(PADDLE_WIDTH_DEFAULT);
    setActivePowerUps({ sticky: 0, shrinkEndTime: 0, invincibleEndTime: 0 });
    setPowerUps([]);
    const newPaddleX = (CANVAS_WIDTH - PADDLE_WIDTH_DEFAULT) / 2;
    setPaddleX(newPaddleX);
    setBall({
      x: newPaddleX + PADDLE_WIDTH_DEFAULT / 2,
      y: PADDLE_Y - BALL_RADIUS,
      dx: 4,
      dy: -4,
      attached: true,
    });
  }, []);

  const startNewLevel = useCallback(async () => {
    setLoading(true);
    setGameState('loading');
    resetBallAndPaddle();
    const newBricks = await generateLevel();
    setBricks(newBricks);
    setLoading(false);
    setGameState('playing');
  }, [resetBallAndPaddle]);

  const startGame = () => {
    setScore(0);
    setLives(INITIAL_LIVES);
    setLevel(1);
    startNewLevel();
  };

  const handleMouseMove = (e) => {
    if (gameState !== 'playing' && gameState !== 'color-picker') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    let newPaddleX = (e.clientX - rect.left) * scaleX - paddleWidth / 2;
    if (newPaddleX < 0) newPaddleX = 0;
    if (newPaddleX > CANVAS_WIDTH - paddleWidth) newPaddleX = CANVAS_WIDTH - paddleWidth;
    setPaddleX(newPaddleX);
  };

  const handleTouchMove = (e) => {
    if (gameState !== 'playing' && gameState !== 'color-picker') return;
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    let newPaddleX = (e.touches[0].clientX - rect.left) * scaleX - paddleWidth / 2;
    if (newPaddleX < 0) newPaddleX = 0;
    if (newPaddleX > CANVAS_WIDTH - paddleWidth) newPaddleX = CANVAS_WIDTH - paddleWidth;
    setPaddleX(newPaddleX);
  };

  const handleClick = () => {
    if (gameState === 'playing' && ball.attached) {
      setBall(prev => ({
        ...prev,
        attached: false,
        // Ensure the ball always launches upwards
        dy: -Math.abs(prev.dy) || -4,
      }));
      if (activePowerUps.sticky > 0) {
        setActivePowerUps(prev => ({ ...prev, sticky: prev.sticky - 1 }));
      }
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

  // Switch to Base network (using Farcaster SDK)
  const switchToBase = async () => {
    try {
      const provider = await sdk.wallet.getEthereumProvider();
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${BASE_CHAIN_ID.toString(16)}` }],
      });
      console.log('Switched to Base network');
    } catch (error) {
      console.error('Failed to switch to Base network:', error);
      // Try to add Base network if it doesn't exist
      try {
        const provider = await sdk.wallet.getEthereumProvider();
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${BASE_CHAIN_ID.toString(16)}`,
            chainName: 'Base',
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18,
            },
            rpcUrls: [BASE_RPC_URL],
            blockExplorerUrls: ['https://basescan.org'],
          }],
        });
      } catch (addError) {
        console.error('Failed to add Base network:', addError);
        setScoreSubmissionError('Please add Base network to your wallet manually.');
      }
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

      // Here you would typically wait for the transaction to be mined
      // For this example, we'll optimistically update the UI

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

    // Use wagmiIsConnected for a more robust check if a wallet is connected via Wagmi
    if (wagmiIsConnected) {
      // Submit to blockchain with gas fee
      submitScoreToBlockchain(initials, score);
    } else {
      // Fallback to local storage
      const newEntry = { name: initials.toUpperCase(), score };
      const newLeaderboard = [...leaderboard, newEntry]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      saveLeaderboard(newLeaderboard);
      setGameState('leaderboard');
    }
  };

  const activatePowerUp = (type) => {
    switch (type) {
      case POWER_UP_TYPES.STICKY:
        setActivePowerUps(prev => ({ ...prev, sticky: 3 }));
        break;
      case POWER_UP_TYPES.PAINT:
        setGameState('color-picker');
        break;
      case POWER_UP_TYPES.INVINCIBLE:
        setActivePowerUps(prev => ({ ...prev, invincibleEndTime: Date.now() + 7000 }));
        break;
      case POWER_DOWN_TYPES.SHRINK_PADDLE:
        setPaddleWidth(PADDLE_WIDTH_DEFAULT * 0.5); // Increased shrink strength
        setActivePowerUps(prev => ({ ...prev, shrinkEndTime: Date.now() + 20000 }));
        break;
      case POWER_DOWN_TYPES.ADD_BRICKS: {
        const visibleBricks = bricks.filter(b => b.visible);
        const numToAdd = Math.ceil(visibleBricks.length * 0.15);
        const occupiedSlots = new Set(visibleBricks.map(b => `${Math.round((b.y - 50 - BRICK_GAP) / (BRICK_HEIGHT + BRICK_GAP))}-${Math.round((b.x - BRICK_GAP) / (BRICK_WIDTH + BRICK_GAP))}`));
        const availableSlots = [];
        for (let r = 0; r < BRICK_ROWS; r++) {
          for (let c = 0; c < BRICK_COLS; c++) {
            if (!occupiedSlots.has(`${r}-${c}`)) {
              availableSlots.push({ r, c });
            }
          }
        }

        const newBricks = [...bricks];
        for (let i = 0; i < numToAdd && availableSlots.length > 0; i++) {
          const slotIndex = Math.floor(Math.random() * availableSlots.length);
          const { r, c } = availableSlots.splice(slotIndex, 1)[0];
          const color = COLORS.BRICK[r % COLORS.BRICK.length];
          newBricks.push({
            x: BRICK_GAP + c * (BRICK_WIDTH + BRICK_GAP),
            y: BRICK_GAP + 50 + r * (BRICK_HEIGHT + BRICK_GAP),
            w: BRICK_WIDTH,
            h: BRICK_HEIGHT,
            hp: 2, // New bricks are also solid
            color: color,
            originalColor: color,
            visible: true,
            powerUpType: null
          });
        }
        setBricks(newBricks);
        break;
      }
    }
  };

  const handleColorSelect = (color) => {
    let clearedCount = 0;
    const newBricks = bricks.map(brick => {
      if (brick.visible && brick.originalColor === color) {
        clearedCount++;
        return { ...brick, visible: false };
      }
      return brick;
    });
    setBricks(newBricks);
    setScore(prev => prev + clearedCount * 10);
    setGameState('playing');
  };

  // Handles resetting the ball after a life is lost
  useEffect(() => {
    if (gameState === 'respawning') {
      resetBallAndPaddle();
      setGameState('playing');
    }
  }, [gameState, resetBallAndPaddle]);

  // Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const draw = () => {
      const now = Date.now();
      let shakeX = 0;
      let shakeY = 0;
      if (now < screenShake.endTime) {
        shakeX = (Math.random() - 0.5) * screenShake.magnitude;
        shakeY = (Math.random() - 0.5) * screenShake.magnitude;
      }

      ctx.save();
      ctx.translate(shakeX, shakeY);

      // Clear canvas
      ctx.fillStyle = '#0d0221';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw Paddle with 3D effect
      const paddleGradient = ctx.createLinearGradient(paddleX, PADDLE_Y, paddleX, PADDLE_Y + PADDLE_HEIGHT);
      paddleGradient.addColorStop(0, '#00ffff');
      paddleGradient.addColorStop(1, '#00b8b8');
      ctx.fillStyle = paddleGradient;
      ctx.shadowColor = COLORS.PADDLE;
      ctx.shadowBlur = 20;
      ctx.fillRect(paddleX, PADDLE_Y, paddleWidth, PADDLE_HEIGHT);
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(paddleX, PADDLE_Y, paddleWidth, PADDLE_HEIGHT);
      ctx.shadowBlur = 0;

      // Draw Bricks with a border for depth
      bricks.forEach(brick => {
        if (brick.visible) {
          ctx.fillStyle = brick.color;
          ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
          ctx.strokeStyle = '#0d0221'; // Border color matches background
          ctx.lineWidth = 2;
          ctx.strokeRect(brick.x, brick.y, brick.w, brick.h);
        }
      });

      // Draw Ball with a glow
      ctx.save();
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.BALL;
      ctx.shadowColor = COLORS.BALL;
      ctx.shadowBlur = 25;
      ctx.fill();
      ctx.closePath();
      ctx.restore();

      // Draw Power-ups with distinct shapes and colors
      powerUps.forEach(p => {
        const isPowerUp = Object.values(POWER_UP_TYPES).includes(p.type);
        const color = isPowerUp ? COLORS.POWER_UP[p.type] : COLORS.POWER_DOWN[p.type];

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, POWER_UP_SIZE, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.closePath();
        ctx.restore();

        ctx.fillStyle = '#ffffff';
        ctx.font = "bold 18px 'Press Start 2P'";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        let text = '';
        if (p.type === POWER_UP_TYPES.STICKY) text = 'S';
        if (p.type === POWER_UP_TYPES.PAINT) text = 'P';
        if (p.type === POWER_UP_TYPES.INVINCIBLE) text = 'I';
        if (p.type === POWER_DOWN_TYPES.ADD_BRICKS) text = '+';
        if (p.type === POWER_DOWN_TYPES.SHRINK_PADDLE) text = '-';
        ctx.fillText(text, p.x, p.y + 1); // +1 for better vertical centering
      });

      // Draw HUD
      ctx.fillStyle = COLORS.TEXT;
      ctx.font = "20px 'Press Start 2P'";
      ctx.textBaseline = 'top';

      // Score (left-aligned)
      ctx.textAlign = 'left';
      ctx.fillText(`Score: ${score}`, 20, 20);

      // Level (center-aligned)
      ctx.textAlign = 'center';
      ctx.fillText(`Level: ${level}`, CANVAS_WIDTH / 2, 20);

      // Lives (right-aligned)
      ctx.textAlign = 'right';
      // Shifted left to make space for the pause button
      ctx.fillText(`Lives: ${lives}`, CANVAS_WIDTH - 180, 20);

      // Reset canvas context state for other potential draws
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';

      ctx.restore();
    };

    const update = () => {
      if (gameState !== 'playing') return;

      // Update Powerup Timers
      const now = Date.now();
      if (activePowerUps.shrinkEndTime && now > activePowerUps.shrinkEndTime) {
        setPaddleWidth(PADDLE_WIDTH_DEFAULT);
        setActivePowerUps(prev => ({ ...prev, shrinkEndTime: 0 }));
      }
      if (activePowerUps.invincibleEndTime && now > activePowerUps.invincibleEndTime) {
        setActivePowerUps(prev => ({ ...prev, invincibleEndTime: 0 }));
      }

      // Update falling powerups
      const newPowerUps = powerUps.map(p => ({ ...p, y: p.y + POWER_UP_SPEED }))
        .filter(p => {
          if (p.y > PADDLE_Y && p.y < PADDLE_Y + PADDLE_HEIGHT && p.x > paddleX && p.x < paddleX + paddleWidth) {
            activatePowerUp(p.type);
            return false; // remove from list
          }
          return p.y < CANVAS_HEIGHT; // remove if off screen
        });
      setPowerUps(newPowerUps);

      if (ball.attached) {
        setBall(prev => ({ ...prev, x: paddleX + paddleWidth / 2 }));
        // Don't return, let the rest of the game logic like powerup timers run
      } else {
        let newBall = { ...ball };
        const speedMultiplier = activePowerUps.invincibleEndTime > 0 ? 1.2 : 1;
        newBall.x += newBall.dx * speedMultiplier;
        newBall.y += newBall.dy * speedMultiplier;

        // Wall collision
        if (newBall.x + BALL_RADIUS > CANVAS_WIDTH || newBall.x - BALL_RADIUS < 0) {
          newBall.dx = -newBall.dx;
        }
        if (newBall.y - BALL_RADIUS < 0) {
          newBall.dy = -newBall.dy;
        }

        // Paddle collision
        if (newBall.y + BALL_RADIUS > PADDLE_Y &&
          newBall.y - BALL_RADIUS < PADDLE_Y + PADDLE_HEIGHT &&
          newBall.x > paddleX && newBall.x < paddleX + paddleWidth) {

          if (activePowerUps.sticky > 0) {
            newBall.attached = true;
          } else {
            newBall.dy = -newBall.dy;
            // More predictable angle based on hit position
            const MAX_BALL_DX = 6;
            let hitPos = (newBall.x - (paddleX + paddleWidth / 2)) / (paddleWidth / 2);
            newBall.dx = hitPos * MAX_BALL_DX;
          }
        }

        // Brick collision
        let newBricks = [...bricks];
        let newScore = score;
        let bricksLeft = false;
        newBricks.forEach(brick => {
          if (brick.visible) {
            if (newBall.x > brick.x && newBall.x < brick.x + brick.w && newBall.y > brick.y && newBall.y < brick.y + brick.h) {
              newBall.dy = -newBall.dy;
              brick.hp -= 1;
              if (brick.hp <= 0) {
                brick.visible = false;
                newScore += 10;
                // Add a screen shake effect for more impact
                setScreenShake({ endTime: Date.now() + 100, magnitude: 5 });
                if (brick.powerUpType) {
                  setPowerUps(prev => [...prev, { x: brick.x + brick.w / 2, y: brick.y + brick.h / 2, type: brick.powerUpType }]);
                }
              } else {
                brick.color = COLORS.BRICK_DAMAGED;
              }
            }
            if (brick.visible) bricksLeft = true;
          }
        });

        setScore(newScore);
        setBricks(newBricks);

        // Check for level complete
        if (!bricksLeft) {
          setLevel(prev => prev + 1);
          setGameState('level-complete');
          setTimeout(() => startNewLevel(), 2000);
          return; // Exit update loop to prevent further ball movement
        }

        // Bottom wall collision (lose life)
        if (newBall.y + BALL_RADIUS >= CANVAS_HEIGHT) { // More robust boundary check
          if (activePowerUps.invincibleEndTime > 0) {
            newBall.dy = -newBall.dy;
            setBall(newBall);
          } else {
            const newLives = lives - 1;
            if (newLives > 0) {
              setLives(newLives);
              setGameState('respawning');
            } else {
              setLives(0); // Ensure lives is 0 on game over
              setGameState('game-over');
            }
            return; // Stop the update loop. A state change will restart it.
          }
        } else {
          setBall(newBall);
        }
      }
    };

    const gameLoop = () => {
      update();
      draw();
      animationFrameId = window.requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [gameState, paddleX, paddleWidth, ball, bricks, score, lives, level, startNewLevel, powerUps, activePowerUps]);

  const togglePause = (e) => {
    if (e) e.stopPropagation();
    if (gameState === 'playing') {
      setGameState('paused');
    } else if (gameState === 'paused') {
      setGameState('playing');
    }
  };

  const renderUI = () => {
    if (gameState === 'playing') return null;

    if (loading) {
      return (
        <div className="game-ui">
          <h2>Generating Level {level}...</h2>
          <div className="loader"></div>
        </div>
      )
    }

    switch (gameState) {
      case 'start':
        return (
          <div className="game-ui">
            <h1>Frame Breaker '85</h1>
            <p>An AI-Powered Brick Smasher</p>
            <button onClick={startGame}>Start Game</button>
            <button onClick={() => setGameState('leaderboard')}>Leaderboard</button>
            {/* --- Chain Switcher in Start Menu --- */}
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
            {/* --- End Chain Switcher --- */}
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

            {/* Wallet Connection Status */}
            <div className="wallet-status">
              {wagmiIsConnected ? ( // Use Wagmi's connection status
                <div className="wallet-connected">
                  <span>✅ Wallet Connected</span>
                  <span className="wallet-address">{wagmiAddress?.slice(0, 6)}...{wagmiAddress?.slice(-4)}</span>
                  <p>Current Chain: {wagmiChain?.name} ({currentTokenSymbol})</p>
                </div>
              ) : (
                <div className="wallet-disconnected">
                  <span>🔗 Connect Wallet to submit to Base chain</span>
                  <button onClick={connectWallet} className="connect-wallet-btn">
                    Connect Wallet
                  </button>
                </div>
              )}
            </div>

            {/* Score Submission Form */}
            <div className="score-submission-form">
              <p className="form-title">Enter Your Initials</p>
              <form onSubmit={handleInitialsSubmit}>
                <div className="input-group">
                  <input
                    type="text"
                    value={initials}
                    onChange={(e) => setInitials(e.target.value.toUpperCase().slice(0, 3))}
                    maxLength={3}
                    placeholder="AAA"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={submittingScore}
                    className={wagmiIsConnected ? "submit-blockchain-btn" : "submit-local-btn"}
                  >
                    {submittingScore ? "Submitting..." :
                      wagmiIsConnected ? `Submit to ${wagmiChain?.name || 'Blockchain'} (Gas Fee)` : "Save Locally"}
                  </button>
                </div>
              </form>
            </div>

            {/* Error Messages */}
            {scoreSubmissionError && (
              <div className="error-message">
                {scoreSubmissionError}
              </div>
            )}

            {/* Submission Info */}
            {wagmiIsConnected && (
              <div className="submission-info">
                <p>💡 Submitting to {wagmiChain?.name || 'the blockchain'} requires a small gas fee (~$0.01-0.05)</p>
                <p>Your score will be permanently recorded on the blockchain!</p>
              </div>
            )}

            <button onClick={startGame}>Play Again</button>
            <button onClick={() => setGameState('leaderboard')}>Leaderboard</button>
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
  }

  return (
    <div id="game-container">
      <div
        id="game-wrapper"
        onMouseMove={handleMouseMove}
        onTouchMove={onTouchMove}
        onClick={handleClick}
        onTouchStart={handleClick}
        style={{
          cursor: (gameState === 'playing' || gameState === 'paused') ? 'none' : 'auto',
        }}
      >
        <div className="scanlines"></div>
        {renderUI()}
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
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
