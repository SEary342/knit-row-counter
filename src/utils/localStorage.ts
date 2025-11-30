import type { PatternRowConfig, ProjectsState } from '../features/projects/types'

const STORAGE_KEY = 'knit_projects_v1'

/**
 * Migrates the application state from older formats to the current format.
 * This function is designed to be idempotent and can be expanded with more migration steps.
 * @param state The state loaded from localStorage.
 * @returns The migrated state.
 */
const migrateState = (state: ProjectsState): ProjectsState => {
  // Migration: Convert string[] patterns to PatternRowConfig[]
  if (state.projects) {
    for (const project of state.projects) {
      for (const section of project.sections) {
        // Check if the pattern exists and is in the old format (array of strings)
        if (section.pattern?.length > 0 && typeof section.pattern[0] === 'string') {
          section.pattern = (section.pattern as unknown as string[]).map(
            (instruction: string): PatternRowConfig => ({
              instruction,
              stitches: null, // Default stitches to null for old data
            }),
          )
        }
      }
    }
  }

  // Future migrations can be added here...

  return state
}

export const loadProjectsFromStorage = (): ProjectsState | null => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const state = JSON.parse(raw) as ProjectsState
    return migrateState(state)
  } catch (error) {
    console.error('Failed to load or migrate projects from storage:', error)
    return null
  }
}

export const saveProjectsToStorage = (state: ProjectsState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}
