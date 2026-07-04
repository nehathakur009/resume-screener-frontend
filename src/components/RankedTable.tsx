import { useMemo, useState } from 'react'
import {
  Avatar, Box, Button, Chip, FormControl,
  IconButton, InputAdornment, InputLabel, LinearProgress,
  MenuItem, Paper, Select, Stack, TextField,
  Tooltip, Typography,
} from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import SearchIcon from '@mui/icons-material/Search'
import FilterListIcon from '@mui/icons-material/FilterList'
import ClearIcon from '@mui/icons-material/Clear'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { JobDescription, ScoringResult } from '../types'
import FlagBadges from './FlagBadges'
import ScoreBreakdown from './ScoreBreakdown'

/* ── helpers ─────────────────────────────────────────────────────── */

const EXP_RANGES = [
  { label: 'Any',   min: 0,  max: Infinity },
  { label: '0 – 2y', min: 0,  max: 2 },
  { label: '2 – 5y', min: 2,  max: 5 },
  { label: '5 – 10y', min: 5,  max: 10 },
  { label: '10y +',  min: 10, max: Infinity },
]

const FLAG_OPTIONS = [
  { value: '',                     label: 'Any' },
  { value: 'date_overlap',         label: 'Date Overlap' },
  { value: 'experience_exaggeration', label: 'Exp. Exaggeration' },
  { value: 'employment_gap',       label: 'Employment Gap' },
  { value: 'unverifiable_timeline',label: 'No Timeline' },
  { value: 'partial_dates',        label: 'Partial Dates' },
  { value: 'skill_padding',        label: 'Skill Padding' },
  { value: 'missing_role_details', label: 'Thin Descriptions' },
  { value: '__none__',             label: 'No Flags' },
]

const CRITERIA_LABELS = ['Skills Match', 'Experience Relevance', 'Years of Experience', 'Education', 'Career Progression']
const CRITERIA_WEIGHTS = [30, 25, 20, 15, 10]

/* ── ScoreBar ────────────────────────────────────────────────────── */

function ScoreBar({ value }: { value: number }) {
  const color = value >= 7 ? '#22c55e' : value >= 5 ? '#f59e0b' : '#ef4444'
  return (
    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ width: '100%' }}>
      <LinearProgress
        variant="determinate"
        value={value * 10}
        sx={{
          flex: 1, height: 6, borderRadius: 4, bgcolor: 'grey.200',
          '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 },
        }}
      />
      <Typography variant="caption" fontWeight={700} sx={{ color, minWidth: 28 }}>
        {value.toFixed(1)}
      </Typography>
    </Stack>
  )
}

/* ── RankAvatar ──────────────────────────────────────────────────── */

function RankAvatar({ rank }: { rank: number }) {
  const bg =
    rank === 1 ? '#f59e0b' :
    rank === 2 ? '#94a3b8' :
    rank === 3 ? '#cd7f32' : 'grey.200'
  return (
    <Avatar sx={{ width: 24, height: 24, fontSize: '0.68rem', fontWeight: 700, bgcolor: bg, color: rank <= 3 ? 'white' : 'text.primary' }}>
      {rank}
    </Avatar>
  )
}

/* ── Props ───────────────────────────────────────────────────────── */

interface Props {
  results: ScoringResult[]
  jdList?: JobDescription[]
}

/* ── Component ───────────────────────────────────────────────────── */

export default function RankedTable({ results, jdList = [] }: Props) {
  const [selected, setSelected] = useState<ScoringResult | null>(null)

  // filter state
  const [candidateQ, setCandidateQ] = useState('')
  const [jdFilter,   setJdFilter]   = useState<number | ''>('')
  const [expRange,   setExpRange]   = useState(0)        // index into EXP_RANGES
  const [flagFilter, setFlagFilter] = useState('')

  const hasFilters = candidateQ !== '' || jdFilter !== '' || expRange !== 0 || flagFilter !== ''

  const clearFilters = () => {
    setCandidateQ(''); setJdFilter(''); setExpRange(0); setFlagFilter('')
  }

  /* ── unique JDs in current result set for filter dropdown ── */
  const jdOptions = useMemo(() => {
    const seen = new Map<number, string>()
    for (const r of results) {
      if (!seen.has(r.jd_id)) seen.set(r.jd_id, r.jd_title ?? `JD #${r.jd_id}`)
    }
    return [...seen.entries()].map(([id, title]) => ({ id, title }))
  }, [results])

  /* ── filtered rows ── */
  const filtered = useMemo(() => {
    const { min, max } = EXP_RANGES[expRange]
    return results.filter((r) => {
      if (candidateQ && !r.name?.toLowerCase().includes(candidateQ.toLowerCase())) return false
      if (jdFilter !== '' && r.jd_id !== jdFilter) return false
      const exp = r.total_experience_years ?? 0
      if (exp < min || exp >= max) return false
      if (flagFilter === '__none__') return (r.flags ?? []).length === 0
      if (flagFilter && !(r.flags ?? []).some((f) => f.type === flagFilter)) return false
      return true
    })
  }, [results, candidateQ, jdFilter, expRange, flagFilter])

  /* ── columns ── */
  const columns: GridColDef[] = [
    {
      field: 'rank', headerName: '#', width: 46,
      renderCell: (p: GridRenderCellParams) => <RankAvatar rank={p.value} />,
    },
    {
      field: 'name', headerName: 'Candidate', width: 140,
      renderCell: (p: GridRenderCellParams<ScoringResult>) => (
        <Typography variant="body2" fontWeight={600} noWrap>{p.row.name}</Typography>
      ),
    },
    {
      field: 'candidate_email', headerName: 'Email', width: 180,
      renderCell: (p: GridRenderCellParams<ScoringResult>) => (
        <Typography variant="caption" color="text.secondary" noWrap>
          {p.row.candidate_email || '—'}
        </Typography>
      ),
    },
    {
      field: 'jd_title', headerName: 'Job Description', width: 170,
      renderCell: (p: GridRenderCellParams<ScoringResult>) => (
        <Tooltip title={p.row.jd_title ?? ''} arrow placement="top">
          <Typography variant="body2" noWrap sx={{ maxWidth: 155, color: 'primary.main', fontWeight: 500 }}>
            {p.row.jd_title ?? `JD #${p.row.jd_id}`}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: 'total_score', headerName: 'Score', width: 140,
      renderCell: (p: GridRenderCellParams) => <ScoreBar value={p.value} />,
    },
    {
      field: 'total_experience_years', headerName: 'Exp.', width: 80,
      renderCell: (p: GridRenderCellParams) => (
        <Typography variant="caption">{p.value ? `${Number(p.value).toFixed(1)}y` : '—'}</Typography>
      ),
    },
    {
      field: 'skills', headerName: 'Key Skills', flex: 1, minWidth: 160, sortable: false,
      renderCell: (p: GridRenderCellParams<ScoringResult>) => (
        <Stack direction="row" spacing={0.4} flexWrap="wrap" useFlexGap>
          {(p.row.skills ?? []).slice(0, 2).map((s) => (
            <Chip key={s} label={s} size="small" sx={{ height: 18, fontSize: '0.6rem' }} />
          ))}
          {(p.row.skills ?? []).length > 2 && (
            <Typography variant="caption" color="text.disabled">
              +{(p.row.skills ?? []).length - 2}
            </Typography>
          )}
        </Stack>
      ),
    },
    {
      field: 'flags', headerName: 'Flags', width: 180, sortable: false,
      renderCell: (p: GridRenderCellParams<ScoringResult>) => {
        const flags = p.row.flags ?? []
        if (!flags.length) {
          return (
            <Chip
              label="Clean"
              size="small"
              color="success"
              variant="outlined"
              sx={{ fontSize: '0.62rem', height: 18 }}
            />
          )
        }
        return <FlagBadges flags={flags} maxVisible={1} />
      },
    },
    {
      field: 'actions', headerName: '', width: 52, sortable: false,
      renderCell: (p: GridRenderCellParams<ScoringResult>) => (
        <Tooltip title="View score breakdown">
          <IconButton size="small" onClick={() => setSelected(p.row)}>
            <InfoOutlinedIcon sx={{ fontSize: 16 }} color="primary" />
          </IconButton>
        </Tooltip>
      ),
    },
  ]

  return (
    <Box>
      {/* ── Criteria legend ── */}
      <Paper variant="outlined" sx={{ p: 1.5, mb: 1.5, bgcolor: 'grey.50' }}>
        <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
          SCORING CRITERIA (how scores are calculated)
        </Typography>
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          {CRITERIA_LABELS.map((label, i) => (
            <Chip key={label} label={`${label} · ${CRITERIA_WEIGHTS[i]}%`} size="small" variant="outlined" sx={{ fontSize: '0.62rem', height: 20 }} />
          ))}
        </Stack>
      </Paper>

      {/* ── Filter bar ── */}
      <Paper variant="outlined" sx={{ p: 1.5, mb: 1.5 }}>
        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
          <FilterListIcon sx={{ fontSize: 16 }} color="action" />
          <Typography variant="overline" color="text.secondary">
            FILTERS
          </Typography>
          {hasFilters && (
            <Button size="small" startIcon={<ClearIcon />} onClick={clearFilters} sx={{ ml: 'auto', fontSize: '0.68rem', py: 0 }}>
              Clear
            </Button>
          )}
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {/* Candidate search */}
          <TextField
            size="small"
            placeholder="Search candidate…"
            value={candidateQ}
            onChange={(e) => setCandidateQ(e.target.value)}
            sx={{ minWidth: 160 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
              endAdornment: candidateQ ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setCandidateQ('')}><ClearIcon fontSize="small" /></IconButton>
                </InputAdornment>
              ) : null,
            }}
          />

          {/* JD filter */}
          <FormControl size="small" sx={{ minWidth: 140, maxWidth: 200 }}>
            <InputLabel>Job Description</InputLabel>
            <Select
              value={jdFilter}
              label="Job Description"
              onChange={(e) => setJdFilter(e.target.value as number | '')}
            >
              <MenuItem value=""><em>All JDs</em></MenuItem>
              {jdOptions.map((jd) => (
                <MenuItem key={jd.id} value={jd.id}>{jd.title}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Experience range */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Experience</InputLabel>
            <Select
              value={expRange}
              label="Experience"
              onChange={(e) => setExpRange(e.target.value as number)}
            >
              {EXP_RANGES.map((r, i) => (
                <MenuItem key={i} value={i}>{r.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Flag filter */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Flag</InputLabel>
            <Select
              value={flagFilter}
              label="Flag"
              onChange={(e) => setFlagFilter(e.target.value as string)}
            >
              {FLAG_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {hasFilters && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Showing {filtered.length} of {results.length} result{results.length !== 1 ? 's' : ''}
          </Typography>
        )}
      </Paper>

      {/* ── DataGrid ── */}
      <DataGrid
        rows={filtered}
        columns={columns}
        getRowId={(row) => `${row.resume_id}-${row.jd_id}`}
        autoHeight
        rowHeight={48}
        disableRowSelectionOnClick
        pageSizeOptions={[10, 25, 50]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        sx={{
          border: 'none',
          '& .MuiDataGrid-columnHeaders': { bgcolor: 'grey.50', fontWeight: 700 },
          '& .MuiDataGrid-row:nth-of-type(even)': { bgcolor: 'grey.50' },
          '& .MuiDataGrid-cell': { display: 'flex', alignItems: 'center', py: 0.5 },
        }}
      />

      <ScoreBreakdown
        open={!!selected}
        onClose={() => setSelected(null)}
        result={selected}
      />
    </Box>
  )
}
