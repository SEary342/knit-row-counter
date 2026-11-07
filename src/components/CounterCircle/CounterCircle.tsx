import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import Box from '@mui/material/Box'
import CircularProgress, { type CircularProgressProps } from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

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
  disabled?: boolean
  isFinished?: boolean
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
  disabled,
  isFinished,
}: Props) {
  const percent = max && max > 0 ? Math.min(100, Math.round((value / max) * 100)) : null
  const isMedium = size < 220
  const isSmall = size < 180

  return (
    <Stack
      sx={{
        gap: 2,
        width: size,
        height: size,
        position: 'relative',
      }}
    >
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
        color={disabled ? 'inherit' : color}
        sx={disabled ? { color: 'action.disabled' } : undefined}
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
        <Stack
          spacing={0.5}
          sx={{
            alignItems: 'center',
            pointerEvents: 'auto',
          }}
        >
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
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
              }}
            >
              {smallNote}
            </Typography>
          )}
          <Stack
            direction="row"
            spacing={2}
            sx={{
              alignItems: 'center',
            }}
          >
            <IconButton
              onClick={onDecrement}
              aria-label="decrement"
              size={isSmall ? 'small' : 'large'}
              disabled={disabled}
            >
              <RemoveIcon fontSize={isSmall ? 'small' : isMedium ? 'medium' : 'large'} />
            </IconButton>
            <IconButton
              onClick={onIncrement}
              aria-label="increment"
              size={isSmall ? 'small' : 'large'}
              disabled={disabled || isFinished}
            >
              <AddIcon fontSize={isSmall ? 'small' : isMedium ? 'medium' : 'large'} />
            </IconButton>
          </Stack>
        </Stack>
      </Box>
    </Stack>
  )
}
