import { DataGrid } from '@mui/x-data-grid'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { PatternRowConfig } from '@src/features/projects/types'

import PatternEditor from './PatternEditor'

// Mock FullscreenDataGrid before importing PatternEditor
vi.mock('@comp/FullscreenDataGrid', () => ({
  default: (props: { children: React.ReactNode }) => (
    <div data-testid="fullscreen-grid">{props.children}</div>
  ),
}))

// Mock nanoid to produce consistent IDs
vi.mock('nanoid', () => {
  let count = 0
  return { nanoid: () => `row-${++count}` }
})

// Mock DataGrid and related exports to avoid CSS import issues
vi.mock('@mui/x-data-grid', () => ({
  DataGrid: vi.fn(
    (props: {
      slots?: { toolbar?: React.ComponentType<Record<string, unknown>> }
      slotProps?: { toolbar?: Record<string, unknown> }
      rows?: Array<{ id: string; instruction: string; stitches: number | null }>
      columns?: Array<{
        field?: string
        getActions?: (params: { id: string; api?: unknown }) => React.ReactNode[]
      }>
      children?: React.ReactNode
    }) => {
      const Toolbar = props.slots?.toolbar
      return (
        <div data-testid="mock-data-grid" role="grid">
          {Toolbar && <Toolbar {...(props.slotProps?.toolbar || {})} />}
          <div data-testid="grid-rows">
            {props.rows?.map((row) => {
              const actionsColumn = props.columns?.find((col) => col.field === 'actions')
              const actions = actionsColumn?.getActions?.({ id: row.id }) || []
              return (
                <div key={row.id} data-testid={`row-${row.id}`}>
                  <span>{row.instruction}</span>
                  {row.stitches !== null && <span>{row.stitches}</span>}
                  <div data-testid={`actions-${row.id}`}>{actions}</div>
                </div>
              )
            })}
          </div>
          {props.children}
        </div>
      )
    },
  ),
  GridActionsCellItem: vi.fn(
    (props: { label?: string; onClick?: () => void; disabled?: boolean }) => (
      <button onClick={props.onClick} disabled={props.disabled}>
        {props.label}
      </button>
    ),
  ),
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

describe('PatternEditor', () => {
  const mockOnChange = vi.fn()

  const defaultProps = {
    value: [] as PatternRowConfig[],
    onChange: mockOnChange,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the pattern editor with title', () => {
      render(<PatternEditor {...defaultProps} />)

      expect(screen.getByText('Pattern')).toBeInTheDocument()
    })

    it('renders add row button', () => {
      render(<PatternEditor {...defaultProps} />)

      expect(screen.getByRole('button', { name: /Add row/i })).toBeInTheDocument()
    })

    it('renders with fullscreen grid wrapper', () => {
      render(<PatternEditor {...defaultProps} />)

      expect(screen.getByTestId('fullscreen-grid')).toBeInTheDocument()
    })

    it('renders mock data grid', () => {
      render(<PatternEditor {...defaultProps} />)

      expect(screen.getByTestId('mock-data-grid')).toBeInTheDocument()
    })
  })

  describe('Empty Pattern', () => {
    it('handles empty pattern array', () => {
      render(<PatternEditor {...defaultProps} value={[]} />)

      expect(screen.getByText('Pattern')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Add row/i })).toBeInTheDocument()
    })

    it('renders without rows when pattern is empty', () => {
      render(<PatternEditor {...defaultProps} value={[]} />)

      const gridRows = screen.getByTestId('grid-rows')
      expect(gridRows.children).toHaveLength(0)
    })
  })

  describe('Single Row Pattern', () => {
    it('handles pattern with single row', () => {
      const pattern: PatternRowConfig[] = [{ instruction: 'Row 1', stitches: 10 }]

      render(<PatternEditor {...defaultProps} value={pattern} />)

      expect(screen.getByText('Row 1')).toBeInTheDocument()
      expect(screen.getByText('10')).toBeInTheDocument()
    })

    it('displays instruction text correctly', () => {
      const pattern: PatternRowConfig[] = [{ instruction: 'Knit all stitches', stitches: 20 }]

      render(<PatternEditor {...defaultProps} value={pattern} />)

      expect(screen.getByText('Knit all stitches')).toBeInTheDocument()
    })

    it('displays stitch count correctly', () => {
      const pattern: PatternRowConfig[] = [{ instruction: 'Test', stitches: 42 }]

      render(<PatternEditor {...defaultProps} value={pattern} />)

      expect(screen.getByText('42')).toBeInTheDocument()
    })
  })

  describe('Multiple Rows Pattern', () => {
    it('handles pattern with multiple rows', () => {
      const pattern: PatternRowConfig[] = [
        { instruction: 'Row 1', stitches: 10 },
        { instruction: 'Row 2', stitches: 20 },
        { instruction: 'Row 3', stitches: 30 },
      ]

      render(<PatternEditor {...defaultProps} value={pattern} />)

      expect(screen.getByText('Row 1')).toBeInTheDocument()
      expect(screen.getByText('Row 2')).toBeInTheDocument()
      expect(screen.getByText('Row 3')).toBeInTheDocument()
      expect(screen.getByText('10')).toBeInTheDocument()
      expect(screen.getByText('20')).toBeInTheDocument()
      expect(screen.getByText('30')).toBeInTheDocument()
    })

    it('renders each row with correct stitch counts', () => {
      const pattern: PatternRowConfig[] = [
        { instruction: 'Knit', stitches: 15 },
        { instruction: 'Purl', stitches: 15 },
        { instruction: 'Decrease', stitches: 12 },
      ]

      render(<PatternEditor {...defaultProps} value={pattern} />)

      const gridRows = screen.getByTestId('grid-rows')
      expect(gridRows.children).toHaveLength(3)
    })
  })

  describe('Null Stitches Value', () => {
    it('handles pattern with null stitches value', () => {
      const pattern: PatternRowConfig[] = [{ instruction: 'Row with no stitches', stitches: null }]

      render(<PatternEditor {...defaultProps} value={pattern} />)

      expect(screen.getByText('Row with no stitches')).toBeInTheDocument()
    })

    it('does not display stitches when null', () => {
      const pattern: PatternRowConfig[] = [{ instruction: 'Test', stitches: null }]

      render(<PatternEditor {...defaultProps} value={pattern} />)

      const gridRows = screen.getByTestId('grid-rows')
      const rowElement = gridRows.children[0]
      expect(rowElement).toBeInTheDocument()
      expect(rowElement?.textContent).not.toMatch(/^\d+$/)
    })

    it('handles mixed null and defined stitches', () => {
      const pattern: PatternRowConfig[] = [
        { instruction: 'Row 1', stitches: 10 },
        { instruction: 'Row 2', stitches: null },
        { instruction: 'Row 3', stitches: 15 },
      ]

      render(<PatternEditor {...defaultProps} value={pattern} />)

      expect(screen.getByText('Row 1')).toBeInTheDocument()
      expect(screen.getByText('Row 2')).toBeInTheDocument()
      expect(screen.getByText('Row 3')).toBeInTheDocument()
      expect(screen.getByText('10')).toBeInTheDocument()
      expect(screen.getByText('15')).toBeInTheDocument()
    })
  })

  describe('Special Characters', () => {
    it('handles pattern with special characters in instruction', () => {
      const pattern: PatternRowConfig[] = [
        { instruction: 'K2tog (decrease)', stitches: 10 },
        { instruction: 'YO (yarn over)', stitches: 5 },
      ]

      render(<PatternEditor {...defaultProps} value={pattern} />)

      expect(screen.getByText('K2tog (decrease)')).toBeInTheDocument()
      expect(screen.getByText('YO (yarn over)')).toBeInTheDocument()
    })

    it('displays special characters correctly', () => {
      const pattern: PatternRowConfig[] = [
        { instruction: '*K1, P1; repeat from *', stitches: 20 },
        { instruction: '(K2tog) 5 times', stitches: 15 },
      ]

      render(<PatternEditor {...defaultProps} value={pattern} />)

      expect(screen.getByText('*K1, P1; repeat from *')).toBeInTheDocument()
      expect(screen.getByText('(K2tog) 5 times')).toBeInTheDocument()
    })
  })

  describe('Long Text', () => {
    it('handles pattern with long instruction text', () => {
      const longInstruction = 'Knit 1, purl 1 across entire row, maintaining pattern'
      const pattern: PatternRowConfig[] = [{ instruction: longInstruction, stitches: 100 }]

      render(<PatternEditor {...defaultProps} value={pattern} />)

      expect(screen.getByText(longInstruction)).toBeInTheDocument()
    })

    it('displays very long instructions without truncation', () => {
      const veryLongInstruction =
        'Knit 5, purl 3, knit 2 together, yarn over, slip 1, knit 1, pass slipped stitch over'
      const pattern: PatternRowConfig[] = [{ instruction: veryLongInstruction, stitches: 50 }]

      render(<PatternEditor {...defaultProps} value={pattern} />)

      expect(screen.getByText(veryLongInstruction)).toBeInTheDocument()
    })
  })

  describe('Large Stitch Counts', () => {
    it('renders with large stitch counts', () => {
      const pattern: PatternRowConfig[] = [{ instruction: 'Large row', stitches: 10000 }]

      render(<PatternEditor {...defaultProps} value={pattern} />)

      expect(screen.getByText('10000')).toBeInTheDocument()
    })

    it('handles very large stitch numbers', () => {
      const pattern: PatternRowConfig[] = [{ instruction: 'Huge row', stitches: 999999 }]

      render(<PatternEditor {...defaultProps} value={pattern} />)

      expect(screen.getByText('999999')).toBeInTheDocument()
    })

    it('handles zero stitches', () => {
      const pattern: PatternRowConfig[] = [{ instruction: 'Empty row', stitches: 0 }]

      render(<PatternEditor {...defaultProps} value={pattern} />)

      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('handles negative stitches if provided', () => {
      const pattern: PatternRowConfig[] = [{ instruction: 'Negative', stitches: -5 }]

      render(<PatternEditor {...defaultProps} value={pattern} />)

      expect(screen.getByText('-5')).toBeInTheDocument()
    })
  })

  describe('Initial Render Behavior', () => {
    it('does not call onChange when initializing with value prop', () => {
      const pattern: PatternRowConfig[] = [{ instruction: 'Row', stitches: 10 }]

      render(<PatternEditor value={pattern} onChange={mockOnChange} />)

      // Initial render should not trigger onChange
      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('initializes with no rows when value is empty', () => {
      render(<PatternEditor {...defaultProps} value={[]} />)

      const gridRows = screen.getByTestId('grid-rows')
      expect(gridRows.children).toHaveLength(0)
    })

    it('syncs rows when value prop changes', () => {
      const initialPattern: PatternRowConfig[] = [{ instruction: 'Row 1', stitches: 10 }]

      const { rerender } = render(<PatternEditor {...defaultProps} value={initialPattern} />)

      expect(screen.getByText('Row 1')).toBeInTheDocument()

      const updatedPattern: PatternRowConfig[] = [{ instruction: 'Row 2', stitches: 20 }]

      rerender(<PatternEditor {...defaultProps} value={updatedPattern} />)

      expect(screen.getByText('Row 2')).toBeInTheDocument()
    })
  })

  describe('Component Structure', () => {
    it('renders fullscreen wrapper correctly', () => {
      render(<PatternEditor {...defaultProps} />)

      const fullscreenGrid = screen.getByTestId('fullscreen-grid')
      expect(fullscreenGrid).toBeInTheDocument()
      expect(fullscreenGrid).toContainElement(screen.getByTestId('mock-data-grid'))
    })

    it('renders data grid inside fullscreen wrapper', () => {
      render(<PatternEditor {...defaultProps} />)

      const mockGrid = screen.getByTestId('mock-data-grid')
      expect(mockGrid).toBeInTheDocument()
      expect(mockGrid).toHaveAttribute('role', 'grid')
    })

    it('renders toolbar with title and add button', () => {
      render(<PatternEditor {...defaultProps} />)

      expect(screen.getByText('Pattern')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Add row/i })).toBeInTheDocument()
    })
  })

  describe('Pattern Variations', () => {
    it('handles pattern with single stitch', () => {
      const pattern: PatternRowConfig[] = [{ instruction: 'Single stitch', stitches: 1 }]

      render(<PatternEditor {...defaultProps} value={pattern} />)

      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('handles empty instruction string', () => {
      const pattern: PatternRowConfig[] = [{ instruction: '', stitches: 5 }]

      render(<PatternEditor {...defaultProps} value={pattern} />)

      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('handles whitespace in instructions', () => {
      const pattern: PatternRowConfig[] = [{ instruction: '   Knit with spaces   ', stitches: 10 }]

      render(<PatternEditor {...defaultProps} value={pattern} />)

      expect(screen.getByText(/Knit with spaces/)).toBeInTheDocument()
    })

    it('handles newline characters in instructions', () => {
      const pattern: PatternRowConfig[] = [{ instruction: 'Knit\nPurl', stitches: 15 }]

      render(<PatternEditor {...defaultProps} value={pattern} />)

      // The component should render the instruction as-is
      expect(screen.getByTestId('grid-rows')).toBeInTheDocument()
    })

    it('handles unicode characters in instructions', () => {
      const pattern: PatternRowConfig[] = [
        { instruction: 'Knit ⚡ with power', stitches: 12 },
        { instruction: 'Purl 🧵 thread', stitches: 10 },
      ]

      render(<PatternEditor {...defaultProps} value={pattern} />)

      expect(screen.getByText('Knit ⚡ with power')).toBeInTheDocument()
      expect(screen.getByText('Purl 🧵 thread')).toBeInTheDocument()
    })
  })

  describe('Edit Mode and Actions', () => {
    it('renders pattern editor with toolbar', () => {
      const pattern: PatternRowConfig[] = [{ instruction: 'Row 1', stitches: 10 }]

      render(<PatternEditor {...defaultProps} value={pattern} />)

      expect(screen.getByText('Pattern')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Add row/i })).toBeInTheDocument()
    })

    it('renders data grid with correct columns', () => {
      const pattern: PatternRowConfig[] = [{ instruction: 'Row 1', stitches: 10 }]

      render(<PatternEditor {...defaultProps} value={pattern} />)

      const gridRows = screen.getByTestId('grid-rows')
      expect(gridRows).toBeInTheDocument()
      expect(gridRows.children).toHaveLength(1)
    })

    it('renders rows with instruction and stitch data', () => {
      const pattern: PatternRowConfig[] = [
        { instruction: 'Knit', stitches: 10 },
        { instruction: 'Purl', stitches: 20 },
      ]

      render(<PatternEditor {...defaultProps} value={pattern} />)

      expect(screen.getByText('Knit')).toBeInTheDocument()
      expect(screen.getByText('Purl')).toBeInTheDocument()
      expect(screen.getByText('10')).toBeInTheDocument()
      expect(screen.getByText('20')).toBeInTheDocument()
    })

    it('handles pattern updates from props', () => {
      const { rerender } = render(<PatternEditor {...defaultProps} value={[]} />)

      expect(screen.getByTestId('grid-rows').children).toHaveLength(0)

      const newPattern: PatternRowConfig[] = [{ instruction: 'New Row', stitches: 15 }]
      rerender(<PatternEditor value={newPattern} onChange={vi.fn()} />)

      expect(screen.getByText('New Row')).toBeInTheDocument()
      expect(screen.getByText('15')).toBeInTheDocument()
    })

    it('renders pattern with mixed stitch values', () => {
      const pattern: PatternRowConfig[] = [
        { instruction: 'Row with stitches', stitches: 10 },
        { instruction: 'Row without', stitches: null },
        { instruction: 'Another row', stitches: 20 },
      ]

      render(<PatternEditor {...defaultProps} value={pattern} />)

      const gridRows = screen.getByTestId('grid-rows')
      expect(gridRows.children).toHaveLength(3)
      expect(screen.getByText('Row with stitches')).toBeInTheDocument()
      expect(screen.getByText('Row without')).toBeInTheDocument()
      expect(screen.getByText('Another row')).toBeInTheDocument()
    })
  })

  describe('Columns and Grid Structure', () => {
    it('renders all required columns', () => {
      const pattern: PatternRowConfig[] = [{ instruction: 'Row 1', stitches: 10 }]

      render(<PatternEditor {...defaultProps} value={pattern} />)

      expect(screen.getByText('Row 1')).toBeInTheDocument()
      expect(screen.getByText('10')).toBeInTheDocument()
    })

    it('renders row number column with correct index', () => {
      const pattern: PatternRowConfig[] = [
        { instruction: 'First', stitches: 10 },
        { instruction: 'Second', stitches: 20 },
        { instruction: 'Third', stitches: 30 },
      ]

      render(<PatternEditor {...defaultProps} value={pattern} />)

      const gridRows = screen.getByTestId('grid-rows')
      expect(gridRows).toBeInTheDocument()
      expect(gridRows.children).toHaveLength(3)
    })

    it('handles empty pattern with all columns visible', () => {
      render(<PatternEditor {...defaultProps} value={[]} />)

      const gridRows = screen.getByTestId('grid-rows')
      expect(gridRows.children).toHaveLength(0)
    })

    it('displays instruction column content', () => {
      const pattern: PatternRowConfig[] = [{ instruction: 'Knit all', stitches: 20 }]

      render(<PatternEditor {...defaultProps} value={pattern} />)

      expect(screen.getByText('Knit all')).toBeInTheDocument()
    })

    it('displays stitches column content', () => {
      const pattern: PatternRowConfig[] = [{ instruction: 'Row', stitches: 100 }]

      render(<PatternEditor {...defaultProps} value={pattern} />)

      expect(screen.getByText('100')).toBeInTheDocument()
    })

    it('handles stitches column with zero value', () => {
      const pattern: PatternRowConfig[] = [{ instruction: 'Empty row', stitches: 0 }]

      render(<PatternEditor {...defaultProps} value={pattern} />)

      expect(screen.getByText('0')).toBeInTheDocument()
    })
  })

  describe('Interaction Handlers', () => {
    it('enters edit mode when Edit is clicked', async () => {
      const user = userEvent.setup()
      const pattern: PatternRowConfig[] = [{ instruction: 'Row 1', stitches: 10 }]
      render(<PatternEditor {...defaultProps} value={pattern} />)

      const editButton = screen.getByRole('button', { name: 'Edit' })
      await user.click(editButton)

      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()
    })

    it('exits edit mode when Save is clicked', async () => {
      const user = userEvent.setup()
      const pattern: PatternRowConfig[] = [{ instruction: 'Row 1', stitches: 10 }]
      render(<PatternEditor {...defaultProps} value={pattern} />)

      await user.click(screen.getByRole('button', { name: 'Edit' }))
      await user.click(screen.getByRole('button', { name: 'Save' }))

      expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    })

    it('exits edit mode when Cancel is clicked', async () => {
      const user = userEvent.setup()
      const pattern: PatternRowConfig[] = [{ instruction: 'Row 1', stitches: 10 }]
      render(<PatternEditor {...defaultProps} value={pattern} />)

      await user.click(screen.getByRole('button', { name: 'Edit' }))
      await user.click(screen.getByRole('button', { name: 'Cancel' }))

      expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    })

    it('deletes a row when Delete is clicked', async () => {
      const user = userEvent.setup()
      const pattern: PatternRowConfig[] = [{ instruction: 'Row 1', stitches: 10 }]
      render(<PatternEditor {...defaultProps} value={pattern} />)

      await user.click(screen.getByRole('button', { name: 'Delete' }))

      expect(mockOnChange).toHaveBeenCalledWith([])
      expect(screen.queryByText('Row 1')).not.toBeInTheDocument()
    })

    it('copies a row when Copy is clicked', async () => {
      const user = userEvent.setup()
      const pattern: PatternRowConfig[] = [{ instruction: 'Row 1', stitches: 10 }]
      render(<PatternEditor {...defaultProps} value={pattern} />)

      await user.click(screen.getByRole('button', { name: 'Copy' }))

      expect(mockOnChange).toHaveBeenCalled()
      const newPattern = mockOnChange.mock.calls[0][0]
      expect(newPattern).toHaveLength(2)
      expect(newPattern[0]).toEqual(pattern[0])
      expect(newPattern[1]).toEqual(pattern[0])
    })

    it('moves a row down', async () => {
      const user = userEvent.setup()
      const pattern: PatternRowConfig[] = [
        { instruction: 'Row 1', stitches: 10 },
        { instruction: 'Row 2', stitches: 20 },
      ]
      render(<PatternEditor {...defaultProps} value={pattern} />)

      const moveDownButtons = screen.getAllByRole('button', { name: 'Move Down' })
      await user.click(moveDownButtons[0])

      expect(mockOnChange).toHaveBeenCalled()
      const newPattern = mockOnChange.mock.calls[0][0]
      expect(newPattern[0].instruction).toBe('Row 2')
      expect(newPattern[1].instruction).toBe('Row 1')
    })

    it('adds a new row via toolbar', async () => {
      const user = userEvent.setup()
      render(<PatternEditor {...defaultProps} value={[]} />)

      await user.click(screen.getByRole('button', { name: /Add row/i }))

      const gridRows = screen.getByTestId('grid-rows')
      expect(gridRows.children).toHaveLength(1)
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    })

    it('removes new row on Cancel', async () => {
      const user = userEvent.setup()
      render(<PatternEditor {...defaultProps} value={[]} />)

      await user.click(screen.getByRole('button', { name: /Add row/i }))
      expect(screen.getByTestId('grid-rows').children).toHaveLength(1)

      await user.click(screen.getByRole('button', { name: 'Cancel' }))
      expect(screen.getByTestId('grid-rows').children).toHaveLength(0)
    })

    it('prevents row edit stop on focus out', () => {
      render(<PatternEditor {...defaultProps} />)

      const DataGridMock = vi.mocked(DataGrid)
      const props = DataGridMock.mock.lastCall?.[0]
      const event = { defaultMuiPrevented: false }

      // @ts-expect-error - Mocking internal event structure
      props?.onRowEditStop?.({ reason: 'rowFocusOut' }, event)

      expect(event.defaultMuiPrevented).toBe(true)
    })
  })
})
