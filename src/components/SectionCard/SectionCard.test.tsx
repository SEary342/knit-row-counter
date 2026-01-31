import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAppDispatch, useAppSelector } from '@src/app/hooks'
import { decrementRow, incrementRow, moveSection } from '@src/features/projects/projectsSlice'

import SectionCard from './SectionCard'

vi.mock('@src/app/hooks', () => ({
  useAppDispatch: vi.fn(),
  useAppSelector: vi.fn(),
}))

// Mock child components to simplify test
vi.mock('@comp/SectionDialog', () => ({
  default: ({ open, trigger }: { open: boolean; trigger?: React.ReactNode }) => (
    <div>
      {trigger}
      {open ? <div data-testid="section-dialog" /> : null}
    </div>
  ),
}))

describe('SectionCard', () => {
  const mockDispatch = vi.fn()
  const mockSection = {
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

  it('renders section name and counter', () => {
    render(<SectionCard section={mockSection} />)
    expect(screen.getByText('Test Section')).toBeInTheDocument()
    expect(screen.getByText('5 / 10')).toBeInTheDocument()
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
    const settingsButton = screen.getByRole('button', { name: /settings/i })
    fireEvent.click(settingsButton)
    expect(screen.getByTestId('section-dialog')).toBeInTheDocument()
  })

  it('handles move section actions', () => {
    render(<SectionCard section={mockSection} />)

    // Move Right (Down)
    const moveRightButton = within(screen.getByLabelText('Move Right')).getByRole('button')
    fireEvent.click(moveRightButton)
    expect(mockDispatch).toHaveBeenCalledWith(moveSection({ sectionId: 's1', direction: 'down' }))
  })
})
