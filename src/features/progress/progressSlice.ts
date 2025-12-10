import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'
import { type Project, type SectionConfig } from '../projects/types'

export interface ProgressRecord {
  id: string
  projectId: string
  sectionId: string
  timestamp: number
  rowsDelta: number
  stitchesDelta: number
}

interface ProgressState {
  records: ProgressRecord[]
}

const initialState: ProgressState = {
  records: [],
}

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    addProgressRecord: (state, action: PayloadAction<Omit<ProgressRecord, 'timestamp' | 'id'>>) => {
      state.records.push({
        id: uuidv4(),
        ...action.payload,
        timestamp: Date.now(),
      })
    },
    deleteProgressRecord: (state, action: PayloadAction<string>) => {
      state.records = state.records.filter((r) => r.id !== action.payload)
    },
    recalculateStitchDeltas: (state, action: PayloadAction<{ projects: Project[] }>) => {
      const projectsById = new Map(action.payload.projects.map((p) => [p.id, p]))

      // A map to track the current row of each section as we iterate through time
      const sectionRowTracker: Record<string, number> = {} // Key: "projectId:sectionId"

      // Sort records by timestamp to process them in chronological order
      const sortedRecords = [...state.records].sort((a, b) => a.timestamp - b.timestamp)

      const getStitchesForRow = (sec: SectionConfig, rowNumber: number): number => {
        if (!sec.repeatRows || rowNumber <= 0) {
          return sec.stitchCount ?? 0
        }
        const rowIndex = (rowNumber - 1) % sec.repeatRows
        return sec.pattern[rowIndex]?.stitches ?? sec.stitchCount ?? 0
      }

      for (const record of sortedRecords) {
        const project = projectsById.get(record.projectId)
        if (!project) continue

        // Try to find a specific section if sectionId is valid
        const specificSection = project.sections.find((s) => s.id === record.sectionId)

        if (specificSection && !specificSection.linked) {
          // This record is for a single, unlinked section
          const trackerKey = `${record.projectId}:${specificSection.id}`
          const previousRowCount = sectionRowTracker[trackerKey] ?? 0
          const currentRowInHistory = previousRowCount + record.rowsDelta

          record.stitchesDelta =
            getStitchesForRow(specificSection, currentRowInHistory) * record.rowsDelta
          sectionRowTracker[trackerKey] = currentRowInHistory
        } else {
          // This record affects all linked sections
          let totalStitchesDelta = 0
          for (const section of project.sections) {
            if (section.linked) {
              const trackerKey = `${record.projectId}:${section.id}`
              const previousRowCount = sectionRowTracker[trackerKey] ?? 0
              const currentRowInHistory = previousRowCount + record.rowsDelta

              totalStitchesDelta +=
                getStitchesForRow(section, currentRowInHistory) * record.rowsDelta
              sectionRowTracker[trackerKey] = currentRowInHistory
            }
          }
          record.stitchesDelta = totalStitchesDelta
        }
      }
      state.records = sortedRecords
    },
  },
})

export const { addProgressRecord, recalculateStitchDeltas, deleteProgressRecord } =
  progressSlice.actions

export default progressSlice.reducer
