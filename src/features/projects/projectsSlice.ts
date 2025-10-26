import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Project, ProjectsState } from './types'
import { loadProjectsFromStorage } from '../../utils/localStorage'
import { v4 } from 'uuid'

const initialState: ProjectsState = loadProjectsFromStorage() ?? {
  projects: [],
  currentProjectId: null,
}

const findProject = (state: ProjectsState) =>
  state.projects.find((p) => p.id === state.currentProjectId)

export const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    createProject: (state, action: PayloadAction<{ name: string }>) => {
      const newProject: Project = {
        id: v4(),
        name: action.payload.name,
        linked: true,
        totalRows: null,
        currentRow: 0,
        sections: [
          {
            id: v4(),
            name: 'Section 1',
            repeatRows: null,
            currentRow: 0,
            repeatCount: 0,
          },
        ],
        notes: '',
        lastModified: Date.now(),
      }
      state.projects.push(newProject)
      state.currentProjectId = newProject.id
    },

    selectProject: (state, action: PayloadAction<string>) => {
      state.currentProjectId = action.payload
    },

    deleteProject: (state, action: PayloadAction<string>) => {
      state.projects = state.projects.filter((p) => p.id !== action.payload)
      if (state.currentProjectId === action.payload)
        state.currentProjectId = state.projects[0]?.id ?? null
    },

    renameProject: (state, action: PayloadAction<{ id: string; name: string }>) => {
      const project = state.projects.find((p) => p.id === action.payload.id)
      if (project) project.name = action.payload.name
    },

    setLinked: (state, action: PayloadAction<boolean>) => {
      const project = findProject(state)
      if (project) project.linked = action.payload
    },

    incrementRow: (state) => {
      const project = findProject(state)
      if (!project) return
      project.currentRow += 1

      const section = project.sections[0]
      if (project.linked || section) {
        section.currentRow += 1
        if (section.repeatRows && section.currentRow >= section.repeatRows) {
          section.currentRow = 0
          section.repeatCount += 1
        }
      }

      project.lastModified = Date.now()
    },

    decrementRow: (state) => {
      const project = findProject(state)
      if (!project) return
      if (project.currentRow > 0) project.currentRow -= 1

      const section = project.sections[0]
      if (project.linked || section) {
        if (section.currentRow === 0 && section.repeatCount > 0 && section.repeatRows) {
          section.repeatCount -= 1
          section.currentRow = section.repeatRows - 1
        } else if (section.currentRow > 0) {
          section.currentRow -= 1
        }
      }

      project.lastModified = Date.now()
    },

    updateNotes: (state, action: PayloadAction<string>) => {
      const project = findProject(state)
      if (project) project.notes = action.payload
    },

    updatePatternUrl: (state, action: PayloadAction<string>) => {
      const project = findProject(state)
      if (project) project.patternUrl = action.payload
    },

    importProjects: (state, action: PayloadAction<Project[]>) => {
      for (const imported of action.payload) {
        const idx = state.projects.findIndex((p) => p.id === imported.id)
        if (idx !== -1) {
          // Replace existing project
          state.projects[idx] = imported
        } else {
          state.projects.push(imported)
        }
      }
    },
  },
})

export const {
  createProject,
  selectProject,
  deleteProject,
  renameProject,
  setLinked,
  incrementRow,
  decrementRow,
  updateNotes,
  updatePatternUrl,
  importProjects,
} = projectsSlice.actions

export default projectsSlice.reducer
