import type { PatternRowConfig } from '../features/projects/types'
import type { RootState } from '../app/store'
import { v4 as uuidv4 } from 'uuid'

/**
 * Migrates the projects slice from older formats to the current format.
 * @param projectsState The projects state loaded from localStorage.
 * @returns The migrated state.
 */
const migrateProjectsState = (state: RootState['projects']): RootState['projects'] => {
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

/**
 * Migrates the progress slice from older formats to the current format.
 * @param state The progress state loaded from localStorage.
 * @returns The migrated state.
 */
const migrateProgressState = (state: RootState['progress']): RootState['progress'] => {
  // Migration: Add unique IDs to progress records that don't have one.
  if (state.records) {
    for (const record of state.records) {
      if (!record.id) record.id = uuidv4()
    }
  }
  return state
}

export const loadStateFromStorage = <T extends keyof RootState>(
  slice: T,
): RootState[T] | undefined => {
  const raw = localStorage.getItem(`knit_slice_${slice}`)
  if (!raw) return undefined

  try {
    let state = JSON.parse(raw)

    // Apply migrations for specific slices if needed
    if (slice === 'projects') {
      state = migrateProjectsState(state)
    } else if (slice === 'progress') {
      state = migrateProgressState(state)
    }

    return state
  } catch (error) {
    console.error(`Failed to load or migrate slice "${slice}" from storage:`, error)
    return undefined
  }
}

export const saveStateToStorage = <T extends keyof RootState>(slice: T, state: RootState[T]) => {
  localStorage.setItem(`knit_slice_${slice}`, JSON.stringify(state))
}
