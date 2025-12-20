import { render, screen } from '@testing-library/react'
import ProgressAlert from './ProgressAlert'

describe('ProgressAlert', () => {
  const defaultProps = {
    rowsToday: 10,
    stitchesToday: 0,
    rowsPerHour: 5.0,
    stitchesPerHour: 0,
    estimatedDays: null,
    estimatedHours: null,
  }

  it('renders basic progress correctly', () => {
    render(<ProgressAlert {...defaultProps} />)

    expect(screen.getByText("Today's Progress")).toBeInTheDocument()
    expect(screen.getByText(/- Rows: 10/)).toBeInTheDocument()
    expect(screen.getByText(/- Speed: 5.0 rows\/hr/)).toBeInTheDocument()

    // Should not show stitches info if 0
    expect(screen.queryByText(/Stitches:/)).not.toBeInTheDocument()
    expect(screen.queryByText(/stitches\/hr/)).not.toBeInTheDocument()
    // Should not show estimation if null
    expect(screen.queryByText(/Est. completion/)).not.toBeInTheDocument()
  })

  it('renders stitches info when non-zero', () => {
    render(<ProgressAlert {...defaultProps} stitchesToday={100} stitchesPerHour={50.2} />)

    expect(screen.getByText(/\| Stitches: 100/)).toBeInTheDocument()
    expect(screen.getByText(/\| 50.2 stitches\/hr/)).toBeInTheDocument()
  })

  it('renders estimated completion when provided', () => {
    render(<ProgressAlert {...defaultProps} estimatedDays={2} estimatedHours={5} />)

    expect(
      screen.getByText(/- Est. completion: 2 days \(5 hrs at current speed\)/),
    ).toBeInTheDocument()
  })

  it('handles singular units correctly for estimation', () => {
    render(<ProgressAlert {...defaultProps} estimatedDays={1} estimatedHours={1} />)

    expect(
      screen.getByText(/- Est. completion: 1 day \(1 hr at current speed\)/),
    ).toBeInTheDocument()
  })
})
