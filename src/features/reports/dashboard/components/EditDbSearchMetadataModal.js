import React from 'react'
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Modal,
  ModalDialog,
  Stack,
  Textarea,
} from '@mui/joy'

import {
  normalizeDbSearchMetadataInput,
  validateDbSearchMetadataInput,
} from '../../dbSearch/integration/index.js'

function buildInitialValues(publication) {
  const meta = publication?.reportContent?.meta || {}

  return normalizeDbSearchMetadataInput({
    reportName: meta.reportName || publication?.title || '',
    reportPurpose: meta.reportPurpose || '',
    reportDescription: meta.reportDescription || '',
  })
}

export default function EditDbSearchMetadataModal({
  open = false,
  publication = null,
  loading = false,
  onClose,
  onSave,
}) {
  const [values, setValues] = React.useState(() => buildInitialValues(publication))
  const [errors, setErrors] = React.useState({})

  React.useEffect(() => {
    if (!open) return

    setValues(buildInitialValues(publication))
    setErrors({})
  }, [open, publication])

  function updateField(field, value) {
    setValues(current => ({ ...current, [field]: value }))
    setErrors(current => ({ ...current, [field]: '' }))
  }

  async function handleSave() {
    const validation = validateDbSearchMetadataInput(values)

    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    await onSave?.(validation.metadata)
  }

  return (
    <Modal open={open} onClose={loading ? undefined : onClose}>
      <ModalDialog sx={{ width: 'min(620px, calc(100vw - 32px))' }}>
        <DialogTitle>עריכת פרטי הדוח</DialogTitle>

        <DialogContent>
          כל שמירה יוצרת גרסה חדשה. תוצאות החיפוש ותנאי השאילתה אינם משתנים.
        </DialogContent>

        <Stack spacing={1.5}>
          <FormControl error={Boolean(errors.reportName)} required>
            <FormLabel>שם הדוח</FormLabel>
            <Input
              value={values.reportName}
              onChange={event => updateField('reportName', event.target.value)}
              slotProps={{ input: { maxLength: 80 } }}
            />
            {errors.reportName ? (
              <FormHelperText>{errors.reportName}</FormHelperText>
            ) : null}
          </FormControl>

          <FormControl error={Boolean(errors.reportPurpose)} required>
            <FormLabel>מטרת הדוח</FormLabel>
            <Textarea
              minRows={2}
              value={values.reportPurpose}
              onChange={event => updateField('reportPurpose', event.target.value)}
              slotProps={{ textarea: { maxLength: 180 } }}
            />
            {errors.reportPurpose ? (
              <FormHelperText>{errors.reportPurpose}</FormHelperText>
            ) : null}
          </FormControl>

          <FormControl>
            <FormLabel>תיאור נוסף</FormLabel>
            <Textarea
              minRows={4}
              value={values.reportDescription}
              onChange={event => updateField('reportDescription', event.target.value)}
              slotProps={{ textarea: { maxLength: 1000 } }}
            />
          </FormControl>
        </Stack>

        <DialogActions>
          <Button onClick={handleSave} loading={loading}>
            שמור כגרסה חדשה
          </Button>
          <Button variant='plain' color='neutral' onClick={onClose} disabled={loading}>
            ביטול
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  )
}
