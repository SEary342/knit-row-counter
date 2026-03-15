import type { SvgIconProps } from '@mui/material'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import ProgressAlert from './ProgressAlert'

vi.mock('@src/app/hooks', () => ({
  useAppDispatch: () => vi.fn(),
  useAppSelector: (selector: (state: { ui: { showStitches: boolean } }) => unknown) =>
    selector({ ui: { showStitches: true } }),
}))

// Mock the date utility so tests are deterministic
vi.mock('@src/hooks/useProjectStats', () => ({
  getXDaysFromNow: (days: number) => `MockDate+${days}d`,
}))

vi.mock('@mui/icons-material/TrendingUp', () => ({
  default: (props: SvgIconProps) => <svg data-testid="TrendingUpIcon" {...props} />,
}))

describe('ProgressAlert', () => {
  const defaultProps = {
    rowsToday: 10,
    stitchesToday: 0,
    rowsPerHour: 5.0,
    stitchesPerHour: 0,
    estimatedDays: null,
    estimatedHours: null,
    averageRowsPerDay: 0,
    lastRowMinutes: null,
    rateTrend: null,
  }

  it('renders basic progress correctly', () => {
    render(<ProgressAlert {...defaultProps} />)

    expect(screen.getByText("Today's Progress")).toBeInTheDocument()
    expect(screen.getByText(/- Rows: 10/)).toBeInTheDocument()
    expect(screen.getByText(/- Speed: 5.0 rows\/hr/)).toBeInTheDocument()

    expect(screen.queryByText(/Stitches:/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Est. completion/)).not.toBeInTheDocument()
  })

  it('renders stitches info when non-zero', () => {
    render(<ProgressAlert {...defaultProps} stitchesToday={100} stitchesPerHour={50.2} />)

    expect(screen.getByText(/\| Stitches: 100/)).toBeInTheDocument()
    expect(screen.getByText(/\| 50.2 stitches\/hr/)).toBeInTheDocument()
  })

  it('renders estimated completion with new date format', () => {
    render(
      <ProgressAlert
        {...defaultProps}
        estimatedDays={2}
        estimatedHours={5}
        averageRowsPerDay={15}
      />,
    )

    // Expected: - Est. completion: MockDate+2d (2 days) - (5 hrs at 15 rows/day)
    expect(
      screen.getByText(/- Est. completion: MockDate\+2d \(2 days\) - \(5 hrs at 15 rows\/day\)/),
    ).toBeInTheDocument()
  })

  it('handles singular units correctly in the new format', () => {
    render(
      <ProgressAlert
        {...defaultProps}
        estimatedDays={1}
        estimatedHours={1}
        averageRowsPerDay={10}
      />,
    )

    // Expected: - Est. completion: MockDate+1d (1 day) - (1 hr at 10 rows/day)
    expect(
      screen.getByText(/- Est. completion: MockDate\+1d \(1 day\) - \(1 hr at 10 rows\/day\)/),
    ).toBeInTheDocument()
  })

  it('renders rate trend icon when provided', () => {
    render(<ProgressAlert {...defaultProps} rateTrend="increasing" />)
    expect(screen.getByTestId('TrendingUpIcon')).toBeInTheDocument()
  })

  it('calls onOpenHistory when history button is clicked', () => {
    const onOpenHistory = vi.fn()
    render(<ProgressAlert {...defaultProps} onOpenHistory={onOpenHistory} />)

    const historyButton = screen.getByRole('button', { name: /view history/i })
    fireEvent.click(historyButton)
    expect(onOpenHistory).toHaveBeenCalledTimes(1)
  })
})
