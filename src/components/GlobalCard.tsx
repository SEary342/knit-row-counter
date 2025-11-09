import type { Project } from '../features/projects/types'
import { decrementRow, incrementRow } from '../features/projects/projectsSlice'
import { useAppDispatch } from '../app/hooks'

import CounterCircle from './CounterCircle'
import CounterCard from './CounterCard'

interface globalCardProps {
  project: Project
}

const GlobalCard = ({ project }: globalCardProps) => {
  const dispatch = useAppDispatch()
  return (
    <CounterCard>
      <CounterCircle
        label="Global"
        value={project.currentRow}
        onIncrement={() => dispatch(incrementRow())}
        onDecrement={() => dispatch(decrementRow())}
        size={220}
        showFraction={false}
        smallNote={project.totalRows ? `Goal: ${project.totalRows}` : 'No total set'}
        color="success"
      />
    </CounterCard>
  )
}

export default GlobalCard
