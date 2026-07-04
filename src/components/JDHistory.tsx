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

export default function FlagBadges({ flags, maxVisible = 3 }: Props) {
  if (!flags?.length) return null

  const visible = flags.slice(0, maxVisible)
  const extra   = flags.length - maxVisible

  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
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
              sx={{ fontSize: '0.7rem', height: 22, cursor: 'help' }}
            />
          </Tooltip>
        )
      })}
      {extra > 0 && (
        <Chip size="small" label={`+${extra} more`} sx={{ fontSize: '0.7rem', height: 22 }} />
      )}
    </Stack>
  )
}
