import type { Middleware } from '@reduxjs/toolkit'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { saveStateToStorage } from '@src/utils/localStorage'

import { persistenceMiddleware } from './persistenceMiddleware'

// Mock the localStorage utilities first
vi.mock('@src/utils/localStorage', () => ({
  loadStateFromStorage: vi.fn(() => undefined),
  saveStateToStorage: vi.fn(),
}))

describe('persistenceMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('is a middleware function', () => {
    expect(typeof persistenceMiddleware).toBe('function')
  })

  it('calls next with the action', () => {
    const mockNext = vi.fn((action) => action)
    const mockState = {
      projects: { projects: [], currentProjectId: null },
      progress: { records: [] },
      ui: { darkMode: true, showStitches: true },
    }
    const mockStore = {
      getState: vi.fn(() => mockState),
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dispatch = (persistenceMiddleware as Middleware)(mockStore as any)(mockNext)
    const testAction = { type: 'TEST_ACTION' }

    dispatch(testAction)
    expect(mockNext).toHaveBeenCalledWith(testAction)
  })

  it('returns the result from next', () => {
    const expectedResult = { type: 'RESULT' }
    const mockNext = vi.fn(() => expectedResult)
    const mockState = {
      projects: { projects: [], currentProjectId: null },
      progress: { records: [] },
      ui: { darkMode: true, showStitches: true },
    }
    const mockStore = {
      getState: vi.fn(() => mockState),
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dispatch = (persistenceMiddleware as Middleware)(mockStore as any)(mockNext)
    const result = dispatch({ type: 'TEST_ACTION' })

    expect(result).toBe(expectedResult)
  })

  it('persists projects, progress, and ui slices after action', () => {
    const mockNext = vi.fn((action) => action)
    const mockState = {
      projects: { projects: [{ id: '1', name: 'Test' }], currentProjectId: '1' },
      progress: {
        records: [
          {
            id: 'rec1',
            projectId: '1',
            sectionId: 's1',
            timestamp: 1000,
            rowsDelta: 5,
            stitchesDelta: 10,
          },
        ],
      },
      ui: { darkMode: false, showStitches: false },
    }
    const mockStore = {
      getState: vi.fn(() => mockState),
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dispatch = (persistenceMiddleware as Middleware)(mockStore as any)(mockNext)
    dispatch({ type: 'TEST_ACTION' })

    expect(saveStateToStorage).toHaveBeenCalledWith('projects', mockState.projects)
    expect(saveStateToStorage).toHaveBeenCalledWith('progress', mockState.progress)
    expect(saveStateToStorage).toHaveBeenCalledWith('ui', mockState.ui)
  })

  it('persists all three slices in order', () => {
    const mockNext = vi.fn((action) => action)
    const mockState = {
      projects: { projects: [], currentProjectId: null },
      progress: { records: [] },
      ui: { darkMode: true, showStitches: true },
    }
    const mockStore = {
      getState: vi.fn(() => mockState),
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dispatch = (persistenceMiddleware as Middleware)(mockStore as any)(mockNext)
    dispatch({ type: 'TEST_ACTION' })

    const mocked = saveStateToStorage as ReturnType<typeof vi.fn>
    const calls = mocked.mock.calls
    expect(calls.length).toBe(3)
    expect(calls[0][0]).toBe('projects')
    expect(calls[1][0]).toBe('progress')
    expect(calls[2][0]).toBe('ui')
  })

  it('handles middleware chain properly', () => {
    const mockNext = vi.fn(
      (action) =>
        ({
          ...action,
          processed: true,
        }) as Record<string, unknown>,
    )
    const mockState = {
      projects: { projects: [], currentProjectId: null },
      progress: { records: [] },
      ui: { darkMode: true, showStitches: true },
    }
    const mockStore = {
      getState: vi.fn(() => mockState),
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dispatch = (persistenceMiddleware as Middleware)(mockStore as any)(mockNext)
    const action = { type: 'TEST' }
    const result = dispatch(action) as Record<string, unknown>

    expect(result.processed).toBe(true)
    expect(mockNext).toHaveBeenCalledWith(action)
  })
})
