import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material'
import { useState } from 'react'
import { useDispatch } from 'react-redux'

import type { Project } from '../features/projects/types'
import { resetProjectProgress, setTotalRows } from '../features/projects/projectsSlice'

import ConfirmationDialog from './ConfirmationDialog'

interface GlobalDialogProps {
  project: Project
  calculatedTotalRows?: number
  open: boolean
  onClose: () => void
  trigger?: React.ReactNode
}

const GlobalDialog = ({
  project,
  calculatedTotalRows,
  open,
  onClose,
  trigger,
}: GlobalDialogProps) => {
  const dispatch = useDispatch()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleSave = async (formData: FormData) => {
    const totalRows = Number(formData.get('totalRows') ?? 0)
    dispatch(setTotalRows(totalRows > 0 ? totalRows : null))
    onClose()
  }

  const handleReset = () => {
    dispatch(resetProjectProgress())
    // Close both dialogs
    setConfirmOpen(false)
    onClose()
  }

  return (
    <Box justifyContent="space-between" flex={1} display="flex" paddingX={2}>
      <div />
      {trigger}
      <Dialog open={open} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Global Settings</DialogTitle>
        <form action={handleSave}>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Total Rows"
                name="totalRows"
                type="number"
                slotProps={{ htmlInput: { min: 0 } }}
                defaultValue={project.totalRows ?? ''}
                placeholder={
                  calculatedTotalRows && calculatedTotalRows > 0
                    ? String(calculatedTotalRows)
                    : undefined
                }
                fullWidth
                autoFocus
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Box display="flex" flex={1} justifyContent="space-between">
              <Button onClick={() => setConfirmOpen(true)} color="error">
                Reset Project
              </Button>
              <Box>
                <Button onClick={onClose}>Cancel</Button>
                <Button type="submit">Save</Button>
              </Box>
            </Box>
          </DialogActions>
        </form>
        <ConfirmationDialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleReset}
          title="Reset Project Progress?"
          message="Are you sure you want to reset all row and repeat counts for this project? This action cannot be undone."
          confirmText="Reset"
          confirmColor="error"
        />
      </Dialog>
    </Box>
  )
}

export default GlobalDialog
