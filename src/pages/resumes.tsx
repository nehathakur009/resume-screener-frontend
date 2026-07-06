import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Alert, Box, Chip, FormControl, Grid, IconButton,
  InputAdornment, InputLabel, MenuItem, Paper,
  Select, Stack, TextField, Typography,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import FilterListIcon from '@mui/icons-material/FilterList'
import CloseIcon from '@mui/icons-material/Close'
import toast from 'react-hot-toast'

import { AppDispatch, RootState } from '../store'
import { fetchResumes, deleteResume } from '../store/apps/resumes'
import ResumeTable from '../components/ResumeTable'

/* ── constants ─────────────────────────────────────────────── */

const EXP_RANGES = [
  { label: 'All Experience', min: 0, max: Infinity },
  { label: '0 – 2 years', min: 0, max: 2 },
  { label: '2 – 5 years', min: 2, max: 5 },
  { label: '5 – 10 years', min: 5, max: 10 },
  { label: '10+ years', min: 10, max: Infinity },
]

const FLAG_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Has Flags', value: 'has' },
  { label: 'No Flags', value: 'none' },
  { label: 'High Severity', value: 'high' },
]

/* ── page ──────────────────────────────────────────────────── */

export default function ResumesPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { list: resumes, total, status } = useSelector((s: RootState) => s.resumes)

  const [nameQ, setNameQ] = useState('')
  const [skillQ, setSkillQ] = useState('')
  const [expIdx, setExpIdx] = useState(0)
  const [flagFilter, setFlagFilter] = useState('all')

  useEffect(() => { dispatch(fetchResumes()) }, [dispatch])

  const handleDelete = (id: number) => {
    dispatch(deleteResume(id))
    toast.success('Resume removed')
  }

  /* ── client-side filtering ─────────────────────────────── */
  const filtered = useMemo(() => {
    const exp = EXP_RANGES[expIdx]
    return resumes.filter((r) => {
      if (nameQ) {
        const q = nameQ.toLowerCase()
        if (
          !(r.name ?? '').toLowerCase().includes(q) &&
          !(r.candidate_email ?? '').toLowerCase().includes(q)
        ) return false
      }
      if (skillQ) {
        const q = skillQ.toLowerCase()
        if (!(r.skills ?? []).some((s) => s.toLowerCase().includes(q))) return false
      }
      const yrs = r.total_experience_years ?? 0
      if (yrs < exp.min || yrs > exp.max) return false

      const flags = r.structural_flags ?? []
      if (flagFilter === 'has' && flags.length === 0) return false
      if (flagFilter === 'none' && flags.length > 0) return false
      if (flagFilter === 'high' && !flags.some((f) => f.severity === 'high')) return false

      return true
    })
  }, [resumes, nameQ, skillQ, expIdx, flagFilter])

  const isFiltered = !!(nameQ || skillQ || expIdx !== 0 || flagFilter !== 'all')

  const clearFilters = () => {
    setNameQ(''); setSkillQ(''); setExpIdx(0); setFlagFilter('all')
  }

  /* ── render ────────────────────────────────────────────── */
  return (
    <Box sx={{ py: 4, px: 4, pb: 8 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={800} letterSpacing={-0.5}>Resumes</Typography>
        <Typography variant="body2" color="text.secondary">
          {total} resume{total !== 1 ? 's' : ''} in system
        </Typography>
      </Box>

      {resumes.length > 0 ? (
        <Paper sx={{ p: 3 }}>

        {/* ── Table header ── */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2.5 }}>
          <FilterListIcon fontSize="small" color="action" />
          <Typography variant="subtitle1" fontWeight={700} sx={{ flex: 1 }}>All Resumes</Typography>
          <Chip
            label={isFiltered ? `${filtered.length} of ${total}` : total}
            size="small"
            color="default"
            sx={{ fontWeight: 700 }}
          />
        </Stack>

        {/* ── Filters ── */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {/* Name */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              size="small"
              fullWidth
              label="Candidate name"
              placeholder="Search name or email…"
              value={nameQ}
              onChange={(e) => setNameQ(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
                endAdornment: nameQ ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setNameQ('')}>
                      <CloseIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />
          </Grid>

          {/* Skills */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              size="small"
              fullWidth
              label="Key skill"
              placeholder="e.g. React, Python…"
              value={skillQ}
              onChange={(e) => setSkillQ(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
                endAdornment: skillQ ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSkillQ('')}>
                      <CloseIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />
          </Grid>

          {/* Experience */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl size="small" fullWidth>
              <InputLabel>Experience</InputLabel>
              <Select
                value={expIdx}
                label="Experience"
                onChange={(e) => setExpIdx(e.target.value as number)}
              >
                {EXP_RANGES.map((r, i) => (
                  <MenuItem key={r.label} value={i}>{r.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Flags */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl size="small" fullWidth>
              <InputLabel>Flags</InputLabel>
              <Select
                value={flagFilter}
                label="Flags"
                onChange={(e) => setFlagFilter(e.target.value)}
              >
                {FLAG_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* ── Active filter chips ── */}
        {isFiltered && (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
            {nameQ && (
              <Chip size="small" label={`Name: "${nameQ}"`} onDelete={() => setNameQ('')} />
            )}
            {skillQ && (
              <Chip size="small" label={`Skill: "${skillQ}"`} onDelete={() => setSkillQ('')} />
            )}
            {expIdx !== 0 && (
              <Chip size="small" label={EXP_RANGES[expIdx].label} onDelete={() => setExpIdx(0)} />
            )}
            {flagFilter !== 'all' && (
              <Chip
                size="small"
                label={FLAG_OPTIONS.find((o) => o.value === flagFilter)?.label}
                onDelete={() => setFlagFilter('all')}
              />
            )}
            <Chip
              size="small"
              label="Clear all"
              variant="outlined"
              onClick={clearFilters}
              sx={{ cursor: 'pointer' }}
            />
          </Stack>
        )}

        {/* ── Table ── */}
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
          Click any row to view the full parsed profile.
        </Typography>

        {filtered.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No resumes match the current filters.
            </Typography>
          </Box>
        ) : (
          <ResumeTable resumes={filtered} onDelete={handleDelete} />
        )}
        </Paper>
      ) : (
        status !== 'loading' && (
          <Alert severity="info">
            No resumes in system yet. Upload resumes on the Screen Resumes page to get started.
          </Alert>
        )
      )}
    </Box>
  )
}