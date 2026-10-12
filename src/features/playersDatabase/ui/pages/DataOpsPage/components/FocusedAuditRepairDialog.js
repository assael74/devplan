// src/features/playersDatabase/ui/pages/DataOpsPage/components/FocusedAuditRepairDialog.js

import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Modal,
  ModalClose,
  ModalDialog,
  Typography,
} from '@mui/joy'

import {
  getFocusedAuditScopeDetails,
  presentFocusedAuditFinding,
} from '../logic/focusedAuditFindings.presentation.js'
import { focusedAuditFindingsSx as sx } from '../sx/focusedAuditFindings.sx.js'

export default function FocusedAuditRepairDialog({ pending, busy, onClose, onConfirm }) {
  if (!pending) return null
  const display = presentFocusedAuditFinding(pending.finding)

  return (
    <Modal open onClose={busy ? undefined : onClose}>
      <ModalDialog sx={sx.dialog}>
        <ModalClose disabled={busy} />
        <DialogTitle>אישור תיקון הממצא</DialogTitle>
        <DialogContent className='dpScrollThin' sx={sx.dialogContent}>
          <Typography level='title-sm'>{display.title}</Typography>
          <Typography level='body-sm'>{pending.action.description}</Typography>
          <Box sx={sx.confirmationScope}>
            {getFocusedAuditScopeDetails(pending.scope).map(([label, value]) => (
              <Typography key={label} level='body-sm'>{label}: {value}</Typography>
            ))}
            <Typography level='body-sm'>יעד התיקון: {display.target}</Typography>
            {pending.finding.documentId ? (
              <Typography level='body-xs' component='code'>{pending.finding.documentId}</Typography>
            ) : null}
          </Box>
          <Typography level='body-sm'>
            לאחר האישור תתבצע קריאה חדשה, התיקון יישמר והבדיקה תרוץ שוב כדי להציג את המצב המעודכן.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button type='button' loading={busy} onClick={onConfirm}>אשר ובצע תיקון</Button>
          <Button type='button' variant='outlined' color='neutral' disabled={busy} onClick={onClose}>
            ביטול
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  )
}
