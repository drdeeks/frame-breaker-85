/**
 * @fileoverview Core type definitions for Frame Breaker '85
 * @module utils/types
 */

export interface Vector2 {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface Viewport extends Dimensions {
  scale: number;
  isMobile: boolean;
  isPortrait: boolean;
}

export type GameState =
  | 'start'
  | 'playing'
  | 'paused'
  | 'loading'
  | 'level-complete'
  | 'game-over'
  | 'leaderboard'
  | 'color-picker'
  | 'respawning';

export type PowerUpType = 'sticky' | 'paint' | 'invincible';
export type PowerDownType = 'add-bricks' | 'shrink-paddle';
export type PowerType = PowerUpType | PowerDownType;

export interface BallState {
  position: Vector2;
  velocity: Vector2;
  radius: number;
  attached: boolean;
}

export interface PaddleState {
  position: Vector2;
  width: number;
  height: number;
}

export interface BrickData {
  position: Vector2;
  dimensions: Dimensions;
  hp: number;
  maxHp: number;
  color: string;
  originalColor: string;
  visible: boolean;
  powerUpType: PowerType | null;
}

export interface PowerUpData {
  position: Vector2;
  velocity: Vector2;
  type: PowerType;
  size: number;
}

export interface ActivePowerUps {
  sticky: number;
  shrinkEndTime: number;
  invincibleEndTime: number;
}

export interface GameStats {
  score: number;
  lives: number;
  level: number;
  combo: number;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  timestamp?: number;
  txHash?: string;
}

export interface WalletState {
  connected: boolean;
  address: string | null;
  chainId: number | null;
}

export interface ContractScore {
  playerName: string;
  score: bigint;
  timestamp: bigint;
}
