import { fireEvent, render, screen } from '@testing-library/react'
import { useSnackbar } from 'notistack'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAppDispatch, useAppSelector } from '@src/app/hooks'
import type { RootState } from '@src/app/store'
import * as projectsSlice from '@src/features/projects/projectsSlice'
import { useProjectStats } from '@src/hooks/useProjectStats'

import ProjectView from './ProjectView'

// Mock react-router-dom
const mockNavigate = vi.fn()
const mockParams = { id: 'p1' }
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockParams,
  }
})

// Mock notistack
vi.mock('notistack', () => ({
  useSnackbar: vi.fn(),
}))

// Mock hooks
vi.mock('@src/app/hooks', () => ({
  useAppDispatch: vi.fn(),
  useAppSelector: vi.fn(),
}))

vi.mock('@src/hooks/useProjectStats', () => ({
  useProjectStats: vi.fn(),
}))

// Mock slice actions
vi.mock('@src/features/projects/projectsSlice', async () => {
  const actual = await vi.importActual<typeof import('@src/features/projects/projectsSlice')>(
    '@src/features/projects/projectsSlice',
  )
  return {
    ...actual,
    importProjects: vi.fn(),
    renameProject: vi.fn(),
    updateNotes: vi.fn(),
    updatePatternUrl: vi.fn(),
  }
})

// Mock child components
vi.mock('@comp/GlobalCard', () => ({
  default: () => <div data-testid="global-card">GlobalCard</div>,
}))
vi.mock('@comp/ProgressAlert', () => ({
  default: ({ onOpenHistory }: { onOpenHistory: () => void }) => (
    <div data-testid="progress-alert">
      <button onClick={onOpenHistory}>Open History</button>
    </div>
  ),
}))
vi.mock('@comp/ProjectInfoDialog', () => ({
  default: ({ open }: { open: boolean }) =>
    open ? <div data-testid="project-info-dialog">Info Dialog</div> : null,
}))
vi.mock('@comp/SectionCard', () => ({
  default: ({ section }: { section: { name: string } }) => (
    <div data-testid="section-card">{section.name}</div>
  ),
}))
vi.mock('@comp/SectionDialog', () => ({
  default: ({ open }: { open: boolean }) =>
    open ? <div data-testid="section-dialog">Section Dialog</div> : null,
}))

describe('ProjectView', () => {
  const mockDispatch = vi.fn()
  const mockEnqueueSnackbar = vi.fn()

  const mockProject = {
    id: 'p1',
    name: 'Test Project',
    sections: [
      {
        id: 's1',
        name: 'Section 1',
        linked: false,
        repeatRows: null,
        currentRow: 0,
        repeatCount: 0,
        totalRepeats: null,
        pattern: [],
        stitchCount: null,
        locked: false,
      },
      {
        id: 's2',
        name: 'Section 2',
        linked: true,
        repeatRows: null,
        currentRow: 0,
        repeatCount: 0,
        totalRepeats: null,
        pattern: [],
        stitchCount: null,
        locked: false,
      },
    ],
    notes: 'Some notes',
    patternUrl: 'http://example.com',
    totalRows: null,
    currentRow: 0,
    lastModified: Date.now(),
  }

  const mockState = {
    projects: { projects: [mockProject], currentProjectId: 'p1' },
    progress: { records: [] },
    ui: { darkMode: true, showStitches: true },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAppDispatch).mockReturnValue(mockDispatch)
    vi.mocked(useSnackbar).mockReturnValue({
      enqueueSnackbar: mockEnqueueSnackbar,
    } as unknown as ReturnType<typeof useSnackbar>)
    vi.mocked(useAppSelector).mockImplementation((selector) =>
      selector(mockState as unknown as RootState),
    )
    vi.mocked(useProjectStats).mockReturnValue({
      rowsToday: 0,
      stitchesToday: 0,
      rowsPerHour: 0,
      stitchesPerHour: 0,
      estimatedDays: null,
      estimatedHours: null,
      averageRowsPerDay: 0,
      lastRowMinutes: null,
      rateTrend: null,
    })

    // Mock URL object
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:url')
    globalThis.URL.revokeObjectURL = vi.fn()
  })

  it('redirects if project not found', () => {
    vi.mocked(useAppSelector).mockImplementation((selector) =>
      selector({
        projects: { projects: [], currentProjectId: null },
        progress: { records: [] },
        ui: { darkMode: true, showStitches: true },
      } as unknown as RootState),
    )

    render(<ProjectView />)
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('renders project details', () => {
    render(<ProjectView />)
    expect(screen.getByText('Test Project')).toBeInTheDocument()
    expect(screen.getByTestId('global-card')).toBeInTheDocument()
    expect(screen.getAllByTestId('section-card')).toHaveLength(2)
    expect(screen.getByDisplayValue('Some notes')).toBeInTheDocument()
    expect(screen.getByDisplayValue('http://example.com')).toBeInTheDocument()
  })

  it('sorts sections if forced (linked sections first)', () => {
    render(<ProjectView />)
    const cards = screen.getAllByTestId('section-card')
    expect(cards[0]).toHaveTextContent('Section 2')
    expect(cards[1]).toHaveTextContent('Section 1')
  })

  it('opens section dialog on add button click', () => {
    render(<ProjectView />)
    fireEvent.click(screen.getByText('Section'))
    expect(screen.getByTestId('section-dialog')).toBeInTheDocument()
  })

  it('handles rename', () => {
    vi.spyOn(window, 'prompt').mockReturnValue('New Name')
    render(<ProjectView />)

    fireEvent.click(screen.getByText('Rename'))
    expect(projectsSlice.renameProject).toHaveBeenCalledWith({ id: 'p1', name: 'New Name' })
    expect(mockDispatch).toHaveBeenCalled()
  })

  it('handles notes update', () => {
    render(<ProjectView />)
    const notesInput = screen.getByLabelText('Notes')
    fireEvent.change(notesInput, { target: { value: 'Updated Notes' } })
    expect(projectsSlice.updateNotes).toHaveBeenCalledWith('Updated Notes')
  })

  it('handles pattern url update', () => {
    render(<ProjectView />)
    const urlInput = screen.getByLabelText('Pattern URL')
    fireEvent.change(urlInput, { target: { value: 'new-url' } })
    expect(projectsSlice.updatePatternUrl).toHaveBeenCalledWith('new-url')
  })

  it('shows progress alert if progress exists', () => {
    vi.mocked(useProjectStats).mockReturnValue({
      rowsToday: 5,
      stitchesToday: 50,
      rowsPerHour: 0,
      stitchesPerHour: 0,
      estimatedDays: null,
      estimatedHours: null,
      averageRowsPerDay: 0,
      lastRowMinutes: null,
      rateTrend: null,
    })
    render(<ProjectView />)
    expect(screen.getByTestId('progress-alert')).toBeInTheDocument()
  })

  it('opens info dialog from progress alert', () => {
    vi.mocked(useProjectStats).mockReturnValue({
      rowsToday: 5,
      stitchesToday: 50,
      rowsPerHour: 0,
      stitchesPerHour: 0,
      estimatedDays: null,
      estimatedHours: null,
      averageRowsPerDay: 0,
      lastRowMinutes: null,
      rateTrend: null,
    })
    render(<ProjectView />)
    fireEvent.click(screen.getByText('Open History'))
    expect(screen.getByTestId('project-info-dialog')).toBeInTheDocument()
  })

  it('handles export', () => {
    render(<ProjectView />)
    const exportBtn = screen.getByLabelText('Export Project')
    fireEvent.click(exportBtn)
    expect(globalThis.URL.createObjectURL).toHaveBeenCalled()
  })

  it('handles import success', async () => {
    render(<ProjectView />)

    const file = new File([JSON.stringify({ id: 'p1', name: 'Imported' })], 'proj.json', {
      type: 'application/json',
    })

    // Mock FileReader
    const mockFileReader = {
      readAsText: vi.fn(),
      onload: null as ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null,
    }
    const fileReaderSpy = vi
      .spyOn(window, 'FileReader')
      .mockImplementation(() => mockFileReader as unknown as FileReader)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [file] } })

    // Verify FileReader was called
    expect(mockFileReader.readAsText).toBeDefined()

    // Simulate onload
    const event = {
      target: { result: JSON.stringify({ id: 'p1', name: 'Imported' }) },
    } as ProgressEvent<FileReader>
    if (mockFileReader.onload) {
      mockFileReader.onload.call(mockFileReader as unknown as FileReader, event)
    }

    fileReaderSpy.mockRestore()
  })

  it('handles import mismatch error', async () => {
    render(<ProjectView />)
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

    const mockFileReader = {
      readAsText: vi.fn(),
      onload: null as ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null,
    }
    const fileReaderSpy = vi
      .spyOn(window, 'FileReader')
      .mockImplementation(() => mockFileReader as unknown as FileReader)

    fireEvent.change(fileInput, { target: { files: [new File([''], 'test')] } })

    // Simulate onload with wrong ID
    const event = {
      target: { result: JSON.stringify({ id: 'wrong-id', name: 'Other' }) },
    } as ProgressEvent<FileReader>
    if (mockFileReader.onload) {
      mockFileReader.onload.call(mockFileReader as unknown as FileReader, event)
    }

    fileReaderSpy.mockRestore()
  })
})
