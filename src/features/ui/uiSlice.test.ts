import { describe, it, expect } from 'vitest'

import uiReducer, { toggleDarkMode, toggleShowStitches } from './uiSlice'

describe('uiSlice reducer', () => {
  it('should handle initial state', () => {
    expect(uiReducer(undefined, { type: 'unknown' })).toEqual({
      darkMode: true,
      showStitches: true,
    })
  })

  it('should handle toggleDarkMode from true to false', () => {
    const previousState = { darkMode: true, showStitches: true }
    expect(uiReducer(previousState, toggleDarkMode()).darkMode).toBe(false)
  })

  it('should handle toggleDarkMode from false to true', () => {
    const previousState = { darkMode: false, showStitches: true }
    expect(uiReducer(previousState, toggleDarkMode()).darkMode).toBe(true)
  })

  it('should handle toggleShowStitches', () => {
    const previousState = { darkMode: true, showStitches: true }
    expect(uiReducer(previousState, toggleShowStitches()).showStitches).toBe(false)
    expect(
      uiReducer({ ...previousState, showStitches: false }, toggleShowStitches()).showStitches,
    ).toBe(true)
  })
})
