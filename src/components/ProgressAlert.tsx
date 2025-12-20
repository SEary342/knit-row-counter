import { useState } from 'react'
import { Alert, Collapse, IconButton, Typography } from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'

interface ProgressAlertProps {
  rowsToday: number
  stitchesToday: number
  rowsPerHour: number
  stitchesPerHour: number
  estimatedDays: number | null
  estimatedHours: number | null
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
}: ProgressAlertProps) => {
  const [open, setOpen] = useState(true)

  return (
    <Alert
      severity="info"
      sx={{ mb: 2, '& .MuiAlert-message': { width: '100%' } }}
      action={
        <IconButton
          aria-label="toggle progress details"
          color="inherit"
          size="small"
          onClick={() => setOpen(!open)}
        >
          {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </IconButton>
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
        <Typography variant="body2" component="div">
          - Speed: {rowsPerHour.toFixed(1)} rows/hr
          {stitchesPerHour !== 0 && ` | ${stitchesPerHour.toFixed(1)} stitches/hr`}
        </Typography>
        {estimatedDays !== null && (
          <Typography variant="body2" component="div">
            - Est. completion: {pluralText('day', estimatedDays)} (
            {pluralText('hr', estimatedHours)} at current speed)
          </Typography>
        )}
      </Collapse>
    </Alert>
  )
}

export default ProgressAlert
