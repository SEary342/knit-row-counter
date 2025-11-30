import React from 'react'
import {
  AppBar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import HomeIcon from '@mui/icons-material/Home' // Projects
import FileUploadIcon from '@mui/icons-material/FileUpload' // Import
import FileDownloadIcon from '@mui/icons-material/FileDownload' // Export
import { Link as RouterLink } from 'react-router-dom'
import { SnackbarProvider, useSnackbar } from 'notistack'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { importProjects } from '../features/projects/projectsSlice'

const drawerWidth = 260

function AppLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const dispatch = useAppDispatch()
  const projects = useAppSelector((state) => state.projects.projects)
  const importInputRef = React.useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const dataStr = JSON.stringify(projects, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `knit-row-counter-export-${new Date().toISOString()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    setOpen(false)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string)
        dispatch(importProjects(imported))
        enqueueSnackbar('Projects imported successfully.', { variant: 'success' })
      } catch (error) {
        console.error('Failed to parse import file:', error)
        enqueueSnackbar('Error: Could not import file. Please ensure it is a valid JSON export.', {
          variant: 'error',
        })
      }
    }
    reader.readAsText(file)
    setOpen(false)
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setOpen((s) => !s)}
            sx={{ mr: 2 }}
            aria-label="open navigation"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Knit Row Counter
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={open}
        onClose={() => setOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Toolbar />
          <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
            <List>
              <ListItem disablePadding>
                <ListItemButton component={RouterLink} to="/" onClick={() => setOpen(false)}>
                  <ListItemIcon>
                    <HomeIcon />
                  </ListItemIcon>
                  <ListItemText primary="Projects" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    importInputRef.current?.click()
                  }}
                >
                  <ListItemIcon>
                    <FileUploadIcon />
                  </ListItemIcon>
                  <ListItemText primary="Import" />
                  <input
                    type="file"
                    ref={importInputRef}
                    hidden
                    accept=".json"
                    onChange={handleImport}
                  />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton onClick={handleExport}>
                  <ListItemIcon>
                    <FileDownloadIcon />
                  </ListItemIcon>
                  <ListItemText primary="Export" />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Version: {import.meta.env.APP_VERSION}
            </Typography>
          </Box>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  )
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SnackbarProvider maxSnack={3}>
      <AppLayout>{children}</AppLayout>
    </SnackbarProvider>
  )
}
