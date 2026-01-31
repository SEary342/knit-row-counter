import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import Fireworks from './Fireworks'

describe('Fireworks', () => {
  let contextMock: Partial<CanvasRenderingContext2D> & {
    globalCompositeOperation?: string
    fillStyle?: string
    fillRect?: (...args: unknown[]) => void
    beginPath?: (...args: unknown[]) => void
    arc?: (...args: unknown[]) => void
    fill?: (...args: unknown[]) => void
  }

  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      return setTimeout(cb, 16) as unknown as number
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
      clearTimeout(id)
    })
    contextMock = {
      globalCompositeOperation: 'source-over',
      fillStyle: '#000',
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
    }
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      contextMock as CanvasRenderingContext2D,
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

    // Mock parent element dimensions
    Object.defineProperty(canvas.parentElement, 'clientWidth', { value: 500, configurable: true })
    Object.defineProperty(canvas.parentElement, 'clientHeight', { value: 300, configurable: true })

    act(() => {
      window.dispatchEvent(new Event('resize'))
    })

    expect(canvas.width).toBe(500)
    expect(canvas.height).toBe(300)
  })

  it('cleans up on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
    const { unmount } = render(<Fireworks />)

    unmount()

    expect(window.cancelAnimationFrame).toHaveBeenCalled()
    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
  })

  it('creates explosions and draws particles', () => {
    // Mock Math.random to ensure explosion triggers (value < 0.05)
    vi.spyOn(Math, 'random').mockReturnValue(0.01)

    render(<Fireworks />)

    // Advance time to allow animation frame to run
    act(() => {
      vi.advanceTimersByTime(50)
    })

    // Check if canvas was cleared (trail effect)
    expect(contextMock.fillRect).toHaveBeenCalled()

    // Check if particles were drawn
    expect(contextMock.beginPath).toHaveBeenCalled()
    expect(contextMock.arc).toHaveBeenCalled()
    expect(contextMock.fill).toHaveBeenCalled()
  })
})
