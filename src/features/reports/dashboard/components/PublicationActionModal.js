// src/features/reports/dashboard/components/PublicationActionModal.js

import Box from '@mui/joy/Box'
import Button from '@mui/joy/Button'
import DialogActions from '@mui/joy/DialogActions'
import DialogContent from '@mui/joy/DialogContent'
import DialogTitle from '@mui/joy/DialogTitle'
import Modal from '@mui/joy/Modal'
import ModalDialog from '@mui/joy/ModalDialog'
import Typography from '@mui/joy/Typography'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'

function resolveModalContent(action, publication) {
  const entityName = publication?.entityName || publication?.title || 'הפרסום'

  if (action === 'delete') {
    return {
      title: 'מחיקת פרסום',
      description: `האם למחוק את "${entityName}"? הפעולה תסיר את הדוח מהרשימה ומהקישור.`,
      confirmLabel: 'מחיקה',
      confirmColor: 'danger',
      iconId: 'delete',
    }
  }

  return {
    title: 'עצירת פרסום',
    description: `האם לעצור את "${entityName}"? לאחר העצירה הקישור לא יהיה זמין יותר.`,
    confirmLabel: 'עצירה',
    confirmColor: 'warning',
    iconId: 'archive',
  }
}

export default function PublicationActionModal({
  open = false,
  action = '',
  publication = null,
  loading = false,
  onClose,
  onConfirm,
}) {
  const content = resolveModalContent(action, publication)

  return (
    <Modal open={open} onClose={loading ? undefined : onClose}>
      <ModalDialog
        variant='outlined'
        sx={{
          width: 'min(100%, 460px)',
          borderRadius: 'lg',
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ color: content.confirmColor === 'danger' ? 'danger.500' : 'warning.500' }}>
            {iconUi({ id: content.iconId, size: 'sm' })}
          </Box>
          {content.title}
        </DialogTitle>

        <DialogContent>
          <Typography level='body-sm' sx={{ color: 'text.secondary' }}>
            {content.description}
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            variant='plain'
            color='neutral'
            onClick={onClose}
            disabled={loading}
          >
            ביטול
          </Button>

          <Button
            variant='solid'
            color={content.confirmColor}
            onClick={onConfirm}
            loading={loading}
          >
            {content.confirmLabel}
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  )
}
