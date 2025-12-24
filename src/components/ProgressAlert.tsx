import { useState } from 'react'
import { Alert, Box, Collapse, IconButton, Tooltip, Typography } from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import DonutLargeIcon from '@mui/icons-material/DonutLarge'
import DonutSmallIcon from '@mui/icons-material/DonutSmall'

interface ProgressAlertProps {
  rowsToday: number
  stitchesToday: number
  rowsPerHour: number
  stitchesPerHour: number
  estimatedDays: number | null
  estimatedHours: number | null
  averageRowsPerDay: number
  onOpenHistory?: () => void
}

const pluralText = (unit: string, count: number | null) =>
  count === null ? '' : `${count} ${unit}${count !== 1 ? 's' : ''}`

const ProgressAlert = ({
  rowsToday,
  stitchesToday,
  rowsPerHour,
  stitchesPerHour,
  estimatedDays,
  estimatedHours,
  averageRowsPerDay,
  onOpenHistory,
}: ProgressAlertProps) => {
  const [open, setOpen] = useState(true)
  const showDetails = rowsPerHour > 0 && rowsPerHour < 100

  return (
    <Alert
      severity="info"
      sx={{ mb: 2, '& .MuiAlert-message': { width: '100%' } }}
      icon={<DonutSmallIcon fontSize="inherit" />}
      action={
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {onOpenHistory && (
            <Tooltip title="View History & Charts">
              <IconButton
                aria-label="view history"
                color="inherit"
                size="small"
                onClick={onOpenHistory}
                sx={{ mr: 0.5 }}
              >
                <DonutLargeIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          )}
          <IconButton
            aria-label="toggle progress details"
            color="inherit"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </Box>
      }
    >
      <Typography variant="subtitle1" onClick={() => setOpen(!open)} sx={{ cursor: 'pointer' }}>
        Today's Progress
      </Typography>
      <Collapse in={open}>
        <Typography variant="body2" component="div">
          - Rows: {rowsToday}
          {stitchesToday !== 0 && ` | Stitches: ${stitchesToday}`}
        </Typography>
        {showDetails && (
          <Box>
            <Typography variant="body2" component="div">
              - Speed: {rowsPerHour.toFixed(1)} rows/hr
              {stitchesPerHour !== 0 && ` | ${stitchesPerHour.toFixed(1)} stitches/hr`}
            </Typography>
            {estimatedDays !== null && (
              <Typography variant="body2" component="div">
                - Est. completion: {pluralText('day', estimatedDays)} (
                {pluralText('hr', estimatedHours)} at {averageRowsPerDay} rows/day)
              </Typography>
            )}
          </Box>
        )}
      </Collapse>
    </Alert>
  )
}

export default ProgressAlert
