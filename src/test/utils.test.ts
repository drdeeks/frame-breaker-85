import { describe, it, expect } from 'vitest'
import { clamp, lerp, distance, normalize, circleRectCollision, formatNumber, truncateAddress } from '@/src/utils/helpers'

describe('Helper Functions', () => {
  describe('clamp', () => {
    it('should clamp value between min and max', () => {
      expect(clamp(5, 0, 10)).toBe(5)
      expect(clamp(-5, 0, 10)).toBe(0)
      expect(clamp(15, 0, 10)).toBe(10)
    })
  })

  describe('lerp', () => {
    it('should interpolate between values', () => {
      expect(lerp(0, 10, 0.5)).toBe(5)
      expect(lerp(0, 10, 0)).toBe(0)
      expect(lerp(0, 10, 1)).toBe(10)
    })
  })

  describe('distance', () => {
    it('should calculate distance between points', () => {
      expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5)
      expect(distance({ x: 0, y: 0 }, { x: 0, y: 0 })).toBe(0)
    })
  })

  describe('normalize', () => {
    it('should normalize vector to unit length', () => {
      const result = normalize({ x: 3, y: 4 })
      expect(result.x).toBeCloseTo(0.6)
      expect(result.y).toBeCloseTo(0.8)
    })

    it('should handle zero vector', () => {
      const result = normalize({ x: 0, y: 0 })
      expect(result.x).toBe(0)
      expect(result.y).toBe(0)
    })
  })

  describe('circleRectCollision', () => {
    it('should detect collision', () => {
      const circle = { x: 5, y: 5, radius: 2 }
      const rect = { x: 0, y: 0, width: 10, height: 10 }
      expect(circleRectCollision(circle, rect)).toBe(true)
    })

    it('should detect no collision', () => {
      const circle = { x: 20, y: 20, radius: 2 }
      const rect = { x: 0, y: 0, width: 10, height: 10 }
      expect(circleRectCollision(circle, rect)).toBe(false)
    })
  })

  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      expect(formatNumber(1000)).toBe('1,000')
      expect(formatNumber(1234567)).toBe('1,234,567')
      expect(formatNumber(123)).toBe('123')
    })
  })

  describe('truncateAddress', () => {
    it('should truncate Ethereum address', () => {
      const address = '0x1234567890123456789012345678901234567890'
      expect(truncateAddress(address)).toBe('0x1234...7890')
    })

    it('should handle short addresses', () => {
      expect(truncateAddress('0x123')).toBe('0x123')
    })
  })
})
