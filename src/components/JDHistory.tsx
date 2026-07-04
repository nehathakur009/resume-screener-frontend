import {
  Box, Typography, List, ListItem, ListItemText,
  Chip, Stack, Tooltip, IconButton,
} from '@mui/material'
import HistoryIcon from '@mui/icons-material/History'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { JobDescription } from '../types'

interface Props {
  jdList: JobDescription[]
  currentJdId: number | null
  screeningJdId: number | null
  resumeCount: number
  onSelect: (jd: JobDescription) => void
  onRunScoring: (jd: JobDescription) => void
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function JDHistory({
  jdList,
  currentJdId,
  screeningJdId,
  resumeCount,
  onSelect,
  onRunScoring,
}: Props) {
  if (!jdList.length) return null

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
        <HistoryIcon fontSize="small" color="action" />
        <Typography variant="caption" color="text.secondary" fontWeight={600} letterSpacing={0.5}>
          SAVED JOB DESCRIPTIONS
        </Typography>
        <Chip
          label={`${jdList.length}`}
          size="small"
          sx={{ height: 16, fontSize: '0.65rem', ml: 0.5 }}
        />
      </Stack>

      <List dense disablePadding sx={{ maxHeight: 240, overflowY: 'auto' }}>
        {jdList.map((jd) => {
          const isActive    = jd.id === currentJdId
          const isScreening = jd.id === screeningJdId

          return (
            <ListItem
              key={jd.id}
              disablePadding
              secondaryAction={
                <Tooltip
                  title={resumeCount === 0 ? 'Upload resumes first' : `Screen ${resumeCount} resume${resumeCount !== 1 ? 's' : ''} against this JD`}
                  arrow
                >
                  <span>
                    <IconButton
                      size="small"
                      color="primary"
                      disabled={resumeCount === 0 || isScreening}
                      onClick={(e) => { e.stopPropagation(); onRunScoring(jd) }}
                      sx={{ mr: 0.5 }}
                    >
                      <PlayArrowIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              }
              sx={{
                borderRadius: 1,
                mb: 0.25,
                bgcolor: isActive ? 'action.selected' : 'transparent',
                '&:hover': { bgcolor: 'action.hover' },
                cursor: 'pointer',
              }}
              onClick={() => onSelect(jd)}
            >
              <ListItemText
                sx={{ pl: 1, py: 0.5 }}
                primary={
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    <Typography variant="body2" fontWeight={500} noWrap sx={{ maxWidth: 280 }}>
                      {jd.title}
                    </Typography>
                    {isActive && (
                      <Chip label="active" size="small" color="primary" sx={{ height: 16, fontSize: '0.62rem' }} />
                    )}
                    {isScreening && (
                      <Chip label="screening…" size="small" color="warning" sx={{ height: 16, fontSize: '0.62rem' }} />
                    )}
                  </Stack>
                }
                secondary={formatDate(jd.created_at)}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItem>
          )
        })}
      </List>
    </Box>
  )
}
