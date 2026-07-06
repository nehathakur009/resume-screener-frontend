import { useCallback, useState } from 'react'
import { useDropzone, FileRejection } from 'react-dropzone'
import { Alert, Box, LinearProgress, Typography, List, ListItem } from '@mui/material'
import UploadFileIcon from '@mui/icons-material/UploadFile'

const ACCEPT = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
}

const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
const MAX_SIZE_LABEL = '5 MB'

interface Props {
  onDrop: (files: File[]) => void
  loading: boolean
}

export default function UploadZone({ onDrop, loading }: Props) {
  const [rejections, setRejections] = useState<string[]>([])

  const onDropAccepted = useCallback((files: File[]) => {
    setRejections([])
    onDrop(files)
  }, [onDrop])

  const onDropRejected = useCallback((rejected: FileRejection[]) => {
    const errors: string[] = []
    rejected.forEach(({ file, errors: errs }) => {
      const sizeMB = (file.size / 1024 / 1024).toFixed(1)
      errs.forEach((e) => {
        if (e.code === 'file-too-large') {
          errors.push(
            `"${file.name}" is ${sizeMB} MB — exceeds the ${MAX_SIZE_LABEL} limit. Please compress or reduce the file size.`
          )
        } else if (e.code === 'file-invalid-type') {
          errors.push(`"${file.name}" is not a supported format. Only PDF, DOC, and DOCX files are accepted.`)
        } else {
          errors.push(`"${file.name}": ${e.message}`)
        }
      })
    })
    setRejections(errors)
  }, [])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDropAccepted,
    onDropRejected,
    accept: ACCEPT,
    maxSize: MAX_SIZE_BYTES,
    multiple: true,
  })

  const borderColor = isDragReject ? 'error.main' : isDragActive ? 'primary.main' : 'grey.300'
  const bgColor = isDragReject ? '#fff5f5' : isDragActive ? 'primary.50' : 'grey.50'

  return (
    <Box>
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor,
          borderRadius: 2,
          bgcolor: bgColor,
          p: 3.5,
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.50' },
        }}
      >
        <input {...getInputProps()} />
        <UploadFileIcon
          sx={{ fontSize: 40, color: isDragReject ? 'error.light' : 'primary.light', mb: 0.75 }}
        />
        <Typography variant="subtitle1" fontWeight={600}>
          {isDragReject
            ? 'Only PDF, DOC, or DOCX files are allowed'
            : isDragActive
            ? 'Drop resumes here…'
            : 'Drag & drop resumes here'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Upload resumes in PDF, Word (.doc or .docx) format
          <br />
          You can upload multiple files at once, each under 5 MB
        </Typography>
      </Box>

      {rejections.length > 0 && (
        <Alert severity="error" onClose={() => setRejections([])} sx={{ mt: 1 }}>
          <Typography variant="caption" fontWeight={700} display="block" sx={{ mb: 0.5 }}>
            {rejections.length === 1 ? 'File could not be uploaded:' : `${rejections.length} files could not be uploaded:`}
          </Typography>
          <List dense disablePadding sx={{ listStyleType: 'disc', pl: 2 }}>
            {rejections.map((msg, i) => (
              <ListItem key={i} disablePadding sx={{ display: 'list-item' }}>
                <Typography variant="caption">{msg}</Typography>
              </ListItem>
            ))}
          </List>
        </Alert>
      )}

      {loading && <LinearProgress sx={{ mt: 1, borderRadius: 1 }} />}
    </Box>
  )
}