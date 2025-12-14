import { useMemo } from 'react'
import type { ProgressRecord } from '../features/progress/progressSlice'
import type { Project } from '../features/projects/types'
import { calculateProjectTotalRows } from '../features/projects/projectsSlice'

export const useProjectStats = (project: Project | undefined, records: ProgressRecord[]) => {
  return useMemo(() => {
    if (!project) {
      return { rowsToday: 0, stitchesToday: 0, rowsPerHour: 0, stitchesPerHour: 0, estimatedDays: null }
    }

    const projectId = project.id
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const midnight = today.getTime()

    const projectRecordsToday = records.filter(
      (r) => r.projectId === projectId && r.timestamp >= midnight,
    )

    const rowsToday = projectRecordsToday.reduce((sum, r) => sum + r.rowsDelta, 0)
    const stitchesToday = projectRecordsToday.reduce((sum, r) => sum + r.stitchesDelta, 0)

    const recentRecords = projectRecordsToday.slice(-10)

    let rowsPerHour = 0
    let stitchesPerHour = 0
    if (recentRecords.length > 1) {
      const timeSpanHours =
        (recentRecords[recentRecords.length - 1].timestamp - recentRecords[0].timestamp) /
        (1000 * 60 * 60)

      if (timeSpanHours > 0) {
        const totalRows = recentRecords.slice(1).reduce((sum, r) => sum + r.rowsDelta, 0)
        const totalStitches = recentRecords.slice(1).reduce((sum, r) => sum + r.stitchesDelta, 0)
        rowsPerHour = totalRows / timeSpanHours
        stitchesPerHour = totalStitches / timeSpanHours
      }
    }

    const allProjectRecords = records.filter((r) => r.projectId === projectId)
    let estimatedDays: number | null = null

    if (allProjectRecords.length > 0) {
      const dailyRows = new Map<string, number>()
      for (const record of allProjectRecords) {
        if (record.rowsDelta > 0) {
          const date = new Date(record.timestamp).toISOString().split('T')[0]
          dailyRows.set(date, (dailyRows.get(date) || 0) + record.rowsDelta)
        }
      }

      if (dailyRows.size > 0) {
        const averageRowsPerDay = Array.from(dailyRows.values()).reduce((sum, r) => sum + r, 0) / dailyRows.size
        const totalProjectRows = project.totalRows ?? calculateProjectTotalRows(project)
        const rowsRemaining = totalProjectRows - project.currentRow
        if (averageRowsPerDay > 0 && rowsRemaining > 0) {
          estimatedDays = Math.ceil(rowsRemaining / averageRowsPerDay)
        }
      }
    }
    return { rowsToday, stitchesToday, rowsPerHour, stitchesPerHour, estimatedDays }
  }, [project, records])
}