import { type Middleware } from '@reduxjs/toolkit'
import { type RootState } from './store'

import { saveStateToStorage } from '../utils/localStorage'

const PERSISTED_SLICES: (keyof RootState)[] = ['projects', 'progress', 'ui']

export const persistenceMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action)
  const state = store.getState()

  PERSISTED_SLICES.forEach((slice) => {
    saveStateToStorage(slice, state[slice])
  })

  return result
}
