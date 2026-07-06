import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {
  Box, Button, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Stack, TextField, Typography,
} from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import toast from 'react-hot-toast'

import { AppDispatch } from '../store'
import { updateJD } from '../store/apps/scoring'
import { JobDescription } from '../types'

const TITLE_MAX = 150
const DESC_MIN = 50
const DESC_MAX = 10000

const schema = yup.object({
  title: yup
    .string()
    .required('Position title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(TITLE_MAX, `Title must not exceed ${TITLE_MAX} characters`),
  description: yup
    .string()
    .required('Job description is required')
    .min(DESC_MIN, `Description must be at least ${DESC_MIN} characters`)
    .max(DESC_MAX, `Description must not exceed ${DESC_MAX} characters`),
})

type FormValues = { title: string; description: string }

function charCount(val: string, max: number) {
  const n = val?.length ?? 0
  return `${n} / ${max}`
}

interface Props {
  open: boolean
  onClose: () => void
  jobDescription: JobDescription | null
  onSaved?: (jd: JobDescription) => void
}

export default function EditJDDialog({ open, onClose, jobDescription, onSaved }: Props) {
  const dispatch = useDispatch<AppDispatch>()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid, isSubmitted },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: ''
    },
    mode: 'onTouched', // validate when user leaves a field
  })

  // Reset form when jobDescription changes and dialog is open
  useEffect(() => {
    if (open && jobDescription) {
      console.log('Resetting form with jobDescription:', jobDescription)
      reset({
        title: jobDescription.title || '',
        description: jobDescription.description || ''
      })
    } else if (open && !jobDescription) {
      console.log('Resetting form to empty values as jobDescription is null')
      reset({ title: '', description: '' })
    }
  }, [open, jobDescription, reset])

  // Log for debugging
  useEffect(() => {
    console.log('EditJDDialog: jobDescription prop changed:', jobDescription)
  }, [jobDescription])

  const onSubmit = async (data: FormValues) => {
    if (!jobDescription) return

    try {
      const jd = await dispatch(updateJD({
        id: jobDescription.id,
        title: data.title,
        description: data.description
      })).unwrap()

      const shortTitle = jd.title.length > 40 ? jd.title.slice(0, 40) + '…' : jd.title
      toast.success(`Job description updated: "${shortTitle}"`)
      reset()
      onSaved?.(jd)
      onClose()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update JD')
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 0.5 }}>
        Edit Job Description
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, fontWeight: 400 }}>
          Update the job description and save changes.
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
                  inputProps={{ maxLength: TITLE_MAX }}
                  error={!!errors.title}
                  helperText={
                    <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography component="span" variant="caption" color={errors.title ? 'error.main' : 'text.disabled'}>
                        {errors.title?.message ?? 'Required · min 3 characters'}
                      </Typography>
                      <Typography component="span" variant="caption"
                        color={(field.value?.length ?? 0) > TITLE_MAX * 0.9 ? 'warning.main' : 'text.disabled'}
                      >
                        {charCount(field.value, TITLE_MAX)}
                      </Typography>
                    </Box>
                  }
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
                  inputProps={{ maxLength: DESC_MAX }}
                  error={!!errors.description}
                  helperText={
                    <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography component="span" variant="caption" color={errors.description ? 'error.main' : 'text.disabled'}>
                        {errors.description?.message ?? `Required · min ${DESC_MIN} characters`}
                      </Typography>
                      <Typography component="span" variant="caption"
                        color={(field.value?.length ?? 0) > DESC_MAX * 0.9 ? 'warning.main' : 'text.disabled'}
                      >
                        {charCount(field.value, DESC_MAX)}
                      </Typography>
                    </Box>
                  }
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
            disabled={isSubmitting || (isSubmitted && !isValid)}
            startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <EditOutlinedIcon />}
          >
            {isSubmitting ? 'Saving…' : 'Update JD'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}