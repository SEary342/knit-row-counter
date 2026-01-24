import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Switch,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import React, { useMemo, useState, useRef, useEffect } from 'react'
import {
  DataGrid,
  type GridColDef,
  GridActionsCellItem,
  type GridToolbarProps,
} from '@mui/x-data-grid'
import DeleteIcon from '@mui/icons-material/Delete'

import { useAppDispatch, useAppSelector } from '../app/hooks'
import { type Project } from '../features/projects/types'
import { deleteProgressRecord } from '../features/progress/progressSlice'
import ConfirmationDialog from './ConfirmationDialog'
import FullscreenDataGrid from './FullscreenDataGrid'
import Heatmap, { calculateMaxDaysForWidth, formatLocalDate } from './Heatmap'
import { type ProgressRecord } from '../features/progress/progressSlice'

const HistoryToolbar = (props: GridToolbarProps & { FullscreenToggleButton?: React.ReactNode }) => (
  <Box sx={{ display: 'flex', p: 1, px: 2, justifyContent: 'space-between', alignItems: 'center' }}>
    <Typography variant="h6">Progress History</Typography>
    {props.FullscreenToggleButton}
  </Box>
)

interface ProjectInfoDialogProps {
  project: Project
  open: boolean
  onClose: () => void
}

type CountMode = 'rows' | 'stitches'

const calculateMaxDays = (width: number, isMobile: boolean) => {
  if (width > 0) {
    const maxDaysFromWidth = calculateMaxDaysForWidth(width)
    // Ensure it does not exceed 365 days
    return Math.min(maxDaysFromWidth, 365)
  }
  // Fallback if width is somehow 0
  return isMobile ? 90 : 365
}

const ProjectInfoDialog = ({ project, open, onClose }: ProjectInfoDialogProps) => {
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { records } = useAppSelector((s) => s.progress)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [countMode, setCountMode] = useState<CountMode>('rows')
  const [maxDays, setMaxDays] = useState(365)

  const updateMaxDays = () => {
    if (!containerRef.current) return
    setMaxDays(calculateMaxDays(containerRef.current.offsetWidth, isMobile))
  }

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setMaxDays(calculateMaxDays(entries[0].contentRect.width, isMobile))
      }
    })

    observer.observe(element)

    return () => observer.disconnect()
  }, [isMobile])

  const projectRecords = useMemo(
    () => records.filter((r) => r.projectId === project.id),
    [records, project.id],
  )

  const heatmapData = useMemo(() => {
    const dailyCounts = new Map<string, number>()

    for (const record of projectRecords) {
      const date = formatLocalDate(new Date(record.timestamp))

      const delta = countMode === 'rows' ? record.rowsDelta : record.stitchesDelta
      dailyCounts.set(date, (dailyCounts.get(date) || 0) + delta)
    }

    return Array.from(dailyCounts.entries()).map(([date, count]) => ({
      date,
      count,
    }))
  }, [projectRecords, countMode])

  const handleDeleteClick = (id: string) => {
    setRecordToDelete(id)
    setConfirmOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (recordToDelete) {
      dispatch(deleteProgressRecord(recordToDelete))
    }
    setConfirmOpen(false)
    setRecordToDelete(null)
  }

  const columns: GridColDef<ProgressRecord>[] = [
    {
      field: 'timestamp',
      headerName: 'Date',
      flex: 1,
      valueFormatter: (value: number) => new Date(value).toLocaleString(),
    },
    {
      field: 'sectionId',
      headerName: 'Section',
      flex: 1,
      valueGetter: (value: string) => {
        if (value === 'global') return 'Global'
        return project.sections.find((s) => s.id === value)?.name ?? 'Unknown'
      },
    },
    { field: 'rowsDelta', headerName: 'Rows', type: 'number', width: 80 },
    { field: 'stitchesDelta', headerName: 'Stitches', type: 'number', width: 100 },
    {
      field: 'actions',
      type: 'actions',
      width: 50,
      getActions: (params) => [
        <GridActionsCellItem
          key="delete"
          icon={
            <Tooltip title="Delete Record">
              <DeleteIcon />
            </Tooltip>
          }
          label="Delete"
          onClick={() => handleDeleteClick(params.row.id)}
        />,
      ],
    },
  ]

  const chartTitle =
    countMode === 'rows' ? 'Rows Completed Activity' : 'Stitches Completed Activity'

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        slotProps={{ transition: { onEntered: updateMaxDays } }}
      >
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          Project History & Info
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }} ref={containerRef}>
            <Heatmap data={heatmapData} title={chartTitle} maxDays={maxDays} verb={countMode}>
              <Stack
                direction="row"
                spacing={{ xs: 0.5, sm: 1 }}
                alignItems="center"
                flexWrap="nowrap"
              >
                <Switch
                  size="small"
                  checked={countMode === 'stitches'}
                  onChange={(event) => setCountMode(event.target.checked ? 'stitches' : 'rows')}
                  slotProps={{ input: { 'aria-label': 'count by stitches or rows' } }}
                />

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={{ xs: 0, sm: 0.5 }}
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  lineHeight={1}
                >
                  <Typography
                    fontWeight={countMode === 'rows' ? 600 : 400}
                    fontSize={{ xs: '0.8rem', sm: '1rem' }}
                  >
                    Rows
                  </Typography>

                  <Typography sx={{ display: { xs: 'none', sm: 'block' } }} fontSize="inherit">
                    /
                  </Typography>

                  <Typography
                    fontWeight={countMode === 'stitches' ? 600 : 400}
                    fontSize={{ xs: '0.8rem', sm: '1rem' }}
                  >
                    Stitches
                  </Typography>
                </Stack>
              </Stack>
            </Heatmap>
            <FullscreenDataGrid height={350}>
              <DataGrid
                rows={projectRecords}
                columns={columns}
                getRowId={(row) => row.id}
                showToolbar
                slots={{ toolbar: HistoryToolbar }}
              />
            </FullscreenDataGrid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
      <ConfirmationDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Progress Record?"
        message="Are you sure you want to delete this progress entry? This action cannot be undone."
        confirmText="Delete"
        confirmColor="error"
      />
    </>
  )
}

export default ProjectInfoDialog
