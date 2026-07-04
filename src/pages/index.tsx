import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Alert, Box, Button, Chip, CircularProgress, Container,
  Divider, FormControl, InputLabel, MenuItem, Paper,
  Select, Stack, Typography,
} from '@mui/material'
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import toast from 'react-hot-toast'

import { AppDispatch, RootState } from '../store'
import { uploadResume, fetchResumes, deleteResume } from '../store/apps/resumes'
import { fetchAllJDs, fetchAllResults, runScoring, clearResults, setCurrentJD } from '../store/apps/scoring'
import { JobDescription } from '../types'

import UploadZone from '../components/UploadZone'
import ResumeTable from '../components/ResumeTable'
import RankedTable from '../components/RankedTable'
import AddJDDialog from '../components/AddJDDialog'

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function HomePage() {
  const dispatch = useDispatch<AppDispatch>()
  const [addJDOpen, setAddJDOpen]       = useState(false)
  const [selectedJdId, setSelectedJdId] = useState<number | ''>('')

  const { list: resumes, status: resumeStatus } = useSelector(
    (s: RootState) => s.resumes,
  )
  const { results, allResults, jdList, scoringStatus, error: scoringError } = useSelector(
    (s: RootState) => s.scoring,
  )

  const tableRows = allResults.length > 0 ? allResults : results

  const selectedJd: JobDescription | undefined = jdList.find((j) => j.id === selectedJdId)
  const isScreening = scoringStatus === 'loading'
  const canScreen   = !!selectedJdId && resumes.length > 0 && !isScreening

  useEffect(() => {
    dispatch(fetchResumes())
    dispatch(fetchAllJDs())
    dispatch(fetchAllResults())
  }, [dispatch])

  /* ── handlers ─────────────────────────────────────────── */

  const handleFileDrop = async (files: File[]) => {
    for (const file of files) {
      const formData = new FormData()
      formData.append('resume', file)
      try {
        const result = await dispatch(uploadResume(formData)).unwrap()
        if (result.duplicate) {
          toast(`Already in system — profile refreshed: ${file.name}`, { icon: '🔄' })
        } else {
          toast.success(`Parsed & added: ${file.name}`)
        }
      } catch (err: any) {
        toast.error(`${file.name}: ${err.message || 'Parse failed'}`)
      }
    }
  }

  const handleDelete = (id: number) => {
    dispatch(deleteResume(id))
    toast.success('Resume removed')
  }

  const handleJDSaved = (jd: JobDescription) => {
    setSelectedJdId(jd.id)
  }

  const handleScreenResumes = async () => {
    if (!selectedJd) return
    try {
      dispatch(setCurrentJD(selectedJd))
      dispatch(clearResults())
      toast.loading(`Screening against "${selectedJd.title}"…`, { id: 'scoring' })
      await dispatch(runScoring({ jd_id: selectedJd.id })).unwrap()
      dispatch(fetchAllResults())
      toast.success('Screening complete!', { id: 'scoring' })
    } catch (err: any) {
      toast.error(err.message || 'Screening failed', { id: 'scoring' })
    }
  }

  /* ── render ───────────────────────────────────────────── */

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 8 }}>

      {/* ── Header ── */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 3, mb: 0 }}>
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <AssessmentOutlinedIcon sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h5" fontWeight={800} letterSpacing={-0.5}>
                Resume Scanner
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                Upload resumes · select a job description · get a ranked, transparent shortlist
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 3 }}>
        <Stack spacing={3}>

          {/* ── Step 1 · Upload Resumes ── */}
          <Paper sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Chip label="1" size="small" color="primary" sx={{ fontWeight: 700, width: 26, height: 26 }} />
              <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>
                Upload Resumes
              </Typography>
              {resumes.length > 0 && (
                <Chip label={`${resumes.length} loaded`} size="small" color="success" variant="outlined" />
              )}
            </Stack>
            <UploadZone
              onDrop={handleFileDrop}
              loading={resumeStatus === 'loading'}
            />
          </Paper>

          {/* ── Step 2 · Job Description ── */}
          <Paper sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2.5 }}>
              <Chip label="2" size="small" color="primary" sx={{ fontWeight: 700, width: 26, height: 26 }} />
              <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>
                Job Description
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setAddJDOpen(true)}
                sx={{ flexShrink: 0 }}
              >
                Add JD
              </Button>
            </Stack>

            <Stack spacing={2.5}>
              {/* ── Dropdown ── */}
              {jdList.length === 0 ? (
                <Alert
                  severity="info"
                  action={
                    <Button color="inherit" size="small" startIcon={<AddIcon />} onClick={() => setAddJDOpen(true)}>
                      Add JD
                    </Button>
                  }
                >
                  No job descriptions saved yet — click <strong>Add JD</strong> to create one.
                </Alert>
              ) : (
                <FormControl fullWidth size="small">
                  <InputLabel id="jd-select-label">Select Job Description</InputLabel>
                  <Select
                    labelId="jd-select-label"
                    value={selectedJdId}
                    label="Select Job Description"
                    onChange={(e) => setSelectedJdId(e.target.value as number)}
                    displayEmpty
                  >
                    {jdList.map((jd) => (
                      <MenuItem key={jd.id} value={jd.id}>
                        <Box sx={{ py: 0.25 }}>
                          <Typography variant="body2" fontWeight={500}>
                            {jd.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {fmtDate(jd.created_at)}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* ── Description preview ── */}
              {selectedJd && (
                <>
                  <Divider />
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={600}
                      letterSpacing={0.5}
                      sx={{ display: 'block', mb: 0.75 }}
                    >
                      DESCRIPTION PREVIEW
                    </Typography>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        bgcolor: 'background.default',
                        maxHeight: 160,
                        overflowY: 'auto',
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}
                      >
                        {selectedJd.description}
                      </Typography>
                    </Paper>
                  </Box>
                </>
              )}

              {/* ── Screen button ── */}
              <Stack direction="row" alignItems="center" spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  disableElevation
                  disabled={!canScreen}
                  onClick={handleScreenResumes}
                  startIcon={
                    isScreening
                      ? <CircularProgress size={18} color="inherit" />
                      : <SearchIcon />
                  }
                >
                  {isScreening ? 'Screening…' : 'Screen Resumes'}
                </Button>

                {!selectedJdId && jdList.length > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    Select a job description to continue.
                  </Typography>
                )}
                {selectedJdId && resumes.length === 0 && (
                  <Typography variant="caption" color="text.secondary">
                    Upload at least one resume first.
                  </Typography>
                )}
              </Stack>
            </Stack>
          </Paper>

          {/* ── Step 3 · Results ── */}
          {tableRows.length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Chip label="3" size="small" color="success" sx={{ fontWeight: 700, width: 26, height: 26 }} />
                <Typography variant="h6" fontWeight={700}>
                  Ranked Results — {tableRows.length} record{tableRows.length !== 1 ? 's' : ''}
                </Typography>
              </Stack>
              <Alert severity="info" sx={{ mb: 2 }}>
                Scores are computed from 5 weighted criteria. Click the{' '}
                <strong>info icon</strong> on any row to see per-criterion breakdown and flags with reasons.
              </Alert>
              <RankedTable results={tableRows} jdList={jdList} />
            </Paper>
          )}

          {scoringError && <Alert severity="error">{scoringError}</Alert>}

          {/* ── Stored Resumes ── */}
          {resumes.length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Chip label={resumes.length} size="small" color="default" sx={{ fontWeight: 700, height: 26, minWidth: 26 }} />
                <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>
                  Stored Resumes
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                Click any row to view the full parsed profile.
              </Typography>
              <ResumeTable resumes={resumes} onDelete={handleDelete} />
            </Paper>
          )}

        </Stack>
      </Container>

      <AddJDDialog
        open={addJDOpen}
        onClose={() => setAddJDOpen(false)}
        onSaved={handleJDSaved}
      />
    </Box>
  )
}
