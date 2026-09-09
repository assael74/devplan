// src/features/playersDatabase/ui/components/modals/SeasonDeleteConfirmModal.js

import {
  Alert,
  Box,
  Typography,
} from '@mui/joy'
import ConfirmModal from './ConfirmModal.js'

export default function SeasonDeleteConfirmModal({
  open,
  title,
  description,
  seasonKey,
  busy,
  confirmLabel,
  mayRemoveLeagueRoot = false,
  onConfirm,
  onClose,
}) {
  return (
    <ConfirmModal
      open={open}
      title={title}
      description={description}
      iconId='delete'
      confirmLabel={confirmLabel}
      confirmIconId='delete'
      busy={busy}
      persistent
      onConfirm={onConfirm}
      onClose={onClose}
    >
      <Alert color='danger' variant='soft'>
        <Box>
          <Typography level='title-sm'>
            {mayRemoveLeagueRoot
              ? 'אם זו העונה האחרונה, גם הליגה תוסר ממרכז הליגות'
              : 'הפעולה משפיעה על עונה אחת בלבד'}
          </Typography>
          <Typography level='body-sm'>עונה: {seasonKey || '—'}</Typography>
        </Box>
      </Alert>
    </ConfirmModal>
  )
}
