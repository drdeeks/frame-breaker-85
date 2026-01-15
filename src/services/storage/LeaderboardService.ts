/**
 * @fileoverview Local storage service for leaderboard management
 * @module services/storage/LeaderboardService
 */

import { STORAGE_KEYS } from '@/src/utils/constants';
import type { LeaderboardEntry } from '@/src/utils/types';

export class LeaderboardService {
  /**
   * Saves a score to the leaderboard
   */
  async saveScore(entry: LeaderboardEntry): Promise<void> {
    try {
      const scores = await this.getTopScores(10);
      const newScores = [...scores, entry]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(newScores));
    } catch (error) {
      console.error('Failed to save score:', error);
      throw error;
    }
  }

  /**
   * Retrieves top scores from storage
   */
  async getTopScores(limit: number = 10): Promise<LeaderboardEntry[]> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
      if (!stored) return [];

      const scores: LeaderboardEntry[] = JSON.parse(stored);
      return scores.slice(0, limit);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      return [];
    }
  }

  /**
   * Clears all scores from storage
   */
  async clearScores(): Promise<void> {
    try {
      localStorage.removeItem(STORAGE_KEYS.LEADERBOARD);
    } catch (error) {
      console.error('Failed to clear leaderboard:', error);
      throw error;
    }
  }

  /**
   * Checks if a score qualifies for the leaderboard
   */
  async isHighScore(score: number): Promise<boolean> {
    const scores = await this.getTopScores(10);
    return scores.length < 10 || score > scores[scores.length - 1].score;
  }
}
