import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { SvgIconProps } from '@mui/material/SvgIcon'

import LinkSwitch from './LinkSwitch'

vi.mock('@mui/icons-material/Link', () => ({
  default: (props: SvgIconProps) => <svg data-testid="LinkIcon" {...props} />,
}))

vi.mock('@mui/icons-material/LinkOff', () => ({
  default: (props: SvgIconProps) => <svg data-testid="LinkOffIcon" {...props} />,
}))

describe('LinkSwitch', () => {
  it('renders LinkIcon when checked is true', () => {
    render(<LinkSwitch checked={true} onClick={() => {}} />)
    expect(screen.getByTestId('LinkIcon')).toBeInTheDocument()
    expect(screen.queryByTestId('LinkOffIcon')).not.toBeInTheDocument()
  })

  it('renders LinkOffIcon when checked is false', () => {
    render(<LinkSwitch checked={false} onClick={() => {}} />)
    expect(screen.getByTestId('LinkOffIcon')).toBeInTheDocument()
    expect(screen.queryByTestId('LinkIcon')).not.toBeInTheDocument()
  })

  it('calls onClick handler when clicked', async () => {
    const user = userEvent.setup()
    const mockOnClick = vi.fn()
    render(<LinkSwitch checked={false} onClick={mockOnClick} />)

    const button = screen.getByRole('button')
    await user.click(button)

    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })
})
