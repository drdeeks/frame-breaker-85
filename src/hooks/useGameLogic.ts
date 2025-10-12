import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount, useConfig, useSwitchChain, useWriteContract, useConnect } from 'wagmi';
import { base } from 'wagmi/chains';
import {
  BASE_CHAIN_ID,
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PADDLE_WIDTH_DEFAULT,
  PADDLE_HEIGHT,
  PADDLE_Y,
  BALL_RADIUS,
  BRICK_COLS,
  BRICK_ROWS,
  BRICK_HEIGHT,
  BRICK_GAP,
  BRICK_WIDTH,
  INITIAL_LIVES,
  POWER_UP_CHANCE,
  POWER_UP_SPEED,
  COLORS,
  POWER_UP_TYPES,
  POWER_DOWN_TYPES,
  ALL_POWER_TYPES,
  PADDLE_SMOOTHING,
} from '../constants';

const generateLevel = async () => {
  try {
    const response = await fetch('/api/generateLevel');
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    const layout = await response.json();

    if (!Array.isArray(layout) || layout.length === 0 || !Array.isArray(layout[0])) {
      throw new Error("Invalid level format from API");
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
            hp: 2,
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
    console.error("Failed to generate level from API, creating a default one.", error);
    const bricks = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        const color = COLORS.BRICK[r % COLORS.BRICK.length];
        bricks.push({
          x: BRICK_GAP + c * (BRICK_WIDTH + BRICK_GAP),
          y: BRICK_GAP + 50 + r * (BRICK_HEIGHT + BRICK_GAP),
          w: BRICK_WIDTH,
          h: BRICK_HEIGHT,
          hp: 2,
          color: color,
          originalColor: color,
          visible: true,
          powerUpType: null,
        });
      }
    }
    return bricks;
  }
};

const useGameLogic = () => {
  const { address: wagmiAddress, isConnected: wagmiIsConnected, chain: wagmiChain } = useAccount();
  const { chains: wagmiChains } = useConfig();
  const { switchChain: wagmiSwitchNetwork } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const { connect, connectors } = useConnect();

  const [leaderboard, setLeaderboard] = useState([]);
  const [initials, setInitials] = useState('');
  const [submittingScore, setSubmittingScore] = useState(false);
  const [scoreSubmissionError, setScoreSubmissionError] = useState('');

  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('start');
  const [paddleX, setPaddleX] = useState((CANVAS_WIDTH - PADDLE_WIDTH_DEFAULT) / 2);
  const [targetPaddleX, setTargetPaddleX] = useState((CANVAS_WIDTH - PADDLE_WIDTH_DEFAULT) / 2);
  const [paddleWidth, setPaddleWidth] = useState(PADDLE_WIDTH_DEFAULT);
  const [ball, setBall] = useState({ x: CANVAS_WIDTH / 2, y: PADDLE_Y - BALL_RADIUS, dx: 4, dy: -4, attached: true });
  const [bricks, setBricks] = useState([]);
  const [powerUps, setPowerUps] = useState([]);
  const [activePowerUps, setActivePowerUps] = useState({ sticky: 0, shrinkEndTime: 0, invincibleEndTime: 0 });
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [level, setLevel] = useState(1);
  const [loading, setLoading] = useState(false);
  const [screenShake, setScreenShake] = useState({ endTime: 0, magnitude: 0 });
  const [flashEffect, setFlashEffect] = useState({ endTime: 0, color: '' });

  const resetBallAndPaddle = useCallback(() => {
    setPaddleWidth(PADDLE_WIDTH_DEFAULT);
    setActivePowerUps({ sticky: 0, shrinkEndTime: 0, invincibleEndTime: 0 });
    setPowerUps([]);
    const newPaddleX = (CANVAS_WIDTH - PADDLE_WIDTH_DEFAULT) / 2;
    setPaddleX(newPaddleX);
    setBall({ x: newPaddleX + PADDLE_WIDTH_DEFAULT / 2, y: PADDLE_Y - BALL_RADIUS, dx: 4, dy: -4, attached: true });
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
    setInitials('');
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
    setTargetPaddleX(newPaddleX);
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
    setTargetPaddleX(newPaddleX);
  };

  const handleClick = () => {
    if (gameState === 'playing' && ball.attached) {
      setBall(prev => ({ ...prev, attached: false, dy: -Math.abs(prev.dy) || -4 }));
      if (activePowerUps.sticky > 0) {
        setActivePowerUps(prev => ({ ...prev, sticky: prev.sticky - 1 }));
      }
    }
  };

  const activatePowerUp = (type) => {
    setScreenShake({ endTime: Date.now() + 200, magnitude: 10 });
    const isPowerUp = Object.values(POWER_UP_TYPES).includes(type);
    const flashColor = isPowerUp ? 'rgba(0, 255, 255, 0.5)' : 'rgba(242, 17, 112, 0.5)';
    setFlashEffect({ endTime: Date.now() + 150, color: flashColor });

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
          newBricks.push({ x: BRICK_GAP + c * (BRICK_WIDTH + BRICK_GAP), y: BRICK_GAP + 50 + r * (BRICK_HEIGHT + BRICK_GAP), w: BRICK_WIDTH, h: BRICK_HEIGHT, hp: 2, color: color, originalColor: color, visible: true, powerUpType: null });
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

  useEffect(() => {
    if (gameState === 'respawning') {
      resetBallAndPaddle();
      setGameState('playing');
    }
  }, [gameState, resetBallAndPaddle]);

  useEffect(() => {
    let animationFrameId;
    const update = () => {
      if (gameState !== 'playing') return;

      if (gameState === 'paused') {
        animationFrameId = window.requestAnimationFrame(gameLoop);
        return;
      }

      setPaddleX(prevX => prevX + (targetPaddleX - prevX) * PADDLE_SMOOTHING);

      const now = Date.now();
      if (activePowerUps.shrinkEndTime && now > activePowerUps.shrinkEndTime) {
        setPaddleWidth(PADDLE_WIDTH_DEFAULT);
        setActivePowerUps(prev => ({ ...prev, shrinkEndTime: 0 }));
      }
      if (activePowerUps.invincibleEndTime && now > activePowerUps.invincibleEndTime) {
        setActivePowerUps(prev => ({ ...prev, invincibleEndTime: 0 }));
      }
      const newPowerUps = powerUps.map(p => ({ ...p, y: p.y + POWER_UP_SPEED })).filter(p => {
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
        if (newBall.x + BALL_RADIUS > CANVAS_WIDTH || newBall.x - BALL_RADIUS < 0) newBall.dx = -newBall.dx;
        if (newBall.y - BALL_RADIUS < 0) newBall.dy = -newBall.dy;
        if (newBall.y + BALL_RADIUS > PADDLE_Y && newBall.y - BALL_RADIUS < PADDLE_Y + PADDLE_HEIGHT && newBall.x > paddleX && newBall.x < paddleX + paddleWidth) {
          if (activePowerUps.sticky > 0) {
            newBall.attached = true;
          } else {
            newBall.dy = -newBall.dy;
            let hitPos = (newBall.x - (paddleX + paddleWidth / 2)) / (paddleWidth / 2);
            newBall.dx = hitPos * 6;
            setScreenShake({ endTime: Date.now() + 50, magnitude: 2 });
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
                setScreenShake({ endTime: Date.now() + 100, magnitude: 7 });
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
      animationFrameId = window.requestAnimationFrame(gameLoop);
    };
    gameLoop();
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [gameState, paddleX, paddleWidth, ball, bricks, score, lives, level, startNewLevel, powerUps, activePowerUps, resetBallAndPaddle]);

  const togglePause = (e) => {
    if (e) e.stopPropagation();
    if (gameState === 'playing') setGameState('paused');
    else if (gameState === 'paused') setGameState('playing');
  };

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

  const saveLeaderboard = (newLeaderboard) => {
    try {
      setLeaderboard(newLeaderboard);
      localStorage.setItem('frameBreakerLeaderboard', JSON.stringify(newLeaderboard));
    } catch (e) {
      console.error("Could not save leaderboard", e);
    }
  };

  const connectWallet = () => {
    if (connectors.length > 0) {
      connect({ connector: connectors[0] });
    } else {
      console.error('No connectors found');
      setScoreSubmissionError('No wallet connectors available.');
    }
  };

  const handleOnChainSubmit = async (e) => {
    e.preventDefault();
    if (!initials || initials.length < 3) {
      setScoreSubmissionError('Please enter at least 3 initials.');
      return;
    }

    setSubmittingScore(true);
    setScoreSubmissionError('');
    try {
      if (!wagmiIsConnected) throw new Error('Wallet not connected');
      if (wagmiChain?.id !== BASE_CHAIN_ID) {
        await wagmiSwitchNetwork?.({ chainId: BASE_CHAIN_ID });
      }
      const txHash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'submitScore',
        args: [initials, BigInt(score)],
      });
      const newEntry = { name: initials.toUpperCase(), score: score, txHash };
      const newLeaderboard = [...leaderboard, newEntry].sort((a, b) => b.score - a.score).slice(0, 10);
      saveLeaderboard(newLeaderboard);
      setGameState('leaderboard');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setScoreSubmissionError(`Failed to submit score: ${errorMessage}`);
    } finally {
      setSubmittingScore(false);
    }
  };

  const handleLocalSubmit = (e) => {
    e.preventDefault();
    if (!initials) return;
    const newEntry = { name: initials.toUpperCase(), score };
    const newLeaderboard = [...leaderboard, newEntry].sort((a, b) => b.score - a.score).slice(0, 10);
    saveLeaderboard(newLeaderboard);
    setGameState('leaderboard');
  };

  const tokenSymbols = {
    [base.id]: 'ETH',
    10143: 'MONAD',
  };
  const currentTokenSymbol = wagmiChain ? tokenSymbols[wagmiChain.id] : 'N/A';

  return {
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
    flashEffect,
    startGame,
    handleMouseMove,
    handleTouchMove,
    handleClick,
    togglePause,
    handleColorSelect,
    leaderboard,
    initials,
    setInitials,
    handleOnChainSubmit,
    handleLocalSubmit,
    submittingScore,
    scoreSubmissionError,
    wagmiIsConnected,
    wagmiAddress,
    wagmiChain,
    wagmiChains,
    currentTokenSymbol,
    connectWallet,
    wagmiSwitchNetwork,
    COLORS,
  };
};

export default useGameLogic;