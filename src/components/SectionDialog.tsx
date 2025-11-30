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
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useAppDispatch } from '../app/hooks'

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
import { type PatternRowConfig } from '../features/projects/types'

interface SectionDialogProps {
  section?: SectionConfig
  open: boolean
  onClose: () => void
  trigger?: React.ReactNode
}

interface FormStateConfig {
  name: string
  repeatRows: number | null
  totalRepeats: number | null
  stitchCount: number | null
}

const SectionDialog = ({ section, open, onClose, trigger }: SectionDialogProps) => {
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [formState, setFormState] = useState<FormStateConfig>({
    name: '',
    repeatRows: null,
    totalRepeats: null,
    stitchCount: null,
  })
  const [pattern, setPattern] = useState<PatternRowConfig[]>([])

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    if (section) {
      setFormState({
        name: section.name || '',
        repeatRows: section.repeatRows || null,
        totalRepeats: section.totalRepeats || null,
        stitchCount: section.stitchCount || null,
      })
      setPattern(section.pattern || [])
    } else {
      setFormState({ name: '', repeatRows: null, totalRepeats: null, stitchCount: null })
      setPattern([])
    }
  }, [section, open])

  useEffect(() => {
    setFormState((prev) => ({ ...prev, repeatRows: pattern.length || null }))
  }, [pattern])

  const averageStitches =
    pattern.length > 0
      ? Math.round(
          pattern.reduce((acc, row) => acc + (row.stitches ?? 0), 0) /
            pattern.filter((row) => row.stitches != null).length,
        ) || ''
      : ''
  // React 19 <form> submission
  const getNumericValue = (value: FormDataEntryValue | null) =>
    value === '' || value === null ? null : Number(value)

  const handleSave = async (formData: FormData) => {
    const name = String(formData.get('name') ?? '')
    const repeatRows = getNumericValue(formData.get('repeatRows'))
    const totalRepeats = getNumericValue(formData.get('totalRepeats'))
    const stitchCount = getNumericValue(formData.get('stitchCount'))

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
      <Dialog open={open} maxWidth="xs" fullWidth fullScreen={isMobile}>
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
                slotProps={{
                  htmlInput: {
                    min: 0,
                    step: 1,
                  },
                }}
                value={formState.repeatRows ?? ''}
                onChange={handleFormChange}
                fullWidth
              />
              <TextField
                label="Stitches per Row"
                name="stitchCount"
                type="number"
                slotProps={{
                  htmlInput: {
                    min: 0,
                    step: 1,
                  },
                }}
                value={formState.stitchCount ?? ''}
                placeholder={String(averageStitches)}
                onChange={handleFormChange}
                fullWidth
              />
              <TextField
                label="Total Repeats"
                name="totalRepeats"
                type="number"
                slotProps={{
                  htmlInput: {
                    min: 0,
                    step: 1,
                  },
                }}
                value={formState.totalRepeats ?? ''}
                onChange={handleFormChange}
                fullWidth
              />
              <PatternEditor value={pattern} onChange={setPattern} />
            </Stack>
          </DialogContent>

          <DialogActions>
            <Box display="flex" flex={1} justifyContent="space-between" sx={{ px: 2 }}>
              {section && (
                <Button onClick={() => setConfirmOpen(true)} color="error">
                  Delete
                </Button>
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
