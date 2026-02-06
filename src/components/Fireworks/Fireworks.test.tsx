import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import Fireworks from './Fireworks'

describe('Fireworks', () => {
  // Define a type that maps the keys we care about to Vitest Mocks
  type ContextMock = {
    [K in keyof CanvasRenderingContext2D]?: CanvasRenderingContext2D[K] & {
      mock: { calls: unknown[][] }
    }
  } & {
    globalCompositeOperation: string
    fillStyle: string | CanvasGradient | CanvasPattern
  }

  let contextMock: ContextMock

  beforeEach(() => {
    vi.useFakeTimers()

    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      return setTimeout(() => cb(performance.now()), 16) as unknown as number
    })

    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
      clearTimeout(id as unknown as number)
    })

    contextMock = {
      globalCompositeOperation: 'source-over',
      fillStyle: '#000',
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      clearRect: vi.fn(),
    } as unknown as ContextMock

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      contextMock as unknown as CanvasRenderingContext2D,
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('renders a canvas element with correct styles', () => {
    const { container } = render(<Fireworks />)
    const canvas = container.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
    expect(canvas).toHaveStyle({
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: '1',
    })
  })

  it('initializes canvas context and starts animation loop', () => {
    render(<Fireworks />)
    expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledWith('2d')
    expect(window.requestAnimationFrame).toHaveBeenCalled()
  })

  it('handles resize events', () => {
    const { container } = render(<Fireworks />)
    const canvas = container.querySelector('canvas') as HTMLCanvasElement
    const parent = canvas.parentElement

    if (parent) {
      Object.defineProperty(parent, 'clientWidth', { value: 500, configurable: true })
      Object.defineProperty(parent, 'clientHeight', { value: 300, configurable: true })
    }

    act(() => {
      window.dispatchEvent(new Event('resize'))
    })

    expect(canvas.width).toBe(500)
    expect(canvas.height).toBe(300)
  })

  it('cleans up on unmount and clears canvas', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
    const { unmount } = render(<Fireworks />)

    unmount()

    expect(window.cancelAnimationFrame).toHaveBeenCalled()
    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    expect(contextMock.clearRect).toHaveBeenCalled()
  })

  it('creates explosions and draws particles', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01)

    render(<Fireworks />)

    act(() => {
      vi.advanceTimersByTime(50)
    })

    expect(contextMock.fillRect).toHaveBeenCalled()
    expect(contextMock.beginPath).toHaveBeenCalled()
    expect(contextMock.arc).toHaveBeenCalled()
    expect(contextMock.fill).toHaveBeenCalled()
  })

  it('finishes animation before clearing', () => {
    const duration = 500
    render(<Fireworks duration={duration} />)

    // Advance past duration, but particles still have alpha > 0
    act(() => {
      vi.advanceTimersByTime(600)
    })

    // Should still be animating if particles are alive
    expect(contextMock.clearRect).not.toHaveBeenCalled()

    // Advance enough for alpha to hit 0 (approx 1 second)
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(contextMock.clearRect).toHaveBeenCalled()
  })
})
