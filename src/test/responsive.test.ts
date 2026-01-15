import { describe, it, expect } from 'vitest'
import { getResponsiveFontSize, getResponsiveSpacing, getCanvasDimensions, screenToCanvas } from '@/src/utils/responsive'

describe('Responsive Utils', () => {
  describe('getResponsiveFontSize', () => {
    it('should scale font size based on viewport', () => {
      const viewport = { width: 400, height: 300 }
      const result = getResponsiveFontSize(20, viewport)
      expect(result).toBeGreaterThanOrEqual(12) // minSize
      expect(result).toBeLessThanOrEqual(24) // maxSize
    })

    it('should clamp to minimum size', () => {
      const viewport = { width: 100, height: 100 }
      const result = getResponsiveFontSize(20, viewport)
      expect(result).toBe(12) // 20 * 0.6
    })
  })

  describe('getResponsiveSpacing', () => {
    it('should scale spacing based on viewport', () => {
      const viewport = { width: 800, height: 600 }
      const result = getResponsiveSpacing(10, viewport)
      expect(result).toBe(10)
    })
  })

  describe('getCanvasDimensions', () => {
    it('should calculate canvas dimensions for mobile', () => {
      const viewport = { width: 400, height: 600, scale: 0.5, isMobile: true, isPortrait: true }
      const result = getCanvasDimensions(viewport)
      expect(result.width).toBeLessThan(400)
      expect(result.height).toBeLessThan(600)
    })

    it('should calculate canvas dimensions for desktop', () => {
      const viewport = { width: 1200, height: 800, scale: 1, isMobile: false, isPortrait: false }
      const result = getCanvasDimensions(viewport)
      expect(result.width).toBeLessThanOrEqual(800)
      expect(result.height).toBeLessThanOrEqual(600)
    })
  })

  describe('screenToCanvas', () => {
    it('should convert screen coordinates to canvas coordinates', () => {
      const rect = { left: 0, top: 0, width: 400, height: 300 } as DOMRect
      const result = screenToCanvas(200, 150, rect)
      expect(result.x).toBe(400) // 200 * (800/400)
      expect(result.y).toBe(300) // 150 * (600/300)
    })
  })
})
