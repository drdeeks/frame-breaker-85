/**
 * @fileoverview Core game rendering engine
 * @module game/engine/Renderer
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS, BALL_RADIUS, PADDLE_HEIGHT } from '@/src/utils/constants';
import type { BallState, PaddleState, BrickData, PowerUpData, GameStats } from '@/src/utils/types';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private fontSize: number;

  constructor(ctx: CanvasRenderingContext2D, fontSize: number = 20) {
    this.ctx = ctx;
    this.fontSize = fontSize;
  }

  /**
   * Updates font size for responsive rendering
   */
  setFontSize(size: number): void {
    this.fontSize = size;
  }

  /**
   * Clears the canvas
   */
  clear(): void {
    this.ctx.fillStyle = COLORS.BACKGROUND;
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  /**
   * Renders the paddle
   */
  renderPaddle(paddle: PaddleState): void {
    this.ctx.fillStyle = COLORS.PADDLE;
    this.ctx.shadowColor = COLORS.SHADOW;
    this.ctx.shadowBlur = 15;
    this.ctx.fillRect(paddle.position.x, paddle.position.y, paddle.width, PADDLE_HEIGHT);
    this.ctx.shadowBlur = 0;
  }

  /**
   * Renders the ball
   */
  renderBall(ball: BallState): void {
    this.ctx.beginPath();
    this.ctx.arc(ball.position.x, ball.position.y, BALL_RADIUS, 0, Math.PI * 2);
    this.ctx.fillStyle = COLORS.BALL;
    this.ctx.fill();
    this.ctx.closePath();
  }

  /**
   * Renders all visible bricks
   */
  renderBricks(bricks: BrickData[]): void {
    bricks.forEach((brick) => {
      if (brick.visible) {
        this.ctx.fillStyle = brick.color;
        this.ctx.fillRect(
          brick.position.x,
          brick.position.y,
          brick.dimensions.width,
          brick.dimensions.height
        );
      }
    });
  }

  /**
   * Renders power-ups
   */
  renderPowerUps(powerUps: PowerUpData[]): void {
    this.ctx.font = `${this.fontSize}px 'Press Start 2P'`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    powerUps.forEach((p) => {
      const isPowerUp = ['sticky', 'paint', 'invincible'].includes(p.type);
      this.ctx.fillStyle = isPowerUp ? COLORS.POWER_UP : COLORS.POWER_DOWN;

      let text = '';
      switch (p.type) {
        case 'sticky':
          text = 'S';
          break;
        case 'paint':
          text = 'P';
          break;
        case 'invincible':
          text = 'I';
          break;
        case 'add-bricks':
          text = '+';
          break;
        case 'shrink-paddle':
          text = '-';
          break;
      }

      this.ctx.fillText(text, p.position.x, p.position.y);
    });

    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'alphabetic';
  }

  /**
   * Renders the HUD (score, level, lives)
   */
  renderHUD(stats: GameStats): void {
    this.ctx.fillStyle = COLORS.TEXT;
    this.ctx.font = `${this.fontSize}px 'Press Start 2P'`;
    this.ctx.textBaseline = 'top';

    // Score (left)
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Score: ${stats.score}`, 20, 20);

    // Level (center)
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`Level: ${stats.level}`, CANVAS_WIDTH / 2, 20);

    // Lives (right)
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`Lives: ${stats.lives}`, CANVAS_WIDTH - 180, 20);

    // Reset
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'alphabetic';
  }

  /**
   * Renders the complete game scene
   */
  render(
    paddle: PaddleState,
    ball: BallState,
    bricks: BrickData[],
    powerUps: PowerUpData[],
    stats: GameStats
  ): void {
    this.clear();
    this.renderBricks(bricks);
    this.renderPowerUps(powerUps);
    this.renderPaddle(paddle);
    this.renderBall(ball);
    this.renderHUD(stats);
  }
}
