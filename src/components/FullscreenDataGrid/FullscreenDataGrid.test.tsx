import { useMediaQuery } from '@mui/material'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import FullscreenDataGrid from './FullscreenDataGrid'

// Mock MUI's useMediaQuery
vi.mock('@mui/material', async () => {
  const actual = await vi.importActual<typeof import('@mui/material')>('@mui/material')
  return {
    ...actual,
    useMediaQuery: vi.fn(),
  }
})

// Mock child component (DataGrid)
const MockDataGrid = (props: {
  slotProps?: {
    toolbar?: {
      FullscreenToggleButton?: React.ReactNode
    }
  }
}) => {
  const { slotProps } = props
  const FullscreenToggleButton = slotProps?.toolbar?.FullscreenToggleButton

  return (
    <div data-testid="mock-data-grid">
      Mock Data Grid
      {FullscreenToggleButton && (
        <div data-testid="fullscreen-toggle-container">{FullscreenToggleButton}</div>
      )}
    </div>
  )
}

describe('FullscreenDataGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default to desktop
    vi.mocked(useMediaQuery).mockReturnValue(false)
  })

  it('renders children correctly', () => {
    render(
      <FullscreenDataGrid height={500}>
        <MockDataGrid />
      </FullscreenDataGrid>,
    )

    expect(screen.getByTestId('mock-data-grid')).toBeInTheDocument()
    expect(screen.getByText('Mock Data Grid')).toBeInTheDocument()
  })

  it('does not render toggle button on desktop', () => {
    vi.mocked(useMediaQuery).mockReturnValue(false)
    render(
      <FullscreenDataGrid height={500}>
        <MockDataGrid />
      </FullscreenDataGrid>,
    )

    expect(screen.queryByTestId('fullscreen-toggle-container')).not.toBeInTheDocument()
  })

  it('renders toggle button on mobile', () => {
    vi.mocked(useMediaQuery).mockReturnValue(true)
    render(
      <FullscreenDataGrid height={500}>
        <MockDataGrid />
      </FullscreenDataGrid>,
    )

    expect(screen.getByTestId('fullscreen-toggle-container')).toBeInTheDocument()
    expect(screen.getByLabelText('toggle fullscreen')).toBeInTheDocument()
  })

  it('toggles fullscreen mode', async () => {
    vi.mocked(useMediaQuery).mockReturnValue(true)
    render(
      <FullscreenDataGrid height={500}>
        <MockDataGrid />
      </FullscreenDataGrid>,
    )

    // Initially no dialog
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    // Click toggle
    fireEvent.click(screen.getByLabelText('toggle fullscreen'))

    // Dialog should appear
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toBeInTheDocument()

    // Check content inside dialog
    const gridInDialog = within(dialog).getByTestId('mock-data-grid')
    expect(gridInDialog).toBeInTheDocument()

    // Click toggle inside dialog to close
    const toggleInDialog = within(dialog).getByLabelText('toggle fullscreen')
    fireEvent.click(toggleInDialog)

    // Dialog should close
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})
