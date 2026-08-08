// features/playersDatabase/ui/pages/searchPage/report/DbSearchReportNameModal.js

import * as React from 'react'
import {
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Stack,
  Textarea,
  Typography,
} from '@mui/joy'

import { AnimatedModal } from '../../../../../../ui/patterns/modals/index.js'

const NAME_MIN_LENGTH = 3
const NAME_MAX_LENGTH = 80
const PURPOSE_MIN_LENGTH = 5
const PURPOSE_MAX_LENGTH = 180
const DESCRIPTION_MAX_LENGTH = 1000
function clean(value) {
  return String(value || '').trim()
}

export default function DbSearchReportNameModal({
  open = false,
  busy = false,
  error = '',
  entityType = '',
  onClose,
  onConfirm,
}) {
  const [reportName, setReportName] = React.useState('')
  const [reportPurpose, setReportPurpose] = React.useState('')
  const [reportDescription, setReportDescription] = React.useState('')
  const [submitted, setSubmitted] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    setReportName('')
    setReportPurpose('')
    setReportDescription('')
    setSubmitted(false)
  }, [open])

  const normalizedName = clean(reportName)
  const normalizedPurpose = clean(reportPurpose)
  const normalizedDescription = clean(reportDescription)
  const isNameValid = normalizedName.length >= NAME_MIN_LENGTH && normalizedName.length <= NAME_MAX_LENGTH
  const isPurposeValid = normalizedPurpose.length >= PURPOSE_MIN_LENGTH && normalizedPurpose.length <= PURPOSE_MAX_LENGTH
  const isDescriptionValid = normalizedDescription.length <= DESCRIPTION_MAX_LENGTH
  const isValid = isNameValid && isPurposeValid && isDescriptionValid
  const entityLabel = entityType === 'player' ? 'שחקנים' : 'קבוצות'

  const handleConfirm = () => {
    setSubmitted(true)
    if (!isValid || busy) return

    onConfirm?.({
      reportName: normalizedName,
      reportPurpose: normalizedPurpose,
      reportDescription: normalizedDescription,
    })
  }

  return (
    <AnimatedModal
      open={open}
      size='sm'
      busy={busy}
      disabled={!isValid}
      persistent={busy}
      title='הגדרת מסלול החיפוש'
      description={`הפרטים יישמרו בדוח ${entityLabel} ויסבירו בעתיד מה חיפשת ולשם מה.`}
      iconId='report'
      confirmLabel='צור דוח ופתח'
      confirmIconId='share'
      cancelLabel='ביטול'
      onConfirm={handleConfirm}
      onClose={onClose}
    >
      <Stack spacing={2}>
        <FormControl error={submitted && !isNameValid}>
          <FormLabel>שם הדוח</FormLabel>
          <Input
            autoFocus
            autoComplete='off'
            name='dbSearchReportName'
            value={reportName}
            placeholder='לדוגמה: קבוצות שנתון 2010 בעדיפות התקפית'
            slotProps={{
              input: {
                maxLength: NAME_MAX_LENGTH,
              },
            }}
            onChange={event => setReportName(event.target.value)}
          />
          <FormHelperText>
            {submitted && normalizedName.length < NAME_MIN_LENGTH
              ? `יש להזין לפחות ${NAME_MIN_LENGTH} תווים.`
              : `${normalizedName.length}/${NAME_MAX_LENGTH}`}
          </FormHelperText>
        </FormControl>

        <FormControl error={submitted && !isPurposeValid}>
          <FormLabel>מטרת הדוח</FormLabel>
          <Input
            autoComplete='off'
            name='dbSearchReportPurpose'
            value={reportPurpose}
            placeholder='לדוגמה: איתור קבוצות עם שחקני התקפה מתחת לרדאר'
            slotProps={{
              input: {
                maxLength: PURPOSE_MAX_LENGTH,
              },
            }}
            onChange={event => setReportPurpose(event.target.value)}
          />
          <FormHelperText>
            {submitted && normalizedPurpose.length < PURPOSE_MIN_LENGTH
              ? `יש להזין לפחות ${PURPOSE_MIN_LENGTH} תווים.`
              : `${normalizedPurpose.length}/${PURPOSE_MAX_LENGTH}`}
          </FormHelperText>
        </FormControl>

        <FormControl error={submitted && !isDescriptionValid}>
          <FormLabel>תיאור נוסף</FormLabel>
          <Textarea
            autoComplete='off'
            name='dbSearchReportDescription'
            minRows={4}
            maxRows={8}
            value={reportDescription}
            placeholder='הקשר מקצועי, אופן השימוש המתוכנן בתוצאות או נקודות שחשוב לזכור.'
            slotProps={{
              textarea: {
                maxLength: DESCRIPTION_MAX_LENGTH,
              },
            }}
            onChange={event => setReportDescription(event.target.value)}
          />
          <FormHelperText>
            אופציונלי · {normalizedDescription.length}/{DESCRIPTION_MAX_LENGTH}
          </FormHelperText>
        </FormControl>

        {error ? (
          <Typography level='body-sm' color='danger'>
            {error}
          </Typography>
        ) : null}
      </Stack>
    </AnimatedModal>
  )
}
