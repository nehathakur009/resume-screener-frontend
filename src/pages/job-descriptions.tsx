import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box, Button, Chip, Dialog, DialogContent, DialogTitle,
  IconButton, InputAdornment, Paper, Stack, TextField,
  Tooltip, Typography,
} from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import WorkOutlineIcon from '@mui/icons-material/WorkOutline'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'

import { AppDispatch, RootState } from '../store'
import { fetchAllJDs } from '../store/apps/scoring'
import { JobDescription } from '../types'
import AddJDDialog from '../components/AddJDDialog'

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function JobDescriptionsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const [addJDOpen, setAddJDOpen] = useState(false)
  const [search, setSearch]       = useState('')
  const [viewJD, setViewJD]       = useState<JobDescription | null>(null)
  const { jdList } = useSelector((s: RootState) => s.scoring)

  useEffect(() => { dispatch(fetchAllJDs()) }, [dispatch])

  const filtered = jdList.filter((jd) => {
    const q = search.toLowerCase()
    return jd.title.toLowerCase().includes(q) || jd.description.toLowerCase().includes(q)
  })

  const handleJDSaved = (_jd: JobDescription) => {
    setAddJDOpen(false)
  }

  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'Title',
      flex: 1,
      minWidth: 200,
      renderCell: (p: GridRenderCellParams<JobDescription>) => (
        <Typography variant="body2" fontWeight={600}>{p.value}</Typography>
      ),
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2,
      minWidth: 300,
      sortable: false,
      renderCell: (p: GridRenderCellParams<JobDescription>) => (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
            whiteSpace: 'normal',
            lineHeight: 1.55,
          }}
        >
          {p.value}
        </Typography>
      ),
    },
    {
      field: 'created_at',
      headerName: 'Created',
      width: 150,
      renderCell: (p: GridRenderCellParams) => (
        <Chip
          icon={<CalendarTodayOutlinedIcon sx={{ fontSize: '11px !important' }} />}
          label={fmtDate(p.value)}
          size="small"
          variant="outlined"
          sx={{ fontSize: '0.7rem' }}
        />
      ),
    },
    {
      field: 'actions',
      headerName: '',
      width: 64,
      sortable: false,
      renderCell: (p: GridRenderCellParams<JobDescription>) => (
        <Tooltip title="View full description">
          <IconButton
            size="small"
            color="primary"
            onClick={(e) => { e.stopPropagation(); setViewJD(p.row) }}
          >
            <VisibilityOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ]

  return (
    <Box sx={{ py: 4, px: 4, pb: 8 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" sx={{ mb: 4 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={800} letterSpacing={-0.5}>Job Descriptions</Typography>
          <Typography variant="body2" color="text.secondary">
            {jdList.length} job description{jdList.length !== 1 ? 's' : ''} saved
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddJDOpen(true)}>
          Add JD
        </Button>
      </Stack>

      {jdList.length === 0 ? (
        <Paper sx={{ p: 7, textAlign: 'center' }}>
          <WorkOutlineIcon sx={{ fontSize: 52, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" fontWeight={700} color="text.secondary">No job descriptions yet</Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
            Add a job description to start screening resumes against it.
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddJDOpen(true)}>
            Add JD
          </Button>
        </Paper>
      ) : (
        <Paper sx={{ p: 3 }}>
          {/* Search / Filter */}
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2.5 }}>
            <TextField
              size="small"
              placeholder="Search by title or description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ width: 380 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearch('')}>
                      <CloseIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />
            {search && (
              <Typography variant="caption" color="text.secondary">
                {filtered.length} of {jdList.length} shown
              </Typography>
            )}
          </Stack>

          {filtered.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No job descriptions match <strong>"{search}"</strong>.
              </Typography>
            </Box>
          ) : (
            <DataGrid
              rows={filtered}
              columns={columns}
              getRowId={(row) => row.id}
              autoHeight
              rowHeight={72}
              disableRowSelectionOnClick
              onRowClick={(params) => setViewJD(params.row)}
              pageSizeOptions={[5, 10, 25]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              sx={{
                border: 'none',
                '& .MuiDataGrid-columnHeaders': { bgcolor: 'grey.50', fontWeight: 700 },
                '& .MuiDataGrid-row': { cursor: 'pointer' },
                '& .MuiDataGrid-row:hover': { bgcolor: 'action.hover' },
                '& .MuiDataGrid-row:nth-of-type(even)': { bgcolor: 'grey.50' },
                '& .MuiDataGrid-cell': { display: 'flex', alignItems: 'center' },
              }}
            />
          )}
        </Paper>
      )}

      {/* Full description dialog */}
      <Dialog open={!!viewJD} onClose={() => setViewJD(null)} maxWidth="sm" fullWidth>
        {viewJD && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 1.5 }}>
              <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>{viewJD.title}</Typography>
              <Chip
                icon={<CalendarTodayOutlinedIcon sx={{ fontSize: '11px !important' }} />}
                label={fmtDate(viewJD.created_at)}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem', mr: 0.5 }}
              />
              <IconButton size="small" onClick={() => setViewJD(null)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}
              >
                {viewJD.description}
              </Typography>
            </DialogContent>
          </>
        )}
      </Dialog>

      <AddJDDialog
        open={addJDOpen}
        onClose={() => setAddJDOpen(false)}
        onSaved={handleJDSaved}
      />
    </Box>
  )
}
