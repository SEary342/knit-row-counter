import { combineReducers, configureStore } from '@reduxjs/toolkit'

import { progressMiddleware } from '@src/features/progress/progressMiddleware'
import progressReducer from '@src/features/progress/progressSlice'
import projectsReducer from '@src/features/projects/projectsSlice'
import uiReducer from '@src/features/ui/uiSlice'
import { loadStateFromStorage } from '@src/utils/localStorage'

import { persistenceMiddleware } from './persistenceMiddleware'

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
