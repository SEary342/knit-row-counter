import { Card, CardActionArea, CardContent } from '@mui/material'
import type { ReactNode } from 'react'

interface CounterCardProps {
  children: ReactNode
  cardActions?: ReactNode
}

const CounterCard = ({ children, cardActions }: CounterCardProps) => (
  <Card>
    {cardActions && <CardActionArea>{cardActions}</CardActionArea>}
    <CardContent sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
      {children}
    </CardContent>
  </Card>
)

export default CounterCard
