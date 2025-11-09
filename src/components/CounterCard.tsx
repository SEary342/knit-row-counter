import { Card, CardActions, CardContent } from '@mui/material'
import type { ReactNode } from 'react'

interface CounterCardProps {
  children: ReactNode
  cardActions?: ReactNode
}

const CounterCard = ({ children, cardActions }: CounterCardProps) => (
  <Card>
    <CardContent sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
      {children}
    </CardContent>
    <CardActions>{cardActions}</CardActions>
  </Card>
)

export default CounterCard
