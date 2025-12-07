import type { ProgressRecord } from '../features/progress/progressSlice'

export const getTodayStats = (projectId: string, records: ProgressRecord[]) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const midnight = today.getTime()

  const projectRecordsToday = records.filter(
    (r) => r.projectId === projectId && r.timestamp >= midnight,
  )

  const rowsToday = projectRecordsToday.reduce((sum, r) => sum + r.rowsDelta, 0)
  const stitchesToday = projectRecordsToday.reduce((sum, r) => sum + r.stitchesDelta, 0)

  // Use the last 10 records (increments and decrements) for speed calculation
  // to get a more accurate recent speed.
  const recentRecords = records.filter((r) => r.projectId === projectId).slice(-10)

  let rowsPerHour = 0
  let stitchesPerHour = 0
  if (recentRecords.length > 1) {
    const timeSpanHours =
      (recentRecords[recentRecords.length - 1].timestamp - recentRecords[0].timestamp) /
      (1000 * 60 * 60)

    if (timeSpanHours > 0) {
      // Sum deltas over the timespan. The timespan is from the first to the last record,
      // so we should include all deltas from the second record onwards.
      const totalRows = recentRecords.slice(1).reduce((sum, r) => sum + r.rowsDelta, 0)
      const totalStitches = recentRecords.slice(1).reduce((sum, r) => sum + r.stitchesDelta, 0)
      rowsPerHour = totalRows / timeSpanHours
      stitchesPerHour = totalStitches / timeSpanHours
    }
  }

  return { rowsToday, stitchesToday, rowsPerHour, stitchesPerHour }
}
