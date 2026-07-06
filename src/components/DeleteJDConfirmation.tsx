import { useDispatch } from 'react-redux'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import toast from 'react-hot-toast'

import { AppDispatch } from '../store'
import { deleteJD } from '../store/apps/scoring'

interface Props {
  open: boolean
  onClose: () => void
  onDeleted: () => void
  jobDescription?: {
    id: number
    title: string
  }
}

export default function DeleteJDConfirmation({ open, onClose, onDeleted, jobDescription }: Props) {
  const dispatch = useDispatch<AppDispatch>()

  const handleConfirm = async () => {
    if (!jobDescription) return

    try {
      await dispatch(deleteJD(jobDescription.id)).unwrap()
      toast.success(`Job description deleted: "${jobDescription.title}"`)
      // Close the dialog after successful deletion
      onClose()
      // Call the onDeleted callback after dialog is closed
      onDeleted()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete job description')
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <DeleteIcon color="error" />
        Delete Job Description
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Are you sure you want to delete the job description:
        </Typography>
        <Typography variant="h6" color="error" sx={{ fontWeight: 600, mb: 2 }}>
          "{jobDescription?.title}"?
        </Typography>
        <Typography variant="body2" color="text-secondary">
          This action cannot be undone. The job description will be permanently removed from the system.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          startIcon={<DeleteIcon />}
        >
          Delete JD
        </Button>
      </DialogActions>
    </Dialog>
  )
}