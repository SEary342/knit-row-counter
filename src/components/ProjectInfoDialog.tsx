import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useMemo, useState } from 'react'
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

function HistoryToolbar(props: GridToolbarProps) {
  // GridToolbarContainer is deprecated, using Box instead.
  return (
    <Box
      sx={{ display: 'flex', p: 1, px: 2, justifyContent: 'space-between', alignItems: 'center' }}
    >
      <Typography variant="h6">Progress History</Typography>
      {props.FullscreenToggleButton}
    </Box>
  )
}

interface ProjectInfoDialogProps {
  project: Project
  open: boolean
  onClose: () => void
}

const ProjectInfoDialog = ({ project, open, onClose }: ProjectInfoDialogProps) => {
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { records } = useAppSelector((s) => s.progress)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null)

  const projectRecords = useMemo(
    () => records.filter((r) => r.projectId === project.id),
    [records, project.id],
  )

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

  const columns: GridColDef[] = [
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

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth fullScreen={isMobile}>
        <DialogTitle>Project History & Info</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FullscreenDataGrid height={400}>
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
