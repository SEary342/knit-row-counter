import React from 'react'
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'

interface NewProjectDialogProps {
  open: boolean
  onClose: () => void
  onCreate: (name: string) => void
}

export default function NewProjectDialog({ open, onClose, onCreate }: NewProjectDialogProps) {
  const [name, setName] = React.useState('')

  const handleCreate = () => {
    const trimmedName = name.trim()
    if (!trimmedName) return
    onCreate(trimmedName)
    setName('')
  }

  const handleClose = () => {
    setName('')
    onClose()
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleCreate()
    }
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>New Project</DialogTitle>
      <DialogContent>
        <TextField
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          label="Project name"
          fullWidth
          autoFocus
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleCreate} variant="contained" disabled={!name.trim()}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  )
}
