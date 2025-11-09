import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Typography, Stack, Paper, IconButton, TextField, Button } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

import { useAppSelector, useAppDispatch } from '../app/hooks'
import { updateNotes, updatePatternUrl, renameProject } from '../features/projects/projectsSlice'
import SectionCard from '../components/SectionCard'
import GlobalCard from '../components/GlobalCard'

const ProjectView = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const project = useAppSelector((s) => s.projects.projects.find((p) => p.id === id))

  React.useEffect(() => {
    if (!project) {
      // if no project found, navigate back home
      navigate('/')
    }
  }, [project, navigate])

  if (!project) return null

  const section = project.sections?.[0]

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <IconButton onClick={() => navigate(-1)} aria-label="back">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5">{project.name}</Typography>
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        <GlobalCard project={project} />
        <SectionCard section={section} />
      </Stack>

      <Paper sx={{ p: 2, mt: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Button
              variant="outlined"
              onClick={() => {
                const newName = prompt('Rename project', project.name)
                if (newName) dispatch(renameProject({ id: project.id, name: newName }))
              }}
            >
              Rename
            </Button>
          </Stack>

          <TextField
            label="Pattern URL"
            value={project.patternUrl ?? ''}
            onChange={(e) => dispatch(updatePatternUrl(e.target.value))}
            fullWidth
          />

          <TextField
            label="Notes"
            value={project.notes ?? ''}
            onChange={(e) => dispatch(updateNotes(e.target.value))}
            fullWidth
            multiline
            minRows={3}
          />
        </Stack>
      </Paper>
    </Box>
  )
}

export default ProjectView
