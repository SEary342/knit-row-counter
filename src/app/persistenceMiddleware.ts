import type { Middleware } from '@reduxjs/toolkit'

import { saveProjectsToStorage } from '../utils/localStorage'

export const persistenceMiddleware: Middleware = (storeAPI) => (next) => (action) => {
  const result = next(action)
  const state = storeAPI.getState()

  // Persist only project data (localStorage)
  if (state.projects) {
    saveProjectsToStorage(state.projects)
  }

  // Stub for future backend save
  // saveToServer(state.projects);

  return result
}
