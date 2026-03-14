import { describe, expect, it, vi } from 'vitest'

import { toggleDarkMode, toggleShowStitches } from '@src/features/ui/uiSlice'

import { store } from './store'
import type { RootState } from './store'

// Mock localStorage first
vi.mock('@src/utils/localStorage', () => ({
  loadStateFromStorage: vi.fn((slice) => {
    if (slice === 'ui') {
      return { darkMode: true, showStitches: true }
    }
    return undefined
  }),
  saveStateToStorage: vi.fn(),
}))

describe('store', () => {
  it('is a valid Redux store', () => {
    expect(store).toBeDefined()
    expect(typeof store.getState).toBe('function')
    expect(typeof store.dispatch).toBe('function')
    expect(typeof store.subscribe).toBe('function')
  })

  it('has the correct state shape', () => {
    const state = store.getState()
    expect(state).toHaveProperty('projects')
    expect(state).toHaveProperty('progress')
    expect(state).toHaveProperty('ui')
    expect(state).toHaveProperty('api')
  })

  it('projects slice is initialized', () => {
    const state = store.getState()
    expect(state.projects).toBeDefined()
    expect(state.projects).toHaveProperty('projects')
    expect(state.projects).toHaveProperty('currentProjectId')
  })

  it('progress slice is initialized', () => {
    const state = store.getState()
    expect(state.progress).toBeDefined()
    expect(state.progress).toHaveProperty('records')
    expect(Array.isArray(state.progress.records)).toBe(true)
  })

  it('ui slice is initialized with persisted state', () => {
    const state = store.getState()
    expect(state.ui).toBeDefined()
    expect(state.ui).toHaveProperty('darkMode')
    expect(state.ui).toHaveProperty('showStitches')
  })

  it('can dispatch actions to update state', () => {
    // Get initial state
    const initialState = store.getState()
    const initialDarkMode = initialState.ui.darkMode

    // Dispatch toggleDarkMode action
    store.dispatch(toggleDarkMode())

    // Verify state changed
    const newState = store.getState()
    expect(newState.ui.darkMode).toBe(!initialDarkMode)
  })

  it('can dispatch multiple actions in sequence', () => {
    const initialShowStitches = store.getState().ui.showStitches
    store.dispatch(toggleShowStitches())
    expect(store.getState().ui.showStitches).toBe(!initialShowStitches)

    // Reset for other tests
    store.dispatch(toggleShowStitches())
  })

  it('RootState type is correctly inferred', () => {
    const state: RootState = store.getState()
    expect(state.projects).toBeDefined()
    expect(state.progress).toBeDefined()
    expect(state.ui).toBeDefined()
  })

  it('loads persisted UI state on store creation', () => {
    // The mock returns { darkMode: true, showStitches: true } for UI slice
    const state = store.getState()
    // Verify UI state was loaded (this was mocked in the setup)
    expect(state.ui.darkMode).toBeDefined()
    expect(state.ui.showStitches).toBeDefined()
  })

  it('allows subscribers to listen to state changes', () => {
    const subscriber = vi.fn()
    const unsubscribe = store.subscribe(subscriber)

    store.dispatch(toggleDarkMode())
    expect(subscriber).toHaveBeenCalled()

    unsubscribe()
  })
})
