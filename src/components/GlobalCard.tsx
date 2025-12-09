import { useState } from 'react'
import { IconButton, Tooltip } from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'

import type { Project } from '../features/projects/types'
import {
  calculateProjectStitches,
  decrementRow,
  incrementRow,
} from '../features/projects/projectsSlice'
import type { DisplaySize } from '../types'
import { useAppDispatch } from '../app/hooks'

import CounterCircle from './CounterCircle'
import CounterCard from './CounterCard'
import GlobalDialog from './GlobalDialog'

interface globalCardProps {
  project: Project
  displaySize?: DisplaySize
}

const GlobalCard = ({ project, displaySize = 'large' }: globalCardProps) => {
  const dispatch = useAppDispatch()
  const [dialogOpen, setDialogOpen] = useState(false)
  const circleSize = displaySize === 'small' ? 140 : displaySize === 'medium' ? 180 : 220

  const calculatedTotalRows = project.sections.reduce((total, section) => {
    if (section.totalRepeats && section.repeatRows) {
      return total + section.totalRepeats * section.repeatRows
    }
    return total
  }, 0)

  const totalStitches = calculateProjectStitches(project)

  const linkedSectionIds = project.sections
    .filter((section) => section.linked)
    .map((section) => section.id)
    .join('|')
  const payload = linkedSectionIds.length > 0 ? linkedSectionIds : undefined

  return (
    <CounterCard
      title="Global"
      cardActions={
        <GlobalDialog
          project={project}
          calculatedTotalRows={calculatedTotalRows}
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          trigger={
            <Tooltip title="Global Settings">
              <IconButton
                size="small"
                onClick={() => setDialogOpen(true)}
                aria-label="global settings"
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          }
        />
      }
    >
      <CounterCircle
        value={project.currentRow}
        onIncrement={() => dispatch(incrementRow(payload))}
        onDecrement={() => dispatch(decrementRow(payload))}
        max={project.totalRows ?? (calculatedTotalRows > 0 ? calculatedTotalRows : null)}
        size={circleSize}
        showFraction={false}
        smallNote={totalStitches > 0 ? `Total Stitches: ${totalStitches.toLocaleString()}` : ''}
        color="success"
      />
    </CounterCard>
  )
}

export default GlobalCard
