import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {
  Box, TextField, Button, Stack, Typography,
  CircularProgress, Alert,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

const schema = yup.object({
  title:       yup.string().required('Position title is required'),
  description: yup.string().min(50, 'Must be at least 50 characters').required('Job description is required'),
})

type FormValues = { title: string; description: string }

interface Props {
  onSubmit: (data: FormValues) => void
  resumeCount: number
  loading: boolean
}

export default function JDInput({ onSubmit, resumeCount, loading }: Props) {
  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { title: '', description: '' },
  })

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      {resumeCount === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Upload at least one resume first, then paste the job description here.
        </Alert>
      )}

      <Stack spacing={2}>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Position Title"
              placeholder="e.g. Senior Full-Stack Engineer"
              fullWidth
              size="small"
              error={!!errors.title}
              helperText={errors.title?.message}
            />
          )}
        />

        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Job Description"
              placeholder="Paste the full job description here…"
              fullWidth
              multiline
              rows={8}
              error={!!errors.description}
              helperText={errors.description?.message}
            />
          )}
        />

        <Box>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading || resumeCount === 0}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SearchIcon />}
            disableElevation
          >
            {loading
              ? 'Screening…'
              : `Screen ${resumeCount > 0 ? resumeCount : ''} Resume${resumeCount !== 1 ? 's' : ''}`}
          </Button>
          {resumeCount > 0 && !loading && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
              Each resume will be scored against this job description using 5 transparent criteria.
            </Typography>
          )}
        </Box>
      </Stack>
    </Box>
  )
}
