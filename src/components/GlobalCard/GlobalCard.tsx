import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import SettingsIcon from '@mui/icons-material/Settings'
import { Box, IconButton, Tooltip } from '@mui/material'
import { useMemo, useState } from 'react'

import { useAppDispatch } from '@src/app/hooks'
import {
  calculateProjectStitches,
  calculateProjectTotalRows,
  decrementRow,
  incrementRow,
} from '@src/features/projects/projectsSlice'
import type { Project } from '@src/features/projects/types'
import type { DisplaySize } from '@src/types'

import CounterCard from '@comp/CounterCard'
import CounterCircle from '@comp/CounterCircle'
import Fireworks from '@comp/Fireworks'
import GlobalDialog from '@comp/GlobalDialog'

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
      {isFinished && <Fireworks duration={10000} />}
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
