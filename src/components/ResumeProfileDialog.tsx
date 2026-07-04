import {
  Avatar, Box, Chip, Dialog, DialogContent, DialogTitle,
  Divider, IconButton, Paper, Stack, Tooltip, Typography,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import WorkOutlineIcon from '@mui/icons-material/WorkOutline'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import { Resume } from '../types'
import FlagBadges from './FlagBadges'

interface Props {
  open: boolean
  onClose: () => void
  resume: Resume | null
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Typography
      variant="caption"
      fontWeight={700}
      color="text.secondary"
      letterSpacing={0.6}
      sx={{ display: 'block', mb: 1.25 }}
    >
      {children}
    </Typography>
  )
}

function fmtDate(d: string | null | undefined) {
  if (!d || d === 'present') return 'Present'
  try {
    return new Date(d).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
  } catch {
    return d
  }
}

export default function ResumeProfileDialog({ open, onClose, resume }: Props) {
  if (!resume) return null

  const initials = (resume.name ?? '?')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()

  const roles           = resume.roles          ?? []
  const education       = resume.education       ?? []
  const skills          = resume.skills          ?? []
  const certifications  = resume.certifications  ?? []
  const flags           = resume.structural_flags ?? []

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">

      {/* ── Header ── */}
      <DialogTitle sx={{ pb: 1.5 }}>
        <Stack direction="row" alignItems="flex-start" spacing={2}>
          <Avatar
            sx={{
              bgcolor: 'primary.main', width: 48, height: 48,
              fontWeight: 700, fontSize: '1.1rem', flexShrink: 0,
            }}
          >
            {initials}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" fontWeight={700} noWrap>
              {resume.name || 'Unknown Candidate'}
            </Typography>

            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
              {resume.candidate_email && (
                <Stack direction="row" spacing={0.4} alignItems="center">
                  <EmailOutlinedIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                  <Typography variant="caption" color="text.secondary">{resume.candidate_email}</Typography>
                </Stack>
              )}
              {resume.phone && (
                <Stack direction="row" spacing={0.4} alignItems="center">
                  <PhoneOutlinedIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                  <Typography variant="caption" color="text.secondary">{resume.phone}</Typography>
                </Stack>
              )}
              {resume.total_experience_years != null && (
                <Stack direction="row" spacing={0.4} alignItems="center">
                  <AccessTimeOutlinedIcon sx={{ fontSize: 13, color: 'primary.main' }} />
                  <Typography variant="caption" color="primary.main" fontWeight={600}>
                    {Number(resume.total_experience_years).toFixed(1)}y experience
                  </Typography>
                </Stack>
              )}
            </Stack>

            {/* Flags row */}
            {flags.length > 0 && (
              <Box sx={{ mt: 0.75 }}>
                <FlagBadges flags={flags} maxVisible={5} />
              </Box>
            )}
          </Box>

          <Tooltip title="Close">
            <IconButton onClick={onClose} size="small" sx={{ flexShrink: 0 }}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2.5 }}>
        <Stack spacing={3}>

          {/* ── Summary ── */}
          {resume.summary && (
            <Box>
              <SectionLabel>SUMMARY</SectionLabel>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                {resume.summary}
              </Typography>
            </Box>
          )}

          {/* ── Experience ── */}
          {roles.length > 0 && (
            <Box>
              <SectionLabel>EXPERIENCE</SectionLabel>
              <Stack spacing={1.5}>
                {roles.map((role, i) => (
                  <Paper key={i} variant="outlined" sx={{ p: 1.75 }}>
                    <Stack direction="row" spacing={1.5}>
                      <WorkOutlineIcon fontSize="small" color="action" sx={{ mt: 0.25, flexShrink: 0 }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" alignItems="baseline" spacing={1} flexWrap="wrap">
                          <Typography variant="body2" fontWeight={700}>
                            {role.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            @ {role.company}
                          </Typography>
                        </Stack>
                        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.25 }}>
                          {role.start_date ? fmtDate(role.start_date) : '?'} –{' '}
                          {role.is_current ? 'Present' : fmtDate(role.end_date)}
                        </Typography>
                        {role.description && role.description.trim().length > 0 && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', mt: 0.5, lineHeight: 1.7 }}
                          >
                            {role.description}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}

          {/* ── Education ── */}
          {education.length > 0 && (
            <Box>
              <SectionLabel>EDUCATION</SectionLabel>
              <Stack spacing={1}>
                {education.map((edu, i) => (
                  <Stack key={i} direction="row" spacing={1.5} alignItems="flex-start">
                    <SchoolOutlinedIcon fontSize="small" color="action" sx={{ mt: 0.25 }} />
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{edu.degree}</Typography>
                      <Typography variant="body2" color="text.secondary">{edu.institution}</Typography>
                      {edu.field && (
                        <Typography variant="caption" color="text.disabled">{edu.field}</Typography>
                      )}
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Box>
          )}

          {/* ── Skills ── */}
          {skills.length > 0 && (
            <Box>
              <SectionLabel>SKILLS ({skills.length})</SectionLabel>
              <Stack direction="row" flexWrap="wrap" spacing={0.75} useFlexGap>
                {skills.map((s) => (
                  <Chip
                    key={s}
                    label={s}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.72rem', height: 24 }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          {/* ── Certifications ── */}
          {certifications.length > 0 && (
            <Box>
              <SectionLabel>CERTIFICATIONS</SectionLabel>
              <Stack direction="row" flexWrap="wrap" spacing={0.75} useFlexGap>
                {certifications.map((c, i) => (
                  <Chip
                    key={i}
                    label={typeof c === 'string' ? c : JSON.stringify(c)}
                    size="small"
                    color="success"
                    variant="outlined"
                    icon={<EmojiEventsOutlinedIcon />}
                    sx={{ fontSize: '0.72rem', height: 24 }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          {/* ── File info ── */}
          <Box>
            <Divider sx={{ mb: 1.5 }} />
            <Stack direction="row" spacing={3} flexWrap="wrap">
              <Typography variant="caption" color="text.disabled">
                File: {resume.original_filename}
              </Typography>
              {resume.parsed_at && (
                <Typography variant="caption" color="text.disabled">
                  Parsed:{' '}
                  {new Date(resume.parsed_at).toLocaleDateString(undefined, {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </Typography>
              )}
            </Stack>
          </Box>

        </Stack>
      </DialogContent>
    </Dialog>
  )
}
