/**
 * @fileoverview Custom hook for game state management
 * @module hooks/useGameState
 */

import { useState, useCallback } from 'react';
import type { GameState, GameStats } from '@/src/utils/types';
import { INITIAL_LIVES } from '@/src/utils/constants';

interface UseGameStateReturn {
  state: GameState;
  stats: GameStats;
  transition: (newState: GameState) => void;
  updateStats: (updates: Partial<GameStats>) => void;
  resetStats: () => void;
  incrementScore: (points: number) => void;
  decrementLives: () => boolean;
  nextLevel: () => void;
}

const initialStats: GameStats = {
  score: 0,
  lives: INITIAL_LIVES,
  level: 1,
  combo: 0,
};

/**
 * Hook for managing game state and statistics
 */
export function useGameState(): UseGameStateReturn {
  const [state, setState] = useState<GameState>('start');
  const [stats, setStats] = useState<GameStats>(initialStats);

  const transition = useCallback((newState: GameState) => {
    setState(newState);
  }, []);

  const updateStats = useCallback((updates: Partial<GameStats>) => {
    setStats((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetStats = useCallback(() => {
    setStats(initialStats);
  }, []);

  const incrementScore = useCallback((points: number) => {
    setStats((prev) => ({
      ...prev,
      score: prev.score + points,
      combo: prev.combo + 1,
    }));
  }, []);

  const decrementLives = useCallback((): boolean => {
    let gameOver = false;
    setStats((prev) => {
      const newLives = prev.lives - 1;
      gameOver = newLives <= 0;
      return { ...prev, lives: newLives, combo: 0 };
    });
    return gameOver;
  }, []);

  const nextLevel = useCallback(() => {
    setStats((prev) => ({ ...prev, level: prev.level + 1 }));
  }, []);

  return {
    state,
    stats,
    transition,
    updateStats,
    resetStats,
    incrementScore,
    decrementLives,
    nextLevel,
  };
}
