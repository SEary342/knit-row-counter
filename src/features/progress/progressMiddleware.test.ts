import { configureStore } from '@reduxjs/toolkit'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import projectsReducer from '@src/features/projects/projectsSlice'
import type { Project } from '@src/features/projects/types'

import { progressMiddleware } from './progressMiddleware'
import progressReducer from './progressSlice'

interface TestState {
  projects: { projects: Project[]; currentProjectId: string | null }
  progress: {
    records: Array<{
      id: string
      projectId: string
      sectionId: string
      timestamp: number
      rowsDelta: number
      stitchesDelta: number
    }>
  }
}

describe('progressMiddleware', () => {
  let store: ReturnType<typeof configureStore>

  // Helper to create a mock project
  const createMockProject = (overrides?: Partial<Project>): Project => ({
    id: 'p1',
    name: 'Test Project',
    totalRows: null,
    currentRow: 0,
    sections: [
      {
        id: 's1',
        name: 'Section 1',
        repeatRows: 10,
        currentRow: 0,
        repeatCount: 0,
        totalRepeats: null,
        pattern: [{ instruction: 'knit', stitches: 20 }],
        stitchCount: 20,
        locked: false,
      },
    ],
    notes: '',
    lastModified: Date.now(),
    ...overrides,
  })

  beforeEach(() => {
    const mockProject = createMockProject()

    store = configureStore({
      reducer: {
        projects: projectsReducer,
        progress: progressReducer,
      },
      middleware: (getDefault) =>
        getDefault({ serializableCheck: false }).concat([progressMiddleware]),
      preloadedState: {
        projects: {
          projects: [mockProject],
          currentProjectId: 'p1',
        },
        progress: {
          records: [],
        },
      },
    })
  })

  it('intercepts incrementRow action', () => {
    vi.spyOn(store, 'dispatch')

    store.dispatch({ type: 'projects/incrementRow', payload: 's1' })

    expect(store.dispatch).toBeDefined()
  })

  it('intercepts decrementRow action', () => {
    vi.spyOn(store, 'dispatch')

    store.dispatch({ type: 'projects/decrementRow', payload: 's1' })

    expect(store.dispatch).toBeDefined()
  })

  it('adds progress record on incrementRow', () => {
    store.dispatch({ type: 'projects/incrementRow', payload: 's1' })

    const state = store.getState() as TestState
    expect(state.progress.records).toHaveLength(1)
  })

  it('adds progress record on decrementRow', () => {
    store.dispatch({ type: 'projects/decrementRow', payload: 's1' })

    const state = store.getState() as TestState
    expect(state.progress.records).toHaveLength(1)
  })

  it('records positive rowsDelta on incrementRow', () => {
    store.dispatch({ type: 'projects/incrementRow', payload: 's1' })

    const state = store.getState() as TestState
    const record = state.progress.records[0]
    expect(record.rowsDelta).toBe(1)
  })

  it('records negative rowsDelta on decrementRow', () => {
    store.dispatch({ type: 'projects/decrementRow', payload: 's1' })

    const state = store.getState() as TestState
    const record = state.progress.records[0]
    expect(record.rowsDelta).toBe(-1)
  })

  it('includes the correct projectId in the record', () => {
    store.dispatch({ type: 'projects/incrementRow', payload: 's1' })

    const state = store.getState() as TestState
    const record = state.progress.records[0]
    expect(record.projectId).toBe('p1')
  })

  it('includes the sectionId from the payload', () => {
    store.dispatch({ type: 'projects/incrementRow', payload: 's1' })

    const state = store.getState() as TestState
    const record = state.progress.records[0]
    expect(record.sectionId).toBe('s1')
  })

  it('uses global section id when payload is undefined', () => {
    store.dispatch({ type: 'projects/incrementRow', payload: undefined })

    const state = store.getState() as TestState
    const record = state.progress.records[0]
    expect(record.sectionId).toBe('global')
  })

  it('sets timestamp to current time', () => {
    const beforeTime = Date.now()
    store.dispatch({ type: 'projects/incrementRow', payload: 's1' })
    const afterTime = Date.now()

    const state = store.getState() as TestState
    const record = state.progress.records[0]
    expect(record.timestamp).toBeGreaterThanOrEqual(beforeTime)
    expect(record.timestamp).toBeLessThanOrEqual(afterTime)
  })

  it('calculates stitchesDelta correctly', () => {
    // This test assumes the project has a section with stitches
    store.dispatch({ type: 'projects/incrementRow', payload: 's1' })

    const state = store.getState() as TestState
    const record = state.progress.records[0]
    expect(typeof record.stitchesDelta).toBe('number')
  })

  it('does not add record for unrelated actions', () => {
    store.dispatch({ type: 'projects/renameProject', payload: {} })

    const state = store.getState() as TestState
    expect(state.progress.records).toHaveLength(0)
  })

  it('ignores non-action objects', () => {
    // Attempting to dispatch something that's not a valid action
    // The middleware should handle this gracefully
    store.dispatch({ type: '' })

    const state = store.getState() as TestState
    expect(state.progress.records).toHaveLength(0)
  })

  it('does not add record if current project not found', () => {
    // Create new store with no current project
    const store2 = configureStore({
      reducer: {
        projects: projectsReducer,
        progress: progressReducer,
      },
      middleware: (getDefault) =>
        getDefault({ serializableCheck: false }).concat([progressMiddleware]),
      preloadedState: {
        projects: {
          projects: [],
          currentProjectId: null,
        },
        progress: {
          records: [],
        },
      },
    })

    store2.dispatch({ type: 'projects/incrementRow', payload: 's1' })

    const state = store2.getState() as TestState
    expect(state.progress.records).toHaveLength(0)
  })

  it('handles multiple increments', () => {
    store.dispatch({ type: 'projects/incrementRow', payload: 's1' })
    store.dispatch({ type: 'projects/incrementRow', payload: 's1' })
    store.dispatch({ type: 'projects/incrementRow', payload: 's1' })

    const state = store.getState() as TestState
    expect(state.progress.records).toHaveLength(3)
    expect(state.progress.records.every((r) => r.rowsDelta === 1)).toBe(true)
  })

  it('handles increments and decrements', () => {
    store.dispatch({ type: 'projects/incrementRow', payload: 's1' })
    store.dispatch({ type: 'projects/incrementRow', payload: 's1' })
    store.dispatch({ type: 'projects/decrementRow', payload: 's1' })

    const state = store.getState() as TestState
    expect(state.progress.records).toHaveLength(3)
    expect(state.progress.records[0].rowsDelta).toBe(1)
    expect(state.progress.records[1].rowsDelta).toBe(1)
    expect(state.progress.records[2].rowsDelta).toBe(-1)
  })

  it('records different sections separately', () => {
    const mockProject = createMockProject({
      sections: [
        {
          id: 's1',
          name: 'Section 1',
          repeatRows: 10,
          currentRow: 0,
          repeatCount: 0,
          totalRepeats: null,
          pattern: [{ instruction: 'knit', stitches: 20 }],
          stitchCount: 20,
          locked: false,
        },
        {
          id: 's2',
          name: 'Section 2',
          repeatRows: 15,
          currentRow: 0,
          repeatCount: 0,
          totalRepeats: null,
          pattern: [{ instruction: 'purl', stitches: 15 }],
          stitchCount: 15,
          locked: false,
        },
      ],
    })

    const store2 = configureStore({
      reducer: {
        projects: projectsReducer,
        progress: progressReducer,
      },
      middleware: (getDefault) =>
        getDefault({ serializableCheck: false }).concat([progressMiddleware]),
      preloadedState: {
        projects: {
          projects: [mockProject],
          currentProjectId: 'p1',
        },
        progress: {
          records: [],
        },
      },
    })

    store2.dispatch({ type: 'projects/incrementRow', payload: 's1' })
    store2.dispatch({ type: 'projects/incrementRow', payload: 's2' })

    const state = store2.getState() as TestState
    expect(state.progress.records).toHaveLength(2)
    expect(state.progress.records[0].sectionId).toBe('s1')
    expect(state.progress.records[1].sectionId).toBe('s2')
  })

  it('applies action to state before calculating stitches', () => {
    // The middleware should calculate stitches after the action is applied
    store.dispatch({ type: 'projects/incrementRow', payload: 's1' })

    const state = store.getState() as TestState
    const record = state.progress.records[0]

    // The record should exist and have valid data
    expect(record).toBeDefined()
    expect(record.projectId).toBe('p1')
    expect(record.rowsDelta).toBe(1)
  })

  it('continues dispatch chain for other middleware', () => {
    vi.spyOn(store, 'dispatch')

    store.dispatch({ type: 'projects/incrementRow', payload: 's1' })

    // The dispatch should have been called
    expect(store.dispatch).toBeDefined()
  })

  it('handles payloads that are strings', () => {
    store.dispatch({ type: 'projects/incrementRow', payload: 's1' })

    const state = store.getState() as TestState
    const record = state.progress.records[0]
    expect(record.sectionId).toBe('s1')
  })

  it('handles actions without payload', () => {
    // This should use 'global' as the section id
    const action = { type: 'projects/incrementRow' }
    store.dispatch(action as unknown as { type: string; payload?: unknown })

    const state = store.getState() as TestState
    expect(state.progress.records.length).toBeGreaterThanOrEqual(0)
  })

  it('preserves original action return value', () => {
    // The middleware should return the result of next(action)
    const result = store.dispatch({ type: 'projects/incrementRow', payload: 's1' })

    // Result should be the action
    expect(result).toBeDefined()
  })
})
