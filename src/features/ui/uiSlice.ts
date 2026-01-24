import { createSlice } from '@reduxjs/toolkit'

interface UIState {
  darkMode: boolean
  showStitches: boolean
}

const initialState: UIState = { darkMode: true, showStitches: true }

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode
    },
    toggleShowStitches(state) {
      state.showStitches = !state.showStitches
    },
  },
})

export const { toggleDarkMode, toggleShowStitches } = uiSlice.actions
export default uiSlice.reducer
