import { useMediaQuery } from '@mui/material'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAppDispatch, useAppSelector } from '@src/app/hooks'
import { deleteProgressRecord } from '@src/features/progress/progressSlice'
import type { Project } from '@src/features/projects/types'

import ProjectInfoDialog from './ProjectInfoDialog'

// Mock DataGrid FIRST to avoid CSS import issues
vi.mock('@mui/x-data-grid', () => ({
  DataGrid: vi.fn(
    (props: {
      rows?: Array<{ id: string | number }>
      columns?: Array<{
        type?: string
        field: string
        getActions?: (params: {
          row: { id: string | number }
        }) => Array<React.ReactElement<{ onClick: () => void; label: string }>>
      }>
      slots?: { toolbar?: React.ComponentType<Record<string, unknown>> }
      slotProps?: { toolbar?: Record<string, unknown> }
    }) => {
      const { rows, columns, slots, slotProps } = props
      const Toolbar = slots?.toolbar
      return (
        <div data-testid="data-grid">
          {Toolbar && <Toolbar {...(slotProps?.toolbar || {})} />}
          {rows?.map((row) => (
            <div key={row.id} data-testid="data-grid-row">
              {row.id}
              {columns
                ?.filter((c) => c.type === 'actions')
                .map((c) =>
                  c.getActions!({ row }).map(
                    (
                      action: React.ReactElement<{ onClick: () => void; label: string }>,
                      i: number,
                    ) => (
                      <button
                        key={`${c.field}-${i}`}
                        onClick={action.props.onClick}
                        aria-label={action.props.label}
                      >
                        {action.props.label}
                      </button>
                    ),
                  ),
                )}
            </div>
          ))}
        </div>
      )
    },
  ),
  GridActionsCellItem: vi.fn((props: React.HTMLAttributes<HTMLDivElement>) => <div {...props} />),
  GridRowModes: {
    Edit: 'edit',
    View: 'view',
  },
  GridRowEditStopReasons: {
    rowFocusOut: 'rowFocusOut',
    escapeKey: 'escapeKey',
    fieldDirectlyEdited: 'fieldDirectlyEdited',
  },
}))

// Mock hooks
vi.mock('@src/app/hooks', () => ({
  useAppDispatch: vi.fn(),
  useAppSelector: vi.fn(),
}))

// Mock MUI
vi.mock('@mui/material', async () => {
  const actual = await vi.importActual<typeof import('@mui/material')>('@mui/material')
  return {
    ...actual,
    useMediaQuery: vi.fn(),
  }
})

// Mock actions
vi.mock('@src/features/progress/progressSlice', () => ({
  deleteProgressRecord: vi.fn(),
}))

// Mock child components
vi.mock('@comp/ConfirmationDialog', () => ({
  default: ({ open, onConfirm, title }: { open: boolean; onConfirm: () => void; title: string }) =>
    open ? (
      <div data-testid="confirmation-dialog">
        <span>{title}</span>
        <button onClick={onConfirm}>Confirm</button>
      </div>
    ) : null,
}))

vi.mock('@comp/FullscreenDataGrid', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="fullscreen-datagrid">{children}</div>
  ),
}))

vi.mock('@comp/Heatmap', () => ({
  default: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div data-testid="heatmap">
      <div data-testid="heatmap-title">{title}</div>
      {children}
    </div>
  ),
  calculateMaxDaysForWidth: vi.fn(() => 365),
  formatLocalDate: vi.fn((d: Date) => d.toISOString().split('T')[0]),
}))

// Mock ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver

describe('ProjectInfoDialog', () => {
  const mockDispatch = vi.fn()
  const mockProject: Project = {
    id: 'p1',
    name: 'Test Project',
    currentRow: 10,
    totalRows: 100,
    sections: [{ id: 's1', name: 'Section 1' }] as unknown as Project['sections'],
    lastModified: 0,
    notes: '',
    patternUrl: '',
  }

  const mockRecords = [
    {
      id: 'r1',
      projectId: 'p1',
      sectionId: 's1',
      timestamp: new Date('2023-01-01').getTime(),
      rowsDelta: 5,
      stitchesDelta: 50,
    },
    {
      id: 'r2',
      projectId: 'p2', // Different project
      sectionId: 's1',
      timestamp: new Date('2023-01-02').getTime(),
      rowsDelta: 10,
      stitchesDelta: 100,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAppDispatch).mockReturnValue(mockDispatch)
    vi.mocked(useAppSelector).mockReturnValue({ records: mockRecords })
    vi.mocked(deleteProgressRecord).mockReturnValue({
      type: 'progress/deleteProgressRecord',
      payload: 'r1',
    })
    vi.mocked(useMediaQuery).mockReturnValue(false)
  })

  it('renders correctly when open', () => {
    render(<ProjectInfoDialog project={mockProject} open={true} onClose={vi.fn()} />)

    expect(screen.getByText('Project History & Info')).toBeInTheDocument()
    expect(screen.getByTestId('heatmap')).toBeInTheDocument()
    expect(screen.getByTestId('data-grid')).toBeInTheDocument()
  })

  it('filters records for the current project', () => {
    render(<ProjectInfoDialog project={mockProject} open={true} onClose={vi.fn()} />)

    const rows = screen.getAllByTestId('data-grid-row')
    expect(rows).toHaveLength(1)
    expect(rows[0]).toHaveTextContent('r1')
  })

  it('toggles between rows and stitches mode', () => {
    render(<ProjectInfoDialog project={mockProject} open={true} onClose={vi.fn()} />)

    // Default is rows
    expect(screen.getByTestId('heatmap-title')).toHaveTextContent('Rows Completed Activity')

    // Find switch
    const switchInput = screen.getByLabelText('count by stitches or rows')
    fireEvent.click(switchInput)

    // Should change to stitches
    expect(screen.getByTestId('heatmap-title')).toHaveTextContent('Stitches Completed Activity')
  })

  it('handles record deletion flow', () => {
    render(<ProjectInfoDialog project={mockProject} open={true} onClose={vi.fn()} />)

    // Click delete on the row (mocked in DataGrid)
    fireEvent.click(screen.getByText('Delete'))

    expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Confirm'))
    expect(deleteProgressRecord).toHaveBeenCalledWith('r1')
    expect(mockDispatch).toHaveBeenCalled()
  })
})
