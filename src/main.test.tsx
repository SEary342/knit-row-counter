import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// 1. Setup Mocks (Hoisted by Vitest)
vi.mock('react-dom/client', () => {
  const render = vi.fn()
  const createRoot = vi.fn(() => ({ render }))
  return { createRoot }
})

vi.mock('./App', () => ({
  default: () => <div data-testid="app-mock">App</div>,
}))

vi.mock('./app/store', () => ({
  store: {
    getState: vi.fn(),
    subscribe: vi.fn(),
    dispatch: vi.fn(),
  },
}))

describe('Main Entry Point', () => {
  beforeEach(() => {
    vi.resetModules() // Vital: Clears the module cache for main.tsx
    vi.clearAllMocks()

    // Prepare the DOM
    document.body.innerHTML = '<div id="root"></div>'
  })

  it('renders without crashing', async () => {
    const { createRoot } = await import('react-dom/client')
    await import('./main')

    expect(createRoot).toHaveBeenCalledWith(document.getElementById('root'))

    const mockRootInstance = vi.mocked(createRoot).mock.results[0].value
    expect(mockRootInstance.render).toHaveBeenCalled()
  })

  it('wraps the App in necessary Providers', async () => {
    const { createRoot } = await import('react-dom/client')
    await import('./main')

    const mockRootInstance = vi.mocked(createRoot).mock.results[0].value
    const renderedJSX = mockRootInstance.render.mock.calls[0][0]

    // StrictMode is the top-level element
    expect(renderedJSX.type).toBe(React.StrictMode)

    // Drill down: StrictMode > Provider > HashRouter > App
    const provider = renderedJSX.props.children
    const hashRouter = provider.props.children
    const app = hashRouter.props.children

    // Check by component name or existence
    expect(provider.props.store).toBeDefined()
    expect(hashRouter.type.name).toMatch(/HashRouter|BrowserRouter/)
    expect(app).toBeDefined()
  })
})
