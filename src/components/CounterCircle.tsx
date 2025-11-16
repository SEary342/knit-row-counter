import {
  Box,
  IconButton,
  Typography,
  CircularProgress,
  Stack,
  type CircularProgressProps,
} from '@mui/material'
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
  color?: CircularProgressProps['color']
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
  color,
}: Props) {
  const percent = max && max > 0 ? Math.min(100, Math.round((value / max) * 100)) : null
  const isSmall = size < 180

  return (
    <Box sx={{ width: size, height: size, position: 'relative' }}>
      <CircularProgress
        variant="determinate"
        value={percent ?? 100}
        size={size}
        thickness={3}
        color={color}
      />
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
          <Typography variant={isSmall ? 'h5' : 'h4'} align="center">
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
            <IconButton
              onClick={onDecrement}
              aria-label="decrement"
              size={isSmall ? 'medium' : 'large'}
            >
              <RemoveIcon fontSize={isSmall ? 'small' : 'inherit'} />
            </IconButton>

            <IconButton
              onClick={onIncrement}
              aria-label="increment"
              size={isSmall ? 'medium' : 'large'}
            >
              <AddIcon fontSize={isSmall ? 'small' : 'inherit'} />
            </IconButton>
          </Stack>
        </Stack>
      </Box>
    </Box>
  )
}
