import { useMemo, useState } from 'react'
import { Box, IconButton, Tooltip } from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

import type { Project } from '../features/projects/types'
import {
  calculateProjectStitches,
  calculateProjectTotalRows,
  decrementRow,
  incrementRow,
} from '../features/projects/projectsSlice'
import type { DisplaySize } from '../types'
import { useAppDispatch } from '../app/hooks'

import CounterCircle from './CounterCircle'
import CounterCard from './CounterCard'
import GlobalDialog from './GlobalDialog'
import Fireworks from './Fireworks'

interface globalCardProps {
  project: Project
  displaySize?: DisplaySize
}

const GlobalCard = ({ project, displaySize = 'large' }: globalCardProps) => {
  const dispatch = useAppDispatch()
  const [dialogOpen, setDialogOpen] = useState(false)
  const circleSize = displaySize === 'small' ? 140 : displaySize === 'medium' ? 180 : 220

  const calculatedTotalRows = useMemo(() => calculateProjectTotalRows(project), [project])

  const maxRows = project.totalRows ?? (calculatedTotalRows > 0 ? calculatedTotalRows : null)
  const isFinished = maxRows !== null && project.currentRow >= maxRows

  const totalStitches = calculateProjectStitches(project)

  const linkedSectionIds = project.sections
    .filter((section) => section.linked)
    .map((section) => section.id)
    .join('|')
  const payload = linkedSectionIds.length > 0 ? linkedSectionIds : undefined

  return (
    <Box position="relative" height="100%">
      {isFinished && <Fireworks />}
      <CounterCard
        title={
          isFinished ? (
            <Box component="span" display="inline-flex" alignItems="center" gap={1}>
              Global
              <CheckCircleIcon color="success" fontSize="small" />
            </Box>
          ) : (
            'Global'
          )
        }
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
          max={maxRows}
          size={circleSize}
          showFraction={false}
          smallNote={totalStitches > 0 ? `Total Stitches: ${totalStitches.toLocaleString()}` : ''}
          color={isFinished ? 'success' : 'primary'}
          isFinished={isFinished}
        />
      </CounterCard>
    </Box>
  )
}

export default GlobalCard
