import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface ProgressRecord {
  projectId: string
  sectionId: string
  timestamp: number // Using number (Date.now()) for easier calculations
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
    addProgressRecord: (state, action: PayloadAction<Omit<ProgressRecord, 'timestamp'>>) => {
      state.records.push({
        ...action.payload,
        timestamp: Date.now(),
      })
    },
  },
})

export const { addProgressRecord } = progressSlice.actions

export default progressSlice.reducer
