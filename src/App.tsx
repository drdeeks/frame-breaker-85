/**
 * @fileoverview Main application component - orchestrates game flow
 * @module App
 */

import { lazy, Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { useFarcasterSDK } from './hooks/useFarcasterSDK';
import { useGameState } from './hooks/useGameState';
import { useResponsive } from './hooks/useResponsive';
import { LevelGenerator } from './services/ai/LevelGenerator';
import { LeaderboardService } from './services/storage/LeaderboardService';
import { Renderer } from './game/engine/Renderer';
import { getResponsiveFontSize, screenToCanvas } from './utils/responsive';
import { circleRectCollision } from './utils/helpers';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PADDLE_WIDTH_DEFAULT,
  PADDLE_Y,
  BALL_RADIUS,
  POWER_UP_SPEED,
  POWER_UP_SIZE,
  POINTS_PER_BRICK,
  COLORS,
  STICKY_USES,
  SHRINK_DURATION,
  INVINCIBLE_DURATION,
  SHRINK_FACTOR,
  ADD_BRICKS_PERCENTAGE,
  BRICK_WIDTH,
  BRICK_HEIGHT,
  BRICK_GAP,
  BRICK_ROWS,
  BRICK_COLS,
} from './utils/constants';
import type {
  BallState,
  PaddleState,
  BrickData,
  PowerUpData,
  ActivePowerUps,
  LeaderboardEntry,
  PowerType,
} from './utils/types';

// Lazy load UI components
const StartScreen = lazy(() => import('./components/UI/StartScreen'));
const GameOverScreen = lazy(() => import('./components/UI/GameOverScreen'));
const PauseScreen = lazy(() => import('./components/UI/PauseScreen'));
const LeaderboardScreen = lazy(() => import('./components/UI/LeaderboardScreen'));
const ColorPickerScreen = lazy(() => import('./components/UI/ColorPickerScreen'));
const LevelCompleteScreen = lazy(() => import('./components/UI/LevelCompleteScreen'));
const LoadingScreen = lazy(() => import('./components/UI/LoadingScreen'));

// Initialize services
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const levelGenerator = new LevelGenerator(apiKey);
const leaderboardService = new LeaderboardService();

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const animationFrameRef = useRef<number>(0);

  // Hooks
  const { isReady } = useFarcasterSDK();
  const { state, stats, transition, resetStats, incrementScore, decrementLives, nextLevel } =
    useGameState();
  const viewport = useResponsive();

  // Game state
  const [paddle, setPaddle] = useState<PaddleState>({
    position: { x: (CANVAS_WIDTH - PADDLE_WIDTH_DEFAULT) / 2, y: PADDLE_Y },
    width: PADDLE_WIDTH_DEFAULT,
    height: 20,
  });

  const [ball, setBall] = useState<BallState>({
    position: { x: CANVAS_WIDTH / 2, y: PADDLE_Y - BALL_RADIUS },
    velocity: { x: 4, y: -4 },
    radius: BALL_RADIUS,
    attached: true,
  });

  const [bricks, setBricks] = useState<BrickData[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUpData[]>([]);
  const [activePowerUps, setActivePowerUps] = useState<ActivePowerUps>({
    sticky: 0,
    shrinkEndTime: 0,
    invincibleEndTime: 0,
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Initialize renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const fontSize = getResponsiveFontSize(20, viewport);
    rendererRef.current = new Renderer(ctx, fontSize);
  }, [viewport]);

  // Load leaderboard
  useEffect(() => {
    leaderboardService.getTopScores(10).then(setLeaderboard);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (state === 'playing') transition('paused');
        else if (state === 'paused') transition('playing');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, transition]);

  // Reset ball and paddle
  const resetBallAndPaddle = useCallback(() => {
    const newPaddleX = (CANVAS_WIDTH - PADDLE_WIDTH_DEFAULT) / 2;
    setPaddle({
      position: { x: newPaddleX, y: PADDLE_Y },
      width: PADDLE_WIDTH_DEFAULT,
      height: 20,
    });
    setBall({
      position: { x: newPaddleX + PADDLE_WIDTH_DEFAULT / 2, y: PADDLE_Y - BALL_RADIUS },
      velocity: { x: 4, y: -4 },
      radius: BALL_RADIUS,
      attached: true,
    });
    setActivePowerUps({ sticky: 0, shrinkEndTime: 0, invincibleEndTime: 0 });
    setPowerUps([]);
  }, []);

  // Start new level
  const startNewLevel = useCallback(async () => {
    transition('loading');
    resetBallAndPaddle();

    const newBricks = await levelGenerator.generateLevel(stats.level);
    setBricks(newBricks);

    transition('playing');
  }, [stats.level, transition, resetBallAndPaddle]);

  // Start game
  const startGame = useCallback(() => {
    resetStats();
    startNewLevel();
  }, [resetStats, startNewLevel]);

  // Handle mouse/touch move
  const handlePointerMove = useCallback(
    (clientX: number) => {
      if (state !== 'playing' && state !== 'color-picker') return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const { x } = screenToCanvas(clientX, 0, rect);
      const newX = Math.max(0, Math.min(x - paddle.width / 2, CANVAS_WIDTH - paddle.width));

      setPaddle((prev) => ({ ...prev, position: { ...prev.position, x: newX } }));
    },
    [state, paddle.width]
  );

  // Handle click/tap to launch ball
  const handleClick = useCallback(() => {
    if (state === 'playing' && ball.attached) {
      setBall((prev) => ({
        ...prev,
        attached: false,
        velocity: { ...prev.velocity, y: -Math.abs(prev.velocity.y) },
      }));

      if (activePowerUps.sticky > 0) {
        setActivePowerUps((prev) => ({ ...prev, sticky: prev.sticky - 1 }));
      }
    }
  }, [state, ball.attached, activePowerUps.sticky]);

  // Activate power-up
  const activatePowerUp = useCallback(
    (type: PowerType) => {
      switch (type) {
        case 'sticky':
          setActivePowerUps((prev) => ({ ...prev, sticky: STICKY_USES }));
          break;
        case 'paint':
          transition('color-picker');
          break;
        case 'invincible':
          setActivePowerUps((prev) => ({ ...prev, invincibleEndTime: Date.now() + INVINCIBLE_DURATION }));
          break;
        case 'shrink-paddle':
          setPaddle((prev) => ({ ...prev, width: PADDLE_WIDTH_DEFAULT * SHRINK_FACTOR }));
          setActivePowerUps((prev) => ({ ...prev, shrinkEndTime: Date.now() + SHRINK_DURATION }));
          break;
        case 'add-bricks': {
          const visibleBricks = bricks.filter((b) => b.visible);
          const numToAdd = Math.ceil(visibleBricks.length * ADD_BRICKS_PERCENTAGE);
          const occupiedSlots = new Set(
            visibleBricks.map(
              (b) =>
                `${Math.round((b.position.y - 50 - BRICK_GAP) / (BRICK_HEIGHT + BRICK_GAP))}-${Math.round(
                  (b.position.x - BRICK_GAP) / (BRICK_WIDTH + BRICK_GAP)
                )}`
            )
          );

          const availableSlots: { r: number; c: number }[] = [];
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
              position: {
                x: BRICK_GAP + c * (BRICK_WIDTH + BRICK_GAP),
                y: BRICK_GAP + 50 + r * (BRICK_HEIGHT + BRICK_GAP),
              },
              dimensions: { width: BRICK_WIDTH, height: BRICK_HEIGHT },
              hp: 2,
              maxHp: 2,
              color,
              originalColor: color,
              visible: true,
              powerUpType: null,
            });
          }
          setBricks(newBricks);
          break;
        }
      }
    },
    [bricks, transition]
  );

  // Handle color selection for paint power-up
  const handleColorSelect = useCallback(
    (color: string) => {
      let clearedCount = 0;
      const newBricks = bricks.map((brick) => {
        if (brick.visible && brick.originalColor === color) {
          clearedCount++;
          return { ...brick, visible: false };
        }
        return brick;
      });

      setBricks(newBricks);
      incrementScore(clearedCount * POINTS_PER_BRICK);
      transition('playing');
    },
    [bricks, incrementScore, transition]
  );

  // Handle score submission
  const handleScoreSubmit = useCallback(
    async (initials: string) => {
      const entry: LeaderboardEntry = {
        name: initials.toUpperCase(),
        score: stats.score,
        timestamp: Date.now(),
      };

      await leaderboardService.saveScore(entry);
      const newLeaderboard = await leaderboardService.getTopScores(10);
      setLeaderboard(newLeaderboard);
      transition('leaderboard');
    },
    [stats.score, transition]
  );

  // Game loop
  useEffect(() => {
    if (state !== 'playing') return;

    const gameLoop = () => {
      // Update power-up timers
      const now = Date.now();
      if (activePowerUps.shrinkEndTime && now > activePowerUps.shrinkEndTime) {
        setPaddle((prev) => ({ ...prev, width: PADDLE_WIDTH_DEFAULT }));
        setActivePowerUps((prev) => ({ ...prev, shrinkEndTime: 0 }));
      }
      if (activePowerUps.invincibleEndTime && now > activePowerUps.invincibleEndTime) {
        setActivePowerUps((prev) => ({ ...prev, invincibleEndTime: 0 }));
      }

      // Update falling power-ups
      setPowerUps((prev) =>
        prev
          .map((p) => ({ ...p, position: { ...p.position, y: p.position.y + POWER_UP_SPEED } }))
          .filter((p) => {
            // Check collision with paddle
            if (
              p.position.y > paddle.position.y &&
              p.position.y < paddle.position.y + paddle.height &&
              p.position.x > paddle.position.x &&
              p.position.x < paddle.position.x + paddle.width
            ) {
              activatePowerUp(p.type);
              return false;
            }
            return p.position.y < CANVAS_HEIGHT;
          })
      );

      // Update ball
      if (ball.attached) {
        setBall((prev) => ({
          ...prev,
          position: { x: paddle.position.x + paddle.width / 2, y: prev.position.y },
        }));
      } else {
        const speedMultiplier = activePowerUps.invincibleEndTime > 0 ? 1.2 : 1;
        const newBall = { ...ball };
        newBall.position.x += newBall.velocity.x * speedMultiplier;
        newBall.position.y += newBall.velocity.y * speedMultiplier;

        // Wall collisions
        if (newBall.position.x + BALL_RADIUS > CANVAS_WIDTH || newBall.position.x - BALL_RADIUS < 0) {
          newBall.velocity.x = -newBall.velocity.x;
        }
        if (newBall.position.y - BALL_RADIUS < 0) {
          newBall.velocity.y = -newBall.velocity.y;
        }

        // Paddle collision
        if (
          circleRectCollision(
            { x: newBall.position.x, y: newBall.position.y, radius: BALL_RADIUS },
            { x: paddle.position.x, y: paddle.position.y, width: paddle.width, height: paddle.height }
          )
        ) {
          if (activePowerUps.sticky > 0) {
            newBall.attached = true;
          } else {
            newBall.velocity.y = -Math.abs(newBall.velocity.y);
            const deltaX = newBall.position.x - (paddle.position.x + paddle.width / 2);
            newBall.velocity.x = deltaX * 0.2;
          }
        }

        // Brick collisions
        let bricksLeft = false;
        const newBricks = bricks.map((brick) => {
          if (brick.visible) {
            if (
              circleRectCollision(
                { x: newBall.position.x, y: newBall.position.y, radius: BALL_RADIUS },
                {
                  x: brick.position.x,
                  y: brick.position.y,
                  width: brick.dimensions.width,
                  height: brick.dimensions.height,
                }
              )
            ) {
              newBall.velocity.y = -newBall.velocity.y;
              brick.hp -= 1;

              if (brick.hp <= 0) {
                brick.visible = false;
                incrementScore(POINTS_PER_BRICK);

                if (brick.powerUpType) {
                  setPowerUps((prev) => [
                    ...prev,
                    {
                      position: {
                        x: brick.position.x + brick.dimensions.width / 2,
                        y: brick.position.y + brick.dimensions.height / 2,
                      },
                      velocity: { x: 0, y: POWER_UP_SPEED },
                      type: brick.powerUpType as PowerType,
                      size: POWER_UP_SIZE,
                    },
                  ]);
                }
              } else {
                brick.color = COLORS.BRICK_DAMAGED;
              }
            }

            if (brick.visible) bricksLeft = true;
          }
          return brick;
        });

        setBricks(newBricks);

        // Level complete
        if (!bricksLeft) {
          nextLevel();
          transition('level-complete');
          setTimeout(() => startNewLevel(), 2000);
          return;
        }

        // Bottom wall (lose life)
        if (newBall.position.y + BALL_RADIUS >= CANVAS_HEIGHT) {
          if (activePowerUps.invincibleEndTime > 0) {
            newBall.velocity.y = -newBall.velocity.y;
          } else {
            const gameOver = decrementLives();
            if (gameOver) {
              transition('game-over');
            } else {
              resetBallAndPaddle();
            }
            return;
          }
        }

        setBall(newBall);
      }

      // Render
      if (rendererRef.current) {
        rendererRef.current.render(paddle, ball, bricks, powerUps, stats);
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    state,
    paddle,
    ball,
    bricks,
    powerUps,
    stats,
    activePowerUps,
    incrementScore,
    decrementLives,
    nextLevel,
    transition,
    startNewLevel,
    resetBallAndPaddle,
    activatePowerUp,
  ]);

  if (!isReady) {
    return <div className="loading">Initializing...</div>;
  }

  return (
    <div id="game-container">
      <div
        id="game-wrapper"
        onMouseMove={(e) => handlePointerMove(e.clientX)}
        onTouchMove={(e) => e.touches[0] && handlePointerMove(e.touches[0].clientX)}
        onClick={handleClick}
        onTouchStart={handleClick}
        style={{ cursor: state === 'playing' || state === 'paused' ? 'none' : 'auto' }}
      >
        <div className="scanlines" />

        <Suspense fallback={<div className="loading">Loading...</div>}>
          {state === 'start' && <StartScreen onStart={startGame} onLeaderboard={() => transition('leaderboard')} />}
          {state === 'paused' && (
            <PauseScreen
              onResume={() => transition('playing')}
              onRestart={startGame}
              onMainMenu={() => transition('start')}
            />
          )}
          {state === 'loading' && <LoadingScreen level={stats.level} />}
          {state === 'level-complete' && <LevelCompleteScreen level={stats.level - 1} />}
          {state === 'game-over' && (
            <GameOverScreen
              score={stats.score}
              onSubmit={handleScoreSubmit}
              onPlayAgain={startGame}
              onLeaderboard={() => transition('leaderboard')}
            />
          )}
          {state === 'leaderboard' && (
            <LeaderboardScreen leaderboard={leaderboard} onMainMenu={() => transition('start')} />
          )}
          {state === 'color-picker' && <ColorPickerScreen colors={[...COLORS.BRICK]} onSelect={handleColorSelect} />}
        </Suspense>

        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />

        {(state === 'playing' || state === 'paused') && (
          <button
            className="pause-button"
            onClick={() => transition(state === 'playing' ? 'paused' : 'playing')}
            aria-label={state === 'playing' ? 'Pause Game' : 'Resume Game'}
          >
            {state === 'playing' ? 'PAUSE' : 'RESUME'}
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
