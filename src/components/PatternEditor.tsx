import { useState, useEffect, type Dispatch, type SetStateAction, useRef, Fragment } from 'react'
import {
  DataGrid,
  type GridColDef,
  type GridRowId,
  GridActionsCellItem,
  type GridRowModel,
  type GridRowModesModel,
  GridRowModes,
  type GridEventListener,
  type GridToolbarProps,
  GridRowEditStopReasons,
} from '@mui/x-data-grid'
import {
  Box,
  Button,
  Dialog,
  IconButton,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Close'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit'
import { nanoid } from 'nanoid'
import type { PatternRowConfig } from '../features/projects/types'

interface PatternRow {
  id: GridRowId
  instruction: string
  stitches: number | null
  isNew?: boolean
}

interface PatternEditorProps {
  value: PatternRowConfig[]
  onChange: (newValue: PatternRowConfig[]) => void
}

declare module '@mui/x-data-grid' {
  interface GridToolbarProps {
    setRows: Dispatch<SetStateAction<PatternRow[]>>
    setRowModesModel: Dispatch<SetStateAction<GridRowModesModel>>
  }
}

interface EditToolbarProps extends GridToolbarProps {}

function EditToolbar(props: EditToolbarProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { setRows, setRowModesModel } = props

  const handleClick = () => {
    const id = nanoid()
    setRows((oldRows) => [...oldRows, { id, instruction: '', stitches: null, isNew: true }])
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'instruction' },
    }))
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 1,
        px: 2,
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h6">Pattern</Typography>
      </Box>

      <Button color="primary" startIcon={<AddIcon />} onClick={handleClick} size="small">
        Add row
      </Button>

      {isMobile && (
        <Tooltip title="Toggle Fullscreen">
          <IconButton
            onClick={() => (props as any).onToggleFullscreen()}
            aria-label="toggle fullscreen"
          >
            {(props as any).fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
        </Tooltip>
      )}
    </Box>
  )
}

const PatternEditor = ({ value, onChange }: PatternEditorProps) => {
  const [rows, setRows] = useState<PatternRow[]>([])
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({})
  const [fullscreen, setFullscreen] = useState(false)
  const isInternalUpdate = useRef(false)

  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false
      return
    }
    const syncedRows = value.map((row) => ({ id: nanoid(), ...row }))
    setRows(syncedRows)
  }, [value])

  const updateExternalState = (updatedRows: PatternRow[]) => {
    isInternalUpdate.current = true
    onChange(updatedRows.map(({ instruction, stitches }) => ({ instruction, stitches })))
  }

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true
    }
  }

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel((prevModel) => ({
      ...prevModel,
      [id]: { mode: GridRowModes.Edit },
    }))
  }

  const handleSaveClick = (id: GridRowId) => () => {
    setRowModesModel((prevModel) => ({
      ...prevModel,
      [id]: { mode: GridRowModes.View },
    }))
  }

  const handleDeleteClick = (id: GridRowId) => () => {
    setRows((oldRows) => {
      const newRows = oldRows.filter((row) => row.id !== id)
      updateExternalState(newRows)
      return newRows
    })
  }

  const handleCopyClick = (id: GridRowId) => () => {
    setRows((oldRows) => {
      const index = oldRows.findIndex((row) => row.id === id)
      if (index === -1) return oldRows

      const newId = nanoid()
      const newRow = { ...oldRows[index], id: newId }

      const newRows = [...oldRows.slice(0, index + 1), newRow, ...oldRows.slice(index + 1)]
      updateExternalState(newRows)
      return newRows
    })
  }

  const handleMoveRow = (id: GridRowId, direction: 'up' | 'down') => () => {
    setRows((oldRows) => {
      const rowIndex = oldRows.findIndex((row) => row.id === id)
      if (rowIndex === -1) return oldRows

      const newIndex = direction === 'up' ? rowIndex - 1 : rowIndex + 1
      if (newIndex < 0 || newIndex >= oldRows.length) return oldRows

      const newRows = [...oldRows]
      const [movedRow] = newRows.splice(rowIndex, 1)
      newRows.splice(newIndex, 0, movedRow)

      updateExternalState(newRows)
      return newRows
    })
  }

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel((prevModel) => ({
      ...prevModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    }))

    setRows((prevRows) => {
      const editedRow = prevRows.find((row) => row.id === id)
      if (editedRow?.isNew) {
        const newRows = prevRows.filter((row) => row.id !== id)
        updateExternalState(newRows)
        return newRows
      }
      return prevRows
    })
  }

  const processRowUpdate = (newRow: GridRowModel, _oldRow: GridRowModel): Promise<PatternRow> => {
    const updatedRow = { ...(newRow as PatternRow), isNew: false }
    const newRows = rows.map((row) => (row.id === updatedRow.id ? updatedRow : row))
    setRows(newRows)
    updateExternalState(newRows)
    return Promise.resolve(updatedRow)
  }

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel): void => {
    setRowModesModel(newRowModesModel)
  }

  const columns: GridColDef<PatternRow>[] = [
    {
      field: 'rowNumber',
      headerName: '#',
      width: 10,
      renderCell: (params) => params.api.getRowIndexRelativeToVisibleRows(params.id) + 1,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      align: 'center',
    },
    {
      field: 'instruction',
      headerName: 'Instruction',
      flex: 1,
      editable: true,
    },
    {
      field: 'stitches',
      headerName: 'Stitches',
      type: 'number',
      flex: 0.5,
      editable: true,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 90,
      cellClassName: 'actions',
      getActions: (params) => {
        const { id } = params
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              key="save"
              icon={<SaveIcon />}
              label="Save"
              onClick={handleSaveClick(id)}
              color="primary"
              size="small"
            />,
            <GridActionsCellItem
              key="cancel"
              icon={<CancelIcon />}
              label="Cancel"
              onClick={handleCancelClick(id)}
              color="inherit"
              size="small"
            />,
          ]
        }

        const rowIndex = rows.findIndex((row) => row.id === id)

        return [
          <GridActionsCellItem
            key="up"
            icon={<ArrowUpwardIcon />}
            label="Move Up"
            onClick={handleMoveRow(id, 'up')}
            disabled={rowIndex === 0}
            color="inherit"
            size="small"
          />,
          <GridActionsCellItem
            key="down"
            icon={<ArrowDownwardIcon />}
            label="Move Down"
            onClick={handleMoveRow(id, 'down')}
            disabled={rowIndex === rows.length - 1}
            color="inherit"
            size="small"
          />,
          <GridActionsCellItem
            key="edit"
            icon={<EditIcon />}
            label="Edit"
            onClick={handleEditClick(id)}
            color="inherit"
            size="small"
          />,
          <GridActionsCellItem
            key="copy"
            icon={<ContentCopyIcon />}
            label="Copy"
            onClick={handleCopyClick(id)}
            color="inherit"
            size="small"
          />,
          <GridActionsCellItem
            key="delete"
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
            size="small"
          />,
        ]
      },
    },
  ]

  const DataGridComponent = (
    <DataGrid<PatternRow>
      rows={rows}
      columns={columns}
      editMode="row"
      rowModesModel={rowModesModel}
      onRowModesModelChange={handleRowModesModelChange}
      onRowEditStop={handleRowEditStop}
      processRowUpdate={processRowUpdate}
      showToolbar
      slots={{
        toolbar: EditToolbar,
      }}
      slotProps={{
        toolbar: {
          setRows,
          setRowModesModel,
          fullscreen,
          onToggleFullscreen: () => setFullscreen((prev) => !prev),
        } as GridToolbarProps,
      }}
      getRowHeight={() => 'auto'}
      sx={{
        '& .MuiDataGrid-actionsCell': {
          flexWrap: 'wrap',
        },
      }}
      hideFooter
    />
  )

  return (
    <Fragment>
      <Box sx={{ height: 300, width: '100%', display: fullscreen ? 'none' : 'block' }}>
        {DataGridComponent}
      </Box>
      {fullscreen && (
        <Dialog fullScreen open={fullscreen} onClose={() => setFullscreen(false)}>
          {DataGridComponent}
        </Dialog>
      )}
    </Fragment>
  )
}

export default PatternEditor
