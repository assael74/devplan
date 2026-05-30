// src/ui/forms/gameStatsForm/modals/DeleteDraftConfirmModal.js

import React from 'react'
import {
  Box,
  Button,
  Modal,
  ModalDialog,
  Sheet,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../core/icons/iconUi.js'

const fallbackModel = {
  title: 'מחיקת סטטיסטיקה',
  text: 'פעולה זו תמחק את הנתונים שנבחרו.',
  warning: 'לא ניתן לשחזר את הפעולה אוטומטית אחרי האישור.',
  confirmLabel: 'מחיקה',
}

export default function DeleteDraftConfirmModal({
  open,
  model,
  pending = false,
  onClose,
  onConfirm,
}) {
  const view = {
    ...fallbackModel,
    ...(model || {}),
  }

  return (
    <Modal open={!!open} onClose={pending ? undefined : onClose}>
      <ModalDialog sx={{ width: 'min(480px, calc(100vw - 24px))' }}>
        <Box sx={{ display: 'grid', gap: 1.25 }}>
          <Box>
            <Typography level="title-md" startDecorator={iconUi({ id: 'delete' })}>
              {view.title}
            </Typography>

            <Typography level="body-sm" color="neutral">
              {view.text}
            </Typography>
          </Box>

          <Sheet variant="soft" color="warning" sx={{ p: 1, borderRadius: 'md' }}>
            <Typography level="body-sm">
              {view.warning}
            </Typography>
          </Sheet>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button
              variant="soft"
              color="neutral"
              disabled={pending}
              onClick={onClose}
            >
              ביטול
            </Button>

            <Button
              variant="solid"
              color="danger"
              loading={pending}
              onClick={onConfirm}
              startDecorator={iconUi({ id: 'delete' })}
            >
              {view.confirmLabel}
            </Button>
          </Box>
        </Box>
      </ModalDialog>
    </Modal>
  )
}
