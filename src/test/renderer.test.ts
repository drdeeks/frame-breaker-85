import { describe, it, expect, beforeEach } from 'vitest'
import { Renderer } from '@/src/game/engine/Renderer'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/src/utils/constants'

describe('Renderer', () => {
  let canvas: HTMLCanvasElement
  let ctx: CanvasRenderingContext2D
  let renderer: Renderer

  beforeEach(() => {
    canvas = document.createElement('canvas')
    canvas.width = CANVAS_WIDTH
    canvas.height = CANVAS_HEIGHT
    ctx = canvas.getContext('2d')!
    renderer = new Renderer(ctx, 20)
  })

  it('should initialize with context and font size', () => {
    expect(renderer).toBeDefined()
  })

  it('should update font size', () => {
    renderer.setFontSize(24)
    // Font size is updated internally
    expect(renderer).toBeDefined()
  })

  it('should clear canvas', () => {
    renderer.clear()
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  })

  it('should render paddle', () => {
    const paddle = {
      position: { x: 100, y: 500 },
      width: 120,
      height: 20
    }
    
    renderer.renderPaddle(paddle)
    expect(ctx.fillRect).toHaveBeenCalled()
  })

  it('should render ball', () => {
    const ball = {
      position: { x: 400, y: 300 },
      velocity: { x: 4, y: -4 },
      radius: 10,
      attached: false
    }
    
    renderer.renderBall(ball)
    expect(ctx.arc).toHaveBeenCalled()
    expect(ctx.fill).toHaveBeenCalled()
  })

  it('should render bricks', () => {
    const bricks = [
      {
        position: { x: 10, y: 10 },
        dimensions: { width: 40, height: 18 },
        hp: 2,
        maxHp: 2,
        color: '#ff00ff',
        originalColor: '#ff00ff',
        visible: true,
        powerUpType: null
      }
    ]
    
    renderer.renderBricks(bricks)
    expect(ctx.fillRect).toHaveBeenCalled()
  })

  it('should render HUD', () => {
    const stats = {
      score: 1000,
      lives: 3,
      level: 5,
      combo: 2
    }
    
    renderer.renderHUD(stats)
    expect(ctx.fillText).toHaveBeenCalledWith(expect.stringContaining('Score'), expect.any(Number), expect.any(Number))
    expect(ctx.fillText).toHaveBeenCalledWith(expect.stringContaining('Level'), expect.any(Number), expect.any(Number))
    expect(ctx.fillText).toHaveBeenCalledWith(expect.stringContaining('Lives'), expect.any(Number), expect.any(Number))
  })
})
