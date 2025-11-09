import SettingsIcon from '@mui/icons-material/Settings'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

import type { SectionConfig } from '../features/projects/types'
import { addSection, updateSection } from '../features/projects/projectsSlice'

import LinkSwitch from './LinkSwitch'

interface SectionDialogProps {
  section?: SectionConfig
}

const SectionDialog = ({ section }: SectionDialogProps) => {
  const dispatch = useDispatch()
  const [open, setOpen] = useState(false)
  const [formState, setFormState] = useState({
    name: '',
    repeatRows: 0,
  })

  useEffect(() => {
    if (section) {
      setFormState({
        name: section.name || '',
        repeatRows: section.repeatRows || 1,
      })
    } else {
      setFormState({ name: '', repeatRows: 1 })
    }
  }, [section, open])

  // React 19 <form> submission
  const handleSave = async (formData: FormData) => {
    const name = String(formData.get('name') ?? '')
    const repeatRows = Number(formData.get('repeatRows') ?? 0)
    dispatch(
      section?.id
        ? updateSection({
            sectionId: section.id,
            updates: { name, repeatRows },
          })
        : addSection({ section: { name, repeatRows } }),
    )
    handleClose()
  }

  const handleClose = () => setOpen(false)

  return (
    <Box justifyContent="space-between" flex={1} display="flex" paddingX={2}>
      <Tooltip title="Link/Unlink From Global Counter">
        <LinkSwitch />
      </Tooltip>
      <Tooltip title="Section Settings">
        <IconButton size="small" onClick={() => setOpen(true)}>
          <SettingsIcon />
        </IconButton>
      </Tooltip>
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>{section ? 'Edit Section' : 'Create Section'}</DialogTitle>

        <form action={handleSave}>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Section Name"
                name="name"
                defaultValue={formState.name}
                required
                fullWidth
                autoFocus
              />
              <TextField
                label="Repeat Rows"
                name="repeatRows"
                type="number"
                slotProps={{ htmlInput: { min: 0 } }}
                defaultValue={formState.repeatRows}
                fullWidth
              />
            </Stack>
          </DialogContent>

          <DialogActions>
            <Box display="flex" flex={1} justifyContent="space-between">
              <Button onClick={handleClose}>Cancel</Button>
              <Button type="submit">Save</Button>
            </Box>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}

export default SectionDialog
