import { describe, it, expect } from 'vitest'
import reducer, {
  createProject,
  addSection,
  incrementRow,
  decrementRow,
  setLinked,
  setLocked,
  selectProject,
  deleteProject,
  renameProject,
  setTotalRows,
  updateSection,
  deleteSection,
  moveSection,
  resetProjectProgress,
  updateNotes,
  updatePatternUrl,
  importProjects,
} from './projectsSlice'
import type { ProjectsState, Project } from './types'

describe('projectsSlice Auto-Advance/Reverse', () => {
  const initialState: ProjectsState = {
    projects: [],
    currentProjectId: null,
  }

  const setupProject = () => {
    let state = reducer(initialState, createProject({ name: 'Test Project' }))

    // Add Section 1: 2 rows, 1 repeat
    state = reducer(
      state,
      addSection({
        section: {
          name: 'Section 1',
          repeatRows: 2,
          totalRepeats: 1,
          locked: false,
        },
      }),
    )

    // Add Section 2: 2 rows, 1 repeat
    state = reducer(
      state,
      addSection({
        section: {
          name: 'Section 2',
          repeatRows: 2,
          totalRepeats: 1,
          locked: false,
        },
      }),
    )

    // Link Section 1
    const s1Id = state.projects[0].sections[0].id
    state = reducer(state, setLinked({ id: s1Id, status: true }))

    return { state, s1Id, s2Id: state.projects[0].sections[1].id }
  }

  it('should auto-advance to next section when finished', () => {
    let { state } = setupProject()

    // Increment 1: Row 1/2
    state = reducer(state, incrementRow(undefined))
    expect(state.projects[0].sections[0].currentRow).toBe(1)
    expect(state.projects[0].sections[0].linked).toBe(true)
    expect(state.projects[0].sections[1].linked).toBeFalsy()

    // Increment 2: Row 2/2 (Finished)
    state = reducer(state, incrementRow(undefined))

    // Should have advanced
    expect(state.projects[0].sections[0].currentRow).toBe(2)
    expect(state.projects[0].sections[0].linked).toBe(false)
    expect(state.projects[0].sections[1].linked).toBe(true)
  })

  it('should not auto-advance if next section is locked', () => {
    let { state, s2Id } = setupProject()

    // Lock Section 2
    state = reducer(state, setLocked({ id: s2Id, status: true }))

    // Increment to finish Section 1
    state = reducer(state, incrementRow(undefined))
    state = reducer(state, incrementRow(undefined))

    // Should NOT have advanced
    expect(state.projects[0].sections[0].linked).toBe(true)
    expect(state.projects[0].sections[1].linked).toBeFalsy()
  })

  it('should auto-reverse to previous section', () => {
    let { state } = setupProject()

    // Advance to Section 2
    state = reducer(state, incrementRow(undefined))
    state = reducer(state, incrementRow(undefined))

    // Verify we are at start of Section 2
    expect(state.projects[0].sections[1].linked).toBe(true)
    expect(state.projects[0].sections[1].currentRow).toBe(0)

    // Decrement
    state = reducer(state, decrementRow(undefined))

    // Should have reversed to Section 1
    expect(state.projects[0].sections[1].linked).toBe(false)
    expect(state.projects[0].sections[0].linked).toBe(true)

    // Section 1 should be decremented from 2 to 1
    expect(state.projects[0].sections[0].currentRow).toBe(1)
  })

  it('should not auto-reverse if previous section is locked', () => {
    let { state, s1Id } = setupProject()

    // Advance to Section 2
    state = reducer(state, incrementRow(undefined))
    state = reducer(state, incrementRow(undefined))

    // Lock Section 1
    state = reducer(state, setLocked({ id: s1Id, status: true }))

    // Decrement
    state = reducer(state, decrementRow(undefined))

    // Should stay on Section 2
    expect(state.projects[0].sections[1].linked).toBe(true)
    expect(state.projects[0].sections[0].linked).toBe(false)
  })
})

describe('projectsSlice General Actions', () => {
  const initialState: ProjectsState = {
    projects: [],
    currentProjectId: null,
  }

  it('should handle project CRUD operations', () => {
    // Create
    let state = reducer(initialState, createProject({ name: 'My Project' }))
    expect(state.projects).toHaveLength(1)
    const projectId = state.projects[0].id
    expect(state.currentProjectId).toBe(projectId)

    // Rename
    state = reducer(state, renameProject({ id: projectId, name: 'Renamed Project' }))
    expect(state.projects[0].name).toBe('Renamed Project')

    // Update Notes & URL
    state = reducer(state, updateNotes('Some notes'))
    expect(state.projects[0].notes).toBe('Some notes')
    state = reducer(state, updatePatternUrl('http://example.com'))
    expect(state.projects[0].patternUrl).toBe('http://example.com')

    // Set Total Rows
    state = reducer(state, setTotalRows(100))
    expect(state.projects[0].totalRows).toBe(100)

    // Create another and Select
    state = reducer(state, createProject({ name: 'Second Project' }))
    const secondId = state.projects[1].id
    expect(state.currentProjectId).toBe(secondId)

    state = reducer(state, selectProject(projectId))
    expect(state.currentProjectId).toBe(projectId)

    // Delete
    state = reducer(state, deleteProject(projectId))
    expect(state.projects).toHaveLength(1)
    expect(state.projects[0].id).toBe(secondId)
    expect(state.currentProjectId).toBe(secondId)
  })

  it('should handle section CRUD operations', () => {
    let state = reducer(initialState, createProject({ name: 'Project' }))

    // Add Section
    state = reducer(state, addSection({ section: { name: 'S1' } }))
    expect(state.projects[0].sections).toHaveLength(1)
    const s1Id = state.projects[0].sections[0].id
    expect(state.projects[0].sections[0].name).toBe('S1')

    // Update Section
    state = reducer(
      state,
      updateSection({ sectionId: s1Id, updates: { name: 'Updated S1', repeatRows: 10 } }),
    )
    expect(state.projects[0].sections[0].name).toBe('Updated S1')
    expect(state.projects[0].sections[0].repeatRows).toBe(10)

    // Add another section for moving
    state = reducer(state, addSection({ section: { name: 'S2' } }))
    const s2Id = state.projects[0].sections[1].id

    // Move Section
    state = reducer(state, moveSection({ sectionId: s2Id, direction: 'up' }))
    expect(state.projects[0].sections[0].id).toBe(s2Id)
    expect(state.projects[0].sections[1].id).toBe(s1Id)

    // Delete Section
    state = reducer(state, deleteSection(s1Id))
    expect(state.projects[0].sections).toHaveLength(1)
    expect(state.projects[0].sections[0].id).toBe(s2Id)
  })

  it('should handle basic row manipulation and reset', () => {
    let state = reducer(initialState, createProject({ name: 'Project' }))
    state = reducer(state, addSection({ section: { name: 'S1', repeatRows: 5 } }))
    const s1Id = state.projects[0].sections[0].id

    // Link section
    state = reducer(state, setLinked({ id: s1Id, status: true }))

    // Increment Global (linked section should increment)
    state = reducer(state, incrementRow(undefined))
    expect(state.projects[0].currentRow).toBe(1)
    expect(state.projects[0].sections[0].currentRow).toBe(1)

    // Test unlinked section increment
    state = reducer(state, addSection({ section: { name: 'S2', repeatRows: 5 } }))
    const s2Id = state.projects[0].sections[1].id

    state = reducer(state, incrementRow(s2Id))
    expect(state.projects[0].currentRow).toBe(1) // Global didn't change
    expect(state.projects[0].sections[1].currentRow).toBe(1)

    // Decrement
    state = reducer(state, decrementRow(s2Id))
    expect(state.projects[0].sections[1].currentRow).toBe(0)

    // Reset
    state = reducer(state, incrementRow(undefined)) // Global 2, S1 2
    state = reducer(state, resetProjectProgress())
    expect(state.projects[0].currentRow).toBe(0)
    expect(state.projects[0].sections[0].currentRow).toBe(0)
  })

  it('should import projects', () => {
    let state = reducer(initialState, createProject({ name: 'Existing' }))
    const importedProject: Project = {
      id: 'imported-id',
      name: 'Imported',
      totalRows: 10,
      currentRow: 5,
      sections: [],
      notes: '',
      lastModified: Date.now(),
    }

    state = reducer(state, importProjects(importedProject))
    expect(state.projects).toHaveLength(2)
    expect(state.projects.find((p) => p.id === 'imported-id')).toBeDefined()
  })
})
