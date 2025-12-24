import { useMemo, type ReactNode } from 'react'
import { Box, Tooltip, Typography, useTheme, useMediaQuery, alpha } from '@mui/material'

export interface HeatmapData {
  date: string // YYYY-MM-DD
  count: number
}

export const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

const cellWidth = 12
const gap = 4

const generateYearData = (inputData: HeatmapData[] = [], maxDays: number = 365) => {
  const today = new Date()
  const days = []
  const dataMap = new Map(inputData.map((d) => [d.date, d.count]))

  const startDate = new Date(today)
  startDate.setDate(today.getDate() - maxDays + 1)
  const daysToSubtract = (7 - startDate.getDay()) % 7
  const totalDays = maxDays - daysToSubtract

  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(today.getDate() - i)
    const dateStr = formatLocalDate(d)
    days.push({
      date: dateStr,
      fullDate: d,
      count: dataMap.get(dateStr) || 0,
    })
  }
  return days
}

export const calculateMaxDaysForWidth = (width: number) => {
  const weekWidth = cellWidth + gap // 16

  // Add a safety margin (5px) to prevent sub-pixel rounding errors from causing overflow.
  const horizontalPadding = 91

  // Calculate the space available for the grid
  const gridWidthAvailable = width - horizontalPadding

  if (gridWidthAvailable <= 0) {
    return 7 // Return one week minimum
  }

  // Calculate number of whole weeks that fit.
  const weeks = Math.floor(gridWidthAvailable / weekWidth)

  const calculatedMaxDays = weeks * 7

  return Math.max(calculatedMaxDays, 7)
}

// --- Heatmap Component ---
const Heatmap = ({
  data = [],
  title = 'Contribution Graph',
  verb = 'contributions',
  children,
  maxDays: maxDaysProp,
}: {
  data: HeatmapData[]
  title: string
  verb: string
  children?: ReactNode
  maxDays?: number | null
}) => {
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))

  const defaultMaxDays = isSmallScreen ? 90 : 365
  const effectiveMaxDays = maxDaysProp ?? defaultMaxDays

  const calendarData = useMemo(
    () => generateYearData(data, effectiveMaxDays),
    [data, effectiveMaxDays],
  )

  const monthLabels = useMemo(() => {
    // Logic to calculate week structure (remains unchanged)
    const weeks: { weekIndex: number; days: typeof calendarData }[] = []
    let currentWeek: (typeof calendarData)[0][] = []
    let currentWeekIndex = 0

    calendarData.forEach((day, index) => {
      const dayOfWeek = day.fullDate.getDay() // 0 (Sun) to 6 (Sat)

      if (dayOfWeek === 0 && index !== 0) {
        weeks.push({ weekIndex: currentWeekIndex, days: currentWeek })
        currentWeek = []
        currentWeekIndex++
      }
      currentWeek.push(day)
    })
    if (currentWeek.length > 0) {
      weeks.push({ weekIndex: currentWeekIndex, days: currentWeek })
    }

    const labels = []
    let currentMonth = -1
    let weekPosition = 0

    for (const week of weeks) {
      const firstDayOfMonth = week.days.find((day) => day.fullDate.getMonth() !== currentMonth)

      if (firstDayOfMonth) {
        currentMonth = firstDayOfMonth.fullDate.getMonth()
        labels.push({
          name: firstDayOfMonth.fullDate.toLocaleString('en-US', { month: 'short' }),
          position: weekPosition,
        })
      }
      weekPosition++
    }

    if (labels.length > 0 && labels[0].position === 0) {
      const secondLabel = labels[1]

      if (effectiveMaxDays < 365 || (secondLabel && secondLabel.position < 5)) {
        return labels.slice(1)
      }
    }

    return labels
  }, [calendarData, effectiveMaxDays])

  const maxCount = useMemo(() => {
    const counts = calendarData.map((d) => d.count).filter((c) => c > 0)
    return counts.length > 0 ? Math.max(...counts) : 0
  }, [calendarData])

  const getColor = (count: number) => {
    if (count === 0) {
      return theme.palette.mode === 'dark' ? '#161b22' : '#ebedf0'
    }

    if (maxCount === 0) {
      return alpha(theme.palette.primary.main, 0.2)
    }

    const ratio = count / maxCount

    // Clamp just to be safe
    const clamped = Math.min(Math.max(ratio, 0), 1)

    const minAlpha = theme.palette.mode === 'dark' ? 0.25 : 0.15
    const maxAlpha = 0.95

    const alphaValue = minAlpha + clamped * (maxAlpha - minAlpha)

    return alpha(theme.palette.primary.main, alphaValue)
  }

  const numWeeks = Math.ceil(calendarData.length / 7)
  // Width = (numWeeks * cellWidth) + ((numWeeks - 1) * gap)
  const gridWidth = numWeeks * cellWidth + (numWeeks > 0 ? (numWeeks - 1) * gap : 0)

  return (
    <Box
      sx={{
        p: 3,
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        width: '100%',
        maxWidth: '100%',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">{title}</Typography>
        {children}
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        {/* Day of Week Labels */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateRows: 'repeat(7, 12px)',
            gap: '4px',
            mt: '20px',
            mr: 1,
            // Fixed width for day labels
            width: 30,
            flexShrink: 0,
          }}
        >
          <Typography
            variant="caption"
            sx={{ gridRow: 2, lineHeight: '12px', color: 'text.secondary' }}
          >
            Mon
          </Typography>
          <Typography
            variant="caption"
            sx={{ gridRow: 4, lineHeight: '12px', color: 'text.secondary' }}
          >
            Wed
          </Typography>
          <Typography
            variant="caption"
            sx={{ gridRow: 6, lineHeight: '12px', color: 'text.secondary' }}
          >
            Fri
          </Typography>
        </Box>

        {/* Heatmap Grid Container (Scrollable) */}
        <Box
          sx={{
            overflowX: 'auto',
            pb: 1,
            width: '100%', // Ensures it fills the remaining space
          }}
        >
          {/* Month Labels */}
          <Box sx={{ display: 'flex', mb: 1, height: '14px', position: 'relative' }}>
            {monthLabels.map((month) => (
              <Typography
                key={month.name + month.position}
                variant="caption"
                sx={{
                  position: 'absolute',
                  left: month.position * (cellWidth + gap) + 0.5 * gap,
                  color: 'text.secondary',
                  whiteSpace: 'nowrap',
                }}
              >
                {month.name}
              </Typography>
            ))}
          </Box>

          {/* Heatmap Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateRows: 'repeat(7, 1fr)',
              gridAutoFlow: 'column',
              gap: `${gap}px`,
              width: gridWidth,
              minWidth: gridWidth,
            }}
          >
            {calendarData.map((item) => (
              <Tooltip key={item.date} title={`${item.count} ${verb} on ${item.date}`} arrow>
                <Box
                  sx={{
                    width: cellWidth,
                    height: cellWidth,
                    borderRadius: '2px',
                    bgcolor: getColor(item.count),
                    outline: '2px solid transparent',
                    outlineOffset: -1,
                    '&:hover': {
                      outlineColor: theme.palette.text.primary,
                      zIndex: 1,
                    },
                  }}
                />
              </Tooltip>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Heatmap
