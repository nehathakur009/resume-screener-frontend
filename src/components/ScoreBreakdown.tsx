import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, LinearProgress, Divider,
  Accordion, AccordionSummary, AccordionDetails, Stack,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { ScoringResult } from '../types'
import FlagBadges from './FlagBadges'

interface Props {
  open: boolean
  onClose: () => void
  result: ScoringResult | null
}

function scoreColor(score: number) {
  if (score >= 7) return '#22c55e'
  if (score >= 5) return '#f59e0b'
  return '#ef4444'
}

export default function ScoreBreakdown({ open, onClose, result }: Props) {
  if (!result) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>{result.name}</Typography>
        <Typography variant="body2" color="text.secondary">{result.original_filename}</Typography>
      </DialogTitle>

      <DialogContent dividers>
        {/* Overall score */}
        <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="subtitle2" fontWeight={600}>Overall Score</Typography>
            <Typography variant="h5" fontWeight={800} color={scoreColor(result.total_score)}>
              {result.total_score.toFixed(1)} / 10
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={result.total_score * 10}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': { bgcolor: scoreColor(result.total_score), borderRadius: 4 },
            }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            {result.overall_rationale}
          </Typography>
        </Box>

        {/* Per-criterion breakdown */}
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Score Breakdown</Typography>
        {(result.criterion_breakdown || []).map((c, i) => (
          <Accordion key={i} disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mb: 0.5, borderRadius: '8px !important', '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1, pr: 1 }}>
                <Typography variant="body2" fontWeight={600} sx={{ minWidth: 160 }}>{c.criterion}</Typography>
                <Box sx={{ flex: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={c.score * 10}
                    sx={{
                      height: 6,
                      borderRadius: 4,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': { bgcolor: scoreColor(c.score), borderRadius: 4 },
                    }}
                  />
                </Box>
                <Typography variant="body2" fontWeight={700} color={scoreColor(c.score)} sx={{ minWidth: 36, textAlign: 'right' }}>
                  {c.score}/10
                </Typography>
                <Typography variant="caption" color="text.disabled" sx={{ minWidth: 40 }}>
                  ×{Math.round(c.weight * 100)}%
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Typography variant="body2" color="text.secondary">{c.reason}</Typography>
              {c.evidence?.raw_text_references?.length > 0 && (
                <Box sx={{ mt: 1.5, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Evidence in resume:
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={0.5}>
                    {c.evidence.raw_text_references.map((text, i) => (
                      <Chip
                        key={i}
                        label={text}
                        size="small"
                        sx={{
                          bgcolor: 'primary.light',
                          color: 'primary.contrastText',
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'primary.main' },
                          fontSize: '0.7rem'
                        }}
                        onClick={() => {
                          console.log('Highlight in resume:', text);
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        ))}

        {/* Flags */}
        {result.flags?.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 1.5 }} />
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Flags ({result.flags.length})
            </Typography>
            <Stack spacing={1}>
              {result.flags.map((flag, i) => (
                <Box key={i} sx={{ p: 1.5, bgcolor: flag.severity === 'high' ? 'error.50' : flag.severity === 'medium' ? 'warning.50' : 'grey.50', borderRadius: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <FlagBadges flags={[flag]} maxVisible={1} />
                    <Typography variant="body2" color="text.secondary">{flag.description}</Typography>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained" disableElevation>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
