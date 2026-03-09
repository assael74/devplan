import React from 'react'
import { Modal, ModalDialog, Typography, Box, Button } from '@mui/joy'
import { iconUi } from '../../core/icons/iconUi.js'

const TITLES = {
  player: 'שחזור שחקן',
  team: 'שחזור קבוצה',
  club: 'שחזור מועדון',
  role: 'שחזור איש צוות',
  tag: 'שחזור תג וידאו',
  videoAnalysis: 'שחזור ניתוח וידאו',
  videoGeneral: 'שחזור וידאו כללי',
}

export default function ArchiveRestoreEntityDialog({
  open,
  entityType,
  entityName,
  busy,
  onConfirm,
  onClose,
}) {
  if (!open) return null

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog sx={{ maxWidth: 520 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Box sx={{ display: 'grid', placeItems: 'center' }}>
            {iconUi({ id: 'restore' })}
          </Box>
          <Typography level="h4">שחזור</Typography>
        </Box>

        <Typography level="body-sm" sx={{ mb: 2 }}>
          {TITLES[entityType] || 'פעולה'}
          {entityName ? `: ${entityName}` : ''}?
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button variant="plain" disabled={busy} onClick={onClose}>
            ביטול
          </Button>

          <Button
            variant="solid"
            loading={busy}
            loadingPosition="center"
            onClick={onConfirm}
          >
            שחזור
          </Button>
        </Box>
      </ModalDialog>
    </Modal>
  )
}
