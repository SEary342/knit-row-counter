import type { Project } from '../features/projects/types'
import { decrementRow, incrementRow } from '../features/projects/projectsSlice'
import { useAppDispatch } from '../app/hooks'
import type { DisplaySize } from '../types'

import CounterCircle from './CounterCircle'
import CounterCard from './CounterCard'

interface globalCardProps {
  project: Project
  displaySize?: DisplaySize
}

const GlobalCard = ({ project, displaySize = 'large' }: globalCardProps) => {
  const dispatch = useAppDispatch()
  const circleSize = displaySize === 'small' ? 140 : displaySize === 'medium' ? 180 : 220

  return (
    <CounterCard>
      <CounterCircle
        label="Global"
        value={project.currentRow}
        onIncrement={() => dispatch(incrementRow())}
        onDecrement={() => dispatch(decrementRow())}
        size={circleSize}
        showFraction={false}
        smallNote={project.totalRows ? `Goal: ${project.totalRows}` : 'No total set'}
        color="success"
      />
    </CounterCard>
  )
}

export default GlobalCard
