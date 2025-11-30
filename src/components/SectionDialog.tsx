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
import {
  addSection,
  deleteSection,
  setLinked,
  updateSection,
} from '../features/projects/projectsSlice'

import LinkSwitch from './LinkSwitch'
import ConfirmationDialog from './ConfirmationDialog'
import PatternEditor from './PatternEditor'

interface SectionDialogProps {
  section?: SectionConfig
  open: boolean
  onClose: () => void
  trigger?: React.ReactNode
}

const SectionDialog = ({ section, open, onClose, trigger }: SectionDialogProps) => {
  const dispatch = useDispatch()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [formState, setFormState] = useState({
    name: '',
    repeatRows: 0,
    totalRepeats: 0,
    stitchCount: 0,
  })
  const [pattern, setPattern] = useState<string[]>([])

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    if (section) {
      setFormState({
        name: section.name || '',
        repeatRows: section.repeatRows || 1,
        totalRepeats: section.totalRepeats || 0,
        stitchCount: section.stitchCount || 0,
      })
      setPattern(section.pattern || [])
    } else {
      setFormState({ name: '', repeatRows: 1, totalRepeats: 0, stitchCount: 0 })
      setPattern([])
    }
  }, [section, open])

  useEffect(() => {
    setFormState((prev) => ({ ...prev, repeatRows: pattern.length || 1 }))
  }, [pattern])

  // React 19 <form> submission
  const handleSave = async (formData: FormData) => {
    const name = String(formData.get('name') ?? '')
    const repeatRows = Number(formData.get('repeatRows') ?? 0)
    const totalRepeats = Number(formData.get('totalRepeats') ?? 0)
    const stitchCount = Number(formData.get('stitchCount') ?? 0)

    dispatch(
      section?.id
        ? updateSection({
            sectionId: section.id,
            updates: { name, repeatRows, totalRepeats, pattern, stitchCount },
          })
        : addSection({ section: { name, repeatRows, totalRepeats, pattern, stitchCount } }),
    )
    onClose()
  }

  const handleLinkClick = () => {
    if (section) dispatch(setLinked({ id: section.id, status: !section.linked }))
  }

  const handleDelete = () => {
    if (!section) return
    dispatch(deleteSection(section.id))
    setConfirmOpen(false)
    onClose()
  }

  return (
    <Box justifyContent="space-between" flex={1} display="flex" paddingX={2}>
      {section && (
        <>
          <Tooltip title="Link/Unlink From Global Counter">
            <LinkSwitch onClick={handleLinkClick} checked={section.linked ?? false} />
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
                value={formState.name}
                onChange={handleFormChange}
                required
                fullWidth
                autoFocus
              />
              <TextField
                label="Repeat Rows"
                name="repeatRows"
                type="number"
                inputProps={{ min: 0 }}
                value={formState.repeatRows}
                onChange={handleFormChange}
                fullWidth
              />
              <TextField
                label="Stitches per Row"
                name="stitchCount"
                type="number"
                inputProps={{ min: 0 }}
                value={formState.stitchCount}
                onChange={handleFormChange}
                fullWidth
              />
              <TextField
                label="Total Repeats"
                name="totalRepeats"
                type="number"
                inputProps={{ min: 0 }}
                value={formState.totalRepeats}
                onChange={handleFormChange}
                fullWidth
              />
              <PatternEditor value={pattern} onChange={setPattern} />
            </Stack>
          </DialogContent>

          <DialogActions>
            <Box display="flex" flex={1} justifyContent="space-between">
              {section ? (
                <Button onClick={() => setConfirmOpen(true)} color="error">
                  Delete
                </Button>
              ) : (
                <div />
              )}
              <Button onClick={onClose}>Cancel</Button>
              <Button type="submit">Save</Button>
            </Box>
          </DialogActions>
        </form>
        {section && (
          <ConfirmationDialog
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            onConfirm={handleDelete}
            title="Delete Section?"
            message={`Are you sure you want to delete the "${section.name}" section? This action cannot be undone.`}
            confirmText="Delete"
            confirmColor="error"
          />
        )}
      </Dialog>
    </Box>
  )
}

export default SectionDialog
