import { useState } from 'react'
import {
  Avatar, Box, Chip, IconButton, Stack, Tooltip, Typography,
} from '@mui/material'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { Resume } from '../types'
import ResumeProfileDialog from './ResumeProfileDialog'

interface Props {
  resumes: Resume[]
  onDelete: (id: number) => void
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export default function ResumeTable({ resumes, onDelete }: Props) {
  const [selected, setSelected] = useState<Resume | null>(null)

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Candidate',
      width: 200,
      renderCell: (p: GridRenderCellParams<Resume>) => {
        const initials = (p.row.name ?? '?')
          .split(' ')
          .slice(0, 2)
          .map((w: string) => w[0] ?? '')
          .join('')
          .toUpperCase()
        return (
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Avatar sx={{ width: 30, height: 30, fontSize: '0.72rem', fontWeight: 700, bgcolor: 'primary.main' }}>
              {initials}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={600} noWrap>{p.row.name || '—'}</Typography>
              {p.row.candidate_email && (
                <Typography variant="caption" color="text.secondary" noWrap>
                  {p.row.candidate_email}
                </Typography>
              )}
            </Box>
          </Stack>
        )
      },
    },
    {
      field: 'total_experience_years',
      headerName: 'Experience',
      width: 105,
      renderCell: (p: GridRenderCellParams) => (
        <Typography variant="body2">
          {p.value != null ? `${Number(p.value).toFixed(1)}y` : '—'}
        </Typography>
      ),
    },
    {
      field: 'skills',
      headerName: 'Key Skills',
      flex: 1,
      minWidth: 200,
      sortable: false,
      renderCell: (p: GridRenderCellParams<Resume>) => (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          {(p.row.skills ?? []).slice(0, 4).map((s) => (
            <Chip key={s} label={s} size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
          ))}
          {(p.row.skills ?? []).length > 4 && (
            <Typography variant="caption" color="text.disabled">
              +{(p.row.skills ?? []).length - 4}
            </Typography>
          )}
        </Stack>
      ),
    },
    {
      field: 'structural_flags',
      headerName: 'Flags',
      width: 80,
      sortable: false,
      renderCell: (p: GridRenderCellParams<Resume>) => {
        const count = (p.row.structural_flags ?? []).length
        if (!count) return <Typography variant="caption" color="text.disabled">—</Typography>
        const hasHigh = (p.row.structural_flags ?? []).some((f) => f.severity === 'high')
        return (
          <Tooltip
            title={(p.row.structural_flags ?? []).map((f) => f.description).join(' | ')}
            arrow
          >
            <Chip
              size="small"
              icon={<WarningAmberIcon fontSize="small" />}
              label={count}
              color={hasHigh ? 'error' : 'warning'}
              sx={{ height: 20, fontSize: '0.68rem' }}
            />
          </Tooltip>
        )
      },
    },
    {
      field: 'parsed_at',
      headerName: 'Uploaded',
      width: 120,
      renderCell: (p: GridRenderCellParams) => (
        <Typography variant="caption" color="text.secondary">
          {p.value ? fmtDate(p.value) : '—'}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: '',
      width: 90,
      sortable: false,
      renderCell: (p: GridRenderCellParams<Resume>) => (
        <Stack direction="row" spacing={0.25}>
          <Tooltip title="View parsed profile">
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => { e.stopPropagation(); setSelected(p.row) }}
            >
              <VisibilityOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remove resume">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onDelete(p.row.id) }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ]

  if (!resumes.length) return null

  return (
    <>
      <DataGrid
        rows={resumes}
        columns={columns}
        getRowId={(row) => row.id}
        autoHeight
        rowHeight={58}
        disableRowSelectionOnClick
        onRowClick={(params) => setSelected(params.row)}
        pageSizeOptions={[5, 10, 25]}
        initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
        sx={{
          border: 'none',
          '& .MuiDataGrid-columnHeaders': { bgcolor: 'grey.50', fontWeight: 700 },
          '& .MuiDataGrid-row': { cursor: 'pointer' },
          '& .MuiDataGrid-row:hover': { bgcolor: 'action.hover' },
          '& .MuiDataGrid-row:nth-of-type(even)': { bgcolor: 'grey.50' },
          '& .MuiDataGrid-cell': { display: 'flex', alignItems: 'center' },
        }}
      />

      <ResumeProfileDialog
        open={!!selected}
        onClose={() => setSelected(null)}
        resume={selected}
      />
    </>
  )
}
