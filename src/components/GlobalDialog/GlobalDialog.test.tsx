import { configureStore } from '@reduxjs/toolkit'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import projectsReducer, {
  resetProjectProgress,
  setTotalRows,
} from '@src/features/projects/projectsSlice'
import type { Project } from '@src/features/projects/types'

import GlobalDialog from './GlobalDialog'

const mockProject: Project = {
  id: '1',
  name: 'Test Project',
  totalRows: 100,
  currentRow: 1,
  sections: [],
  notes: '',
  lastModified: Date.now(),
}

const createTestStore = () =>
  configureStore({
    reducer: {
      projects: projectsReducer,
    },
  })

describe('GlobalDialog', () => {
  let store: ReturnType<typeof createTestStore>

  beforeEach(() => {
    store = createTestStore()
  })

  it('renders dialog title when open', () => {
    render(
      <Provider store={store}>
        <GlobalDialog project={mockProject} open={true} onClose={vi.fn()} />
      </Provider>,
    )

    expect(screen.getByText('Edit Global Settings')).toBeInTheDocument()
  })

  it('does not render dialog when closed', () => {
    render(
      <Provider store={store}>
        <GlobalDialog project={mockProject} open={false} onClose={vi.fn()} />
      </Provider>,
    )

    expect(screen.queryByText('Edit Global Settings')).not.toBeInTheDocument()
  })

  it('displays project total rows in text field', () => {
    render(
      <Provider store={store}>
        <GlobalDialog project={mockProject} open={true} onClose={vi.fn()} />
      </Provider>,
    )

    const input = screen.getByDisplayValue('100')
    expect(input).toBeInTheDocument()
  })

  it('displays empty field when project has no totalRows', () => {
    const projectWithoutTotalRows = { ...mockProject, totalRows: null }
    render(
      <Provider store={store}>
        <GlobalDialog project={projectWithoutTotalRows} open={true} onClose={vi.fn()} />
      </Provider>,
    )

    const input = screen.getByRole('spinbutton', { name: /Total Rows/i })
    expect(input).toHaveValue(null)
  })

  it('displays calculated total rows as placeholder', () => {
    render(
      <Provider store={store}>
        <GlobalDialog
          project={mockProject}
          open={true}
          onClose={vi.fn()}
          calculatedTotalRows={250}
        />
      </Provider>,
    )

    const input = screen.getByRole('spinbutton', { name: /Total Rows/i })
    expect(input).toHaveAttribute('placeholder', '250')
  })

  it('calls onClose when Cancel button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnClose = vi.fn()

    render(
      <Provider store={store}>
        <GlobalDialog project={mockProject} open={true} onClose={mockOnClose} />
      </Provider>,
    )

    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    await user.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('dispatches setTotalRows and calls onClose when Save is clicked', async () => {
    const user = userEvent.setup()
    const mockOnClose = vi.fn()
    const dispatchSpy = vi.spyOn(store, 'dispatch')

    render(
      <Provider store={store}>
        <GlobalDialog project={mockProject} open={true} onClose={mockOnClose} />
      </Provider>,
    )

    const input = screen.getByRole('spinbutton', { name: /Total Rows/i })
    await user.clear(input)
    await user.type(input, '150')

    const saveButton = screen.getByRole('button', { name: 'Save' })
    await user.click(saveButton)

    expect(dispatchSpy).toHaveBeenCalledWith(setTotalRows(150))
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('saves null when total rows is 0', async () => {
    const user = userEvent.setup()
    const mockOnClose = vi.fn()
    const dispatchSpy = vi.spyOn(store, 'dispatch')

    render(
      <Provider store={store}>
        <GlobalDialog project={mockProject} open={true} onClose={mockOnClose} />
      </Provider>,
    )

    const input = screen.getByRole('spinbutton', { name: /Total Rows/i })
    await user.clear(input)
    await user.type(input, '0')

    const saveButton = screen.getByRole('button', { name: 'Save' })
    await user.click(saveButton)

    expect(dispatchSpy).toHaveBeenCalledWith(setTotalRows(null))
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('renders Reset Project button', () => {
    render(
      <Provider store={store}>
        <GlobalDialog project={mockProject} open={true} onClose={vi.fn()} />
      </Provider>,
    )

    const resetButton = screen.getByRole('button', { name: 'Reset Project' })
    expect(resetButton).toBeInTheDocument()
  })

  it('opens confirmation dialog when Reset Project is clicked', async () => {
    const user = userEvent.setup()

    render(
      <Provider store={store}>
        <GlobalDialog project={mockProject} open={true} onClose={vi.fn()} />
      </Provider>,
    )

    const resetButton = screen.getByRole('button', { name: 'Reset Project' })
    await user.click(resetButton)

    // Check for confirmation dialog title
    expect(screen.getByText('Reset Project Progress?')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Are you sure you want to reset all row and repeat counts for this project? This action cannot be undone.',
      ),
    ).toBeInTheDocument()
  })

  it('dispatches resetProjectProgress when confirming reset', async () => {
    const user = userEvent.setup()
    const mockOnClose = vi.fn()
    const dispatchSpy = vi.spyOn(store, 'dispatch')

    render(
      <Provider store={store}>
        <GlobalDialog project={mockProject} open={true} onClose={mockOnClose} />
      </Provider>,
    )

    // Open confirmation dialog
    const resetButton = screen.getByRole('button', { name: 'Reset Project' })
    await user.click(resetButton)

    // Confirm reset
    const confirmButton = screen.getByRole('button', { name: 'Reset' })
    await user.click(confirmButton)

    expect(dispatchSpy).toHaveBeenCalledWith(resetProjectProgress())
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('closes confirmation dialog without resetting on cancel', async () => {
    const user = userEvent.setup()
    const mockOnClose = vi.fn()
    const dispatchSpy = vi.spyOn(store, 'dispatch')

    render(
      <Provider store={store}>
        <GlobalDialog project={mockProject} open={true} onClose={mockOnClose} />
      </Provider>,
    )

    // Open confirmation dialog
    const resetButton = screen.getByRole('button', { name: 'Reset Project' })
    await user.click(resetButton)

    // Cancel reset
    const cancelButton = screen.getAllByRole('button', { name: 'Cancel' })[0]
    await user.click(cancelButton)

    expect(dispatchSpy).not.toHaveBeenCalledWith(resetProjectProgress())
  })

  it('renders trigger element when provided', () => {
    const trigger = <button data-testid="custom-trigger">Open Dialog</button>

    render(
      <Provider store={store}>
        <GlobalDialog project={mockProject} open={true} onClose={vi.fn()} trigger={trigger} />
      </Provider>,
    )

    expect(screen.getByTestId('custom-trigger')).toBeInTheDocument()
  })

  it('focuses on total rows input on dialog open', () => {
    render(
      <Provider store={store}>
        <GlobalDialog project={mockProject} open={true} onClose={vi.fn()} />
      </Provider>,
    )

    const input = screen.getByRole('spinbutton', { name: /Total Rows/i })
    expect(input).toHaveFocus()
  })
})
