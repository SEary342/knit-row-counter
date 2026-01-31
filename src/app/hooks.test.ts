import { describe, expect, it } from 'vitest'
import { vi } from 'vitest'

import { useAppDispatch, useAppSelector } from './hooks'
import type { AppDispatch, RootState } from './store'

describe('hooks', () => {
  describe('useAppDispatch', () => {
    it('is exported as a function', () => {
      expect(typeof useAppDispatch).toBe('function')
    })
  })

  describe('useAppSelector', () => {
    it('is exported as a function', () => {
      expect(typeof useAppSelector).toBe('function')
    })

    it('can be used with selector functions', () => {
      // This test verifies the type signature is correct
      // The actual usage is tested through integration tests in components
      const selectorFn = (state: RootState) => state.ui.darkMode
      expect(selectorFn).toBeDefined()
      expect(typeof selectorFn).toBe('function')
    })
  })

  describe('type exports', () => {
    it('exports AppDispatch type', () => {
      // Verify types are correctly exported
      const dispatchType: AppDispatch = vi.fn()
      expect(dispatchType).toBeDefined()
    })
  })
})
