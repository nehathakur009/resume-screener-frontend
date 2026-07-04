import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'
import { Resume, UploadResult } from '../../../types'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export const uploadResume = createAsyncThunk(
  'resumes/upload',
  async (formData: FormData) => {
    const res = await axios.post<UploadResult>(`${API}/resumes`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  }
)

export const fetchResumes = createAsyncThunk('resumes/fetchAll', async () => {
  const res = await axios.get<{ data: Resume[]; total: number }>(`${API}/resumes`)
  return res.data
})

export const deleteResume = createAsyncThunk('resumes/delete', async (id: number) => {
  await axios.delete(`${API}/resumes/${id}`)
  return id
})

interface ResumesState {
  list: Resume[]
  total: number
  uploadResults: UploadResult[]
  status: 'idle' | 'loading' | 'success' | 'failed'
  error: string | null
}

const initialState: ResumesState = {
  list: [],
  total: 0,
  uploadResults: [],
  status: 'idle',
  error: null,
}

const resumesSlice = createSlice({
  name: 'resumes',
  initialState,
  reducers: {
    clearUploadResults: (state) => { state.uploadResults = [] },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadResume.pending,   (state) => { state.status = 'loading'; state.error = null })
      .addCase(uploadResume.fulfilled, (state, action) => {
        state.status = 'success'
        state.uploadResults.push(action.payload)
        const idx = state.list.findIndex((r) => r.id === action.payload.data.id)
        if (idx === -1) {
          // Genuinely new resume — prepend to list
          state.list.unshift(action.payload.data)
          state.total += 1
        } else {
          // Duplicate filename → update the existing entry in place (refreshed parse)
          state.list[idx] = action.payload.data
        }
      })
      .addCase(uploadResume.rejected,  (state, action) => { state.status = 'failed'; state.error = action.error.message ?? 'Upload failed' })

      .addCase(fetchResumes.pending,   (state) => { state.status = 'loading' })
      .addCase(fetchResumes.fulfilled, (state, action) => {
        state.status = 'success'
        state.list   = action.payload.data
        state.total  = action.payload.total
      })
      .addCase(fetchResumes.rejected,  (state, action) => { state.status = 'failed'; state.error = action.error.message ?? 'Fetch failed' })

      .addCase(deleteResume.fulfilled, (state, action) => {
        state.list  = state.list.filter((r) => r.id !== action.payload)
        state.total = Math.max(0, state.total - 1)
        state.uploadResults = state.uploadResults.filter((u) => u.resume_id !== action.payload)
      })
  },
})

export const { clearUploadResults } = resumesSlice.actions
export default resumesSlice.reducer
