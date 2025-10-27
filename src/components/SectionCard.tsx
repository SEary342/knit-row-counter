import type { SectionConfig } from '../features/projects/types'
import { decrementRow, incrementRow } from '../features/projects/projectsSlice'
import { useAppDispatch } from '../app/hooks'

import CounterCircle from './CounterCircle'
import CounterCard from './CounterCard'
import SectionDialog from './SectionDialog'

interface sectionCardProps {
  section: SectionConfig
}

const SectionCard = ({ section }: sectionCardProps) => {
  const dispatch = useAppDispatch()
  return (
    <CounterCard cardActions={<SectionDialog section={section} />}>
      <CounterCircle
        label="Section"
        value={section?.currentRow ?? 0}
        max={section?.repeatRows ?? null}
        onIncrement={() => dispatch(incrementRow())}
        onDecrement={() => dispatch(decrementRow())}
        size={220}
        showFraction={true}
        smallNote={section ? `Repeats: ${section.repeatCount}` : 'No section configured'}
        color="secondary"
      />
    </CounterCard>
  )
}

export default SectionCard
