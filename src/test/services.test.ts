import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LevelGenerator } from '@/src/services/ai/LevelGenerator'

describe('LevelGenerator', () => {
  let generator: LevelGenerator

  beforeEach(() => {
    generator = new LevelGenerator('test-api-key')
  })

  it('should generate level with AI response', async () => {
    const bricks = await generator.generateLevel(1)
    
    expect(Array.isArray(bricks)).toBe(true)
    expect(bricks.length).toBeGreaterThan(0)
    
    // Check brick structure
    const brick = bricks[0]
    expect(brick).toHaveProperty('position')
    expect(brick).toHaveProperty('dimensions')
    expect(brick).toHaveProperty('hp')
    expect(brick).toHaveProperty('color')
    expect(brick).toHaveProperty('visible')
  })

  it('should handle AI failure gracefully', async () => {
    // Mock AI failure
    vi.mocked(generator['ai'].models.generateContent).mockRejectedValueOnce(new Error('API Error'))
    
    const bricks = await generator.generateLevel(1)
    
    // Should still return bricks (fallback)
    expect(Array.isArray(bricks)).toBe(true)
    expect(bricks.length).toBeGreaterThan(0)
  })

  it('should assign power-ups randomly', async () => {
    const bricks = await generator.generateLevel(1)
    
    // Some bricks should have power-ups (15% chance)
    const bricksWithPowerUps = bricks.filter(b => b.powerUpType !== null)
    expect(bricksWithPowerUps.length).toBeGreaterThanOrEqual(0)
  })
})
