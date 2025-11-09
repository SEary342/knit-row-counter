import { configureStore } from '@reduxjs/toolkit'

import projectsReducer from '../features/projects/projectsSlice'
import uiReducer from '../features/ui/uiSlice'

import { persistenceMiddleware } from './persistenceMiddleware'

export const store = configureStore({
  reducer: {
    projects: projectsReducer,
    ui: uiReducer,
  },
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: false,
    }).concat(persistenceMiddleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
