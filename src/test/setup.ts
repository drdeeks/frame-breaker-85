import '@testing-library/jest-dom'

// Mock Farcaster SDK
vi.mock('@farcaster/miniapp-sdk', () => ({
  sdk: {
    actions: {
      ready: vi.fn().mockResolvedValue(undefined)
    },
    wallet: {
      getEthereumProvider: vi.fn().mockResolvedValue({
        request: vi.fn().mockResolvedValue([])
      })
    }
  }
}))

// Mock Google GenAI
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn().mockResolvedValue({
        text: JSON.stringify([[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]])
      })
    }
  })),
  Type: {
    ARRAY: 'array',
    INTEGER: 'integer'
  }
}))

// Mock canvas context
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(),
  putImageData: vi.fn(),
  createImageData: vi.fn(),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn().mockReturnValue({ width: 0 }),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
})

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn().mockImplementation((cb) => setTimeout(cb, 16))
global.cancelAnimationFrame = vi.fn()

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock as any
