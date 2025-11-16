import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Typography, Stack, Paper, IconButton, TextField, Button, Grid } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Add from '@mui/icons-material/Add'

import { useAppSelector, useAppDispatch } from '../app/hooks'
import { updateNotes, updatePatternUrl, renameProject } from '../features/projects/projectsSlice'
import SectionCard from '../components/SectionCard'
import GlobalCard from '../components/GlobalCard'
import SectionDialog from '../components/SectionDialog'

const ProjectView = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const project = useAppSelector((s) => s.projects.projects.find((p) => p.id === id))

  const [addSectionOpen, setAddSectionOpen] = React.useState(false)
  React.useEffect(() => {
    if (!project) {
      // if no project found, navigate back home
      navigate('/')
    }
  }, [project, navigate])

  if (!project) return null

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} mb={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton onClick={() => navigate(-1)} aria-label="back">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5">{project.name}</Typography>
        </Stack>
        <Button startIcon={<Add />} onClick={() => setAddSectionOpen(true)}>
          Section
        </Button>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <GlobalCard project={project} displaySize="medium" />
        </Grid>
        {project.sections.map((section) => (
          <Grid
            key={section.id}
            size={{
              xs: section.linked ? 12 : 6,
              sm: section.linked ? 6 : 4,
              md: section.linked ? 4 : 3,
            }}
          >
            <SectionCard section={section} displaySize={section.linked ? 'medium' : 'small'} />
          </Grid>
        ))}
      </Grid>

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

      <SectionDialog open={addSectionOpen} onClose={() => setAddSectionOpen(false)} />
    </Box>
  )
}

export default ProjectView
