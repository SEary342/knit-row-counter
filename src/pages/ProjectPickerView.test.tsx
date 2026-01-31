import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { store } from '@src/app/store'
import * as projectsSlice from '@src/features/projects/projectsSlice'
import type { Project } from '@src/features/projects/types'

import ProjectPickerView from './ProjectPickerView'

// Mock child components
vi.mock('@comp/NewProjectDialog', () => ({
  default: ({
    open,
    onClose,
    onCreate,
  }: {
    open: boolean
    onClose: () => void
    onCreate: (name: string) => void
  }) => (
    <div data-testid="new-project-dialog">
      {open && (
        <div>
          <button onClick={() => onCreate('Test Project')} data-testid="create-project-button">
            Create
          </button>
          <button onClick={onClose} data-testid="close-dialog-button">
            Close
          </button>
        </div>
      )}
    </div>
  ),
}))

vi.mock('@comp/ConfirmationDialog', () => ({
  default: ({
    open,
    onConfirm,
    onClose,
    message,
  }: {
    open: boolean
    onConfirm: () => void
    onClose: () => void
    message: string
  }) => (
    <div data-testid="confirmation-dialog">
      {open && (
        <div>
          <p data-testid="confirmation-message">{message}</p>
          <button onClick={onConfirm} data-testid="confirm-delete-button">
            Confirm
          </button>
          <button onClick={onClose} data-testid="cancel-delete-button">
            Cancel
          </button>
        </div>
      )}
    </div>
  ),
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('ProjectPickerView', () => {
  const mockProject: Project = {
    id: 'proj-1',
    name: 'Test Project',
    totalRows: 100,
    currentRow: 25,
    sections: [],
    notes: '',
    lastModified: Date.now(),
  }

  const mockProject2: Project = {
    id: 'proj-2',
    name: 'Another Project',
    totalRows: 50,
    currentRow: 50,
    sections: [],
    notes: '',
    lastModified: Date.now(),
  }

  const mockProjectWithCalculatedRows: Project = {
    id: 'proj-3',
    name: 'Calculated Rows Project',
    totalRows: null,
    currentRow: 30,
    sections: [
      {
        id: 'sec-1',
        name: 'Section 1',
        repeatRows: 10,
        currentRow: 5,
        repeatCount: 1,
        totalRepeats: 2,
        pattern: [],
        stitchCount: 20,
        locked: false,
      },
      {
        id: 'sec-2',
        name: 'Section 2',
        repeatRows: 8,
        currentRow: 3,
        repeatCount: 1,
        totalRepeats: 2,
        pattern: [],
        stitchCount: 25,
        locked: false,
      },
    ],
    notes: '',
    lastModified: Date.now(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset store state by clearing projects
    store.dispatch(projectsSlice.importProjects([]))
  })

  const renderWithProviders = () => {
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <ProjectPickerView />
        </MemoryRouter>
      </Provider>,
    )
  }

  describe('rendering', () => {
    it('renders the Projects title', () => {
      renderWithProviders()
      expect(screen.getByText('Projects')).toBeInTheDocument()
    })

    it('renders the New Project button', () => {
      renderWithProviders()
      expect(screen.getByRole('button', { name: 'New Project' })).toBeInTheDocument()
    })

    it('renders empty state when no projects exist', () => {
      renderWithProviders()
      expect(screen.getByText('No projects yet — create one!')).toBeInTheDocument()
    })

    it('renders projects list when projects exist', () => {
      store.dispatch(projectsSlice.importProjects([mockProject]))
      renderWithProviders()
      expect(screen.getByText('Test Project')).toBeInTheDocument()
    })

    it('renders multiple projects', () => {
      store.dispatch(projectsSlice.importProjects([mockProject, mockProject2]))
      renderWithProviders()
      expect(screen.getByText('Test Project')).toBeInTheDocument()
      expect(screen.getByText('Another Project')).toBeInTheDocument()
    })

    it('renders delete button for each project', () => {
      store.dispatch(projectsSlice.importProjects([mockProject, mockProject2]))
      renderWithProviders()
      const deleteButtons = screen.getAllByLabelText('delete')
      expect(deleteButtons).toHaveLength(2)
    })
  })

  describe('project secondary text', () => {
    it('shows progress percentage when totalRows is set', () => {
      store.dispatch(projectsSlice.importProjects([mockProject]))
      renderWithProviders()
      // 25 / 100 * 100 = 25%
      expect(screen.getByText(/25% complete \(25 \/ 100 rows\)/)).toBeInTheDocument()
    })

    it('shows 100% when currentRow equals totalRows', () => {
      const completedProject = { ...mockProject, currentRow: 100 }
      store.dispatch(projectsSlice.importProjects([completedProject]))
      renderWithProviders()
      expect(screen.getByText(/100% complete \(100 \/ 100 rows\)/)).toBeInTheDocument()
    })

    it('shows current row when totalRows is null and no calculated rows', () => {
      const noRowsProject = { ...mockProject, totalRows: null, sections: [] }
      store.dispatch(projectsSlice.importProjects([noRowsProject]))
      renderWithProviders()
      expect(screen.getByText('Current row: 25')).toBeInTheDocument()
    })

    it('calculates total rows from sections when totalRows is null', () => {
      store.dispatch(projectsSlice.importProjects([mockProjectWithCalculatedRows]))
      renderWithProviders()
      // (2 * 10) + (2 * 8) = 36 calculated total rows
      // 30 / 36 * 100 = 83%
      expect(screen.getByText(/83% complete \(30 \/ 36 rows\)/)).toBeInTheDocument()
    })

    it('uses number localization for large numbers', () => {
      const largeProject = { ...mockProject, currentRow: 1000, totalRows: 10000 }
      store.dispatch(projectsSlice.importProjects([largeProject]))
      renderWithProviders()
      expect(screen.getByText(/10% complete \(1,000 \/ 10,000 rows\)/)).toBeInTheDocument()
    })

    it('caps percentage at 100 when currentRow exceeds totalRows', () => {
      const overflowProject = { ...mockProject, currentRow: 150, totalRows: 100 }
      store.dispatch(projectsSlice.importProjects([overflowProject]))
      renderWithProviders()
      expect(screen.getByText(/100% complete \(150 \/ 100 rows\)/)).toBeInTheDocument()
    })
  })

  describe('project selection', () => {
    it('navigates to project when a project is clicked', async () => {
      const user = userEvent.setup()
      store.dispatch(projectsSlice.importProjects([mockProject]))
      renderWithProviders()

      const projectItem = screen.getByText('Test Project')
      await user.click(projectItem)

      expect(mockNavigate).toHaveBeenCalledWith('/project/proj-1')
    })

    it('dispatches selectProject action when a project is clicked', async () => {
      const user = userEvent.setup()
      store.dispatch(projectsSlice.importProjects([mockProject]))
      const selectProjectSpy = vi.spyOn(projectsSlice, 'selectProject')

      renderWithProviders()
      const projectItem = screen.getByText('Test Project')
      await user.click(projectItem)

      expect(selectProjectSpy).toHaveBeenCalledWith('proj-1')
      selectProjectSpy.mockRestore()
    })

    it('shows selected project as highlighted', () => {
      store.dispatch(projectsSlice.importProjects([mockProject]))
      store.dispatch(projectsSlice.selectProject('proj-1'))
      renderWithProviders()

      const listItemButton = screen.getByRole('button', { name: /Test Project/i })
      expect(listItemButton).toHaveClass('Mui-selected')
    })

    it('does not highlight unselected projects', () => {
      store.dispatch(projectsSlice.importProjects([mockProject, mockProject2]))
      store.dispatch(projectsSlice.selectProject('proj-1'))
      renderWithProviders()

      const button2 = screen.getByRole('button', { name: /Another Project/i })
      expect(button2).not.toHaveClass('Mui-selected')
    })
  })

  describe('project deletion', () => {
    it('opens confirmation dialog when delete button is clicked', async () => {
      const user = userEvent.setup()
      store.dispatch(projectsSlice.importProjects([mockProject]))
      renderWithProviders()

      const deleteButtons = screen.getAllByLabelText('delete')
      await user.click(deleteButtons[0])

      expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument()
    })

    it('shows project name in confirmation message', async () => {
      const user = userEvent.setup()
      store.dispatch(projectsSlice.importProjects([mockProject]))
      renderWithProviders()

      const deleteButtons = screen.getAllByLabelText('delete')
      await user.click(deleteButtons[0])

      expect(
        screen.getByText(/Are you sure you want to delete the "Test Project" project/),
      ).toBeInTheDocument()
    })

    it('deletes project when confirmed', async () => {
      const user = userEvent.setup()
      store.dispatch(projectsSlice.importProjects([mockProject, mockProject2]))
      const deleteProjectSpy = vi.spyOn(projectsSlice, 'deleteProject')

      renderWithProviders()
      const deleteButtons = screen.getAllByLabelText('delete')
      await user.click(deleteButtons[0])

      const confirmButton = screen.getByTestId('confirm-delete-button')
      await user.click(confirmButton)

      expect(deleteProjectSpy).toHaveBeenCalledWith('proj-1')
      deleteProjectSpy.mockRestore()
    })

    it('closes confirmation dialog after deletion', async () => {
      const user = userEvent.setup()
      store.dispatch(projectsSlice.importProjects([mockProject]))
      renderWithProviders()

      const deleteButtons = screen.getAllByLabelText('delete')
      await user.click(deleteButtons[0])

      const confirmButton = screen.getByTestId('confirm-delete-button')
      await user.click(confirmButton)

      expect(screen.queryByTestId('confirmation-message')).not.toBeInTheDocument()
    })

    it('closes confirmation dialog when cancelled', async () => {
      const user = userEvent.setup()
      store.dispatch(projectsSlice.importProjects([mockProject]))
      renderWithProviders()

      const deleteButtons = screen.getAllByLabelText('delete')
      await user.click(deleteButtons[0])

      const cancelButton = screen.getByTestId('cancel-delete-button')
      await user.click(cancelButton)

      expect(screen.queryByTestId('confirmation-message')).not.toBeInTheDocument()
    })

    it('does not delete when cancelled', async () => {
      const user = userEvent.setup()
      store.dispatch(projectsSlice.importProjects([mockProject]))
      const deleteProjectSpy = vi.spyOn(projectsSlice, 'deleteProject')

      renderWithProviders()
      const deleteButtons = screen.getAllByLabelText('delete')
      await user.click(deleteButtons[0])

      const cancelButton = screen.getByTestId('cancel-delete-button')
      await user.click(cancelButton)

      expect(deleteProjectSpy).not.toHaveBeenCalled()
      deleteProjectSpy.mockRestore()
    })
  })

  describe('project creation', () => {
    it('opens new project dialog when New Project button is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders()

      const newProjectButton = screen.getByRole('button', { name: 'New Project' })
      await user.click(newProjectButton)

      expect(screen.getByTestId('new-project-dialog')).toBeInTheDocument()
    })

    it('closes new project dialog and creates project with entered name', async () => {
      const user = userEvent.setup()
      renderWithProviders()

      const initialProjectCount = store.getState().projects.projects.length
      const newProjectButton = screen.getByRole('button', { name: 'New Project' })
      await user.click(newProjectButton)

      // Dialog should be open
      expect(screen.getByTestId('create-project-button')).toBeInTheDocument()

      const createButton = screen.getByTestId('create-project-button')
      await user.click(createButton)

      // After creation, dialog should close (create button should no longer be visible)
      expect(screen.queryByTestId('create-project-button')).not.toBeInTheDocument()

      // Verify a new project was created in the store
      expect(store.getState().projects.projects.length).toBe(initialProjectCount + 1)
      expect(store.getState().projects.projects[initialProjectCount].name).toBe('Test Project')
    })

    it('navigates to created project after creation', async () => {
      const user = userEvent.setup()
      renderWithProviders()

      const initialProjectCount = store.getState().projects.projects.length
      const newProjectButton = screen.getByRole('button', { name: 'New Project' })
      await user.click(newProjectButton)

      const createButton = screen.getByTestId('create-project-button')
      await user.click(createButton)

      // Verify the project was created
      const projects = store.getState().projects.projects
      expect(projects.length).toBe(initialProjectCount + 1)

      // Verify the project ID is set in the store
      const createdProjectId = projects[initialProjectCount].id
      expect(createdProjectId).toBeDefined()
      expect(store.getState().projects.currentProjectId).toBe(createdProjectId)
    })

    it('closes new project dialog when close button is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders()

      const newProjectButton = screen.getByRole('button', { name: 'New Project' })
      await user.click(newProjectButton)

      const closeButton = screen.getByTestId('close-dialog-button')
      await user.click(closeButton)

      expect(screen.queryByTestId('create-project-button')).not.toBeInTheDocument()
    })
  })
})
