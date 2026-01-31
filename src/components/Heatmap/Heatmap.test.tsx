import { useMediaQuery } from '@mui/material'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import Heatmap, { calculateMaxDaysForWidth, formatLocalDate } from './Heatmap'

// Mock useMediaQuery to control mobile/desktop view in tests
vi.mock('@mui/material', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mui/material')>()
  return {
    ...actual,
    useMediaQuery: vi.fn(),
  }
})

describe('Heatmap Utils', () => {
  it('formatLocalDate formats date correctly as YYYY-MM-DD', () => {
    const date = new Date(2023, 9, 5) // Oct 5, 2023 (Month is 0-indexed)
    expect(formatLocalDate(date)).toBe('2023-10-05')
  })

  it('calculateMaxDaysForWidth returns correct days based on width', () => {
    // Logic: (width - 91) / 16 = weeks. days = weeks * 7. Min 7.

    // Width 200: (200 - 91) / 16 = 6.81 -> 6 weeks -> 42 days
    expect(calculateMaxDaysForWidth(200)).toBe(42)

    // Width 100: (100 - 91) / 16 = 0.56 -> 0 weeks -> min 7 days
    expect(calculateMaxDaysForWidth(100)).toBe(7)
  })
})

describe('Heatmap Component', () => {
  const mockDate = new Date('2023-12-31T12:00:00')

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(mockDate)
    // Default to desktop (false)
    vi.mocked(useMediaQuery).mockReturnValue(false)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.resetAllMocks()
  })

  const mockData = [
    { date: '2023-12-31', count: 10 },
    { date: '2023-12-30', count: 5 },
  ]

  it('renders title and day labels', () => {
    render(<Heatmap data={mockData} title="Activity" verb="contributions" />)
    expect(screen.getByText('Activity')).toBeInTheDocument()
    expect(screen.getByText('Mon')).toBeInTheDocument()
    expect(screen.getByText('Wed')).toBeInTheDocument()
    expect(screen.getByText('Fri')).toBeInTheDocument()
  })

  it('renders correct number of cells for desktop default (365 days)', () => {
    render(<Heatmap data={mockData} title="Activity" verb="contributions" />)
    // Should show month labels for the past year
    expect(screen.getByText('Dec')).toBeInTheDocument()
    // Jan is hidden because it's too close to the start (Feb is at index 4)
    expect(screen.getByText('Feb')).toBeInTheDocument()
  })

  it('renders correct number of cells for mobile default (90 days)', () => {
    vi.mocked(useMediaQuery).mockReturnValue(true)
    render(<Heatmap data={mockData} title="Activity" verb="contributions" />)
    // 90 days back from Dec 31 is roughly Oct
    expect(screen.getByText('Dec')).toBeInTheDocument()
    expect(screen.getByText('Nov')).toBeInTheDocument()
    // Jan should not be visible in a 90 day window ending in Dec
    expect(screen.queryByText('Jan')).not.toBeInTheDocument()
  })

  it('displays tooltip on hover', () => {
    render(<Heatmap data={mockData} title="Activity" verb="contributions" maxDays={14} />)

    const cell = screen.getByTestId('heatmap-cell-2023-12-31')
    fireEvent.mouseOver(cell)

    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(screen.getByText('10 contributions on 2023-12-31')).toBeInTheDocument()
  })

  it('renders children content', () => {
    render(
      <Heatmap data={[]} title="With Children" verb="items">
        <button>Extra Action</button>
      </Heatmap>,
    )
    expect(screen.getByText('Extra Action')).toBeInTheDocument()
  })
})
