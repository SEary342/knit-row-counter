import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAppDispatch, useAppSelector } from '@src/app/hooks'
import { decrementRow, incrementRow, moveSection } from '@src/features/projects/projectsSlice'
import type { SectionConfig } from '@src/features/projects/types'

import SectionCard from './SectionCard'

// Mock hooks
vi.mock('@src/app/hooks', () => ({
  useAppDispatch: vi.fn(),
  useAppSelector: vi.fn(),
}))

// Mock child components
vi.mock('@comp/CounterCard', () => ({
  default: ({
    title,
    cardActions,
    footerContent,
    children,
  }: {
    title: React.ReactNode
    cardActions: React.ReactNode
    footerContent: React.ReactNode
    children: React.ReactNode
  }) => (
    <div data-testid="counter-card">
      <div data-testid="card-title">{title}</div>
      <div data-testid="card-actions">{cardActions}</div>
      <div data-testid="card-footer">{footerContent}</div>
      {children}
    </div>
  ),
}))

vi.mock('@comp/CounterCircle', () => ({
  default: ({
    value,
    max,
    onIncrement,
    onDecrement,
    size,
    smallNote,
    color,
    disabled,
  }: {
    value: number
    max: number
    onIncrement: () => void
    onDecrement: () => void
    size: number
    smallNote: string
    color: string
    disabled: boolean
  }) => (
    <div data-testid="counter-circle">
      <span data-testid="circle-value">{value}</span>
      <span data-testid="circle-max">{max}</span>
      <span data-testid="circle-size">{size}</span>
      <span data-testid="circle-note">{smallNote}</span>
      <span data-testid="circle-color">{color}</span>
      <span data-testid="circle-disabled">{disabled ? 'true' : 'false'}</span>
      <button aria-label="increment" onClick={onIncrement}>
        +
      </button>
      <button aria-label="decrement" onClick={onDecrement}>
        -
      </button>
    </div>
  ),
}))

vi.mock('@comp/SectionDialog', () => ({
  default: ({ open, trigger }: { open: boolean; trigger?: React.ReactNode }) => (
    <div>
      {trigger}
      {open ? <div data-testid="section-dialog" /> : null}
    </div>
  ),
}))

// Mock icons
vi.mock('@mui/icons-material/CheckCircle', () => ({
  default: () => <span data-testid="check-circle-icon" />,
}))

describe('SectionCard', () => {
  const mockDispatch = vi.fn()
  const mockSection: SectionConfig = {
    id: 's1',
    name: 'Test Section',
    currentRow: 5,
    repeatRows: 10,
    repeatCount: 0,
    totalRepeats: 2,
    linked: false,
    locked: false,
    pattern: [],
    stitchCount: 0,
  }

  const mockProject = {
    id: 'p1',
    name: 'Project',
    sections: [mockSection, { ...mockSection, id: 's2' }],
    currentProjectId: 'p1',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAppDispatch).mockReturnValue(mockDispatch)
    vi.mocked(useAppSelector).mockReturnValue(mockProject)
  })

  it('renders section name and counter values', () => {
    render(<SectionCard section={mockSection} />)
    expect(screen.getByTestId('card-title')).toHaveTextContent('Test Section')
    expect(screen.getByTestId('circle-value')).toHaveTextContent('5')
    expect(screen.getByTestId('circle-max')).toHaveTextContent('10')
  })

  it('dispatches increment action', () => {
    render(<SectionCard section={mockSection} />)
    fireEvent.click(screen.getByLabelText('increment'))
    expect(mockDispatch).toHaveBeenCalledWith(incrementRow('s1'))
  })

  it('dispatches decrement action', () => {
    render(<SectionCard section={mockSection} />)
    fireEvent.click(screen.getByLabelText('decrement'))
    expect(mockDispatch).toHaveBeenCalledWith(decrementRow('s1'))
  })

  it('opens settings dialog when settings button is clicked', () => {
    render(<SectionCard section={mockSection} />)
    const settingsButton = screen.getByRole('button', { name: /Section Settings/i })
    fireEvent.click(settingsButton)
    expect(screen.getByTestId('section-dialog')).toBeInTheDocument()
  })

  describe('Move Actions', () => {
    it('renders move buttons when sort is not forced', () => {
      render(<SectionCard section={mockSection} />)
      expect(screen.getByLabelText('Move Left')).toBeInTheDocument()
      expect(screen.getByLabelText('Move Right')).toBeInTheDocument()
    })

    it('disables Move Left for the first section', () => {
      render(<SectionCard section={mockSection} />)
      const moveLeftBtn = within(screen.getByLabelText('Move Left')).getByRole('button')
      expect(moveLeftBtn).toBeDisabled()
    })

    it('enables Move Right for the first section (if more exist)', () => {
      render(<SectionCard section={mockSection} />)
      const moveRightBtn = within(screen.getByLabelText('Move Right')).getByRole('button')
      expect(moveRightBtn).not.toBeDisabled()
    })

    it('dispatches moveSection down when Move Right is clicked', () => {
      render(<SectionCard section={mockSection} />)
      const moveRightBtn = within(screen.getByLabelText('Move Right')).getByRole('button')
      fireEvent.click(moveRightBtn)
      expect(mockDispatch).toHaveBeenCalledWith(moveSection({ sectionId: 's1', direction: 'down' }))
    })

    it('dispatches moveSection up when Move Left is clicked', () => {
      // Use the second section to test moving up/left
      const secondSection = { ...mockSection, id: 's2' }
      render(<SectionCard section={secondSection} />)

      const moveLeftBtn = within(screen.getByLabelText('Move Left')).getByRole('button')
      expect(moveLeftBtn).not.toBeDisabled()
      fireEvent.click(moveLeftBtn)
      expect(mockDispatch).toHaveBeenCalledWith(moveSection({ sectionId: 's2', direction: 'up' }))
    })

    it('does not render move buttons when sort is forced', () => {
      render(<SectionCard section={mockSection} isSortForced={true} />)
      expect(screen.queryByLabelText('Move Left')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Move Right')).not.toBeInTheDocument()
    })
  })

  describe('Display Logic', () => {
    it('passes correct size to CounterCircle based on displaySize prop', () => {
      const { rerender } = render(<SectionCard section={mockSection} displaySize="small" />)
      expect(screen.getByTestId('circle-size')).toHaveTextContent('140')

      rerender(<SectionCard section={mockSection} displaySize="medium" />)
      expect(screen.getByTestId('circle-size')).toHaveTextContent('180')

      rerender(<SectionCard section={mockSection} displaySize="large" />)
      expect(screen.getByTestId('circle-size')).toHaveTextContent('220')
    })

    it('shows pattern instruction if available', () => {
      const sectionWithPattern = {
        ...mockSection,
        pattern: [{ instruction: 'Knit 1', stitches: 5 }],
        currentRow: 0,
      }
      render(<SectionCard section={sectionWithPattern} />)
      expect(screen.getByTestId('card-footer')).toHaveTextContent('Knit 1 (5)')
    })

    it('handles pattern instruction without stitches', () => {
      const sectionWithPattern = {
        ...mockSection,
        pattern: [{ instruction: 'Purl 1', stitches: null }],
        currentRow: 0,
      }
      render(<SectionCard section={sectionWithPattern} />)
      expect(screen.getByTestId('card-footer')).toHaveTextContent('Purl 1')
      expect(screen.getByTestId('card-footer')).not.toHaveTextContent('()')
    })

    it('does not show pattern if repeatRows is not set', () => {
      const sectionNoRepeats = {
        ...mockSection,
        repeatRows: null,
        pattern: [{ instruction: 'Knit 1', stitches: 5 }],
      }
      render(<SectionCard section={sectionNoRepeats} />)
      expect(screen.getByTestId('card-footer')).toHaveTextContent('')
    })
  })

  describe('Completion and Repeats Logic', () => {
    it('shows "Section Complete!" when finished', () => {
      const finishedSection = {
        ...mockSection,
        repeatCount: 2,
        totalRepeats: 2,
      }
      render(<SectionCard section={finishedSection} />)

      expect(screen.getByTestId('circle-note')).toHaveTextContent('Section Complete!')
      expect(screen.getByTestId('circle-color')).toHaveTextContent('success')
      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument()
    })

    it('shows repeat progress when total repeats is set', () => {
      const section = {
        ...mockSection,
        repeatCount: 1,
        totalRepeats: 5,
      }
      render(<SectionCard section={section} />)
      expect(screen.getByTestId('circle-note')).toHaveTextContent('Repeats: 1 / 5')
    })

    it('shows simple repeat count when total repeats is not set', () => {
      const section = {
        ...mockSection,
        repeatCount: 3,
        totalRepeats: null,
      }
      render(<SectionCard section={section} />)
      expect(screen.getByTestId('circle-note')).toHaveTextContent('Repeats: 3')
    })

    it('shows soft increment for repeat count when on last row of repeat', () => {
      const section = {
        ...mockSection,
        repeatRows: 10,
        currentRow: 10,
        repeatCount: 1,
        totalRepeats: 5,
      }
      render(<SectionCard section={section} />)
      // Should show 2 instead of 1 because we are at the end of the repeat
      expect(screen.getByTestId('circle-note')).toHaveTextContent('Repeats: 2 / 5')
    })
  })

  describe('State Props', () => {
    it('passes disabled prop to CounterCircle when locked', () => {
      const lockedSection = { ...mockSection, locked: true }
      render(<SectionCard section={lockedSection} />)
      expect(screen.getByTestId('circle-disabled')).toHaveTextContent('true')
    })

    it('passes secondary color when linked', () => {
      const linkedSection = { ...mockSection, linked: true }
      render(<SectionCard section={linkedSection} />)
      expect(screen.getByTestId('circle-color')).toHaveTextContent('secondary')
    })
  })
})
