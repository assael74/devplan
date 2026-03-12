// preview/previewDomainCard/domains/player/info/components/PlayerInfoDomainActions.js

import React from 'react'
import { Box, Button } from '@mui/joy'
import { sx } from '../sx/playerInfo.domain.sx.js'

export default function PlayerInfoDomainActions({
  dirty,
  pending,
  onSave,
  onReset,
  onClose,
}) {
  return (
    <Box sx={sx.actions}>
      <Button
        variant="solid"
        disabled={!dirty || pending}
        loading={pending}
        loadingPosition="center"
        onClick={onSave}
        sx={sx.conBut}
      >
        שמור
      </Button>

      <Button
        variant="soft"
        color="neutral"
        disabled={!dirty || pending}
        onClick={onReset}
      >
        איפוס
      </Button>

      <Button
        variant="outlined"
        color="neutral"
        disabled={pending}
        onClick={onClose}
      >
        סגור
      </Button>
    </Box>
  )
}
