import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  CircularProgress,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

import { AppDispatch, RootState } from '../store'
import { fetchAverageScoreTrend } from '../store/apps/scoring'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface TrendData {
  date: string
  avg_score: number
  count: number
}

export default function AverageScoreTrend() {
  const dispatch = useDispatch<AppDispatch>()
  const { trendData, trendLoading, trendError } = useSelector((s: RootState) => s.scoring)
  const [period, setPeriod] = useState('30')

  useEffect(() => {
    dispatch(fetchAverageScoreTrend(period))
  }, [dispatch, period])

  const chartData = {
    labels: trendData?.map((item) => new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })) || [],
    datasets: [
      {
        label: 'Daily Average Score',
        data: trendData?.map((item) => item.avg_score) || [],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
        fill: true,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Average: ${context.parsed.y.toFixed(1)} (${context.raw.count} resumes)`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        title: {
          display: true,
          text: 'Average Score (out of 10)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    }
  }

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>Average Score Trend</Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Time Period</InputLabel>
          <Select
            value={period}
            label="Time Period"
            onChange={(e) => setPeriod(e.target.value as string)}
          >
            <MenuItem value="7">Last 7 Days</MenuItem>
            <MenuItem value="30">Last 30 Days</MenuItem>
            <MenuItem value="90">Last 90 Days</MenuItem>
            <MenuItem value="365">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {trendLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {trendError && (
        <Typography color="error" sx={{ py: 2 }}>
          {trendError}
        </Typography>
      )}

      {!trendLoading && !trendError && trendData && trendData.length > 0 ? (
        <Box sx={{ height: 300, mt: 2 }}>
          <Line data={chartData} options={options} />
        </Box>
      ) : !trendLoading && !trendError && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            No score data available yet. Run your first screening to see trends over time.
          </Typography>
        </Box>
      )}
    </Paper>
  )
}