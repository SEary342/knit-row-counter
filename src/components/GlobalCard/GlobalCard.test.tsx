import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAppDispatch } from '@src/app/hooks'
import {
  calculateProjectStitches,
  calculateProjectTotalRows,
  decrementRow,
  incrementRow,
} from '@src/features/projects/projectsSlice'
import type { Project } from '@src/features/projects/types'

import GlobalCard from './GlobalCard'

// Mock hooks
vi.mock('@src/app/hooks', () => ({
  useAppDispatch: vi.fn(),
}))

// Mock slice functions
vi.mock('@src/features/projects/projectsSlice', () => ({
  calculateProjectStitches: vi.fn(),
  calculateProjectTotalRows: vi.fn(),
  decrementRow: vi.fn(),
  incrementRow: vi.fn(),
}))

// Mock icons
vi.mock('@mui/icons-material/CheckCircle', () => ({
  default: () => <span data-testid="check-circle-icon" />,
}))
vi.mock('@mui/icons-material/Settings', () => ({
  default: () => <span data-testid="settings-icon" />,
}))

// Mock child components
vi.mock('@comp/CounterCard', () => ({
  default: ({
    children,
    title,
    cardActions,
  }: {
    children: React.ReactNode
    title: React.ReactNode
    cardActions: React.ReactNode
  }) => (
    <div data-testid="counter-card">
      <div data-testid="card-title">{title}</div>
      <div data-testid="card-actions">{cardActions}</div>
      {children}
    </div>
  ),
}))

vi.mock('@comp/CounterCircle', () => ({
  default: ({
    onIncrement,
    onDecrement,
    value,
    max,
    smallNote,
  }: {
    onIncrement: () => void
    onDecrement: () => void
    value: number
    max: number
    smallNote: string
  }) => (
    <div data-testid="counter-circle">
      <span data-testid="circle-value">{value}</span>
      <span data-testid="circle-max">{max}</span>
      <span data-testid="circle-note">{smallNote}</span>
      <button onClick={onIncrement} aria-label="increment">
        Inc
      </button>
      <button onClick={onDecrement} aria-label="decrement">
        Dec
      </button>
    </div>
  ),
}))

vi.mock('@comp/Fireworks', () => ({
  default: () => <div data-testid="fireworks">Fireworks</div>,
}))

vi.mock('@comp/GlobalDialog', () => ({
  default: ({ trigger, open }: { trigger: React.ReactNode; open: boolean }) => (
    <div data-testid="global-dialog">
      {trigger}
      {open && <div data-testid="dialog-content">Dialog Open</div>}
    </div>
  ),
}))

describe('GlobalCard', () => {
  const mockDispatch = vi.fn()
  const mockProject: Project = {
    id: 'p1',
    name: 'Test Project',
    currentRow: 5,
    totalRows: 10,
    sections: [],
    lastModified: 0,
    notes: '',
    patternUrl: '',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAppDispatch).mockReturnValue(mockDispatch)
    vi.mocked(calculateProjectTotalRows).mockReturnValue(10)
    vi.mocked(calculateProjectStitches).mockReturnValue(100)
    vi.mocked(incrementRow).mockReturnValue({ type: 'projects/incrementRow', payload: undefined })
    vi.mocked(decrementRow).mockReturnValue({ type: 'projects/decrementRow', payload: undefined })
  })

  it('renders correctly with basic props', () => {
    render(<GlobalCard project={mockProject} />)

    expect(screen.getByTestId('counter-card')).toBeInTheDocument()
    expect(screen.getByText('Global')).toBeInTheDocument()
    expect(screen.getByTestId('circle-value')).toHaveTextContent('5')
    expect(screen.getByTestId('circle-max')).toHaveTextContent('10')
    expect(screen.getByTestId('circle-note')).toHaveTextContent('Total Stitches: 100')
    expect(screen.queryByTestId('fireworks')).not.toBeInTheDocument()
    expect(screen.queryByTestId('check-circle-icon')).not.toBeInTheDocument()
  })

  it('dispatches increment action without payload when no sections are linked', () => {
    render(<GlobalCard project={mockProject} />)

    fireEvent.click(screen.getByLabelText('increment'))
    expect(incrementRow).toHaveBeenCalledWith(undefined)
    expect(mockDispatch).toHaveBeenCalled()
  })

  it('dispatches decrement action without payload when no sections are linked', () => {
    render(<GlobalCard project={mockProject} />)

    fireEvent.click(screen.getByLabelText('decrement'))
    expect(decrementRow).toHaveBeenCalledWith(undefined)
    expect(mockDispatch).toHaveBeenCalled()
  })

  it('dispatches actions with linked section IDs when sections are linked', () => {
    const linkedProject = {
      ...mockProject,
      sections: [
        { id: 's1', linked: true },
        { id: 's2', linked: false },
        { id: 's3', linked: true },
      ] as unknown as Project['sections'],
    }

    render(<GlobalCard project={linkedProject} />)

    fireEvent.click(screen.getByLabelText('increment'))
    expect(incrementRow).toHaveBeenCalledWith('s1|s3')

    fireEvent.click(screen.getByLabelText('decrement'))
    expect(decrementRow).toHaveBeenCalledWith('s1|s3')
  })

  it('shows fireworks and checkmark when finished', () => {
    const finishedProject = { ...mockProject, currentRow: 10, totalRows: 10 }
    vi.mocked(calculateProjectTotalRows).mockReturnValue(10)

    render(<GlobalCard project={finishedProject} />)

    expect(screen.getByTestId('fireworks')).toBeInTheDocument()
    expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument()
  })

  it('opens settings dialog when trigger is clicked', () => {
    render(<GlobalCard project={mockProject} />)

    expect(screen.queryByTestId('dialog-content')).not.toBeInTheDocument()

    const settingsBtn = screen.getByLabelText('global settings')
    fireEvent.click(settingsBtn)

    expect(screen.getByTestId('dialog-content')).toBeInTheDocument()
  })

  it('uses calculated total rows if project total rows is not set', () => {
    const projectNoTotal = { ...mockProject, totalRows: null }
    vi.mocked(calculateProjectTotalRows).mockReturnValue(50)

    render(<GlobalCard project={projectNoTotal as unknown as Project} />)
    expect(screen.getByTestId('circle-max')).toHaveTextContent('50')
  })

  it('passes null max if no total rows available', () => {
    const projectNoTotal = { ...mockProject, totalRows: null }
    vi.mocked(calculateProjectTotalRows).mockReturnValue(0)

    render(<GlobalCard project={projectNoTotal as unknown as Project} />)
    expect(screen.getByTestId('circle-max')).toBeEmptyDOMElement()
  })
})
