import type { Project } from '../features/projects/types'

type ProjectsState = {
  projects: Project[]
  currentProjectId: string | null
}

const STORAGE_KEY = 'knit_projects_v1'

export const loadProjectsFromStorage = (): ProjectsState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ProjectsState
  } catch {
    return null
  }
}

export const saveProjectsToStorage = (state: ProjectsState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}
