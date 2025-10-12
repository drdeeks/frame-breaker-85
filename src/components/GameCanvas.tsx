import React, { useRef, useEffect } from 'react';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PADDLE_HEIGHT,
  BALL_RADIUS,
  POWER_UP_SIZE,
  COLORS,
  POWER_UP_TYPES,
  POWER_DOWN_TYPES,
} from '../constants';

const GameCanvas = ({
  canvasRef,
  screenShake,
  flashEffect,
  paddleX,
  paddleWidth,
  PADDLE_Y,
  bricks,
  ball,
  powerUps,
  score,
  level,
  lives,
}) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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

    // Draw flash effect
    if (now < flashEffect.endTime) {
      ctx.fillStyle = flashEffect.color;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

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

    // Draw Power-ups
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
      ctx.fillText(text, p.x, p.y + 1);
    });

    // Draw HUD
    ctx.fillStyle = COLORS.TEXT;
    ctx.font = "20px 'Press Start 2P'";
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 20, 20);
    ctx.textAlign = 'center';
    ctx.fillText(`Level ${level}`, CANVAS_WIDTH / 2, 20);
    ctx.textAlign = 'right';
    ctx.fillText(`Lives: ${lives}`, CANVAS_WIDTH - 180, 20);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    ctx.restore();
  }, [
    canvasRef,
    screenShake,
    paddleX,
    paddleWidth,
    PADDLE_Y,
    bricks,
    ball,
    powerUps,
    score,
    level,
    lives,
  ]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
    />
  );
};

export default GameCanvas;