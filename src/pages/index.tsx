import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Avatar, Box, Chip, Grid, LinearProgress, Paper, Stack, Tooltip, Typography,
} from '@mui/material'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import WorkOutlineIcon from '@mui/icons-material/WorkOutline'
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined'
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
  AreaChart, Area,
  LineChart, Line, ReferenceLine
} from 'recharts'

import { AppDispatch, RootState } from '../store'
import { fetchResumes } from '../store/apps/resumes'
import { fetchAllJDs, fetchAllResults } from '../store/apps/scoring'

/* ── helpers ──────────────────────────────────────────────── */

const SCORE_BUCKETS = [
  { range: '0 – 25', min: 0, max: 25, color: '#EF4444' },
  { range: '26 – 50', min: 26, max: 50, color: '#F97316' },
  { range: '51 – 75', min: 51, max: 75, color: '#EAB308' },
  { range: '76 – 100',min: 76, max: 100, color: '#22C55E' },
]

const JD_COLORS = ['#2563EB', '#7C3AED', '#059669', '#D97706', '#EF4444', '#0891B2']

function scoreColor(score: number) {
  if (score >= 76) return '#22C55E'
  if (score >= 51) return '#EAB308'
  if (score >= 26) return '#F97316'
  return '#EF4444'
}

/* ── sub-components ───────────────────────────────────────── */

function StatCard({
  icon, label, value, color,
}: {
  icon: React.ReactNode; label: string; value: string | number; color: string
}) {
  return (
    <Paper sx={{ p: 2.5 }}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box sx={{ p: 1.1, borderRadius: 2, bgcolor: `${color}18`, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <Box sx={{ color, display: 'flex', alignItems: 'center' }}>{icon}</Box>
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1.1 }}>{value}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: 'block', lineHeight: 1.3 }}>
            {label}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  )
}

function ChartCard({ title, subtitle, children, minHeight = 260 }: {
  title: string; subtitle?: string; children: React.ReactNode; minHeight?: number
}) {
  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="subtitle1" fontWeight={700}>{title}</Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
        )}
      </Box>
      <Box sx={{ minHeight }}>{children}</Box>
    </Paper>
  )
}

function EmptyChart({ message }: { message: string }) {
  return (
    <Box sx={{
      height: '100%', minHeight: 200, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 1,
      }}>
      <AssessmentOutlinedIcon sx={{ fontSize: 36, color: 'text.disabled' }} />
      <Typography variant="body2" color="text.disabled">{message}</Typography>
    </Box>
  )
}

/* ── custom tooltip ───────────────────────────────────────── */

function BarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <Paper sx={{ p: 1.5, fontSize: 13 }} elevation={3}>
      <Typography variant="caption" fontWeight={600}>{label}</Typography>
      <br />
      <Typography variant="caption" color="text.secondary">
        {payload[0].name}: <strong>{payload[0].value}</strong>
      </Typography>
    </Paper>
  )
}

/* ── main page ────────────────────────────────────────────── */

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { total } = useSelector((s: RootState) => s.resumes)
  const { jdList, allResults } = useSelector((s: RootState) => s.scoring)

  useEffect(() => {
    dispatch(fetchResumes())
    dispatch(fetchAllJDs())
    dispatch(fetchAllResults())
  }, [dispatch])

  /* ── derived chart data ─────────────────────────────────── */

  const avgScore = useMemo(
    () => allResults.length
      ? Math.round(allResults.reduce((s, r) => s + r.total_score, 0) / allResults.length)
      : null,
    [allResults],
  )

  const scoreDist = useMemo(() =>
    SCORE_BUCKETS.map((b) => ({
      ...b,
      count: allResults.filter((r) => r.total_score >= b.min && r.total_score <= b.max).length,
    })),
    [allResults],
  )

  const jdData = useMemo(() =>
    jdList
      .map((jd) => ({
        name: jd.title.length > 22 ? jd.title.slice(0, 22) + '…' : jd.title,
        fullName: jd.title,
        count: allResults.filter((r) => r.jd_id === jd.id).length,
      }))
      .filter((d) => d.count > 0),
    [jdList, allResults],
  )

  const trendData = useMemo(() => {
    const byDate: Record<string, number[]> = {}
    allResults.forEach((r) => {
      const key = new Date(r.scored_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      ;(byDate[key] ??= []).push(r.total_score)
    })
    return Object.entries(byDate).map(([date, scores]) => ({
      date,
      avg: Math.round(scores.reduce((s, v) => s + v, 0) / scores.length),
      count: scores.length,
    }))
  }, [allResults])

  const topCandidates = useMemo(
    () => [...allResults].sort((a, b) => b.total_score - a.total_score).slice(0, 5),
    [allResults],
  )

  const recent = useMemo(
    () => [...allResults]
      .sort((a, b) => new Date(b.scored_at).getTime() - new Date(a.scored_at).getTime())
      .slice(0, 5),
    [allResults],
  )

  const hasData = allResults.length > 0

  return (
    <Box sx={{ py: 4, px: 4, pb: 8 }}>

    {/* ── Page header ── */}
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" fontWeight={800} letterSpacing={-0.5}>Dashboard</Typography>
      <Typography variant="body2" color="text.secondary">
        Overview of your resume screening activity
      </Typography>
    </Box>

    {/* ── Stat cards ── */}
    <Grid container spacing={2.5} sx={{ mb: 3 }}>
      {[
        { icon: <DescriptionOutlinedIcon sx={{ fontSize: 20 }} />, label: 'Resumes in System', value: total, color: '#2563EB' },
        { icon: <WorkOutlineIcon sx={{ fontSize: 20 }} />, label: 'Job Descriptions', value: jdList.length, color: '#7C3AED' },
        { icon: <AssessmentOutlinedIcon sx={{ fontSize: 20 }} />, label: 'Screenings Run', value: allResults.length, color: '#059669' },
        { icon: <EmojiEventsOutlinedIcon sx={{ fontSize: 20 }}/>, label: 'Avg Score', value: avgScore !== null ? `${avgScore}%` : '—', color: '#D97706' },
      ].map(({ icon, label, value, color }) => (
        <Grid key={label} item xs={12} sm={6} md={3}>
          <StatCard icon={icon} label={label} value={value} color={color} />
        </Grid>
      ))}
    </Grid>

    {/* ── Charts row 1: Score Distribution + JD Breakdown ── */}
    <Grid container spacing={2.5} sx={{ mb: 3 }}>

    {/* Score Distribution */}
    <Grid item xs={12} md={7}>
      <ChartCard
        title="Score Distribution"
        subtitle="Number of candidates in each score range"
      >
        {!hasData ? (
          <EmptyChart message="Run a screening to see score distribution" />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={scoreDist} barSize={52} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="range" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <ChartTooltip content={<BarTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
              <Bar dataKey="count" name="Candidates" radius={[6, 6, 0, 0]}>
                {scoreDist.map((entry) => (
                  <Cell key={entry.range} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </Grid>

    {/* Screenings by JD */}
    <Grid item xs={12} md={5}>
      <ChartCard
        title="Screenings by Job Description"
        subtitle="Candidates screened per JD"
      >
        {jdData.length === 0 ? (
          <EmptyChart message="No screenings yet" />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={jdData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="45%"
                outerRadius={80}
                innerRadius={46}
                paddingAngle={3}
              >
                {jdData.map((_, i) => (
                  <Cell key={i} fill={JD_COLORS[i % JD_COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip
                formatter={(val: number, _name: string, props: any) => [
                  `${val} candidate${val !== 1 ? 's' : ''}`,
                  props.payload.fullName,
                ]}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span style={{ fontSize: 12, color: '#64748b' }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </Grid>
    </Grid>

    {/* ── Charts row 2: Score Trend + Top Candidates ── */}
    <Grid container spacing={2.5} sx={{ mb: 3 }}>

    {/* Score Trend */}
    <Grid item xs={12} md={7}>
      <ChartCard
        title="Average Score Trend"
        subtitle="Daily average candidate scores over time"
      >
        {trendData.length < 2 ? (
          <EmptyChart message={trendData.length === 0 ? 'No trend data yet' : 'Need more sessions to show a trend'} />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trendData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                unit="%"
                width={60}
              />
              <ChartTooltip
                formatter={(val: number, name: string, props: any) => [`${val}%`, 'Avg Score', props.payload.count > 1 ? `${props.payload.count} resumes` : '1 resume']}
                labelStyle={{ fontWeight: 600 }}
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '12px',
                }}
              />
              <Legend
                align="right"
                verticalAlign="top"
                wrapperStyle={{
                  marginTop: '20px',
                  marginBottom: '10px',
                }}
              />
              <Line
                type="monotone"
                dataKey="avg"
                stroke="#2563EB"
                strokeWidth={3}
                fill="url(#scoreGrad)"
                dot={{ r: 5, fill: '#2563EB', strokeWidth: 0 }}
                activeDot={{ r: 7, strokeWidth: 1, stroke: '#2563EB' }}
                strokeWidth={2.5}
              />
              <ReferenceLine y={70} stroke="#10B981" strokeDasharray="5 5" label={{
                position: 'top',
                value: 'Target: 70%',
                fill: '#10B981',
                fontWeight: 'bold',
                fontSize: 12
              }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </Grid>

    {/* Top Candidates */}
    <Grid item xs={12} md={5}>
      <ChartCard title="Top Candidates" subtitle="Highest-scoring across all screenings" minHeight={240}>
        {topCandidates.length === 0 ? (
          <EmptyChart message="No candidates scored yet" />
        ) : (
          <Stack spacing={1.75} sx={{ pt: 0.5 }}>
            {topCandidates.map((r, idx) => {
              const initials = (r.name ?? '?')
                .split(' ').slice(0, 2).map((w) => w[0] ?? '').join('').toUpperCase()
              const color = scoreColor(r.total_score)
              return (
                <Stack key={r.id} direction="row" alignItems="center" spacing={1.5}>
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    sx={{ color: 'text.disabled', minWidth: 16, textAlign: 'center' }}
                  >
                    {idx + 1}
                  </Typography>
                  <Avatar sx={{ width: 32, height: 32, fontSize: '0.7rem', fontWeight: 700, bgcolor: color }}>
                    {initials}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 130 }}>
                        {r.name || '—'}
                      </Typography>
                      <Chip
                        label={`${r.total_score}%`}
                        size="small"
                        sx={{
                          fontWeight: 700, fontSize: '0.7rem',
                          bgcolor: `${color}18`, color, border: 'none',
                        }}
                        variant="outlined"
                      />
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={r.total_score}
                      sx={{
                        mt: 0.5, height: 4, borderRadius: 2,
                        bgcolor: '#f1f5f9',
                        '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 2 },
                      }}
                    />
                    <Typography variant="caption" color="text.disabled" noWrap>
                      {r.jd_title}
                    </Typography>
                  </Box>
                </Stack>
              )
            })}
          </Stack>
        )}
      </ChartCard>
    </Grid>
    </Grid>

    {/* ── Recent Screenings ── */}
    <Paper sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ flex: 1 }}>Recent Screenings</Typography>
        <Typography variant="caption" color="text.secondary">{recent.length} of {allResults.length} shown</Typography>
      </Stack>
      {recent.length === 0 ? (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <AssessmentOutlinedIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Go to Screen Resumes to screen candidates against a job description.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1}>
          {recent.map((r) => {
            const initials = (r.name ?? '?')
              .split(' ').slice(0, 2).map((w) => w[0] ?? '').join('').toUpperCase()
            const color = scoreColor(r.total_score)
            const skills = (r.skills ?? []).slice(0, 2)
            const extraSkills = (r.skills ?? []).length - skills.length
            const allSkills = (r.skills ?? []).join(', ')
            const flags = r.flags ?? []
            const flagTooltip = flags.map((f) => `${f.type.replace(/_/g, ' ')} (${f.severity})`).join('\n')
            const scoreBreakdown = r.criterion_breakdown
              ? Object.entries(r.criterion_breakdown)
                .map(([k, v]: [string, any]) => `${k.replace(/_/g, ' ')}: ${v?.score ?? '—'}`)
                .join('\n')
              : null
            return (
              <Stack
                key={r.id}
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{
                  py: 1.5, px: 2, borderRadius: 2, bgcolor: 'grey.50',
                  '&:hover': { bgcolor: 'grey.100' }, transition: 'background 0.15s',
                }}
              >
                {/* Avatar + rank */}
                <Tooltip title={`Rank #${r.rank ?? '—'}`} arrow placement="top">
                  <Box sx={{ position: 'relative', flexShrink: 0, cursor: 'default' }}>
                    <Avatar sx={{ width: 38, height: 38, fontSize: '0.75rem', fontWeight: 700, bgcolor: color }}>
                      {initials}
                    </Avatar>
                    {r.rank && r.rank <= 3 && (
                      <Box sx={{
                        position: 'absolute', bottom: -2, right: -4,
                        width: 16, height: 16, borderRadius: '50%',
                        bgcolor: r.rank === 1 ? '#f59e0b' : r.rank === 2 ? '#94a3b8' : '#cd7f32',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.5rem', fontWeight: 800, color: 'white', border: '1.5px solid white',
                      }}>
                        {r.rank}
                      </Box>
                    )}
                  </Box>
                </Tooltip>

                {/* Name + email + JD */}
                <Tooltip
                  title={[r.name, r.candidate_email].filter(Boolean).join(' · ')}
                  arrow placement="top"
                >
                  <Box sx={{ minWidth: 0, width: 180, cursor: 'default' }}>
                    <Typography variant="body2" fontWeight={700} noWrap>{r.name || '—'}</Typography>
                    {r.candidate_email && (
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                        {r.candidate_email}
                      </Typography>
                    )}
                    <Typography variant="caption" color="primary.main" noWrap fontWeight={500}>
                      {r.jd_title}
                    </Typography>
                  </Box>
                </Tooltip>

                {/* Experience */}
                <Tooltip title="Total years of work experience" arrow placement="top">
                  <Box sx={{ minWidth: 60, textAlign: 'center', flexShrink: 0, cursor: 'default' }}>
                    <Typography variant="caption" color="text.disabled" display="block">Exp.</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {r.total_experience_years ? `${Number(r.total_experience_years).toFixed(1)}y` : '—'}
                    </Typography>
                  </Box>
                </Tooltip>

                {/* Skills */}
                <Tooltip title={allSkills || 'No skills listed'} arrow placement="top">
                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flex: 1, minWidth: 0, cursor: 'default' }} flexWrap="wrap" useFlexGap>
                    {skills.map((s) => (
                      <Chip key={s} label={s} size="small" sx={{ height: 18, fontSize: '0.6rem' }} />
                    ))}
                    {extraSkills > 0 && (
                      <Typography variant="caption" color="text.disabled">+{extraSkills}</Typography>
                    )}
                  </Stack>
                </Tooltip>

                {/* Flags */}
                <Tooltip
                  title={flags.length > 0 ? flagTooltip : 'No issues detected'}
                  arrow
                  placement="top"
                  sx={{ whiteSpace: 'pre-line' }}
                >
                  <Box sx={{ minWidth: 80, flexShrink: 0, cursor: 'default' }}>
                    {flags.length === 0 ? (
                      <Chip label="Clean" size="small" color="success" variant="outlined" sx={{ fontSize: '0.62rem', height: 18 }} />
                    ) : (
                      <Chip
                        label={`${flags.length} flag${flags.length > 1 ? 's' : ''}`}
                        size="small"
                        color={flags.some((f) => f.severity === 'high') ? 'error' : 'warning'}
                        sx={{ fontSize: '0.62rem', height: 18 }}
                      />
                    )}
                  </Box>
                </Tooltip>

                {/* Score */}
                <Tooltip
                  title={scoreBreakdown ?? `Score: ${r.total_score.toFixed(1)} / 10`}
                  arrow
                  placement="top"
                  componentsProps={{ tooltip: { sx: { whiteSpace: 'pre-line' } } }}
                >
                  <Box sx={{ minWidth: 110, flexShrink: 0, cursor: 'default' }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.4 }}>
                      <Typography variant="caption" color="text.secondary">Score</Typography>
                      <Typography variant="caption" fontWeight={700} sx={{ color }}>
                        {r.total_score.toFixed(1)}/10
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={r.total_score * 10}
                      sx={{
                        height: 5, borderRadius: 2, bgcolor: '#f1f5f9',
                        '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 2 },
                      }}
                    />
                  </Box>
                </Tooltip>

                {/* Date */}
                <Tooltip title={new Date(r.scored_at).toLocaleString()} arrow placement="top">
                  <Typography variant="caption" color="text.secondary" sx={{ minWidth: 44, textAlign: 'right', flexShrink: 0, cursor: 'default' }}>
                    {new Date(r.scored_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </Typography>
                </Tooltip>
              </Stack>
            )
          })}
        </Stack>
      )}
    </Paper>

    </Box>
  )
}