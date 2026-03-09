// ui/entityLifecycle/ArchiveEntityDialog.js
import { Modal, ModalDialog, ModalClose, Typography, Box, Button } from '@mui/joy'

const TITLES = {
  player: 'ארכוב שחקן',
  team: 'ארכוב קבוצה',
  club: 'ארכוב מועדון',
  role: 'ארכוב איש צוות',
  tag: 'ארכוב איש צוות',
  videoAnalysis: 'ארכוב ניתוח וידאו',
  videoGeneral: 'ארכוב וידאו כללי',
}

export default function ArchiveEntityDialog({
  open,
  entityType,
  entityName,
  onConfirm,
  onClose,
  busy,
}) {
  return (
    <Modal open={open} onClose={busy ? undefined : onClose}>
      <ModalDialog>
        <ModalClose disabled={!!busy} />

        <Typography level="h4">
          {TITLES[entityType] || 'פעולה'}
        </Typography>

        <Typography mt={1}>
          <b>{entityName}</b> יועבר לארכיון ויוסר מהרשימות הפעילות.
        </Typography>

        <Typography level="body-sm" color="neutral" mt={0.5}>
          ניתן לשחזור בכל עת.
        </Typography>

        <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
          <Button
            variant="plain"
            disabled={!!busy}
            onClick={onClose}
          >
            ביטול
          </Button>

          <Button
            loading={!!busy}
            disabled={!!busy}
            onClick={onConfirm}
          >
            ארכב
          </Button>
        </Box>
      </ModalDialog>
    </Modal>
  )
}
