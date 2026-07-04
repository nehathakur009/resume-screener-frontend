import { useDispatch } from 'react-redux'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {
  Box, Button, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Stack, TextField, Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import toast from 'react-hot-toast'

import { AppDispatch } from '../store'
import { createJD } from '../store/apps/scoring'
import { JobDescription } from '../types'

const schema = yup.object({
  title:       yup.string().required('Position title is required'),
  description: yup.string().min(50, 'Must be at least 50 characters').required('Job description is required'),
})

type FormValues = { title: string; description: string }

interface Props {
  open: boolean
  onClose: () => void
  onSaved?: (jd: JobDescription) => void
}

export default function AddJDDialog({ open, onClose, onSaved }: Props) {
  const dispatch = useDispatch<AppDispatch>()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { title: '', description: '' },
  })

  const onSubmit = async (data: FormValues) => {
    try {
      const jd = await dispatch(createJD(data)).unwrap()
      toast.success(`Saved: ${jd.title}`)
      reset()
      onSaved?.(jd)
      onClose()
    } catch (err: any) {
      toast.error(err.message || 'Failed to save JD')
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 0.5 }}>
        Add Job Description
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, fontWeight: 400 }}>
          Save a JD to the library — run scoring against it any time from the history panel.
        </Typography>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          <Stack spacing={2.5}>
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
                  rows={9}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              )}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disableElevation
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
          >
            {isSubmitting ? 'Saving…' : 'Save JD'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
