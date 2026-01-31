import { describe, expect, it } from 'vitest'

import progressReducer, { addProgressRecord, deleteProgressRecord } from './progressSlice'

describe('progressSlice', () => {
  const initialState = { records: [] }

  describe('addProgressRecord', () => {
    it('adds a new progress record to the state', () => {
      const newRecord = {
        projectId: 'p1',
        sectionId: 's1',
        rowsDelta: 1,
        stitchesDelta: 10,
      }

      const state = progressReducer(initialState, addProgressRecord(newRecord))

      expect(state.records).toHaveLength(1)
      expect(state.records[0]).toMatchObject(newRecord)
    })

    it('generates a unique id for each record', () => {
      const record1 = {
        projectId: 'p1',
        sectionId: 's1',
        rowsDelta: 1,
        stitchesDelta: 10,
      }
      const record2 = {
        projectId: 'p1',
        sectionId: 's2',
        rowsDelta: 2,
        stitchesDelta: 20,
      }

      let state = progressReducer(initialState, addProgressRecord(record1))
      state = progressReducer(state, addProgressRecord(record2))

      expect(state.records[0].id).not.toBe(state.records[1].id)
    })

    it('sets timestamp to current time', () => {
      const beforeTime = Date.now()
      const newRecord = {
        projectId: 'p1',
        sectionId: 's1',
        rowsDelta: 1,
        stitchesDelta: 10,
      }

      const state = progressReducer(initialState, addProgressRecord(newRecord))
      const afterTime = Date.now()

      expect(state.records[0].timestamp).toBeGreaterThanOrEqual(beforeTime)
      expect(state.records[0].timestamp).toBeLessThanOrEqual(afterTime)
    })

    it('adds records with negative deltas', () => {
      const newRecord = {
        projectId: 'p1',
        sectionId: 's1',
        rowsDelta: -1,
        stitchesDelta: -10,
      }

      const state = progressReducer(initialState, addProgressRecord(newRecord))

      expect(state.records[0].rowsDelta).toBe(-1)
      expect(state.records[0].stitchesDelta).toBe(-10)
    })

    it('adds records for global section', () => {
      const newRecord = {
        projectId: 'p1',
        sectionId: 'global',
        rowsDelta: 1,
        stitchesDelta: 10,
      }

      const state = progressReducer(initialState, addProgressRecord(newRecord))

      expect(state.records[0].sectionId).toBe('global')
    })

    it('appends to existing records', () => {
      const record1 = {
        projectId: 'p1',
        sectionId: 's1',
        rowsDelta: 1,
        stitchesDelta: 10,
      }
      const record2 = {
        projectId: 'p2',
        sectionId: 's2',
        rowsDelta: 2,
        stitchesDelta: 20,
      }

      let state = progressReducer(initialState, addProgressRecord(record1))
      state = progressReducer(state, addProgressRecord(record2))

      expect(state.records).toHaveLength(2)
      expect(state.records[0].projectId).toBe('p1')
      expect(state.records[1].projectId).toBe('p2')
    })

    it('includes all required properties on the record', () => {
      const newRecord = {
        projectId: 'p1',
        sectionId: 's1',
        rowsDelta: 5,
        stitchesDelta: 50,
      }

      const state = progressReducer(initialState, addProgressRecord(newRecord))
      const record = state.records[0]

      expect(record).toHaveProperty('id')
      expect(record).toHaveProperty('projectId')
      expect(record).toHaveProperty('sectionId')
      expect(record).toHaveProperty('timestamp')
      expect(record).toHaveProperty('rowsDelta')
      expect(record).toHaveProperty('stitchesDelta')
    })
  })

  describe('deleteProgressRecord', () => {
    it('removes a progress record by id', () => {
      const newRecord = {
        projectId: 'p1',
        sectionId: 's1',
        rowsDelta: 1,
        stitchesDelta: 10,
      }

      let state = progressReducer(initialState, addProgressRecord(newRecord))
      const recordId = state.records[0].id

      state = progressReducer(state, deleteProgressRecord(recordId))

      expect(state.records).toHaveLength(0)
    })

    it('only removes the matching record', () => {
      const record1 = {
        projectId: 'p1',
        sectionId: 's1',
        rowsDelta: 1,
        stitchesDelta: 10,
      }
      const record2 = {
        projectId: 'p1',
        sectionId: 's2',
        rowsDelta: 2,
        stitchesDelta: 20,
      }

      let state = progressReducer(initialState, addProgressRecord(record1))
      state = progressReducer(state, addProgressRecord(record2))

      const idToDelete = state.records[0].id
      state = progressReducer(state, deleteProgressRecord(idToDelete))

      expect(state.records).toHaveLength(1)
      expect(state.records[0].sectionId).toBe('s2')
    })

    it('does nothing if record id does not exist', () => {
      const newRecord = {
        projectId: 'p1',
        sectionId: 's1',
        rowsDelta: 1,
        stitchesDelta: 10,
      }

      let state = progressReducer(initialState, addProgressRecord(newRecord))
      const recordId = state.records[0].id

      state = progressReducer(state, deleteProgressRecord('non-existent-id'))

      expect(state.records).toHaveLength(1)
      expect(state.records[0].id).toBe(recordId)
    })

    it('removes multiple records from the same project', () => {
      const record1 = {
        projectId: 'p1',
        sectionId: 's1',
        rowsDelta: 1,
        stitchesDelta: 10,
      }
      const record2 = {
        projectId: 'p1',
        sectionId: 's2',
        rowsDelta: 2,
        stitchesDelta: 20,
      }
      const record3 = {
        projectId: 'p2',
        sectionId: 's1',
        rowsDelta: 1,
        stitchesDelta: 15,
      }

      let state = progressReducer(initialState, addProgressRecord(record1))
      state = progressReducer(state, addProgressRecord(record2))
      state = progressReducer(state, addProgressRecord(record3))

      state = progressReducer(state, deleteProgressRecord(state.records[0].id))
      state = progressReducer(state, deleteProgressRecord(state.records[0].id))

      expect(state.records).toHaveLength(1)
      expect(state.records[0].projectId).toBe('p2')
    })

    it('can delete a record and add a new one', () => {
      const record1 = {
        projectId: 'p1',
        sectionId: 's1',
        rowsDelta: 1,
        stitchesDelta: 10,
      }
      const record2 = {
        projectId: 'p2',
        sectionId: 's2',
        rowsDelta: 2,
        stitchesDelta: 20,
      }

      let state = progressReducer(initialState, addProgressRecord(record1))
      const recordId = state.records[0].id

      state = progressReducer(state, deleteProgressRecord(recordId))
      state = progressReducer(state, addProgressRecord(record2))

      expect(state.records).toHaveLength(1)
      expect(state.records[0].projectId).toBe('p2')
    })
  })

  describe('reducer', () => {
    it('returns initial state for unknown action', () => {
      const state = progressReducer(undefined, { type: 'UNKNOWN' })

      expect(state).toEqual(initialState)
    })

    it('handles multiple operations in sequence', () => {
      let state = progressReducer(undefined, { type: '' })

      // Add multiple records
      for (let i = 0; i < 5; i++) {
        state = progressReducer(
          state,
          addProgressRecord({
            projectId: `p${i}`,
            sectionId: `s${i}`,
            rowsDelta: i,
            stitchesDelta: i * 10,
          }),
        )
      }

      expect(state.records).toHaveLength(5)

      // Delete some records
      state = progressReducer(state, deleteProgressRecord(state.records[0].id))
      state = progressReducer(state, deleteProgressRecord(state.records[0].id))

      expect(state.records).toHaveLength(3)
    })
  })

  describe('action types', () => {
    it('exports addProgressRecord action', () => {
      expect(addProgressRecord).toBeDefined()
      expect(typeof addProgressRecord).toBe('function')
    })

    it('exports deleteProgressRecord action', () => {
      expect(deleteProgressRecord).toBeDefined()
      expect(typeof deleteProgressRecord).toBe('function')
    })
  })
})
