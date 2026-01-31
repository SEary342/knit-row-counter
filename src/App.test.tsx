import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAppSelector } from '@src/app/hooks'

import App from './App'

// Mock hooks
vi.mock('@src/app/hooks', () => ({
  useAppSelector: vi.fn(),
  useAppDispatch: vi.fn(),
}))

// Mock child components to isolate App logic
vi.mock('./components/Layout/Layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-layout">{children}</div>
  ),
}))

vi.mock('@src/pages/ProjectPickerView', () => ({
  default: () => <div data-testid="project-picker-view" />,
}))

vi.mock('@src/pages/ProjectView', () => ({
  default: () => <div data-testid="project-view" />,
}))

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default mock for useAppSelector (darkMode: true)
    vi.mocked(useAppSelector).mockReturnValue(true)
  })

  it('renders Layout and ProjectPickerView on root route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('mock-layout')).toBeInTheDocument()
    expect(screen.getByTestId('project-picker-view')).toBeInTheDocument()
  })

  it('renders ProjectView on /project/:id route', () => {
    render(
      <MemoryRouter initialEntries={['/project/123']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('mock-layout')).toBeInTheDocument()
    expect(screen.getByTestId('project-view')).toBeInTheDocument()
  })

  it('redirects to root on unknown route', () => {
    render(
      <MemoryRouter initialEntries={['/does-not-exist']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('project-picker-view')).toBeInTheDocument()
  })

  it('initializes theme based on store state', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )

    expect(useAppSelector).toHaveBeenCalled()
  })
})
