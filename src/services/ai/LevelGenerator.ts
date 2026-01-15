/**
 * @fileoverview AI-powered level generation service
 * @module services/ai/LevelGenerator
 */

import { GoogleGenAI, Type } from '@google/genai';
import { BRICK_ROWS, BRICK_COLS, BRICK_WIDTH, BRICK_HEIGHT, BRICK_GAP, COLORS, POWER_UP_CHANCE } from '@/src/utils/constants';
import type { BrickData, PowerType } from '@/src/utils/types';

const POWER_TYPES: PowerType[] = ['sticky', 'paint', 'invincible', 'add-bricks', 'shrink-paddle'];

export class LevelGenerator {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Generates a level layout using AI
   */
  async generateLevel(levelNumber: number): Promise<BrickData[]> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a 2D array of numbers for a brick breaker game level ${levelNumber}. 
        The grid must be ${BRICK_ROWS} rows by ${BRICK_COLS} columns. 
        Use numbers 1-4 for different brick types and 0 for empty space.
        Create a fun, challenging pattern like a spaceship, face, or geometric design.
        Difficulty should increase with level number.
        Only output the JSON array.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            description: `A 2D array representing the brick layout, ${BRICK_ROWS} rows and ${BRICK_COLS} columns.`,
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.INTEGER,
                description: 'A number from 0 to 4 representing a brick type or empty space.',
              },
            },
          },
        },
      });

      const layout = JSON.parse(response.text || '[]');
      return this.layoutToBricks(layout);
    } catch (error) {
      console.error('AI level generation failed, using fallback:', error);
      return this.generateFallbackLevel(levelNumber);
    }
  }

  /**
   * Converts a 2D layout array to brick objects
   */
  private layoutToBricks(layout: number[][]): BrickData[] {
    const bricks: BrickData[] = [];

    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        const cellValue = layout[r]?.[c];
        if (cellValue && cellValue > 0) {
          const hasPowerUp = Math.random() < POWER_UP_CHANCE;
          const colorIndex = (cellValue - 1) % COLORS.BRICK.length;
          const color: string = COLORS.BRICK[colorIndex] ?? COLORS.BRICK[0];

          bricks.push({
            position: {
              x: BRICK_GAP + c * (BRICK_WIDTH + BRICK_GAP),
              y: BRICK_GAP + 50 + r * (BRICK_HEIGHT + BRICK_GAP),
            },
            dimensions: {
              width: BRICK_WIDTH,
              height: BRICK_HEIGHT,
            },
            hp: 2,
            maxHp: 2,
            color,
            originalColor: color,
            visible: true,
            powerUpType: hasPowerUp ? POWER_TYPES[Math.floor(Math.random() * POWER_TYPES.length)] : null,
          });
        }
      }
    }

    return bricks;
  }

  /**
   * Generates a fallback level when AI is unavailable
   */
  private generateFallbackLevel(levelNumber: number): BrickData[] {
    const bricks: BrickData[] = [];
    const rows = Math.min(4 + Math.floor(levelNumber / 3), BRICK_ROWS);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        const hasPowerUp = Math.random() < POWER_UP_CHANCE;
        const color = COLORS.BRICK[r % COLORS.BRICK.length];

        bricks.push({
          position: {
            x: BRICK_GAP + c * (BRICK_WIDTH + BRICK_GAP),
            y: BRICK_GAP + 50 + r * (BRICK_HEIGHT + BRICK_GAP),
          },
          dimensions: {
            width: BRICK_WIDTH,
            height: BRICK_HEIGHT,
          },
          hp: 2,
          maxHp: 2,
          color,
          originalColor: color,
          visible: true,
          powerUpType: hasPowerUp ? POWER_TYPES[Math.floor(Math.random() * POWER_TYPES.length)] : null,
        });
      }
    }

    return bricks;
  }
}
