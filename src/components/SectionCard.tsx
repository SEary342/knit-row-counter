import { useState } from 'react'
import { IconButton, Tooltip } from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'

import type { SectionConfig } from '../features/projects/types'
import { decrementRow, incrementRow } from '../features/projects/projectsSlice'
import { useAppDispatch } from '../app/hooks'
import type { DisplaySize } from '../types'

import CounterCircle from './CounterCircle'
import CounterCard from './CounterCard'
import SectionDialog from './SectionDialog'

interface sectionCardProps {
  section: SectionConfig
  displaySize?: DisplaySize
}

const SectionCard = ({ section, displaySize = 'large' }: sectionCardProps) => {
  const dispatch = useAppDispatch()
  const [dialogOpen, setDialogOpen] = useState(false)
  const circleSize = displaySize === 'small' ? 140 : displaySize === 'medium' ? 180 : 220

  return (
    <CounterCard
      cardActions={
        <SectionDialog
          section={section}
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          trigger={
            <Tooltip title="Section Settings">
              <IconButton size="small" onClick={() => setDialogOpen(true)}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          }
        />
      }
    >
      <CounterCircle
        label={section?.name}
        value={section?.currentRow ?? 0}
        max={section?.repeatRows ?? null}
        onIncrement={() => dispatch(incrementRow(section?.id))}
        onDecrement={() => dispatch(decrementRow(section?.id))}
        size={circleSize}
        showFraction={true}
        smallNote={section ? `Repeats: ${section.repeatCount}` : 'No section configured'}
        color="secondary"
      />
    </CounterCard>
  )
}

export default SectionCard
