import { combineReducers, configureStore } from '@reduxjs/toolkit'

import projectsReducer from '../features/projects/projectsSlice'
import uiReducer from '../features/ui/uiSlice'
import progressReducer from '../features/progress/progressSlice'

import { persistenceMiddleware } from './persistenceMiddleware'
import { progressMiddleware } from '../features/progress/progressMiddleware'
import { loadStateFromStorage } from '../utils/localStorage'

const rootReducer = combineReducers({
  projects: projectsReducer,
  progress: progressReducer,
  ui: uiReducer,
})

export type RootState = ReturnType<typeof rootReducer>

const preloadedState = {
  projects: loadStateFromStorage('projects') ?? undefined,
  progress: loadStateFromStorage('progress') ?? undefined,
  ui: loadStateFromStorage('ui') ?? undefined,
}

export const store = configureStore({
  reducer: rootReducer,
  preloadedState,
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: false,
    }).concat(persistenceMiddleware, progressMiddleware),
})

export type AppDispatch = typeof store.dispatch
