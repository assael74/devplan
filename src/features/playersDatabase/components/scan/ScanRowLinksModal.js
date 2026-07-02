// src/features/playersDatabase/components/scan/ScanRowLinksModal.js

import React, { useEffect, useState } from 'react'
import { Box, Button, Input, Modal, ModalClose, ModalDialog, Typography } from '@mui/joy'
import LinkIcon from '@mui/icons-material/Link'

import { clean } from './logic/utils.js'
import { scanModalSx as sx } from './sx/modal.sx.js'

export default function ScanRowLinksModal({ open, row, saving = false, error = '', onClose, onSave }) {
  const [playerUrl, setPlayerUrl] = useState('')
  const [teamUrl, setTeamUrl] = useState('')

  useEffect(() => {
    if (!open) return
    setPlayerUrl(clean(row?.playerUrl || row?.source?.playerUrl))
    setTeamUrl(clean(row?.teamUrl || row?.source?.teamUrl))
  }, [open, row?.playerUrl, row?.source?.playerUrl, row?.teamUrl, row?.source?.teamUrl])

  const playerName = clean(row?.fullName || row?.playerName || row?.name)
  const teamName = clean(row?.clubName || row?.teamName)
  const identity = clean(row?.teamSeasonKey || row?.playerSeasonId || row?.id)

  return (
    <Modal open={open} onClose={saving ? undefined : onClose}>
      <ModalDialog sx={sx.dialog}>
        <ModalClose disabled={saving} />
        <Box sx={sx.head}>
          <LinkIcon color="primary" />
          <Box>
            <Typography level="title-md">עריכת שורה</Typography>
            <Typography level="body-sm" sx={sx.meta}>קישורים לשחקן ולקבוצה, עם אפשרות להרחיב בהמשך להערות ושדות נוספים.</Typography>
          </Box>
        </Box>

        <Box sx={sx.identity}>
          <Typography level="body-sm" sx={sx.identityTitle}>{playerName || '-'}</Typography>
          <Typography level="body-xs" sx={sx.meta}>{teamName || '-'}</Typography>
          <Typography level="body-xs" sx={sx.meta}>{identity || '-'}</Typography>
        </Box>

        <Box sx={sx.field}><Typography level="body-xs" sx={sx.label}>קישור לשחקן</Typography><Input size="sm" value={playerUrl} placeholder="https://..." disabled={saving} onChange={event => setPlayerUrl(event.target.value)} /></Box>
        <Box sx={sx.field}><Typography level="body-xs" sx={sx.label}>קישור לקבוצה</Typography><Input size="sm" value={teamUrl} placeholder="https://..." disabled={saving} onChange={event => setTeamUrl(event.target.value)} /></Box>
        {error ? <Typography sx={sx.error}>{error}</Typography> : null}

        <Box sx={sx.actions}>
          <Button size="sm" color="primary" loading={saving} onClick={() => onSave?.({ playerUrl, teamUrl })}>שמור שורה</Button>
          <Button size="sm" variant="soft" color="neutral" disabled={saving} onClick={onClose}>ביטול</Button>
        </Box>
      </ModalDialog>
    </Modal>
  )
}
