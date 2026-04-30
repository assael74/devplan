// playerProfile/mobile/modules/info/components/PlayerNamesCard.js

import React from 'react'
import { Box, Typography, Sheet } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { infoModuleSx as sx } from '../info.module.sx.js'

import {
  PlayerFirstNameField,
  PlayerLastNameField,
  PlayerShortNameField,
} from '../../../../../../../ui/fields'

export default function PlayerNamesCard({ draft, setDraft, pending }) {
  const setField = (key) => (value) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Sheet variant="outlined" sx={sx.card}>
      <Box sx={sx.cardHead}>
        <Typography level="title-md" noWrap startDecorator={iconUi({ id: 'info' })}>
          שם השחקן
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gap: 0.875, minWidth: 0 }}>
        <Box sx={sx.formGrid2}>
          <Box sx={{ minWidth: 0 }}>
            <PlayerFirstNameField
              size="sm"
              value={draft?.playerFirstName || ''}
              onChange={setField('playerFirstName')}
              disabled={pending}
              sx={{ minWidth: 0, width: '100%' }}
            />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <PlayerLastNameField
              size="sm"
              value={draft?.playerLastName || ''}
              onChange={setField('playerLastName')}
              disabled={pending}
              sx={{ minWidth: 0, width: '100%' }}
            />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <PlayerShortNameField
              size="sm"
              value={draft?.playerShortName || ''}
              onChange={setField('playerShortName')}
              disabled={pending}
              sx={{ minWidth: 0, width: '100%' }}
            />
          </Box>
        </Box>
      </Box>
    </Sheet>
  )
}
