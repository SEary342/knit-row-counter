import { useState, cloneElement, type ReactElement, Fragment } from 'react'
import { Box, Dialog, IconButton, Tooltip, useMediaQuery, useTheme } from '@mui/material'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit'
import type { DataGridProps } from '@mui/x-data-grid'

interface FullscreenDataGridProps {
  children: ReactElement<DataGridProps>
  height: number | string
}

const FullscreenDataGrid = ({ children, height }: FullscreenDataGridProps) => {
  const [fullscreen, setFullscreen] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const handleToggleFullscreen = () => {
    setFullscreen((prev) => !prev)
  }

  const FullscreenToggleButton = isMobile ? (
    <Tooltip title="Toggle Fullscreen">
      <IconButton onClick={handleToggleFullscreen} aria-label="toggle fullscreen">
        {fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
      </IconButton>
    </Tooltip>
  ) : null

  const dataGridWithToolbar = cloneElement(children, {
    ...children.props,
    slots: {
      ...children.props.slots,
    },
    slotProps: {
      ...children.props.slotProps,
      toolbar: {
        ...children.props.slotProps?.toolbar,
        FullscreenToggleButton,
      },
    },
  })

  return (
    <Fragment>
      <Box sx={{ height, width: '100%', display: fullscreen ? 'none' : 'block' }}>
        {dataGridWithToolbar}
      </Box>
      {fullscreen && (
        <Dialog fullScreen open={fullscreen} onClose={() => setFullscreen(false)}>
          {dataGridWithToolbar}
        </Dialog>
      )}
    </Fragment>
  )
}

export default FullscreenDataGrid
