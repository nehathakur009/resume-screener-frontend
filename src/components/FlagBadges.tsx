import { Chip, Stack, Tooltip } from '@mui/material'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { Flag } from '../types'

const severityConfig = {
  high:   { color: 'error'   as const, Icon: ErrorOutlineIcon  },
  medium: { color: 'warning' as const, Icon: WarningAmberIcon  },
  low:    { color: 'default' as const, Icon: InfoOutlinedIcon  },
}

const labelMap: Record<string, string> = {
  date_overlap:              'Date Overlap',
  experience_exaggeration:   'Exp. Exaggeration',
  employment_gap:            'Employment Gap',
  skill_inflation:           'Skill Inflation',
  vague_claims:              'Vague Claims',
  contradictory_level:       'Contradictory Level',
  unexplained_gap:           'Unexplained Gap',
  unverifiable_timeline:     'No Timeline',
  partial_dates:             'Partial Dates',
  missing_role_details:      'Thin Descriptions',
  skill_padding:             'Skill Padding',
}

interface Props {
  flags: Flag[]
  maxVisible?: number
}

export default function FlagBadges({ flags, maxVisible = 1 }: Props) {
  if (!flags?.length) return null

  const visible = flags.slice(0, maxVisible)
  const hidden  = flags.slice(maxVisible)
  const extra   = hidden.length

  const tooltipContent = hidden
    .map((f) => labelMap[f.type] ?? f.type.replace(/_/g, ' '))
    .join(', ')

  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      {visible.map((flag, i) => {
        const cfg  = severityConfig[flag.severity] ?? severityConfig.low
        const Icon = cfg.Icon
        const label = labelMap[flag.type] ?? flag.type.replace(/_/g, ' ')
        return (
          <Tooltip key={i} title={flag.description} arrow placement="top">
            <Chip
              size="small"
              color={cfg.color}
              icon={<Icon fontSize="small" />}
              label={label}
              sx={{ fontSize: '0.68rem', height: 20, cursor: 'help' }}
            />
          </Tooltip>
        )
      })}
      {extra > 0 && (
        <Tooltip title={tooltipContent} arrow placement="top">
          <Chip
            size="small"
            label={`+${extra}`}
            sx={{ fontSize: '0.68rem', height: 20, cursor: 'help', fontWeight: 600 }}
          />
        </Tooltip>
      )}
    </Stack>
  )
}
