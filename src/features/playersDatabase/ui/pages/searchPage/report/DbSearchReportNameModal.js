import * as React from 'react'
import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Modal,
  ModalClose,
  ModalDialog,
  Stack,
  Typography,
} from '@mui/joy'

import { dbSearchReportNameModalSx as sx } from './dbSearchReportNameModal.sx.js'

const MIN_LENGTH = 3
const MAX_LENGTH = 80
const clean = value => String(value || '').trim()

export default function DbSearchReportNameModal({
  open = false,
  busy = false,
  entityType = '',
  onClose,
  onConfirm,
}) {
  const [reportName, setReportName] = React.useState('')
  const [submitted, setSubmitted] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    setReportName('')
    setSubmitted(false)
  }, [open])

  const normalizedName = clean(reportName)
  const isValid = normalizedName.length >= MIN_LENGTH && normalizedName.length <= MAX_LENGTH
  const entityLabel = entityType === 'player' ? 'שחקנים' : 'קבוצות'

  const handleConfirm = () => {
    setSubmitted(true)
    if (!isValid || busy) return
    onConfirm?.(normalizedName)
  }

  const handleKeyDown = event => {
    if (event.key !== 'Enter') return
    event.preventDefault()
    handleConfirm()
  }

  return (
    <Modal open={open} onClose={busy ? undefined : onClose}>
      <ModalDialog sx={sx.dialog}>
        <ModalClose disabled={busy} />

        <Stack spacing={2}>
          <Stack spacing={0.5} sx={sx.header}>
            <Typography level='title-lg'>שם מסלול החיפוש</Typography>
            <Typography level='body-sm'>
              השם יוצג בדוח {entityLabel} הזה בלבד ואינו משנה את שם סוג הדוח בקטלוג.
            </Typography>
          </Stack>

          <FormControl error={submitted && !isValid}>
            <FormLabel>שם תצוגה לדוח</FormLabel>
            <Input
              autoFocus
              value={reportName}
              placeholder='לדוגמה: מסלול איתור בלמים שנתון 2010'
              slotProps={{ input: { maxLength: MAX_LENGTH } }}
              onChange={event => setReportName(event.target.value)}
              onKeyDown={handleKeyDown}
            />
            <FormHelperText>
              {submitted && normalizedName.length < MIN_LENGTH
                ? `יש להזין לפחות ${MIN_LENGTH} תווים.`
                : `${normalizedName.length}/${MAX_LENGTH}`}
            </FormHelperText>
          </FormControl>

          <Stack direction='row' justifyContent='flex-end' spacing={1}>
            <Button variant='plain' color='neutral' disabled={busy} onClick={onClose}>
              ביטול
            </Button>
            <Button loading={busy} onClick={handleConfirm}>
              המשך לתצוגה
            </Button>
          </Stack>
        </Stack>
      </ModalDialog>
    </Modal>
  )
}
