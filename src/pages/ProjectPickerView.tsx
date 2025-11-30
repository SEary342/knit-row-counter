import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  TextField,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ListItemButton,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'

import { useAppDispatch, useAppSelector } from '../app/hooks'
import { createProject, deleteProject, selectProject } from '../features/projects/projectsSlice'

export default function ProjectPickerView() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const projects = useAppSelector((s) => s.projects.projects)
  const currentId = useAppSelector((s) => s.projects.currentProjectId)
  const [openNew, setOpenNew] = React.useState(false)
  const [name, setName] = React.useState('')

  const handleCreate = () => {
    if (!name.trim()) return
    dispatch(createProject({ name: name.trim() }))
    setName('')
    setOpenNew(false)

    // Navigate to last project after a tiny delay (works for skeleton)
    setTimeout(() => {
      const last = projects[projects.length - 1] // only this is used
      if (last) navigate(`/project/${last.id}`)
    }, 50)
  }

  const handleSelect = (id: string) => {
    dispatch(selectProject(id))
    navigate(`/project/${id}`)
  }

  const handleDelete = (id: string) => {
    if (!confirm('Delete this project?')) return
    dispatch(deleteProject(id))
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Projects</Typography>
        <Button variant="contained" onClick={() => setOpenNew(true)}>
          New Project
        </Button>
      </Stack>

      <List>
        {projects.length === 0 && (
          <Typography color="text.secondary">No projects yet — create one!</Typography>
        )}
        {projects.map((p) => (
          <ListItem
            key={p.id}
            secondaryAction={
              <IconButton edge="end" onClick={() => handleDelete(p.id)} aria-label="delete">
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemButton selected={p.id === currentId} onClick={() => handleSelect(p.id)}>
              <ListItemText primary={p.name} secondary={getSecondaryText(p)} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Dialog open={openNew} onClose={() => setOpenNew(false)}>
        <DialogTitle>New Project</DialogTitle>
        <DialogContent>
          <TextField
            value={name}
            onChange={(e) => setName(e.target.value)}
            label="Project name"
            fullWidth
            autoFocus
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNew(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

import type { Project } from '../features/projects/types'

const getSecondaryText = (project: Project) => {
  const calculatedTotalRows = project.sections.reduce((total, section) => {
    if (section.totalRepeats && section.repeatRows) {
      return total + section.totalRepeats * section.repeatRows
    }
    return total
  }, 0)

  const maxRows = project.totalRows ?? (calculatedTotalRows > 0 ? calculatedTotalRows : null)

  if (maxRows && maxRows > 0) {
    const percent = Math.min(100, Math.round((project.currentRow / maxRows) * 100))
    return `${percent}% complete (${project.currentRow.toLocaleString()} / ${maxRows.toLocaleString()} rows)`
  }

  return `Current row: ${project.currentRow.toLocaleString()}`
}
