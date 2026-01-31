import { render, screen } from '@testing-library/react'

import LogoIcon from './LogoIcon'

describe('LogoIcon', () => {
  it('renders the logo icon', () => {
    render(<LogoIcon />)
    const svgElement = screen.getByTestId('logo-icon-svg')
    expect(svgElement).toBeInTheDocument()
  })
  it('accepts custom size props', () => {
    render(<LogoIcon width={128} height={128} />)
    const svgElement = screen.getByTestId('logo-icon-svg')
    expect(svgElement).toHaveAttribute('width', '128')
    expect(svgElement).toHaveAttribute('height', '128')
  })
  it('matches the snapshot', () => {
    const { asFragment } = render(<LogoIcon />)
    expect(asFragment()).toMatchSnapshot()
  })
})
