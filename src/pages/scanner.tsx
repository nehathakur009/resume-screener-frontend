import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Alert, Box, Button, Chip, CircularProgress,
  FormControl, InputLabel, MenuItem, Paper,
  Select, Stack, Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import WorkOutlineIcon from '@mui/icons-material/WorkOutline'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import toast from 'react-hot-toast'

import { AppDispatch, RootState } from '../store'
import { uploadResume, fetchResumes, deleteResume } from '../store/apps/resumes'
import { fetchAllJDs, runScoring, clearResults, setCurrentJD } from '../store/apps/scoring'
import { JobDescription } from '../../../types'

import UploadZone from '../components/UploadZone'
import RankedTable from '../components/RankedTable'
import AddJDDialog from '../components/AddJDDialog'

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function StepHeader({
  label, done = false, right,
}: {
  number?: number; label: string; done?: boolean; right?: React.ReactNode
}) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1.5 }}>
      <Typography variant="h6" fontWeight={700} sx={{ flex: 1, fontSize: '1.05rem' }}>
        {label}
      </Typography>
      {right}
    </Stack>
  )
}

export default function ScannerPage() {
  const dispatch = useDispatch<AppDispatch>()
  const [addJDOpen, setAddJDOpen] = useState(false)
  const [selectedJdId, setSelectedJdId] = useState<number | ''>('')
  const [screened, setScreened] = useState(false)
  const [newUploadIds, setNewUploadIds] = useState<Set<number>>(new Set())

  const { list: resumes, status: resumeStatus } = useSelector((s: RootState) => s.resumes)
  const { results, jdList, scoringStatus, error: scoringError } = useSelector(
    (s: RootState) => s.scoring,
  )

  const selectedJd = jdList.find((j) => j.id === selectedJdId) as JobDescription | undefined
  const isScreening = scoringStatus === 'loading'
  const canScreen = !!selectedJdId && resumes.length > 0 && !isScreening

  useEffect(() => {
    dispatch(fetchResumes())
    dispatch(fetchAllJDs())
  }, [dispatch])

  const handleFileDrop = async (files: File[]) => {
    setScreened(false)

    // Upload files sequentially to avoid overwhelming the server
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const formData = new FormData()
      formData.append('resume', file)

      try {
        const result = await dispatch(uploadResume(formData)).unwrap()
        setNewUploadIds((prev) => new Set([...prev, result.data.id]))
        if (result.duplicate) {
          toast(`Already in system — profile refreshed: ${file.name}`, { icon: '🔄' })
        } else {
          toast.success(`Parsed & added: ${file.name}`)
        }
      } catch (err: any) {
        toast.error(`${file.name}: ${err.message || 'Parse failed'}`)
      }

      // Add a small delay between uploads to give server time to process
      // This prevents rate limiting and concurrent processing issues
      if (i < files.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
  }

  const handleDelete = (id: number) => {
    dispatch(deleteResume(id))
    setNewUploadIds((prev) => { const n = new Set(prev); n.delete(id); return n })
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
      setScreened(false)
      toast.loading(`Screening against "${selectedJd.title}"…`, { id: 'scoring' })
      await dispatch(runScoring({ jd_id: selectedJd.id })).unwrap()
      toast.success('Screening complete!', { id: 'scoring' })
      setScreened(true)
      setNewUploadIds(new Set())
    } catch (err: any) {
      toast.error(err.message || 'Screening failed', { id: 'scoring' })
    }
  }

  return (
    <Box sx={{ pb: 8 }}>
    {/* ── Page header ── */}
    <Box sx={{ px: 3, pt: 3, pb: 2 }}>
      <Typography variant="h5" fontWeight={800} letterSpacing={-0.5}>Screen Resumes</Typography>
      <Typography variant="body2" color="text-secondary">
        Follow the steps below to rank candidates against a job description.
      </Typography>
    </Box>

    <Box sx={{ px: 3 }}>
      <Stack spacing={1.5}>

      {/* ── Step 1 · Job Description ── */}
      <Paper sx={{ p: 2 }}>
        <StepHeader
          number={1}
          label="Job Description"
          done={!!selectedJd}
          right={
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setAddJDOpen(true)}
              sx={{ flexShrink: 0 }}
            >
              Add JD
            </Button>
          }
        />

        {jdList.length === 0 ? (
          <Alert
            severity="info"
            action={
              <Button color="inherit" size="small" startIcon={<AddIcon />} onClick={() => setAddJDOpen(true)}>
                Add JD
              </Button>
            }
          >
            Create your first job description to start scanning resumes. It's the key to finding great candidates.
          </Alert>
        ) : (
          <Stack spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="jd-select-label">Select Job Description</InputLabel>
              <Select
                labelId="jd-select-label"
                value={selectedJdId}
                label="Select Job Description"
                onChange={(e) => { setSelectedJdId(e.target.value as number); setScreened(false) }}
              >
                {jdList.map((jd) => (
                  <MenuItem key={jd.id} value={jd.id}>
                    <Box sx={{ py: 0.25 }}>
                      <Typography variant="body2" fontWeight={500}>{jd.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{fmtDate(jd.created_at)}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

          </Stack>
        )}
      </Paper>

      {/* ── Step 2 · Upload Resumes ── */}
      <Paper sx={{ p: 2 }}>
        { <StepHeader
          number={2}
          label="Upload Resumes"
        /> }

        <UploadZone onDrop={handleFileDrop} loading={resumeStatus === 'loading'} />

        {newUploadIds.size > 0 && (
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {resumes
              .filter((r) => newUploadIds.has(r.id))
              .map((resume) => (
                <Chip
                  key={resume.id}
                  label={resume.name || resume.original_filename}
                  onDelete={() => handleDelete(resume.id)}
                  size="small"
                  variant="outlined"
                  sx={{ maxWidth: 240 }}
                />
              ))}
          </Box>
        )}
      </Paper>

      {/* ── Step 3 · Screen ── */}
      <Paper sx={{ p: 2 }}>
        {/* <StepHeader number={3} label="Screen Resumes" />*/}
        <Stack direction="column" alignItems="center" spacing={1}>
          <Button
            variant="contained"
            size="small"
            disableElevation
            disabled={!canScreen}
            onClick={handleScreenResumes}
            startIcon={
              isScreening
                ? <CircularProgress size={12} color="inherit" />
                : <SearchIcon />
            }
            sx={{ px: 2 }}
          >
            {isScreening ? 'Screening…' : 'Screen Resumes'}
          </Button>

          {!selectedJdId && (
            <Typography variant="caption" color="text.secondary">
              Select a job description in step 1 to continue.
            </Typography>
          )}
          {selectedJdId && resumes.length === 0 && (
            <Typography variant="caption" color="text-secondary">
              Upload at least one resume in step 2 to continue.
            </Typography>
          )}
        </Stack>
      </Paper>

      {/* ── Step 4 · Ranked Results ── */}
      {scoringError && <Alert severity="error">{scoringError}</Alert>}

      {screened && results.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <StepHeader
            number={4}
            label={`Ranked Results: ${results.length} candidate${results.length !== 1 ? 's' : ''}`}
            done
          />

          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1.5, color: 'text.secondary' }}>
            <InfoOutlinedIcon sx={{ fontSize: 15 }} />
            <Typography variant="caption">
              Scores are computed from 5 weighted criteria. Click the{' '}
              <strong>View</strong> button on any row to see the per-criterion breakdown.
            </Typography>
          </Stack>

          <RankedTable results={results} jdList={jdList} />
        </Paper>
      )}

      </Stack>
    </Box>

    <AddJDDialog
      open={addJDOpen}
      onClose={() => setAddJDOpen(false)}
      onSaved={handleJDSaved}
    />
    </Box>
  )
}