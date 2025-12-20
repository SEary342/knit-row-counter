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
      const averageRowsPerDay =
        Array.from(dailyRows.values()).reduce((sum, r) => sum + r, 0) / dailyRows.size

      if (averageRowsPerDay > 0 && rowsRemaining > 0) {
        // Round to two decimal places
        estimatedDays = Math.round((rowsRemaining / averageRowsPerDay) * 100) / 100
      }
    }
  }

  if (rowsPerHour > 0 && rowsRemaining > 0) {
    estimatedHours = Math.round((rowsRemaining / rowsPerHour) * 100) / 100
  }

  return { estimatedDays, estimatedHours }
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
      }
    }

    const allProjectRecords = records.filter((r) => r.projectId === project.id)

    const { rowsToday, stitchesToday } = calculateTodayStats(allProjectRecords)
    const { rowsPerHour, stitchesPerHour } = calculateSpeed(allProjectRecords)
    const { estimatedDays, estimatedHours } = calculateEstimatedCompletion(
      project,
      allProjectRecords,
      rowsPerHour,
    )

    return { rowsToday, stitchesToday, rowsPerHour, stitchesPerHour, estimatedDays, estimatedHours }
  }, [project, records])
}
