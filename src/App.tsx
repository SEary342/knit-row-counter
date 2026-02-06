import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { useAppSelector } from './app/hooks'
import Layout from './components/Layout'
import ProjectPickerView from './pages/ProjectPickerView'
import ProjectView from './pages/ProjectView'

export default function App() {
  const darkMode = useAppSelector((s) => s?.ui?.darkMode ?? true)

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
        },
      }),
    [darkMode],
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout>
        <Routes>
          <Route path="/" element={<ProjectPickerView />} />
          <Route path="/project/:id" element={<ProjectView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </ThemeProvider>
  )
}
