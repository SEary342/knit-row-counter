import { Card, CardActions, CardContent, Stack, Typography, Box } from '@mui/material'
import type { ReactNode } from 'react'

interface CounterCardProps {
  title?: string
  children: ReactNode
  cardActions?: ReactNode
  footerContent?: ReactNode
}

const CounterCard = ({ title, children, cardActions, footerContent }: CounterCardProps) => (
  <Card>
    <CardContent sx={{ flex: 1, display: 'flex', justifyContent: 'center', pb: 0 }}>
      <Stack spacing={2} alignItems="center">
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
        <Typography variant="caption" color="text.secondary">
          {footerContent}
        </Typography>
      </Box>
    )}
    <CardActions>{cardActions}</CardActions>
  </Card>
)

export default CounterCard
