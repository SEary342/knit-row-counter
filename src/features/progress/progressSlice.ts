import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

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
  },
})

export const { addProgressRecord, deleteProgressRecord } = progressSlice.actions

export default progressSlice.reducer
