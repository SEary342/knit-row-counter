import { useState } from 'react'
import { Box, IconButton, Tooltip, Typography } from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

import type { SectionConfig } from '../features/projects/types'
import { decrementRow, incrementRow, moveSection } from '../features/projects/projectsSlice'
import type { DisplaySize } from '../types'
import { useAppDispatch, useAppSelector } from '../app/hooks'

import CounterCircle from './CounterCircle'
import CounterCard from './CounterCard'
import SectionDialog from './SectionDialog'

interface sectionCardProps {
  section: SectionConfig
  displaySize?: DisplaySize
  isSortForced?: boolean
}

const SectionCard = ({
  section,
  displaySize = 'large',
  isSortForced = false,
}: sectionCardProps) => {
  const dispatch = useAppDispatch()
  const project = useAppSelector((s) =>
    s.projects.projects.find((p) => p.id === s.projects.currentProjectId),
  )
  const [dialogOpen, setDialogOpen] = useState(false)
  const circleSize = displaySize === 'small' ? 140 : displaySize === 'medium' ? 180 : 220

  // Determine index and total only when needed for manual sorting
  const { sectionIndex, totalSections } = !isSortForced
    ? {
        sectionIndex: project?.sections.findIndex((s) => s.id === section.id),
        totalSections: project?.sections.length,
      }
    : { sectionIndex: undefined, totalSections: undefined }

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
    const stitchesText = patternRow.stitches ? ` (${patternRow.stitches})` : ''

    return patternRow ? (
      <Typography variant="body2">
        {patternRow.instruction}
        {stitchesText}
      </Typography>
    ) : null
  }

  return (
    <CounterCard
      title={section?.name}
      cardActions={
        <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
          <Box>
            {!isSortForced && sectionIndex !== undefined && totalSections !== undefined && (
              <>
                <Tooltip title="Move Left">
                  <span>
                    <IconButton
                      size="small"
                      onClick={() =>
                        dispatch(moveSection({ sectionId: section.id, direction: 'up' }))
                      }
                      disabled={sectionIndex === 0}
                    >
                      <ArrowBackIcon />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Move Right">
                  <span>
                    <IconButton
                      size="small"
                      onClick={() =>
                        dispatch(moveSection({ sectionId: section.id, direction: 'down' }))
                      }
                      disabled={sectionIndex === totalSections - 1}
                    >
                      <ArrowForwardIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </>
            )}
          </Box>
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
        </Box>
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
