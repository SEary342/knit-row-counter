import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { v4 } from 'uuid'
import { produce } from 'immer'

import type { Project, ProjectsState, SectionConfig } from './types'

const initialState: ProjectsState = {
  projects: [],
  currentProjectId: null,
}

const findProject = (state: ProjectsState) =>
  state.projects.find((p) => p.id === state.currentProjectId)

export const calculateProjectStitches = (project: Project): number => {
  return project.sections.reduce((total: number, section: SectionConfig) => {
    const repeatRows = section.repeatRows
    if (!repeatRows) {
      // Handles null and 0
      return total
    }
    // Calculate total rows completed for the section
    const completedRepeatRows = section.repeatCount * repeatRows
    const currentRepeatRows = section.currentRow
    const sectionTotalRows = completedRepeatRows + currentRepeatRows

    // Calculate stitches for the section
    const sectionStitches = Array.from({ length: sectionTotalRows }).reduce(
      (sectionTotal: number, _, i: number) => {
        const rowIndex = i % repeatRows
        const rowStitches = section.pattern[rowIndex]?.stitches ?? section.stitchCount ?? 0
        return sectionTotal + rowStitches
      },
      0,
    )

    // Add to project total
    return total + sectionStitches
  }, 0)
}

export const calculateProjectTotalRows = (project: Project): number => {
  return project.sections.reduce((total, section) => {
    if (section.totalRepeats && section.repeatRows) {
      return total + section.totalRepeats * section.repeatRows
    }
    return total
  }, 0)
}

export const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    createProject: (state, action: PayloadAction<{ name: string }>) => {
      const newProject: Project = {
        id: v4(),
        name: action.payload.name,
        totalRows: null,
        currentRow: 0,
        sections: [],
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

    setLinked: (state, action: PayloadAction<{ id: string; status: boolean }>) => {
      const project = findProject(state)
      const section = project?.sections.find((s) => s.id === action.payload.id)
      if (section) section.linked = action.payload.status
    },

    setTotalRows: (state, action: PayloadAction<number | null>) => {
      const project = findProject(state)
      if (project) {
        project.totalRows = action.payload
        project.lastModified = Date.now()
      }
    },

    addSection: (state, action: PayloadAction<{ section: Partial<SectionConfig> }>) => {
      const project = findProject(state)
      if (!project) return
      const section: SectionConfig = {
        id: v4(),
        name: action.payload.section.name ?? '',
        repeatRows: action.payload.section.repeatRows ?? null,
        totalRepeats: action.payload.section.totalRepeats ?? null,
        pattern: action.payload.section.pattern ?? [],
        stitchCount: action.payload.section.stitchCount ?? null,
        currentRow: 0,
        repeatCount: 0,
      }
      if (!section) return

      project.sections.push(section)
      project.lastModified = Date.now()
    },

    updateSection: (
      state,
      action: PayloadAction<{ sectionId: string; updates: Partial<SectionConfig> }>,
    ) => {
      const project = findProject(state)
      if (!project) return
      const section = project.sections.find((s) => s.id === action.payload.sectionId)
      if (!section) return

      Object.assign(section, action.payload.updates)
      // Ensure pattern is in the correct format
      section.pattern = produce(section.pattern, (draft) => {
        draft.forEach(
          (row, i) => (draft[i] = { instruction: row.instruction, stitches: row.stitches ?? null }),
        )
      })
    },

    deleteSection: (state, action: PayloadAction<string>) => {
      const project = findProject(state)
      if (!project) return

      project.sections = project.sections.filter((s) => s.id !== action.payload)

      project.lastModified = Date.now()
    },

    moveSection: (
      state,
      action: PayloadAction<{ sectionId: string; direction: 'up' | 'down' }>,
    ) => {
      const project = findProject(state)
      if (!project) return

      const { sectionId, direction } = action.payload
      const sectionIndex = project.sections.findIndex((s) => s.id === sectionId)

      if (sectionIndex === -1) return

      const newIndex = direction === 'up' ? sectionIndex - 1 : sectionIndex + 1

      if (newIndex < 0 || newIndex >= project.sections.length) return

      const [movedSection] = project.sections.splice(sectionIndex, 1)
      project.sections.splice(newIndex, 0, movedSection)
      project.lastModified = Date.now()
    },

    incrementRow: (state, action: PayloadAction<string | undefined>) => {
      const sectionId = action.payload
      const project = findProject(state)
      if (!project) return

      const targetSection = sectionId ? project.sections.find((s) => s.id === sectionId) : null

      const incrementLogic = (section: SectionConfig) => {
        section.currentRow += 1
        if (section.repeatRows && section.currentRow > section.repeatRows) {
          section.currentRow = 1
          section.repeatCount += 1
        }
      }

      if (targetSection && !targetSection.linked) {
        // If the target section is not linked, only increment it.
        incrementLogic(targetSection)
        project.lastModified = Date.now()
        return
      }

      // Otherwise, increment the global counter and all linked sections.
      project.currentRow += 1
      for (const section of project.sections) {
        if (section.linked) {
          incrementLogic(section)
        }
      }

      project.lastModified = Date.now()
    },

    decrementRow: (state, action: PayloadAction<string | undefined>) => {
      const sectionId = action.payload
      const project = findProject(state)
      if (!project) return

      const targetSection = sectionId ? project.sections.find((s) => s.id === sectionId) : null

      const decrementLogic = (section: SectionConfig) => {
        if (section.currentRow > 0) {
          section.currentRow--
          if (section.repeatRows && section.currentRow === 0 && section.repeatCount > 0) {
            section.currentRow = section.repeatRows
            section.repeatCount--
          }
        }
      }

      if (targetSection && !targetSection.linked) {
        // If the target section is not linked, only decrement it.
        decrementLogic(targetSection)
        project.lastModified = Date.now()
        return
      }

      // Otherwise, decrement the global counter and all linked sections.
      if (project.currentRow > 0) {
        project.currentRow--
        for (const section of project.sections) {
          if (section.linked) {
            decrementLogic(section)
          }
        }
      }

      project.lastModified = Date.now()
    },

    resetProjectProgress: (state) => {
      const project = findProject(state)
      if (!project) return

      project.currentRow = 0

      for (const section of project.sections) {
        section.currentRow = 0
        section.repeatCount = 0
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

    importProjects: (state, action: PayloadAction<Project | Project[]>) => {
      const projectsToImport = Array.isArray(action.payload) ? action.payload : [action.payload]

      for (const imported of projectsToImport) {
        const idx = state.projects.findIndex((p) => p.id === imported.id)
        if (idx !== -1) {
          // Replace existing project
          state.projects[idx] = imported
        } else if (imported.id && imported.name) {
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
  setTotalRows,
  decrementRow,
  updateNotes,
  updatePatternUrl,
  importProjects,
  updateSection,
  resetProjectProgress,
  addSection,
  deleteSection,
  moveSection,
} = projectsSlice.actions

export default projectsSlice.reducer
