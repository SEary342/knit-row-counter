import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

interface CounterCardProps {
  title?: ReactNode
  children: ReactNode
  cardActions?: ReactNode
  footerContent?: ReactNode
}

const CounterCard = ({ title, children, cardActions, footerContent }: CounterCardProps) => (
  <Card>
    <CardContent sx={{ flex: 1, display: 'flex', justifyContent: 'center', pb: 0 }}>
      <Stack
        spacing={2}
        sx={{
          alignItems: 'center',
        }}
      >
        {title && (
          <Typography variant="subtitle1" align="center">
            {title}
          </Typography>
        )}
        {children}
      </Stack>
    </CardContent>
    {footerContent && (
      <Box sx={{ textAlign: 'justify', pt: 1, px: 2 }}>
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
          }}
        >
          {footerContent}
        </Typography>
      </Box>
    )}
    <CardActions>{cardActions}</CardActions>
  </Card>
)

export default CounterCard
