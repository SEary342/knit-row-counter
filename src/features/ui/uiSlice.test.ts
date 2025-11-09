import { describe, it, expect } from 'vitest'

import uiReducer, { toggleDarkMode } from './uiSlice'

describe('uiSlice reducer', () => {
  it('should handle initial state', () => {
    expect(uiReducer(undefined, { type: 'unknown' })).toEqual({
      darkMode: true,
    })
  })

  it('should handle toggleDarkMode from true to false', () => {
    const previousState = { darkMode: true }
    expect(uiReducer(previousState, toggleDarkMode()).darkMode).toBe(false)
  })

  it('should handle toggleDarkMode from false to true', () => {
    const previousState = { darkMode: false }
    expect(uiReducer(previousState, toggleDarkMode()).darkMode).toBe(true)
  })
})
