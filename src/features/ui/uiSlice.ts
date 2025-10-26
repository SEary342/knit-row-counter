import { createSlice } from '@reduxjs/toolkit'

interface UIState {
  darkMode: boolean
}

const initialState: UIState = { darkMode: true }

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode
    },
  },
})

export const { toggleDarkMode } = uiSlice.actions
export default uiSlice.reducer
