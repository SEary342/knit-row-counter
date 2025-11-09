import { describe, it, expect, beforeEach, vi } from 'vitest'

import type { Project } from '../features/projects/types'

import { loadProjectsFromStorage, saveProjectsToStorage } from './localStorage'

type ProjectsState = {
  projects: Project[]
  currentProjectId: string | null
}

const STORAGE_KEY = 'knit_projects_v1'

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

  const mockState: ProjectsState = {
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

  describe('saveProjectsToStorage', () => {
    it('should save the state to localStorage', () => {
      saveProjectsToStorage(mockState)
      const rawData = localStorage.getItem(STORAGE_KEY)
      expect(rawData).not.toBeNull()
      expect(JSON.parse(rawData!)).toEqual(mockState)
    })
  })

  describe('loadProjectsFromStorage', () => {
    it('should return null if no data is in localStorage', () => {
      const result = loadProjectsFromStorage()
      expect(result).toBeNull()
    })

    it('should return the parsed state if data is in localStorage', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockState))
      const result = loadProjectsFromStorage()
      expect(result).toEqual(mockState)
    })

    it('should return null if data in localStorage is invalid JSON', () => {
      localStorage.setItem(STORAGE_KEY, 'invalid json')
      const result = loadProjectsFromStorage()
      expect(result).toBeNull()
    })
  })
})
