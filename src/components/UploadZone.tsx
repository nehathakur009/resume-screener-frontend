import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Box, LinearProgress, Typography } from '@mui/material'
import UploadFileIcon from '@mui/icons-material/UploadFile'

interface Props {
  onDrop: (files: File[]) => void
  loading: boolean
}

export default function UploadZone({ onDrop, loading }: Props) {
  const onDropAccepted = useCallback((files: File[]) => onDrop(files), [onDrop])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDropAccepted,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true,
  })

  return (
    <Box>
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          bgcolor: isDragActive ? 'primary.50' : 'grey.50',
          p: 3.5,
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.50' },
        }}
      >
        <input {...getInputProps()} />
        <UploadFileIcon sx={{ fontSize: 40, color: 'primary.light', mb: 0.75 }} />
        <Typography variant="subtitle1" fontWeight={600}>
          {isDragActive ? 'Drop PDFs here…' : 'Drag & drop PDF resumes here'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          or click to browse — multiple files supported
        </Typography>
      </Box>

      {loading && <LinearProgress sx={{ mt: 1, borderRadius: 1 }} />}
    </Box>
  )
}
