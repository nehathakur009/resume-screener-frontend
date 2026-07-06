import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box, FormControl, InputLabel, MenuItem,
  Paper, Select, Stack, Typography,
} from '@mui/material'
import LeaderboardRoundedIcon from '@mui/icons-material/LeaderboardRounded'

import { AppDispatch, RootState } from '../store'
import { fetchAllJDs, fetchAllResults } from '../store/apps/scoring'
import RankedTable from '../components/RankedTable'

export default function ResultsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const [filterJdId, setFilterJdId] = useState<number | ''>('')
  const { jdList, allResults } = useSelector((s: RootState) => s.scoring)

  useEffect(() => {
    dispatch(fetchAllJDs())
    dispatch(fetchAllResults())
  }, [dispatch])

  const filtered = filterJdId
  ? allResults.filter((r) => r.jd_id === filterJdId)
  : allResults

  return (
    <Box sx={{ py: 4, px: 4, pb: 8 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={800} letterSpacing={-0.5}>Results</Typography>
        <Typography variant="body2" color="text.secondary">
          {allResults.length} screening result{allResults.length !== 1 ? 's' : ''} across all job descriptions
        </Typography>
      </Box>

      {allResults.length === 0 ? (
        <Paper sx={{ p: 7, textAlign: 'center' }}>
          <LeaderboardRoundedIcon sx={{ fontSize: 52, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" fontWeight={700} color="text.secondary">No results yet</Typography>
          <Typography variant="body2" color="text.disabled">
            Run a screening on the Screen Resumes page to see ranked results here.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={3}>
          {jdList.length > 1 && (
            <Paper sx={{ p: 2.5 }}>
              <FormControl size="small" sx={{ minWidth: 300 }}>
                <InputLabel>Filter by Job Description</InputLabel>
                <Select
                  value={filterJdId}
                  label="Filter by Job Description"
                  onChange={(e) => setFilterJdId(e.target.value as number | '')}
                >
                  <MenuItem value="">All Job Descriptions</MenuItem>
                  {jdList.map((jd) => (
                    <MenuItem key={jd.id} value={jd.id}>{jd.title}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>
          )}

          <Paper sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ flex: 1 }}>
                {filterJdId ? jdList.find((j) => j.id === filterJdId)?.title : 'All Results'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              </Typography>
            </Stack>
            {filtered.length > 0 ? (
              <RankedTable results={filtered} jdList={jdList} />
            ) : (
              <Typography variant="body2" color="text-secondary">
                No results match the selected filter.
              </Typography>
            )}
          </Paper>
        </Stack>
      )}
    </Box>
  )
}