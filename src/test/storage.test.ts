import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LeaderboardService } from '@/src/services/storage/LeaderboardService'

describe('LeaderboardService', () => {
  let service: LeaderboardService

  beforeEach(() => {
    service = new LeaderboardService()
    vi.clearAllMocks()
  })

  it('should save score to leaderboard', async () => {
    const entry = { name: 'ABC', score: 1000, timestamp: Date.now() }
    
    await service.saveScore(entry)
    
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'frameBreakerLeaderboard',
      expect.stringContaining('ABC')
    )
  })

  it('should get top scores', async () => {
    const mockScores = [
      { name: 'ABC', score: 1000 },
      { name: 'DEF', score: 800 }
    ]
    
    vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockScores))
    
    const scores = await service.getTopScores(10)
    
    expect(scores).toEqual(mockScores)
    expect(localStorage.getItem).toHaveBeenCalledWith('frameBreakerLeaderboard')
  })

  it('should return empty array when no scores exist', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null)
    
    const scores = await service.getTopScores(10)
    
    expect(scores).toEqual([])
  })

  it('should clear all scores', async () => {
    await service.clearScores()
    
    expect(localStorage.removeItem).toHaveBeenCalledWith('frameBreakerLeaderboard')
  })

  it('should check if score is high score', async () => {
    const mockScores = Array.from({ length: 10 }, (_, i) => ({
      name: 'ABC',
      score: 1000 - i * 100
    }))
    
    vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockScores))
    
    const isHigh = await service.isHighScore(500)
    expect(isHigh).toBe(true)
    
    const isNotHigh = await service.isHighScore(50)
    expect(isNotHigh).toBe(false)
  })
})
