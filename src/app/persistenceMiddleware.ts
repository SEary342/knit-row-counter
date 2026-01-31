import { type Middleware } from '@reduxjs/toolkit'

import { saveStateToStorage } from '@src/utils/localStorage'

const PERSISTED_SLICES = ['projects', 'progress', 'ui'] as const

export const persistenceMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action)
  const state = store.getState() as Record<string, unknown>

  PERSISTED_SLICES.forEach((slice) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    saveStateToStorage(slice, state[slice] as any)
  })

  return result
}
