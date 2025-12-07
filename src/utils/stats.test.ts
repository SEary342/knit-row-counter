import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getTodayStats } from './stats'
import type { ProgressRecord } from '../features/progress/progressSlice'

// Set a consistent "now" for testing purposes
const MOCK_DATE_NOW = new Date('2023-10-27T12:00:00.000Z')
const MOCK_MIDNIGHT = new Date('2023-10-27T00:00:00.000Z').getTime()

describe('getTodayStats', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(MOCK_DATE_NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const projectId = 'proj-1'

  it('should return all zeros when there are no records', () => {
    const records: ProgressRecord[] = []
    const stats = getTodayStats(projectId, records)
    expect(stats).toEqual({
      rowsToday: 0,
      stitchesToday: 0,
      rowsPerHour: 0,
      stitchesPerHour: 0,
    })
  })

  it('should return all zeros when records exist but not for the specified project', () => {
    const records: ProgressRecord[] = [
      {
        projectId: 'proj-2',
        sectionId: 's1',
        timestamp: MOCK_DATE_NOW.getTime(),
        rowsDelta: 1,
        stitchesDelta: 10,
      },
    ]
    const stats = getTodayStats(projectId, records)
    expect(stats).toEqual({
      rowsToday: 0,
      stitchesToday: 0,
      rowsPerHour: 0,
      stitchesPerHour: 0,
    })
  })

  it('should return zero for today stats if all records are from previous days', () => {
    const yesterday = MOCK_MIDNIGHT - 1000 * 60 * 60 * 24
    const records: ProgressRecord[] = [
      { projectId, sectionId: 's1', timestamp: yesterday, rowsDelta: 5, stitchesDelta: 50 },
    ]
    const stats = getTodayStats(projectId, records)
    expect(stats.rowsToday).toBe(0)
    expect(stats.stitchesToday).toBe(0)
  })

  it('should return zero for speed if there is only one record', () => {
    const records: ProgressRecord[] = [
      {
        projectId,
        sectionId: 's1',
        timestamp: MOCK_DATE_NOW.getTime(),
        rowsDelta: 1,
        stitchesDelta: 10,
      },
    ]
    const stats = getTodayStats(projectId, records)
    expect(stats.rowsToday).toBe(1)
    expect(stats.stitchesToday).toBe(10)
    expect(stats.rowsPerHour).toBe(0)
    expect(stats.stitchesPerHour).toBe(0)
  })

  it('should correctly calculate today stats and speed from multiple records', () => {
    const records: ProgressRecord[] = [
      // Yesterday's record - should be ignored for "today" stats
      {
        projectId,
        sectionId: 's1',
        timestamp: MOCK_MIDNIGHT - 1000,
        rowsDelta: 10,
        stitchesDelta: 100,
      },
      // Today's records
      {
        projectId,
        sectionId: 's1',
        timestamp: MOCK_DATE_NOW.getTime() - 1000 * 60 * 60, // 1 hour ago
        rowsDelta: 5,
        stitchesDelta: 50,
      },
      {
        projectId,
        sectionId: 's1',
        timestamp: MOCK_DATE_NOW.getTime(), // now
        rowsDelta: 3,
        stitchesDelta: 30,
      },
      // A decrement
      {
        projectId,
        sectionId: 's1',
        timestamp: MOCK_DATE_NOW.getTime() + 1000, // a bit later
        rowsDelta: -1,
        stitchesDelta: -10,
      },
    ]

    const stats = getTodayStats(projectId, records)

    // Today's stats should only sum up records from today
    expect(stats.rowsToday).toBe(5 + 3 - 1) // 7
    expect(stats.stitchesToday).toBe(50 + 30 - 10) // 70

    // Speed is calculated over the last 10 (or fewer) records.
    // Timespan is from the first record to the last.
    // Deltas are summed from the *second* record onwards.
    // Timespan: (now + 1000) - (yesterday) = a bit over 12 hours
    // Total rows delta (from 2nd record): 5 + 3 - 1 = 7
    // Total stitches delta (from 2nd record): 50 + 30 - 10 = 70
    const timeSpanHours = (records[3].timestamp - records[0].timestamp) / (1000 * 60 * 60)
    expect(stats.rowsPerHour).toBeCloseTo(7 / timeSpanHours)
    expect(stats.stitchesPerHour).toBeCloseTo(70 / timeSpanHours)
  })

  it('should only use the last 10 records for speed calculation', () => {
    const records: ProgressRecord[] = []
    // Create 12 records, 1 minute apart
    for (let i = 0; i < 12; i++) {
      records.push({
        projectId,
        sectionId: 's1',
        timestamp: MOCK_DATE_NOW.getTime() - (11 - i) * 60 * 1000,
        rowsDelta: 1,
        stitchesDelta: 10,
      })
    }

    const stats = getTodayStats(projectId, records)

    // Speed should be based on the last 10 records (indices 2 to 11)
    const recentRecords = records.slice(-10)
    const timeSpanHours =
      (recentRecords[9].timestamp - recentRecords[0].timestamp) / (1000 * 60 * 60)

    // Sum of deltas for the last 9 records in the recent slice
    const totalRows = 9
    const totalStitches = 90

    expect(stats.rowsPerHour).toBeCloseTo(totalRows / timeSpanHours) // 9 rows / 9 minutes
    expect(stats.stitchesPerHour).toBeCloseTo(totalStitches / timeSpanHours) // 90 stitches / 9 minutes

    // 9 rows in 9 minutes is 1 row/min, which is 60 rows/hr
    expect(stats.rowsPerHour).toBeCloseTo(60)
    expect(stats.stitchesPerHour).toBeCloseTo(600)
  })
})
