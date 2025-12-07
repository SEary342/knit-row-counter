import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Stack,
  Paper,
  IconButton,
  TextField,
  Button,
  Grid,
  Alert,
  Tooltip,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import { useSnackbar } from 'notistack'
import Add from '@mui/icons-material/Add'

import { useAppSelector, useAppDispatch } from '../app/hooks'
import {
  updateNotes,
  updatePatternUrl,
  renameProject,
  importProjects,
} from '../features/projects/projectsSlice'
import SectionCard from '../components/SectionCard'
import GlobalCard from '../components/GlobalCard'
import SectionDialog from '../components/SectionDialog'
import { getTodayStats } from '../utils/stats'

const ProjectView = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { enqueueSnackbar } = useSnackbar()
  const project = useAppSelector((s) => s.projects.projects.find((p) => p.id === id))
  const progressRecords = useAppSelector((s) => s.progress.records)

  const [addSectionOpen, setAddSectionOpen] = React.useState(false)
  const importInputRef = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => {
    if (!project) {
      // if no project found, navigate back home
      navigate('/')
    }
  }, [project, navigate])

  if (!project) return null

  const { rowsToday, stitchesToday, rowsPerHour, stitchesPerHour } = getTodayStats(
    project.id,
    progressRecords,
  )

  const hasProgress = rowsToday > 0 || stitchesToday > 0

  // Check if any section is linked to force a visual-only sort
  const isSortForced = project.sections.some((s) => s.linked)

  // Create a new array for display, sorting linked sections to the front
  const displayedSections = isSortForced
    ? [...project.sections].sort((a, b) => {
        if (a.linked && !b.linked) return -1
        if (!a.linked && b.linked) return 1
        return 0 // Maintain original order for items of same linked status
      })
    : project.sections
  const handleExport = () => {
    const safeName = project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    const dataStr = JSON.stringify(project, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `knit-proj-${safeName}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string)
        if (imported.id !== project.id) {
          enqueueSnackbar(
            `Import failed: The project file you selected does not match the current project "${project.name}".`,
            { variant: 'error' },
          )
          return
        }

        dispatch(importProjects(imported))
        enqueueSnackbar(`Project "${imported.name}" has been imported.`, { variant: 'success' })
      } catch (error) {
        console.error('Failed to parse import file:', error)
        enqueueSnackbar('Error: Could not import file. Please ensure it is a valid JSON export.', {
          variant: 'error',
        })
      }
    }
    reader.readAsText(file)
  }

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

      {hasProgress && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Today's Progress</Typography>
          <Typography variant="body2" component="div">
            - Rows: {rowsToday}
            {stitchesToday !== 0 && ` | Stitches: ${stitchesToday}`}
          </Typography>
          <Typography variant="body2" component="div">
            - Speed: {rowsPerHour.toFixed(1)} rows/hr
            {stitchesPerHour !== 0 && ` | ${stitchesPerHour.toFixed(1)} stitches/hr`}
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <GlobalCard project={project} displaySize="large" />
        </Grid>
        {displayedSections.map((section) => (
          <Grid
            key={section.id}
            size={{
              xs: 6,
              sm: 4,
              md: 3,
            }}
          >
            <SectionCard section={section} displaySize="small" isSortForced={isSortForced} />
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 2, mt: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
            <Button
              variant="outlined"
              onClick={() => {
                const newName = prompt('Rename project', project.name)
                if (newName) dispatch(renameProject({ id: project.id, name: newName }))
              }}
            >
              Rename
            </Button>
            <Tooltip title="Import Project">
              <IconButton onClick={() => importInputRef.current?.click()}>
                <FileUploadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export Project">
              <IconButton onClick={handleExport}>
                <FileDownloadIcon />
              </IconButton>
            </Tooltip>
            <input
              type="file"
              ref={importInputRef}
              hidden
              accept=".json"
              onChange={handleImport}
              // Allow re-importing the same file
              onClick={(e) => ((e.target as HTMLInputElement).value = '')}
            />
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
