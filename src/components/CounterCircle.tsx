import { Box, IconButton, Typography, CircularProgress, Stack } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'

interface Props {
  label?: string
  value: number
  max?: number | null
  onIncrement: () => void
  onDecrement: () => void
  size?: number
  showFraction?: boolean
  smallNote?: string
}

export default function CounterCircle({
  label,
  value,
  max = null,
  onIncrement,
  onDecrement,
  size = 180,
  showFraction = true,
  smallNote,
}: Props) {
  const percent = max && max > 0 ? Math.min(100, Math.round((value / max) * 100)) : null

  return (
    <Box sx={{ width: size, height: size, position: 'relative' }}>
      <CircularProgress variant="determinate" value={percent ?? 100} size={size} thickness={3} />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <Stack spacing={1} alignItems="center" sx={{ pointerEvents: 'auto' }}>
          {label && (
            <Typography variant="subtitle2" align="center">
              {label}
            </Typography>
          )}
          <Typography variant="h4" align="center">
            {value}
            {showFraction && max ? ` / ${max}` : ''}
          </Typography>
          {percent != null && (
            <Typography variant="caption" align="center">
              {percent}% complete
            </Typography>
          )}
          {smallNote && (
            <Typography variant="caption" color="text.secondary">
              {smallNote}
            </Typography>
          )}

          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton onClick={onDecrement} aria-label="decrement" size="large">
              <RemoveIcon />
            </IconButton>

            <IconButton onClick={onIncrement} aria-label="increment" size="large">
              <AddIcon />
            </IconButton>
          </Stack>
        </Stack>
      </Box>
    </Box>
  )
}
