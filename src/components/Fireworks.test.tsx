import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import Fireworks from './Fireworks'

describe('Fireworks', () => {
  beforeEach(() => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      return setTimeout(cb, 0) as unknown as number
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
      clearTimeout(id)
    })
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      globalCompositeOperation: '',
      fillStyle: '',
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
    } as any)
  })

  afterEach(() => {
    vi.restoreAllMocks()
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
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    render(<Fireworks />)
    expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
  })

  it('cleans up on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
    const { unmount } = render(<Fireworks />)

    unmount()

    expect(window.cancelAnimationFrame).toHaveBeenCalled()
    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
  })
})
