// src/features/playersDatabase/ui/pages/DataOpsPage/components/SystemAuditRepairDialog.js

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalClose,
  ModalDialog,
  Option,
  Select,
  Typography,
} from '@mui/joy'
import { Link } from 'react-router-dom'

import { focusedAuditFindingsSx as findingSx } from '../sx/focusedAuditFindings.sx.js'
import { systemAuditRepairSx as sx } from '../sx/systemAuditRepair.sx.js'

const CHANGE_LABELS = {
  create: 'יצירה',
  update: 'עדכון',
  set: 'שמירה',
  delete: 'מחיקה',
  remove: 'הסרה',
  move: 'העברה',
}

export default function SystemAuditRepairDialog({
  pending,
  preparing,
  repairing,
  onInputChange,
  onRefresh,
  onClose,
  onConfirm,
}) {
  if (!pending) return null
  const preview = pending.preview || {}
  const fields = Array.isArray(preview.fields) ? preview.fields : []
  const changes = Array.isArray(preview.changes) ? preview.changes : []
  const busy = preparing || repairing
  const requiredMissing = fields.some(field => (
    field.required && !String(pending.input[field.name] || '').trim()
  ))
  const ready = preview.allowed && preview.previewKey && !requiredMissing && !preview.skipped && !preview.reload
  const reload = preview.reload

  return (
    <Modal open onClose={busy ? undefined : onClose}>
      <ModalDialog sx={findingSx.dialog}>
        <ModalClose disabled={busy} />
        <DialogTitle>הצעת תיקון</DialogTitle>
        <DialogContent className='dpScrollThin' sx={findingSx.dialogContent}>
          <Typography level='title-sm'>{pending.finding.title || pending.finding.type}</Typography>
          <Typography level='body-sm'>{pending.finding.reason}</Typography>
          <Typography component='code' level='body-xs' sx={sx.documentId}>
            {pending.finding.documentId || pending.finding.relatedDocumentId}
          </Typography>
          <Typography level='body-sm'>
            {preview.description || pending.action.description}
          </Typography>

          {preparing ? (
            <Box role='status' sx={sx.status}>
              <CircularProgress size='sm' />
              <Typography level='body-sm'>קורא את הנתונים ומכין הצעת תיקון...</Typography>
            </Box>
          ) : null}

          {fields.map(field => (
            <FormControl key={field.name} required={field.required} disabled={busy}>
              <FormLabel>{field.label}</FormLabel>
              {field.type === 'text' || field.type === 'number' ? (
                <Input
                  type={field.type}
                  value={pending.input[field.name] || ''}
                  onChange={event => onInputChange(field.name, event.target.value)}
                />
              ) : (
                <Select
                  value={pending.input[field.name] || null}
                  placeholder='בחר...'
                  onChange={(event, value) => onInputChange(field.name, value || '')}
                >
                  {(field.options || []).map(option => (
                    <Option key={option.value} value={option.value}>{option.label}</Option>
                  ))}
                </Select>
              )}
            </FormControl>
          ))}

          {changes.length ? (
            <Box sx={sx.changes}>
              <Typography level='title-sm'>השינויים שיבוצעו לאחר האישור</Typography>
              {changes.map((change, index) => (
                <Box key={`${change.target}-${change.documentId}-${index}`} sx={sx.change}>
                  <Typography level='body-sm' fontWeight={700}>
                    {change.summary || CHANGE_LABELS[change.action] || 'עדכון המסמך'}
                  </Typography>
                  <Typography component='code' level='body-xs' sx={sx.documentId}>
                    {change.target} / {change.documentId}
                  </Typography>
                  {CHANGE_LABELS[change.action] ? (
                    <Typography level='body-xs'>{CHANGE_LABELS[change.action]}</Typography>
                  ) : null}
                </Box>
              ))}
            </Box>
          ) : null}

          {preview.skipped ? (
            <Alert color='success'>הממצא כבר אינו קיים בבדיקה החדשה. אין צורך בתיקון.</Alert>
          ) : null}
          {!preparing && !preview.skipped && preview.reason ? (
            <Alert color='warning'>{preview.reason}</Alert>
          ) : null}
          {reload ? (
            <Alert color='warning'>
              {reload.reason || 'יש להשלים את נתוני המקור בטעינה מחדש. לאחר הטעינה יש להריץ שוב את האודיט.'}
            </Alert>
          ) : null}
          {pending.error ? <Alert color='danger'>{pending.error}</Alert> : null}
          {ready ? (
            <Typography level='body-sm'>
              לפני השמירה תיבדק שוב התאמת הנתונים להצעה. לאחר התיקון הבדיקה תרוץ מחדש.
            </Typography>
          ) : null}
        </DialogContent>
        <DialogActions sx={sx.actions}>
          {reload && reload.route ? (
            <Button component={Link} to={reload.route} state={reload.context} disabled={busy}>
              {reload.label || 'פתח טעינה מחדש'}
            </Button>
          ) : null}
          {ready ? (
            <Button type='button' loading={repairing} disabled={preparing} onClick={onConfirm}>
              אשר ובצע תיקון
            </Button>
          ) : null}
          {!ready && !preview.skipped && !reload ? (
            <Button type='button' loading={preparing} disabled={busy || requiredMissing} onClick={onRefresh}>
              {pending.error ? 'נסה שוב להכין הצעה' : 'הצג הצעת תיקון'}
            </Button>
          ) : null}
          <Button type='button' variant='outlined' color='neutral' disabled={busy} onClick={onClose}>
            {preview.skipped || reload ? 'סגור' : 'ביטול'}
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  )
}
