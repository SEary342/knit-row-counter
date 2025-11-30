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
  const isMedium = size < 220
  const isSmall = size < 180

  return (
    <Stack sx={{ width: size, height: size, position: 'relative' }} gap={2}>
      {label && (
        <Typography variant="h6" align="center">
          {label}
        </Typography>
      )}
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
        <Stack spacing={0.5} alignItems="center" sx={{ pointerEvents: 'auto' }}>
          <Typography variant={isSmall ? 'caption' : isMedium ? 'h6' : 'h3'} align="center">
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
              size={isSmall ? 'small' : 'large'}
            >
              <RemoveIcon fontSize={isSmall ? 'small' : isMedium ? 'medium' : 'large'} />
            </IconButton>
            <IconButton
              onClick={onIncrement}
              aria-label="increment"
              size={isSmall ? 'small' : 'large'}
            >
              <AddIcon fontSize={isSmall ? 'small' : isMedium ? 'medium' : 'large'} />
            </IconButton>
          </Stack>
        </Stack>
      </Box>
    </Stack>
  )
}
