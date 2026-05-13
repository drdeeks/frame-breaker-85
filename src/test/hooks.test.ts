import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGameState } from '@/src/hooks/useGameState'

describe('useGameState Hook', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useGameState())
    
    expect(result.current.state).toBe('start')
    expect(result.current.stats).toEqual({
      score: 0,
      lives: 3,
      level: 1,
      combo: 0
    })
  })

  it('should transition between states', () => {
    const { result } = renderHook(() => useGameState())
    
    act(() => {
      result.current.transition('playing')
    })
    
    expect(result.current.state).toBe('playing')
  })

  it('should increment score and combo', () => {
    const { result } = renderHook(() => useGameState())
    
    act(() => {
      result.current.incrementScore(100)
    })
    
    expect(result.current.stats.score).toBe(100)
    expect(result.current.stats.combo).toBe(1)
  })

  it('should decrement lives and reset combo', () => {
    const { result } = renderHook(() => useGameState())
    
    act(() => {
      const gameOver = result.current.decrementLives()
      expect(gameOver).toBe(false)
    })
    
    expect(result.current.stats.lives).toBe(2)
    expect(result.current.stats.combo).toBe(0)
  })

  it('should return game over when lives reach zero', () => {
    const { result } = renderHook(() => useGameState())
    
    act(() => {
      result.current.decrementLives() // 2 lives
      result.current.decrementLives() // 1 life
      result.current.decrementLives() // 0 lives
    })
    
    expect(result.current.stats.lives).toBe(0)
  })

  it('should increment level', () => {
    const { result } = renderHook(() => useGameState())
    
    act(() => {
      result.current.nextLevel()
    })
    
    expect(result.current.stats.level).toBe(2)
  })

  it('should reset stats', () => {
    const { result } = renderHook(() => useGameState())
    
    act(() => {
      result.current.incrementScore(500)
      result.current.nextLevel()
      result.current.resetStats()
    })
    
    expect(result.current.stats).toEqual({
      score: 0,
      lives: 3,
      level: 1,
      combo: 0
    })
  })
})
