/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { Renderer } from "./game/engine/Renderer";
import { LevelGenerator } from "./services/ai/LevelGenerator";
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PADDLE_WIDTH_DEFAULT,
  PADDLE_HEIGHT,
  PADDLE_Y,
  BALL_RADIUS,
  INITIAL_LIVES,
  POWER_UP_SPEED,
  STICKY_USES,
  SHRINK_DURATION,
  INVINCIBLE_DURATION
} from "./utils/constants";
import type {
  BrickData,
  PowerUpData,
  ActivePowerUps,
  BallState,
  PaddleState,
  GameState,
  LeaderboardEntry,
  PowerType
} from "./utils/types";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const rendererRef = useRef<Renderer | null>(null);
  const levelGeneratorRef = useRef<LevelGenerator>(new LevelGenerator(process.env.API_KEY || ""));
  const animationFrameRef = useRef<number>(0);

  // UI State
  const [gameState, setGameState] = useState<GameState>("start");
  const [loading, setLoading] = useState(false);
  const [scoreUI, setScoreUI] = useState(0);
  const [levelUI, setLevelUI] = useState(1);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [initials, setInitials] = useState("");

  // Game Logic Refs (The source of truth for 60fps)
  const paddleRef = useRef<PaddleState>({
    position: { x: (CANVAS_WIDTH - PADDLE_WIDTH_DEFAULT) / 2, y: PADDLE_Y },
    width: PADDLE_WIDTH_DEFAULT,
    height: PADDLE_HEIGHT,
  });
  const ballRef = useRef<BallState>({
    position: { x: CANVAS_WIDTH / 2, y: PADDLE_Y - BALL_RADIUS },
    velocity: { x: 4, y: -4 },
    radius: BALL_RADIUS,
    attached: true,
  });
  const bricksRef = useRef<BrickData[]>([]);
  const powerUpsRef = useRef<PowerUpData[]>([]);
  const activePowerUpsRef = useRef<ActivePowerUps>({
    sticky: 0,
    shrinkEndTime: 0,
    invincibleEndTime: 0,
  });
  const scoreRef = useRef(0);
  const livesRef = useRef(INITIAL_LIVES);
  const levelRef = useRef(1);
  const gameStateRef = useRef<GameState>("start");

  // Keep gameStateRef in sync with gameState
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Initialize Farcaster Mini App SDK
  useEffect(() => {
    const initializeSDK = async () => {
      try {
        await sdk.actions.ready();
        const provider = await sdk.wallet.getEthereumProvider();
        if (provider) {
          await provider.request({ method: "eth_accounts" });
        }
      } catch (error) {
        console.error("SDK Initialization error:", error);
      }
    };
    initializeSDK();
  }, []);

  // Initialize Renderer
  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        rendererRef.current = new Renderer(ctx);
      }
    }
  }, []);

  // Load Leaderboard
  useEffect(() => {
    const saved = localStorage.getItem("frameBreakerLeaderboard");
    if (saved) {
      try {
        setLeaderboard(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse leaderboard", e);
      }
    }
  }, []);

  const saveLeaderboard = (newEntry: LeaderboardEntry) => {
    const updated = [...leaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    setLeaderboard(updated);
    localStorage.setItem("frameBreakerLeaderboard", JSON.stringify(updated));
  };

  const activatePowerUp = (type: PowerType) => {
    const now = Date.now();
    switch (type) {
      case "sticky":
        activePowerUpsRef.current.sticky = STICKY_USES;
        break;
      case "invincible":
        activePowerUpsRef.current.invincibleEndTime = now + INVINCIBLE_DURATION;
        break;
      case "shrink-paddle":
        paddleRef.current.width = PADDLE_WIDTH_DEFAULT / 2;
        activePowerUpsRef.current.shrinkEndTime = now + SHRINK_DURATION;
        break;
    }
  };

  const resetBallAndPaddle = useCallback(() => {
    const newPaddleX = (CANVAS_WIDTH - PADDLE_WIDTH_DEFAULT) / 2;
    paddleRef.current = {
      position: { x: newPaddleX, y: PADDLE_Y },
      width: PADDLE_WIDTH_DEFAULT,
      height: PADDLE_HEIGHT,
    };
    ballRef.current = {
      position: { x: newPaddleX + PADDLE_WIDTH_DEFAULT / 2, y: PADDLE_Y - BALL_RADIUS },
      velocity: { x: 4, y: -4 },
      radius: BALL_RADIUS,
      attached: true,
    };
    activePowerUpsRef.current = { sticky: 0, shrinkEndTime: 0, invincibleEndTime: 0 };
    powerUpsRef.current = [];
  }, []);

  const startNewLevel = useCallback(async () => {
    setLoading(true);
    setGameState("loading");
    resetBallAndPaddle();

    const newBricks = await levelGeneratorRef.current.generateLevel(levelRef.current);
    bricksRef.current = newBricks;

    setLoading(false);
    setGameState("playing");
  }, [resetBallAndPaddle]);

  const startGame = () => {
    scoreRef.current = 0;
    livesRef.current = INITIAL_LIVES;
    levelRef.current = 1;
    setScoreUI(0);
    setLevelUI(1);
    startNewLevel();
  };

  // Input Handlers - Update Refs directly
  const handleMouseMove = (e: React.MouseEvent) => {
    if (gameStateRef.current !== "playing") return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    paddleRef.current.position.x = Math.max(0, Math.min(x - paddleRef.current.width / 2, CANVAS_WIDTH - paddleRef.current.width));
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (gameStateRef.current !== "playing") return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || !e.touches[0]) return;
    const x = e.touches[0].clientX - rect.left;
    paddleRef.current.position.x = Math.max(0, Math.min(x - paddleRef.current.width / 2, CANVAS_WIDTH - paddleRef.current.width));
  };

  const handleClick = () => {
    if (gameStateRef.current === "playing" && ballRef.current.attached) {
      ballRef.current.attached = false;
    }
  };

  // Main Game Loop
  useEffect(() => {
    const update = () => {
      if (gameStateRef.current !== "playing") return;

      const now = Date.now();
      const ball = ballRef.current;
      const paddle = paddleRef.current;
      const activePowerUps = activePowerUpsRef.current;

      // Power-up expiration
      if (activePowerUps.shrinkEndTime && now > activePowerUps.shrinkEndTime) {
        paddle.width = PADDLE_WIDTH_DEFAULT;
        activePowerUps.shrinkEndTime = 0;
      }
      if (activePowerUps.invincibleEndTime && now > activePowerUps.invincibleEndTime) {
        activePowerUps.invincibleEndTime = 0;
      }

      // Update Power-ups
      powerUpsRef.current = powerUpsRef.current.filter((p) => {
        p.position.y += POWER_UP_SPEED;
        if (
          p.position.y + p.size > paddle.position.y &&
          p.position.y < paddle.position.y + paddle.height &&
          p.position.x > paddle.position.x &&
          p.position.x < paddle.position.x + paddle.width
        ) {
          activatePowerUp(p.type);
          return false;
        }
        return p.position.y < CANVAS_HEIGHT;
      });

      // Update Ball
      if (ball.attached) {
        ball.position.x = paddle.position.x + paddle.width / 2;
        ball.position.y = paddle.position.y - ball.radius;
      } else {
        const speedMult = activePowerUps.invincibleEndTime > 0 ? 1.2 : 1;
        ball.position.x += ball.velocity.x * speedMult;
        ball.position.y += ball.velocity.y * speedMult;

        // Wall collisions
        if (ball.position.x + ball.radius > CANVAS_WIDTH || ball.position.x - ball.radius < 0) {
          ball.velocity.x = -ball.velocity.x;
        }
        if (ball.position.y - ball.radius < 0) {
          ball.velocity.y = -ball.velocity.y;
        }

        // Paddle collision
        if (
          ball.position.y + ball.radius > paddle.position.y &&
          ball.position.y - ball.radius < paddle.position.y + paddle.height &&
          ball.position.x > paddle.position.x &&
          ball.position.x < paddle.position.x + paddle.width
        ) {
          if (activePowerUps.sticky > 0) {
            ball.attached = true;
            activePowerUps.sticky--;
          } else {
            ball.velocity.y = -Math.abs(ball.velocity.y);
            const deltaX = ball.position.x - (paddle.position.x + paddle.width / 2);
            ball.velocity.x = deltaX * 0.15;
          }
        }

        // Brick collisions
        let bricksLeft = false;
        bricksRef.current.forEach((brick) => {
          if (!brick.visible) return;
          bricksLeft = true;
          if (
            ball.position.x > brick.position.x &&
            ball.position.x < brick.position.x + brick.dimensions.width &&
            ball.position.y > brick.position.y &&
            ball.position.y < brick.position.y + brick.dimensions.height
          ) {
            ball.velocity.y = -ball.velocity.y;
            brick.hp--;
            if (brick.hp <= 0) {
              brick.visible = false;
              scoreRef.current += 10;
              if (brick.powerUpType) {
                powerUpsRef.current.push({
                  position: { x: brick.position.x + brick.dimensions.width / 2, y: brick.position.y },
                  velocity: { x: 0, y: POWER_UP_SPEED },
                  type: brick.powerUpType,
                  size: 15,
                });
              }
            }
          }
        });

        if (!bricksLeft) {
          levelRef.current++;
          setLevelUI(levelRef.current);
          setGameState("level-complete");
          setTimeout(() => startNewLevel(), 2000);
          return;
        }

        // Bottom collision
        if (ball.position.y + ball.radius > CANVAS_HEIGHT) {
          if (activePowerUps.invincibleEndTime > 0) {
            ball.velocity.y = -ball.velocity.y;
          } else {
            livesRef.current--;
            if (livesRef.current > 0) {
              resetBallAndPaddle();
            } else {
              setScoreUI(scoreRef.current);
              setGameState("game-over");
            }
          }
        }
      }
    };

    const gameLoop = () => {
      update();
      if (rendererRef.current) {
        rendererRef.current.render(
          paddleRef.current,
          ballRef.current,
          bricksRef.current,
          powerUpsRef.current,
          {
            score: scoreRef.current,
            lives: livesRef.current,
            level: levelRef.current,
            combo: 0
          }
        );
      }
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [startNewLevel, resetBallAndPaddle]);

  const handleInitialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initials.length > 0) {
      saveLeaderboard({ name: initials.toUpperCase(), score: scoreRef.current, timestamp: Date.now() });
      setGameState("leaderboard");
    }
  };

  const renderUI = () => {
    if (gameState === "playing") return null;

    if (loading) {
      return (
        <div className="game-ui">
          <h2>Generating Level {levelRef.current}...</h2>
          <div className="loader"></div>
        </div>
      );
    }

    switch (gameState) {
      case "start":
        return (
          <div className="game-ui">
            <h1>Frame Breaker '85</h1>
            <p>An AI-Powered Brick Smasher</p>
            <button onClick={startGame}>Start Game</button>
            <button onClick={() => setGameState("leaderboard")}>Leaderboard</button>
          </div>
        );
      case "level-complete":
        return (
          <div className="game-ui">
            <h2>Level {levelUI - 1} Complete!</h2>
            <p>Get ready for the next level!</p>
          </div>
        );
      case "game-over":
        return (
          <div className="game-ui">
            <h1>Game Over</h1>
            <p>Final Score: {scoreUI}</p>
            <form onSubmit={handleInitialsSubmit}>
              <input
                type="text"
                value={initials}
                onChange={(e) => setInitials(e.target.value.slice(0, 3))}
                maxLength={3}
                placeholder="AAA"
                autoFocus
              />
              <button type="submit">Save Score</button>
            </form>
            <button onClick={startGame}>Play Again</button>
          </div>
        );
      case "leaderboard":
        return (
          <div className="game-ui">
            <h1>High Scores</h1>
            <ol className="leaderboard">
              {leaderboard.map((entry, i) => (
                <li key={i}>{entry.name}: {entry.score}</li>
              ))}
            </ol>
            <button onClick={() => setGameState("start")}>Main Menu</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div id="game-container">
      <div
        id="game-wrapper"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onClick={handleClick}
        style={{ cursor: gameState === "playing" ? "none" : "auto" }}
      >
        <div className="scanlines"></div>
        {renderUI()}
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
      </div>
    </div>
  );
}

export default App;
