// src/features/playersDatabase/ui/components/modals/SeasonDeleteConfirmModal.js

import {
  Alert,
  Box,
  Typography,
} from '@mui/joy'
import ConfirmModal from './ConfirmModal.js'
import TeamSeasonSelect from './TeamSeasonSelect.js'

export default function SeasonDeleteConfirmModal({
  open,
  title,
  description,
  seasonKey,
  seasonOptions,
  selectedSeasonOptionKey,
  busy,
  confirmLabel,
  mayRemoveLeagueRoot = false,
  onConfirm,
  onSeasonOptionChange,
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
      disabled={!selectedSeasonOptionKey}
      persistent
      onConfirm={onConfirm}
      onClose={onClose}
    >
      <TeamSeasonSelect
        seasonOptions={seasonOptions}
        value={selectedSeasonOptionKey}
        onChange={onSeasonOptionChange}
      />
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
