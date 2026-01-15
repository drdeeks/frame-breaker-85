/**
 * @fileoverview Game configuration constants
 * @module utils/constants
 */

// Canvas Configuration
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const ASPECT_RATIO = CANVAS_WIDTH / CANVAS_HEIGHT;

// Paddle Configuration
export const PADDLE_WIDTH_DEFAULT = 120;
export const PADDLE_HEIGHT = 20;
export const PADDLE_Y = CANVAS_HEIGHT - 40;
export const PADDLE_SPEED = 8;

// Ball Configuration
export const BALL_RADIUS = 10;
export const BALL_SPEED_DEFAULT = 4;
export const BALL_SPEED_INVINCIBLE = 4.8;

// Brick Configuration
export const BRICK_COLS = 18;
export const BRICK_ROWS = 10;
export const BRICK_HEIGHT = 18;
export const BRICK_GAP = 3;
export const BRICK_WIDTH = (CANVAS_WIDTH - BRICK_GAP * (BRICK_COLS + 1)) / BRICK_COLS;
export const BRICK_HP_DEFAULT = 2;

// Game Configuration
export const INITIAL_LIVES = 3;
export const POWER_UP_CHANCE = 0.15;
export const POWER_UP_SIZE = 15;
export const POWER_UP_SPEED = 2;
export const POINTS_PER_BRICK = 10;
export const TARGET_FPS = 60;
export const FRAME_TIME = 1000 / TARGET_FPS;

// Power-up Durations (milliseconds)
export const STICKY_USES = 3;
export const SHRINK_DURATION = 20000;
export const INVINCIBLE_DURATION = 7000;
export const ADD_BRICKS_PERCENTAGE = 0.15;
export const SHRINK_FACTOR = 0.5;

// Color Palette
export const COLORS = {
  PADDLE: '#00ffff',
  BALL: '#f21170',
  BRICK: ['#ff00ff', '#70ff00', '#f89a1d', '#3d25b5'],
  TEXT: '#ffffff',
  BORDER: '#00ffff',
  SHADOW: '#f21170',
  POWER_UP: '#00ffff',
  POWER_DOWN: '#f21170',
  BRICK_DAMAGED: '#999999',
  BACKGROUND: '#0d0221',
} as const;

// Blockchain Configuration
export const BASE_CHAIN_ID = 8453;
export const BASE_RPC_URL = 'https://mainnet.base.org';
export const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000';

// Storage Keys
export const STORAGE_KEYS = {
  LEADERBOARD: 'frameBreakerLeaderboard',
  HIGH_SCORE: 'frameBreakerHighScore',
  SETTINGS: 'frameBreakerSettings',
} as const;

// Responsive Breakpoints
export const BREAKPOINTS = {
  MOBILE: 428,
  TABLET: 768,
  DESKTOP: 1024,
  FARCASTER_MAX: 428,
} as const;
