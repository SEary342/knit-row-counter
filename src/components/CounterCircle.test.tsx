import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import CounterCircle from './CounterCircle'

describe('CounterCircle', () => {
  const mockOnIncrement = vi.fn()
  const mockOnDecrement = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the basic counter with value', () => {
    render(<CounterCircle value={5} onIncrement={mockOnIncrement} onDecrement={mockOnDecrement} />)
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByLabelText('increment')).toBeInTheDocument()
    expect(screen.getByLabelText('decrement')).toBeInTheDocument()
  })

  it('calls onIncrement when the add button is clicked', async () => {
    const user = userEvent.setup()
    render(<CounterCircle value={5} onIncrement={mockOnIncrement} onDecrement={mockOnDecrement} />)
    await user.click(screen.getByLabelText('increment'))
    expect(mockOnIncrement).toHaveBeenCalledTimes(1)
  })

  it('calls onDecrement when the remove button is clicked', async () => {
    const user = userEvent.setup()
    render(<CounterCircle value={5} onIncrement={mockOnIncrement} onDecrement={mockOnDecrement} />)
    await user.click(screen.getByLabelText('decrement'))
    expect(mockOnDecrement).toHaveBeenCalledTimes(1)
  })

  it('displays the label when provided', () => {
    render(
      <CounterCircle
        label="Test Label"
        value={5}
        onIncrement={mockOnIncrement}
        onDecrement={mockOnDecrement}
      />,
    )
    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('displays the fraction when showFraction is true and max is provided', () => {
    render(
      <CounterCircle
        value={5}
        max={10}
        showFraction={true}
        onIncrement={mockOnIncrement}
        onDecrement={mockOnDecrement}
      />,
    )
    expect(screen.getByText('5 / 10')).toBeInTheDocument()
  })

  it('does not display the fraction when showFraction is false', () => {
    render(
      <CounterCircle
        value={5}
        max={10}
        showFraction={false}
        onIncrement={mockOnIncrement}
        onDecrement={mockOnDecrement}
      />,
    )
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.queryByText('/ 10')).not.toBeInTheDocument()
  })

  it('displays the percentage when max is provided and greater than 0', () => {
    render(
      <CounterCircle
        value={3}
        max={10}
        onIncrement={mockOnIncrement}
        onDecrement={mockOnDecrement}
      />,
    )
    expect(screen.getByText('30% complete')).toBeInTheDocument()
  })

  it('caps the percentage at 100% when value exceeds max', () => {
    render(
      <CounterCircle
        value={12}
        max={10}
        onIncrement={mockOnIncrement}
        onDecrement={mockOnDecrement}
      />,
    )
    expect(screen.getByText('100% complete')).toBeInTheDocument()
  })

  it('does not display percentage when max is null or 0', () => {
    const { rerender } = render(
      <CounterCircle
        value={5}
        max={null}
        onIncrement={mockOnIncrement}
        onDecrement={mockOnDecrement}
      />,
    )
    expect(screen.queryByText(/% complete/)).not.toBeInTheDocument()

    rerender(
      <CounterCircle
        value={5}
        max={0}
        onIncrement={mockOnIncrement}
        onDecrement={mockOnDecrement}
      />,
    )
    expect(screen.queryByText(/% complete/)).not.toBeInTheDocument()
  })

  it('displays the smallNote when provided', () => {
    render(
      <CounterCircle
        value={5}
        smallNote="Test Note"
        onIncrement={mockOnIncrement}
        onDecrement={mockOnDecrement}
      />,
    )
    expect(screen.getByText('Test Note')).toBeInTheDocument()
  })
})
