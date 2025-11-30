import { useState } from 'react'
import { Box, IconButton, Tooltip, Typography } from '@mui/material'
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

  const repeatsNote = () => {
    if (!section) return 'No section configured'
    if (section.repeatRows && section.repeatRows > 1) {
      if (section.totalRepeats && section.totalRepeats > 0) {
        return `Repeats: ${section.repeatCount} / ${section.totalRepeats}`
      }
      return `Repeats: ${section.repeatCount}`
    }
    return undefined
  }

  const nextPatternRow = () => {
    if (!section?.pattern?.length || !section.repeatRows) return null

    const nextRowIndex = section.currentRow < section.repeatRows ? section.currentRow : 0
    const patternRow = section.pattern[nextRowIndex]

    return patternRow ? <Typography variant="body2">{patternRow}</Typography> : null
  }

  return (
    <CounterCard
      title={section?.name}
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
      footerContent={<Box>{nextPatternRow()}</Box>}
    >
      <CounterCircle
        value={section?.currentRow ?? 0}
        max={section?.repeatRows ?? null}
        onIncrement={() => dispatch(incrementRow(section?.id))}
        onDecrement={() => dispatch(decrementRow(section?.id))}
        size={circleSize}
        showFraction={true}
        smallNote={repeatsNote()}
        color={section.linked ? 'secondary' : 'info'}
      />
    </CounterCard>
  )
}

export default SectionCard
