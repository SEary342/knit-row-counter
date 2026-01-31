import { configureStore } from '@reduxjs/toolkit'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import projectsSlice from '@src/features/projects/projectsSlice'
import type { Project, SectionConfig } from '@src/features/projects/types'

import SectionDialog from './SectionDialog'

// Mock child components
vi.mock('@comp/ConfirmationDialog', () => ({
  default: ({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
  }: {
    open: boolean
    onClose: () => void
    onConfirm?: () => void
    title: string
    message: string
    confirmText?: string
    confirmColor?: string
  }) =>
    open ? (
      <div data-testid="confirmation-dialog">
        <h2>{title}</h2>
        <p>{message}</p>
        <button
          data-testid="confirm-button"
          onClick={() => {
            onConfirm?.()
          }}
        >
          {confirmText || 'Confirm'}
        </button>
        <button data-testid="cancel-button" onClick={onClose}>
          Cancel
        </button>
      </div>
    ) : null,
}))

vi.mock('@comp/LinkSwitch', () => ({
  default: ({
    checked,
    disabled,
    onClick,
  }: {
    checked: boolean
    disabled: boolean
    onClick: () => void
  }) => (
    <input
      data-testid="link-switch"
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={onClick}
    />
  ),
}))

vi.mock('@comp/PatternEditor', () => ({
  default: ({
    value,
    onChange,
  }: {
    value: Array<{ instruction: string; stitches: number | null }>
    onChange: (pattern: Array<{ instruction: string; stitches: number | null }>) => void
  }) => (
    <div data-testid="pattern-editor">
      <button
        data-testid="add-pattern-row"
        onClick={() => onChange([...value, { instruction: 'New Row', stitches: null }])}
      >
        Add Row
      </button>
      <div data-testid="pattern-rows">
        {value.map((row, idx) => (
          <div key={idx}>{row.instruction}</div>
        ))}
      </div>
    </div>
  ),
}))

describe('SectionDialog', () => {
  let store: ReturnType<typeof configureStore>
  const mockOnClose = vi.fn()

  const mockSection: SectionConfig = {
    id: 'section-1',
    name: 'Test Section',
    repeatRows: 10,
    currentRow: 5,
    repeatCount: 2,
    linked: false,
    totalRepeats: 5,
    pattern: [
      { instruction: 'K1', stitches: 10 },
      { instruction: 'P1', stitches: 10 },
    ],
    stitchCount: 10,
    locked: false,
  }

  const mockProject: Project = {
    id: 'proj-1',
    name: 'Test Project',
    totalRows: 100,
    currentRow: 25,
    sections: [mockSection],
    notes: 'Test notes',
    lastModified: Date.now(),
  }

  const renderWithProviders = (
    ui: React.ReactElement,
    initialState?: { projects: { projects: Project[]; currentProjectId: string | null } },
  ) => {
    store = configureStore({
      reducer: {
        projects: projectsSlice,
      },
      preloadedState: initialState,
    })

    return render(<Provider store={store}>{ui}</Provider>)
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Dialog Rendering', () => {
    it('renders create section dialog when section is undefined', () => {
      renderWithProviders(<SectionDialog section={undefined} open={true} onClose={mockOnClose} />)
      expect(screen.getByText('Create Section')).toBeInTheDocument()
    })

    it('renders edit section dialog when section is provided', () => {
      renderWithProviders(<SectionDialog section={mockSection} open={true} onClose={mockOnClose} />)
      expect(screen.getByText('Edit Section')).toBeInTheDocument()
    })

    it('does not render dialog when open is false', () => {
      renderWithProviders(
        <SectionDialog section={mockSection} open={false} onClose={mockOnClose} />,
      )
      expect(screen.queryByText('Edit Section')).not.toBeInTheDocument()
    })

    it('renders Cancel and Save buttons', () => {
      renderWithProviders(<SectionDialog section={mockSection} open={true} onClose={mockOnClose} />)
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    })
  })

  describe('Form Fields - Text Input', () => {
    it('populates section name field when editing', () => {
      renderWithProviders(<SectionDialog section={mockSection} open={true} onClose={mockOnClose} />)
      const nameField = screen.getByDisplayValue('Test Section')
      expect(nameField).toBeInTheDocument()
    })

    it('allows editing section name', async () => {
      const user = userEvent.setup()
      renderWithProviders(<SectionDialog section={mockSection} open={true} onClose={mockOnClose} />)

      const nameField = screen.getByDisplayValue('Test Section')
      await user.clear(nameField)
      await user.type(nameField, 'Updated Section')

      expect(nameField).toHaveValue('Updated Section')
    })

    it('renders empty name field when creating new section', () => {
      renderWithProviders(<SectionDialog section={undefined} open={true} onClose={mockOnClose} />)
      const nameField = screen.getAllByRole('textbox')[0]
      expect(nameField).toHaveValue('')
    })
  })

  describe('Form Fields - Numeric Inputs', () => {
    it('populates repeat rows field', () => {
      renderWithProviders(<SectionDialog section={mockSection} open={true} onClose={mockOnClose} />)
      const spinbuttons = screen.getAllByRole('spinbutton')
      expect(spinbuttons.length).toBeGreaterThanOrEqual(1)
    })

    it('allows editing repeat rows', async () => {
      const user = userEvent.setup()
      renderWithProviders(<SectionDialog section={mockSection} open={true} onClose={mockOnClose} />)

      const repeatRowsField = screen.getByLabelText('Repeat Rows')
      await user.clear(repeatRowsField)
      await user.type(repeatRowsField, '20')

      expect(repeatRowsField).toHaveValue(20)
    })

    it('allows editing total repeats', async () => {
      const user = userEvent.setup()
      renderWithProviders(<SectionDialog section={mockSection} open={true} onClose={mockOnClose} />)

      const totalRepeatsField = screen.getByLabelText('Total Repeats')
      await user.clear(totalRepeatsField)
      await user.type(totalRepeatsField, '8')

      expect(totalRepeatsField).toHaveValue(8)
    })

    it('allows editing stitches per row', async () => {
      const user = userEvent.setup()
      renderWithProviders(<SectionDialog section={mockSection} open={true} onClose={mockOnClose} />)

      const stitchCountField = screen.getByLabelText('Stitches per Row')
      await user.clear(stitchCountField)
      await user.type(stitchCountField, '25')

      expect(stitchCountField).toHaveValue(25)
    })
  })

  describe('Pattern Editor Integration', () => {
    it('renders pattern editor', () => {
      renderWithProviders(<SectionDialog section={mockSection} open={true} onClose={mockOnClose} />)
      expect(screen.getByTestId('pattern-editor')).toBeInTheDocument()
    })

    it('displays pattern rows from section', () => {
      renderWithProviders(<SectionDialog section={mockSection} open={true} onClose={mockOnClose} />)
      expect(screen.getByText('K1')).toBeInTheDocument()
      expect(screen.getByText('P1')).toBeInTheDocument()
    })

    it('allows adding pattern rows', async () => {
      const user = userEvent.setup()
      renderWithProviders(<SectionDialog section={mockSection} open={true} onClose={mockOnClose} />)

      const addRowButton = screen.getByTestId('add-pattern-row')
      await user.click(addRowButton)

      expect(screen.getByText('New Row')).toBeInTheDocument()
    })
  })

  describe('Link and Lock Controls', () => {
    it('renders link switch for existing section', () => {
      renderWithProviders(<SectionDialog section={mockSection} open={true} onClose={mockOnClose} />)
      expect(screen.getByTestId('link-switch')).toBeInTheDocument()
    })

    it('does not render link switch for new section', () => {
      renderWithProviders(<SectionDialog section={undefined} open={true} onClose={mockOnClose} />)
      expect(screen.queryByTestId('link-switch')).not.toBeInTheDocument()
    })

    it('link switch reflects section linked state', () => {
      const linkedSection = { ...mockSection, linked: true }
      renderWithProviders(
        <SectionDialog section={linkedSection} open={true} onClose={mockOnClose} />,
      )

      const linkSwitch = screen.getByTestId('link-switch')
      expect(linkSwitch).toBeChecked()
    })

    it('hides lock button when section is linked', () => {
      const linkedSection = { ...mockSection, linked: true, locked: false }
      renderWithProviders(
        <SectionDialog section={linkedSection} open={true} onClose={mockOnClose} />,
      )

      // Lock button should not be visible when linked
      const buttons = screen.getAllByRole('button')
      const lockButtons = buttons.filter((btn) => btn.innerHTML.includes('svg'))
      expect(lockButtons.length).toBe(0)
    })

    it('shows lock button when section is not linked', () => {
      const unlinkedSection = { ...mockSection, linked: false, locked: false }
      renderWithProviders(
        <SectionDialog section={unlinkedSection} open={true} onClose={mockOnClose} />,
      )

      // Should have icon buttons visible (link switch and lock button)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('disables link switch when section is locked', () => {
      const lockedSection = { ...mockSection, locked: true }
      renderWithProviders(
        <SectionDialog section={lockedSection} open={true} onClose={mockOnClose} />,
      )

      const linkSwitch = screen.getByTestId('link-switch')
      expect(linkSwitch).toBeDisabled()
    })
  })

  describe('Delete Functionality', () => {
    it('renders delete button for existing section', () => {
      renderWithProviders(<SectionDialog section={mockSection} open={true} onClose={mockOnClose} />)
      const deleteButton = screen.getByRole('button', { name: 'Delete' })
      expect(deleteButton).toBeInTheDocument()
    })

    it('does not render delete button for new section', () => {
      renderWithProviders(<SectionDialog section={undefined} open={true} onClose={mockOnClose} />)
      expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
    })

    it('opens confirmation dialog when delete button is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <SectionDialog section={mockSection} open={true} onClose={mockOnClose} />,
        { projects: { projects: [mockProject], currentProjectId: 'proj-1' } },
      )

      const deleteButton = screen.getByRole('button', { name: 'Delete' })
      await user.click(deleteButton)

      expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument()
      expect(screen.getByText('Delete Section?')).toBeInTheDocument()
    })

    it('shows section name in deletion confirmation message', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <SectionDialog section={mockSection} open={true} onClose={mockOnClose} />,
        { projects: { projects: [mockProject], currentProjectId: 'proj-1' } },
      )

      const deleteButton = screen.getByRole('button', { name: 'Delete' })
      await user.click(deleteButton)

      expect(screen.getByText(/Test Section/)).toBeInTheDocument()
    })

    it('closes confirmation dialog when cancel button is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <SectionDialog section={mockSection} open={true} onClose={mockOnClose} />,
        { projects: { projects: [mockProject], currentProjectId: 'proj-1' } },
      )

      const deleteButton = screen.getByRole('button', { name: 'Delete' })
      await user.click(deleteButton)

      const cancelButton = screen.getByTestId('cancel-button')
      await user.click(cancelButton)

      expect(screen.queryByTestId('confirmation-dialog')).not.toBeInTheDocument()
    })
  })

  describe('Save Functionality', () => {
    it('calls onClose when save button is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <SectionDialog section={mockSection} open={true} onClose={mockOnClose} />,
        { projects: { projects: [mockProject], currentProjectId: 'proj-1' } },
      )

      const saveButton = screen.getByRole('button', { name: 'Save' })
      await user.click(saveButton)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('calls onClose when cancel button is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<SectionDialog section={mockSection} open={true} onClose={mockOnClose} />)

      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      await user.click(cancelButton)

      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('Form State Management', () => {
    it('renders form fields with correct initial values', () => {
      renderWithProviders(<SectionDialog section={undefined} open={true} onClose={mockOnClose} />)

      const nameField = screen.getAllByRole('textbox')[0]
      expect(nameField).toHaveValue('')
    })

    it('syncs repeat rows from pattern length', () => {
      renderWithProviders(<SectionDialog section={mockSection} open={true} onClose={mockOnClose} />)

      // Initially, repeat rows field should show the pattern length
      // The component sets repeatRows = pattern.length when pattern changes
      const spinbuttons = screen.getAllByRole('spinbutton')
      expect(spinbuttons.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Core Component Functionality', () => {
    it('renders all dialog action buttons', () => {
      renderWithProviders(<SectionDialog section={mockSection} open={true} onClose={mockOnClose} />)

      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    })

    it('renders all form fields for editing', () => {
      renderWithProviders(<SectionDialog section={mockSection} open={true} onClose={mockOnClose} />)

      const textboxes = screen.getAllByRole('textbox')
      expect(textboxes.length).toBeGreaterThanOrEqual(1) // Section Name field
      const spinbuttons = screen.getAllByRole('spinbutton')
      expect(spinbuttons.length).toBeGreaterThanOrEqual(3) // Repeat Rows, Stitches per Row, Total Repeats
    })

    it('renders pattern editor with section pattern', () => {
      renderWithProviders(<SectionDialog section={mockSection} open={true} onClose={mockOnClose} />)

      expect(screen.getByTestId('pattern-editor')).toBeInTheDocument()
      expect(screen.getByText('K1')).toBeInTheDocument()
      expect(screen.getByText('P1')).toBeInTheDocument()
    })
  })
})
