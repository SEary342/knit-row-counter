import { useMemo } from 'react'
import type { ProgressRecord } from '../features/progress/progressSlice'
import type { Project } from '../features/projects/types'
import { calculateProjectTotalRows } from '../features/projects/projectsSlice'

const HOUR = 60 * 60 * 1000

/**
 * Calculates the total rows and stitches completed today.
 * @param projectRecords - All progress records for a single project.
 * @returns An object with `rowsToday` and `stitchesToday`.
 */
const calculateTodayStats = (projectRecords: ProgressRecord[]) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const midnight = today.getTime()

  const projectRecordsToday = projectRecords.filter((r) => r.timestamp >= midnight)

  const rowsToday = projectRecordsToday.reduce((sum, r) => sum + r.rowsDelta, 0)
  const stitchesToday = projectRecordsToday.reduce((sum, r) => sum + r.stitchesDelta, 0)

  return { rowsToday, stitchesToday }
}

const twoDigitRound = (num: number) => Math.round(num * 100) / 100

/**
 * Calculates the recent knitting speed in rows/hour and stitches/hour.
 * Speed is based on the records from the last hour.
 * @param projectRecords - All progress records for a single project, sorted by timestamp.
 * @returns An object with `rowsPerHour` and `stitchesPerHour`.
 */
const calculateSpeed = (projectRecords: ProgressRecord[]) => {
  // Use records from the last hour for speed calculation
  const now = Date.now()
  const recentRecords = projectRecords.filter((r) => r.timestamp >= now - HOUR)
  let rowsPerHour = 0
  let stitchesPerHour = 0

  if (recentRecords.length > 1) {
    const timeSpanHours =
      (recentRecords[recentRecords.length - 1].timestamp - recentRecords[0].timestamp) / HOUR

    if (timeSpanHours > 0) {
      // The first record is the baseline, so we sum the deltas of the subsequent records
      const totalRows = recentRecords.slice(1).reduce((sum, r) => sum + r.rowsDelta, 0)
      const totalStitches = recentRecords.slice(1).reduce((sum, r) => sum + r.stitchesDelta, 0)
      rowsPerHour = totalRows / timeSpanHours
      stitchesPerHour = totalStitches / timeSpanHours
    }
  }

  return { rowsPerHour, stitchesPerHour }
}

/**
 * Calculates the estimated number of days to complete the project.
 * This is based on the average number of rows completed per day.
 * @param project - The project object.
 * @param projectRecords - All progress records for the project.
 * @param rowsPerHour - The current knitting speed in rows per hour.
 * @returns An object with estimated days and hours remaining.
 */
const calculateEstimatedCompletion = (
  project: Project,
  projectRecords: ProgressRecord[],
  rowsPerHour: number,
) => {
  const totalProjectRows = project.totalRows ?? calculateProjectTotalRows(project)
  const rowsRemaining = totalProjectRows - project.currentRow
  let estimatedDays: number | null = null
  let estimatedHours: number | null = null
  let averageRowsPerDay = 0

  if (projectRecords.length > 0) {
    const dailyRows = new Map<string, number>()
    for (const record of projectRecords) {
      // Only consider progress, not decrements, for average speed
      if (record.rowsDelta > 0) {
        const date = new Date(record.timestamp).toISOString().split('T')[0]
        dailyRows.set(date, (dailyRows.get(date) || 0) + record.rowsDelta)
      }
    }

    if (dailyRows.size > 0) {
      averageRowsPerDay =
        Array.from(dailyRows.values()).reduce((sum, r) => sum + r, 0) / dailyRows.size

      if (averageRowsPerDay > 0 && rowsRemaining > 0) {
        // Round to two decimal places
        estimatedDays = twoDigitRound(rowsRemaining / averageRowsPerDay)
      }
    }
  }

  if (rowsPerHour > 0 && rowsRemaining > 0) {
    estimatedHours = twoDigitRound(rowsRemaining / rowsPerHour)
  }

  const averageRowsPerDayReturn = twoDigitRound(averageRowsPerDay)

  return { estimatedDays, estimatedHours, averageRowsPerDay: averageRowsPerDayReturn }
}

const calculateLastRowMinutes = (projectRecords: ProgressRecord[]) => {
  if (projectRecords.length < 2) return null

  // Sort by timestamp descending to find the most recent records
  const sorted = [...projectRecords].sort((a, b) => b.timestamp - a.timestamp)
  const last = sorted[0]
  const prev = sorted[1]

  // Only calculate if the last record was a row increment
  if (last.rowsDelta > 0) {
    return Math.round((last.timestamp - prev.timestamp) / 60000)
  }
  return null
}

const calculateRateTrend = (
  projectRecords: ProgressRecord[],
  rowsPerHour: number,
): 'increasing' | 'decreasing' | 'stable' | null => {
  const sorted = [...projectRecords]
    .filter((r) => r.rowsDelta > 0)
    .sort((a, b) => b.timestamp - a.timestamp)

  if (sorted.length < 2) return null

  const last = sorted[0]
  const prev = sorted[1]

  const durationHours = (last.timestamp - prev.timestamp) / HOUR
  if (durationHours <= 0) return null

  const currentRate = last.rowsDelta / durationHours

  if (rowsPerHour === 0) {
    return currentRate > 0 ? 'increasing' : null
  }

  const ratio = currentRate / rowsPerHour

  if (ratio > 1.1) return 'increasing'
  if (ratio < 0.9) return 'decreasing'
  return 'stable'
}

export const useProjectStats = (project: Project | undefined, records: ProgressRecord[]) => {
  return useMemo(() => {
    if (!project) {
      return {
        rowsToday: 0,
        stitchesToday: 0,
        rowsPerHour: 0,
        stitchesPerHour: 0,
        estimatedDays: null,
        estimatedHours: null,
        averageRowsPerDay: 0,
        lastRowMinutes: null,
        rateTrend: null as 'increasing' | 'decreasing' | 'stable' | null,
      }
    }

    const allProjectRecords = records.filter((r) => r.projectId === project.id)

    const { rowsToday, stitchesToday } = calculateTodayStats(allProjectRecords)
    const { rowsPerHour, stitchesPerHour } = calculateSpeed(allProjectRecords)
    const { estimatedDays, estimatedHours, averageRowsPerDay } = calculateEstimatedCompletion(
      project,
      allProjectRecords,
      rowsPerHour,
    )
    const lastRowMinutes = calculateLastRowMinutes(allProjectRecords)
    const rateTrend = calculateRateTrend(allProjectRecords, rowsPerHour)

    return {
      rowsToday,
      stitchesToday,
      rowsPerHour,
      stitchesPerHour,
      estimatedDays,
      estimatedHours,
      averageRowsPerDay,
      lastRowMinutes,
      rateTrend,
    }
  }, [project, records])
}
