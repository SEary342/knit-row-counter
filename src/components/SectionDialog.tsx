import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

import type { SectionConfig } from '../features/projects/types'
import { addSection, setLinked, updateSection } from '../features/projects/projectsSlice'

import LinkSwitch from './LinkSwitch'

interface SectionDialogProps {
  section?: SectionConfig
  open: boolean
  onClose: () => void
  trigger?: React.ReactNode
}

const SectionDialog = ({ section, open, onClose, trigger }: SectionDialogProps) => {
  const dispatch = useDispatch()
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
    onClose()
  }

  const handleLinkClick = () => {
    if (section) dispatch(setLinked({ id: section.id, status: !section.linked }))
  }

  return (
    <Box justifyContent="space-between" flex={1} display="flex" paddingX={2}>
      {section && (
        <>
          <Tooltip title="Link/Unlink From Global Counter">
            <LinkSwitch onClick={handleLinkClick} checked={section.linked ?? true} />
          </Tooltip>
        </>
      )}
      {trigger}
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
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
              <Button onClick={onClose}>Cancel</Button>
              <Button type="submit">Save</Button>
            </Box>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}

export default SectionDialog
