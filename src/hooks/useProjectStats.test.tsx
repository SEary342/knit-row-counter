import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useProjectStats } from './useProjectStats'
import type { ProgressRecord } from '../features/progress/progressSlice'
import type { Project } from '../features/projects/types'

// Set a consistent "now" for testing purposes
const MOCK_DATE_NOW = new Date('2023-10-27T12:00:00.000Z')
const MOCK_MIDNIGHT = new Date('2023-10-27T00:00:00.000Z').getTime()

describe('useProjectStats', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(MOCK_DATE_NOW)
  })
  
  afterEach(() => {
    vi.useRealTimers()
  })

  const mockProject: Project = {
    id: 'proj-1',
    name: 'Test Project',
    currentRow: 10,
    totalRows: 100,
    sections: [],
    notes: '',
    lastModified: 0,
  }

  it('should return all zeros and null estimatedDays when project is undefined', () => {
    const records: ProgressRecord[] = []
    const { result } = renderHook(() => useProjectStats(undefined, records))
    expect(result.current).toEqual({
      rowsToday: 0,
      stitchesToday: 0,
      rowsPerHour: 0,
      stitchesPerHour: 0,
      estimatedDays: null,
    })
  })

  it('should return all zeros and null estimatedDays when there are no records for the project', () => {
    const records: ProgressRecord[] = []
    const { result } = renderHook(() => useProjectStats(mockProject, records))
    expect(result.current).toEqual({
      rowsToday: 0,
      stitchesToday: 0,
      rowsPerHour: 0,
      stitchesPerHour: 0,
      estimatedDays: null,
    })
  })

  it('should return all zeros when records exist but not for the specified project', () => {
    const records: ProgressRecord[] = [
      {
        id: 'rec-1',
        projectId: 'proj-2',
        sectionId: 's1',
        timestamp: MOCK_DATE_NOW.getTime(),
        rowsDelta: 1,
        stitchesDelta: 10,
      },
    ]
    const { result } = renderHook(() => useProjectStats(mockProject, records))
    expect(result.current).toEqual({
      rowsToday: 0,
      stitchesToday: 0,
      rowsPerHour: 0,
      stitchesPerHour: 0,
      estimatedDays: null,
    })
  })

  it('should return zero for today stats if all records are from previous days', () => {
    const yesterday = MOCK_MIDNIGHT - 1000 * 60 * 60 * 24
    const records: ProgressRecord[] = [
      {
        id: 'rec-1',
        projectId: mockProject.id,
        sectionId: 's1',
        timestamp: yesterday,
        rowsDelta: 5,
        stitchesDelta: 50,
      },
    ]
    const { result } = renderHook(() => useProjectStats(mockProject, records))
    expect(result.current.rowsToday).toBe(0)
    expect(result.current.stitchesToday).toBe(0)
  })

  it('should return zero for speed if there is only one record', () => {
    const records: ProgressRecord[] = [
      {
        id: 'rec-1',
        projectId: mockProject.id,
        sectionId: 's1',
        timestamp: MOCK_DATE_NOW.getTime(),
        rowsDelta: 1,
        stitchesDelta: 10,
      },
    ]
    const { result } = renderHook(() => useProjectStats(mockProject, records))
    expect(result.current.rowsToday).toBe(1)
    expect(result.current.stitchesToday).toBe(10)
    expect(result.current.rowsPerHour).toBe(0)
    expect(result.current.stitchesPerHour).toBe(0)
  })

  it('should correctly calculate today stats and speed from multiple records', () => {
    const records: ProgressRecord[] = [
      // Yesterday's record - should be ignored for "today" stats
      {
        projectId: mockProject.id,
        id: 'rec-1',
        sectionId: 's1',
        timestamp: MOCK_MIDNIGHT - 1000,
        rowsDelta: 10,
        stitchesDelta: 100,
      },
      // Today's records
      {
        projectId: mockProject.id,
        id: 'rec-2',
        sectionId: 's1',
        timestamp: MOCK_DATE_NOW.getTime() - 1000 * 60 * 60, // 1 hour ago
        rowsDelta: 5,
        stitchesDelta: 50,
      },
      {
        projectId: mockProject.id,
        sectionId: 's1',
        id: 'rec-3',
        timestamp: MOCK_DATE_NOW.getTime(), // now
        rowsDelta: 3,
        stitchesDelta: 30,
      },
      // A decrement
      {
        projectId: mockProject.id,
        id: 'rec-4',
        sectionId: 's1',
        timestamp: MOCK_DATE_NOW.getTime() + 1000, // a bit later
        rowsDelta: -1,
        stitchesDelta: -10,
      },
    ]

    const { result } = renderHook(() => useProjectStats(mockProject, records))

    // Today's stats should only sum up records from today
    expect(result.current.rowsToday).toBe(5 + 3 - 1) // 7
    expect(result.current.stitchesToday).toBe(50 + 30 - 10) // 70
  })

  it('should only use the last 10 records for speed calculation', () => {
    const records: ProgressRecord[] = []
    // Create 12 records, 1 minute apart
    for (let i = 0; i < 12; i++) {
      records.push({
        id: `rec-${i}`, // Add a unique ID for each record
        projectId: mockProject.id,
        sectionId: 's1',
        timestamp: MOCK_DATE_NOW.getTime() - (11 - i) * 60 * 1000,
        rowsDelta: 1,
        stitchesDelta: 10,
      })
    }

    const { result } = renderHook(() => useProjectStats(mockProject, records))

    // Speed should be based on the last 10 records (indices 2 to 11)
    const recentRecords = records.slice(-10)
    const timeSpanHours =
      (recentRecords[9].timestamp - recentRecords[0].timestamp) / (1000 * 60 * 60)

    // Sum of deltas for the last 9 records in the recent slice
    const totalRows = 9
    const totalStitches = 90

    expect(result.current.rowsPerHour).toBeCloseTo(totalRows / timeSpanHours) // 9 rows / 9 minutes
    expect(result.current.stitchesPerHour).toBeCloseTo(totalStitches / timeSpanHours) // 90 stitches / 9 minutes

    // 9 rows in 9 minutes is 1 row/min, which is 60 rows/hr
    expect(result.current.rowsPerHour).toBeCloseTo(60)
    expect(result.current.stitchesPerHour).toBeCloseTo(600)
  })

  it('should correctly calculate estimated days to completion', () => {
    const records: ProgressRecord[] = [
      // Day 1: 10 rows
      {
        id: 'rec-1',
        projectId: mockProject.id,
        sectionId: 's1',
        timestamp: MOCK_MIDNIGHT - 1000 * 60 * 60 * 48, // 2 days ago
        rowsDelta: 10,
        stitchesDelta: 100,
      },
      // Day 2: 20 rows
      {
        id: 'rec-2',
        projectId: mockProject.id,
        sectionId: 's1',
        timestamp: MOCK_MIDNIGHT - 1000 * 60 * 60 * 24, // 1 day ago
        rowsDelta: 20,
        stitchesDelta: 200,
      },
    ]

    // Average is (10 + 20) / 2 = 15 rows/day
    // Project has 100 total rows, 10 are complete. 90 rows remaining.
    // 90 rows / 15 rows/day = 6 days.
    const { result } = renderHook(() => useProjectStats(mockProject, records))
    expect(result.current.estimatedDays).toBe(6)
  })

  it('should return null for estimatedDays if average rows per day is zero or negative', () => {
    const { result } = renderHook(() => useProjectStats(mockProject, []))
    expect(result.current.estimatedDays).toBeNull()
  })
})
