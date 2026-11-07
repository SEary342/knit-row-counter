import { ThemeProvider, createTheme } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ConfirmationDialog from './ConfirmationDialog'

describe('ConfirmationDialog', () => {
  const mockOnClose = vi.fn()
  const mockOnConfirm = vi.fn()

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
    title: 'Test Title',
    message: 'Test message for confirmation.',
  }

  const testTheme = createTheme({
    components: {
      MuiButtonBase: {
        defaultProps: {
          disableRipple: true,
        },
      },
    },
  })

  const renderDialog = (props: Parameters<typeof ConfirmationDialog>[0] = defaultProps) =>
    render(
      <ThemeProvider theme={testTheme}>
        <ConfirmationDialog {...props} />
      </ThemeProvider>,
    )

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the dialog with title and message when open', () => {
    renderDialog()

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test message for confirmation.')).toBeInTheDocument()
  })

  it('does not render the dialog when not open', () => {
    renderDialog({ ...defaultProps, open: false })

    expect(screen.queryByText('Test Title')).not.toBeInTheDocument()
  })

  it('calls onConfirm when the confirm button is clicked', async () => {
    const user = userEvent.setup()
    renderDialog()

    const confirmButton = screen.getByRole('button', { name: 'Confirm' })
    await user.click(confirmButton)

    expect(mockOnConfirm).toHaveBeenCalledTimes(1)
    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('calls onClose when the cancel button is clicked', async () => {
    const user = userEvent.setup()
    renderDialog()

    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    await user.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
    expect(mockOnConfirm).not.toHaveBeenCalled()
  })

  it('displays custom confirm text and color', () => {
    renderDialog({ ...defaultProps, confirmText: 'Delete', confirmColor: 'error' })

    const confirmButton = screen.getByRole('button', { name: 'Delete' })
    expect(confirmButton).toBeInTheDocument()
    expect(confirmButton).toHaveClass('MuiButton-colorError')
  })

  it('gives the confirm button autoFocus', () => {
    renderDialog()
    const confirmButton = screen.getByRole('button', { name: 'Confirm' })
    expect(confirmButton).toHaveFocus()
  })
})
