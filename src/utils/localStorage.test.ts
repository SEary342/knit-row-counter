import { describe, it, expect, beforeEach, vi } from 'vitest'

import { loadStateFromStorage, saveStateToStorage } from './localStorage'
import type { RootState } from '../app/store'

const getStorageKey = (slice: keyof RootState) => `knit_slice_${slice}`

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    clear: () => {
      store = {}
    },
    removeItem: (key: string) => {
      delete store[key]
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('localStorage utils', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.spyOn(console, 'error').mockImplementation(() => {}) // silence console errors for the failing test
  })

  const mockProjectsState: RootState['projects'] = {
    projects: [
      {
        id: '1',
        name: 'Test Project',
        sections: [
          {
            id: 'c1',
            name: 'Counter 1',
            currentRow: 10,
            repeatRows: null,
            repeatCount: 0,
            totalRepeats: null,
            pattern: [],
            stitchCount: null,
          },
        ],
        totalRows: null,
        currentRow: 0,
        notes: '',
        lastModified: 0,
      },
    ],
    currentProjectId: '1',
  }

  describe('saveStateToStorage', () => {
    it('should save the state to localStorage', () => {
      saveStateToStorage('projects', mockProjectsState)
      const rawData = localStorage.getItem(getStorageKey('projects'))
      expect(rawData).not.toBeNull()
      expect(JSON.parse(rawData!)).toEqual(mockProjectsState)
    })
  })

  describe('loadStateFromStorage', () => {
    it('should return undefined if no data is in localStorage', () => {
      const result = loadStateFromStorage('projects')
      expect(result).toBeUndefined()
    })

    it('should return the parsed state if data is in localStorage', () => {
      localStorage.setItem(getStorageKey('projects'), JSON.stringify(mockProjectsState))
      const result = loadStateFromStorage('projects')
      expect(result).toEqual(mockProjectsState)
    })

    it('should return undefined if data in localStorage is invalid JSON', () => {
      localStorage.setItem(getStorageKey('projects'), 'invalid json')
      const result = loadStateFromStorage('projects')
      expect(result).toBeUndefined()
    })
  })

  describe('migration', () => {
    it('should migrate an old string[] pattern to the new PatternRowConfig[] format', () => {
      const oldState = {
        projects: [
          {
            id: 'p1',
            name: 'Old Project',
            sections: [
              {
                id: 's1',
                name: 'Old Section',
                pattern: ['k1, p1', 'p2tog'], // Old format
              },
            ],
          },
        ],
        currentProjectId: 'p1',
      }

      localStorage.setItem(getStorageKey('projects'), JSON.stringify(oldState))
      const result = loadStateFromStorage('projects')

      expect(result).not.toBeNull()
      const migratedPattern = result!.projects[0].sections[0].pattern
      expect(migratedPattern).toEqual([
        { instruction: 'k1, p1', stitches: null },
        { instruction: 'p2tog', stitches: null },
      ])
    })

    it('should not modify a pattern that is already in the new format', () => {
      const newState = {
        projects: [
          {
            id: 'p1',
            name: 'New Project',
            sections: [
              {
                id: 's1',
                name: 'New Section',
                pattern: [
                  { instruction: 'k1, p1', stitches: 10 },
                  { instruction: 'p2tog', stitches: 12 },
                ], // New format
              },
            ],
          },
        ],
        currentProjectId: 'p1',
      }

      localStorage.setItem(getStorageKey('projects'), JSON.stringify(newState))
      const result = loadStateFromStorage('projects')

      expect(result).toEqual(newState)
    })
  })
})
