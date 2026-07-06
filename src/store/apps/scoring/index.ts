import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'
import { JobDescription, ScoringResult } from '../../../types'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

// Add logging to verify the API URL
console.log('API base URL:', API)

export const createJD = createAsyncThunk(
  'scoring/createJD',
  async (payload: { title: string; description: string }) => {
    const url = `${API}/jd`
    console.log('Creating JD with URL:', url)
    const res = await axios.post<{ data: JobDescription }>(url, payload)
    return res.data.data
  }
)

export const fetchAllJDs = createAsyncThunk('scoring/fetchAllJDs', async () => {
  const url = `${API}/jd`
  console.log('Fetching all JDs with URL:', url)
  const res = await axios.get<{ data: JobDescription[] }>(url)
  return res.data.data
})

export const updateJD = createAsyncThunk(
  'scoring/updateJD',
  async (payload: { id: number; title: string; description: string }) => {
    const url = `${API}/jd/${payload.id}`
    console.log('Updating JD with URL:', url, 'and data:', payload)
    const res = await axios.put<{ data: JobDescription }>(url, {
      title: payload.title,
      description: payload.description,
    })
    return res.data.data
  }
)

export const deleteJD = createAsyncThunk(
  'scoring/deleteJD',
  async (id: number) => {
    const url = `${API}/jd/${id}`
    console.log('Deleting JD with URL:', url)
    await axios.delete(url)
    return id
  }
)

export const runScoring = createAsyncThunk(
  'scoring/run',
  async (payload: { jd_id: number; resume_ids?: number[] }) => {
    const url = `${API}/scoring/run`
    console.log('Running scoring with URL:', url, 'and payload:', payload)
    const res = await axios.post<{ data: ScoringResult[]; total_scored: number; failed: number }>(
      url,
      payload
    )
    return res.data
  }
)

export const fetchResults = createAsyncThunk('scoring/fetchResults', async (jd_id: number) => {
  const url = `${API}/scoring/results/${jd_id}`
  console.log('Fetching results with URL:', url)
  const res = await axios.get<{ data: ScoringResult[] }>(url)
  return res.data.data
})

export const fetchAllResults = createAsyncThunk('scoring/fetchAllResults', async () => {
  const url = `${API}/scoring/results`
  console.log('Fetching all results with URL:', url)
  const res = await axios.get<{ data: ScoringResult[] }>(url)
  return res.data.data
})

export const fetchAverageScoreTrend = createAsyncThunk(
  'scoring/fetchAverageScoreTrend',
  async (period: string) => {
    const url = `${API}/scoring/trend?days=${period}`
    console.log('Fetching average score trend with URL:', url)
    const res = await axios.get<{ data: TrendData[], period: number }>(url)
    return res.data
  }
)

interface TrendData {
  date: string
  avg_score: number
  count: number
}

interface ScoringState {
  currentJD: JobDescription | null
  jdList: JobDescription[]
  results: ScoringResult[]
  allResults: ScoringResult[]
  trendData: TrendData[]
  trendLoading: boolean
  trendError: string | null
  scoringStatus: 'idle' | 'loading' | 'success' | 'failed'
  error: string | null
}

const initialState: ScoringState = {
  currentJD: null,
  jdList: [],
  results: [],
  allResults: [],
  trendData: [],
  trendLoading: false,
  trendError: null,
  scoringStatus: 'idle',
  error: null,
}

const scoringSlice = createSlice({
  name: 'scoring',
  initialState,
  reducers: {
    clearResults: (state) => {
      state.results = []
      state.currentJD = null
      state.scoringStatus = 'idle'
    },
    setCurrentJD: (state, action) => {
      state.currentJD = action.payload
    },
    setTrendLoading: (state) => {
      state.trendLoading = true
      state.trendError = null
    },
    setTrendSuccess: (state, action) => {
      state.trendLoading = false
      state.trendData = action.payload.data
    },
    setTrendError: (state, action) => {
      state.trendLoading = false
      state.trendError = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createJD.fulfilled, (state, action) => {
        state.currentJD = action.payload
        state.jdList = [action.payload, ...state.jdList.filter((j) => j.id !== action.payload.id)]
      })
      .addCase(fetchAllJDs.fulfilled, (state, action) => { state.jdList = action.payload })
      .addCase(updateJD.fulfilled, (state, action) => {
        state.currentJD = action.payload
        state.jdList = state.jdList.map(jd =>
          jd.id === action.payload.id ? action.payload : jd
        )
      })
      .addCase(deleteJD.fulfilled, (state, action) => {
        state.jdList = state.jdList.filter(jd => jd.id !== action.payload)
      })

      .addCase(runScoring.pending, (state) => { state.scoringStatus = 'loading'; state.error = null })
      .addCase(runScoring.fulfilled, (state, action) => {
        state.scoringStatus = 'success'
        state.results = action.payload.data
      })
      .addCase(runScoring.rejected, (state, action) => {
        state.scoringStatus = 'failed'
        state.error = action.error.message ?? 'Scoring failed'
      })

      .addCase(fetchResults.fulfilled, (state, action) => { state.results = action.payload })
      .addCase(fetchAllResults.fulfilled, (state, action) => { state.allResults = action.payload })

      .addCase(fetchAverageScoreTrend.pending, (state) => {
        state.trendLoading = true
        state.trendError = null
      })
      .addCase(fetchAverageScoreTrend.fulfilled, (state, action) => {
        state.trendLoading = false
        state.trendData = action.payload.data
      })
      .addCase(fetchAverageScoreTrend.rejected, (state, action) => {
        state.trendLoading = false
        state.trendError = action.error.message ?? 'Failed to load trend data'
      })
  },
})

export const { clearResults, setCurrentJD, setTrendLoading, setTrendSuccess, setTrendError } = scoringSlice.actions
export default scoringSlice.reducer