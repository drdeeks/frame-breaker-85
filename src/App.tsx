/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenerativeAI } from '@google/generative-ai';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

// --- Wagmi Imports for Multi-chain Support ---
import { useAccount, useNetwork, useSwitchChain, useWriteContract, useConnect } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains'; // Import chains used in main.tsx

// --- BASE CHAIN CONFIGURATION ---
const BASE_CHAIN_ID = 8453; // Base mainnet
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

// --- HELPER FUNCTIONS ---
const generateLevel = async () => {
  try {
    // Moved AI initialization inside the function to prevent module-level errors
    const apiKey = import.meta.env.VITE_API_KEY;
    if (!apiKey) {
      throw new Error("VITE_API_KEY is not defined.");
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});

    const prompt = `Generate a 2D array of numbers for a brick breaker game level layout. The grid must be ${BRICK_ROWS} rows by ${BRICK_COLS} columns.
      Use numbers 1-4 for different brick types and 0 for empty space.
      The output should be a fun, challenging, and aesthetically pleasing pattern, like a simple spaceship, face, or geometric design.
      Only output the JSON array.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    const layout = JSON.parse(text);

    if (!Array.isArray(layout) || layout.length === 0 || !Array.isArray(layout[0])) {
      throw new Error("Invalid level format from AI");
    }

    const bricks: any[] = [];
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
    const bricks: any[] = [];
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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
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
  const [bricks, setBricks] = useState<any[]>([]);
  const [powerUps, setPowerUps] = useState<any[]>([]);
  const [activePowerUps, setActivePowerUps] = useState({
    sticky: 0,
    shrinkEndTime: 0,
    invincibleEndTime: 0,
  });
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [level, setLevel] = useState(1);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [initials, setInitials] = useState('');
  const [loading, setLoading] = useState(false);
  const [screenShake, setScreenShake] = useState({ endTime: 0, magnitude: 0 });
  const [scoreSubmissionError, setScoreSubmissionError] = useState('');
  const { writeContract, isPending: isSubmitting } = useWriteContract();

  // --- Wagmi Hooks ---
  const { address, isConnected, chain } = useAccount();
  const { chains, switchChain } = useSwitchChain();
  const { connectors, connect } = useConnect();

  // Define a mapping for token symbols based on chain ID
  const tokenSymbols: { [key: number]: string } = {
    [base.id]: 'ETH',
    [baseSepolia.id]: 'ETH',
  };

  const currentTokenSymbol = chain ? tokenSymbols[chain.id] : 'N/A';


  // Initialize Farcaster Mini App SDK
  useEffect(() => {
    try {
      sdk.ready();
    } catch (error) {
      console.info('Farcaster SDK not in frame, continuing in standalone mode:', error);
    }
  }, []);

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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setGameState(gs => gs === 'playing' ? 'paused' : 'playing');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState]);

  // Save leaderboard to localStorage
  const saveLeaderboard = (newLeaderboard: any[]) => {
    setLeaderboard(newLeaderboard);
    localStorage.setItem('frameBreakerLeaderboard', JSON.stringify(newLeaderboard));
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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
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

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
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
      setBall(prev => ({ ...prev, attached: false, dy: -Math.abs(prev.dy) || -4 }));
      if (activePowerUps.sticky > 0) {
        setActivePowerUps(prev => ({ ...prev, sticky: prev.sticky - 1 }));
      }
    }
  };

  const connectWallet = () => {
    const injectedConnector = connectors.find(c => c.id === 'injected');
    if (injectedConnector) {
      connect({ connector: injectedConnector });
    }
  };

  const submitScoreToBlockchain = (playerName: string, playerScore: number) => {
    setScoreSubmissionError('');
    try {
      if (!isConnected) {
        throw new Error('Wallet not connected. Please connect your wallet.');
      }

      if (chain?.id !== BASE_CHAIN_ID) {
        switchChain?.(BASE_CHAIN_ID);
      }

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'submitScore',
        args: [playerName, BigInt(playerScore)],
      }, {
        onSuccess: (txHash) => {
          console.log('Score submission transaction hash:', txHash);
          const newEntry = { name: playerName.toUpperCase(), score: playerScore, txHash };
          const newLeaderboard = [...leaderboard, newEntry]
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
          saveLeaderboard(newLeaderboard);
          setGameState('leaderboard');
        },
        onError: (error) => {
          console.error('Failed to submit score to blockchain:', error);
          setScoreSubmissionError(`Failed to submit score: ${error.message}`);
        }
      });
    } catch (error: any) {
      console.error('Failed to submit score to blockchain:', error);
      setScoreSubmissionError(`Failed to submit score: ${error.message}`);
    }
  };

  const handleInitialsSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!initials) return;

    if (isConnected) {
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

  const activatePowerUp = (type: string | null) => {
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
        setPaddleWidth(PADDLE_WIDTH_DEFAULT * 0.5);
        setActivePowerUps(prev => ({ ...prev, shrinkEndTime: Date.now() + 20000 }));
        break;
      case POWER_DOWN_TYPES.ADD_BRICKS: {
        const visibleBricks = bricks.filter(b => b.visible);
        const numToAdd = Math.ceil(visibleBricks.length * 0.15);
        const occupiedSlots = new Set(visibleBricks.map(b => `${Math.round((b.y - 50 - BRICK_GAP) / (BRICK_HEIGHT + BRICK_GAP))}-${Math.round((b.x - BRICK_GAP) / (BRICK_WIDTH + BRICK_GAP))}`));
        const availableSlots: { r: number; c: number }[] = [];
        for (let r = 0; r < BRICK_ROWS; r++) {
          for (let c = 0; c < BRICK_COLS; c++) {
            if (!occupiedSlots.has(`${r}-${c}`)) {
              availableSlots.push({ r, c });
            }
          }
        }

        const newBricksToAdd = [];
        for (let i = 0; i < numToAdd && availableSlots.length > 0; i++) {
          const slotIndex = Math.floor(Math.random() * availableSlots.length);
          const { r, c } = availableSlots.splice(slotIndex, 1)[0];
          const color = COLORS.BRICK[r % COLORS.BRICK.length];
          newBricksToAdd.push({
            x: BRICK_GAP + c * (BRICK_WIDTH + BRICK_GAP),
            y: BRICK_GAP + 50 + r * (BRICK_HEIGHT + BRICK_GAP),
            w: BRICK_WIDTH,
            h: BRICK_HEIGHT,
            hp: 2,
            color: color,
            originalColor: color,
            visible: true,
            powerUpType: null
          });
        }
        setBricks(prev => [...prev, ...newBricksToAdd]);
        break;
      }
    }
  };

  const handleColorSelect = (color: string) => {
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

  useEffect(() => {
    if (gameState === 'respawning') {
      resetBallAndPaddle();
      setGameState('playing');
    }
  }, [gameState, resetBallAndPaddle]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrameId: number;

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

      ctx.fillStyle = '#0d0221';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

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

      bricks.forEach(brick => {
        if (brick.visible) {
          ctx.fillStyle = brick.color;
          ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
          ctx.strokeStyle = '#0d0221';
          ctx.lineWidth = 2;
          ctx.strokeRect(brick.x, brick.y, brick.w, (brick as any).h);
        }
      });

      ctx.save();
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.BALL;
      ctx.shadowColor = COLORS.BALL;
      ctx.shadowBlur = 25;
      ctx.fill();
      ctx.closePath();
      ctx.restore();

      powerUps.forEach(p => {
        const isPowerUp = Object.values(POWER_UP_TYPES).includes(p.type as string);
        const color = isPowerUp ? (COLORS.POWER_UP as any)[p.type] : (COLORS.POWER_DOWN as any)[p.type];

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
        ctx.fillText(text, p.x, p.y + 1);
      });

      ctx.fillStyle = COLORS.TEXT;
      ctx.font = "20px 'Press Start 2P'";
      ctx.textBaseline = 'top';

      ctx.textAlign = 'left';
      ctx.fillText(`Score: ${score}`, 20, 20);

      ctx.textAlign = 'center';
      ctx.fillText(`Level: ${level}`, CANVAS_WIDTH / 2, 20);

      ctx.textAlign = 'right';
      ctx.fillText(`Lives: ${lives}`, CANVAS_WIDTH - 180, 20);

      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';

      ctx.restore();
    };

    const update = () => {
      if (gameState !== 'playing') return;

      const now = Date.now();
      if (activePowerUps.shrinkEndTime && now > activePowerUps.shrinkEndTime) {
        setPaddleWidth(PADDLE_WIDTH_DEFAULT);
        setActivePowerUps(prev => ({ ...prev, shrinkEndTime: 0 }));
      }
      if (activePowerUps.invincibleEndTime && now > activePowerUps.invincibleEndTime) {
        setActivePowerUps(prev => ({ ...prev, invincibleEndTime: 0 }));
      }

      const newPowerUps = powerUps.map(p => ({ ...p, y: p.y + POWER_UP_SPEED }))
        .filter(p => {
          if (p.y > PADDLE_Y && p.y < PADDLE_Y + PADDLE_HEIGHT && p.x > paddleX && p.x < paddleX + paddleWidth) {
            activatePowerUp(p.type);
            return false;
          }
          return p.y < CANVAS_HEIGHT;
        });
      setPowerUps(newPowerUps);

      if (ball.attached) {
        setBall(prev => ({ ...prev, x: paddleX + paddleWidth / 2 }));
      } else {
        let newBall = { ...ball };
        const speedMultiplier = activePowerUps.invincibleEndTime > 0 ? 1.2 : 1;
        newBall.x += newBall.dx * speedMultiplier;
        newBall.y += newBall.dy * speedMultiplier;

        if (newBall.x + BALL_RADIUS > CANVAS_WIDTH || newBall.x - BALL_RADIUS < 0) {
          newBall.dx = -newBall.dx;
        }
        if (newBall.y - BALL_RADIUS < 0) {
          newBall.dy = -newBall.dy;
        }

        if (newBall.y + BALL_RADIUS > PADDLE_Y &&
          newBall.y - BALL_RADIUS < PADDLE_Y + PADDLE_HEIGHT &&
          newBall.x > paddleX && newBall.x < paddleX + paddleWidth) {
          if (activePowerUps.sticky > 0) {
            newBall.attached = true;
          } else {
            newBall.dy = -newBall.dy;
            const MAX_BALL_DX = 6;
            let hitPos = (newBall.x - (paddleX + paddleWidth / 2)) / (paddleWidth / 2);
            newBall.dx = hitPos * MAX_BALL_DX;
          }
        }

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

        if (!bricksLeft) {
          setLevel(prev => prev + 1);
          setGameState('level-complete');
          setTimeout(() => startNewLevel(), 2000);
          return;
        }

        if (newBall.y + BALL_RADIUS >= CANVAS_HEIGHT) {
          if (activePowerUps.invincibleEndTime > 0) {
            newBall.dy = -newBall.dy;
            setBall(newBall);
          } else {
            const newLives = lives - 1;
            if (newLives > 0) {
              setLives(newLives);
              setGameState('respawning');
            } else {
              setLives(0);
              setGameState('game-over');
            }
            return;
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
  }, [gameState, paddleX, paddleWidth, ball, bricks, score, lives, level, startNewLevel, powerUps, activePowerUps, resetBallAndPaddle]);

  const togglePause = () => {
    setGameState(prev => prev === 'playing' ? 'paused' : 'playing');
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
            {chains.length > 1 && (
              <div className="chain-switcher-start">
                <label htmlFor="chain-select-start">Network:</label>
                <select
                  id="chain-select-start"
                  onChange={(e) => switchChain?.(parseInt(e.target.value))}
                  value={chain?.id || ''}
                >
                  {chains.map((x) => (
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
            <button onClick={() => setGameState('playing')}>Resume</button>
            <button onClick={startGame}>Restart Game</button>
            <button onClick={() => setGameState('start')}>Main Menu</button>
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

            <div className="wallet-status">
              {isConnected ? (
                <div className="wallet-connected">
                  <span>✅ Wallet Connected</span>
                  <span className="wallet-address">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                  <p>Current Chain: {chain?.name} ({currentTokenSymbol})</p>
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
                    disabled={isSubmitting}
                    className={isConnected ? "submit-blockchain-btn" : "submit-local-btn"}
                  >
                    {isSubmitting ? "Submitting..." :
                      isConnected ? `Submit to ${chain?.name || 'Blockchain'} (Gas Fee)` : "Save Locally"}
                  </button>
                </div>
              </form>
            </div>

            {scoreSubmissionError && (
              <div className="error-message">
                {scoreSubmissionError}
              </div>
            )}
            {writeError && (
              <div className="error-message">
                Error: {writeError.message}
              </div>
            )}

            {isConnected && (
              <div className="submission-info">
                <p>💡 Submitting to {chain?.name || 'the blockchain'} requires a small gas fee (~$0.01-0.05)</p>
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
                  <span className="leader-score">{entry.score}</span>
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
        onTouchMove={handleTouchMove}
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