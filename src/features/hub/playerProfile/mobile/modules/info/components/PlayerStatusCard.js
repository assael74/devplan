// playerProfile/mobile/modules/info/components/PlayerStatusCard.js

import React from 'react'
import { Box, Typography, Sheet } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { infoModuleSx as sx } from '../info.module.sx.js'

import {
  PhoneField,
  PlayerIfaLinkField,
  PlayerActiveSelector,
  SquadRoleSelectField,
} from '../../../../../../../ui/fields'

export default function PlayerStatusCard({ draft, setDraft, pending }) {
  const setField = (key) => (value) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Sheet variant="outlined" sx={sx.card}>
      <Box sx={sx.cardHead}>
        <Typography level="title-md" noWrap startDecorator={iconUi({ id: 'info' })}>
          סטטוס וטלפון
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gap: 0.875, minWidth: 0 }}>
        <Box sx={sx.gridIfa}>
          <Box sx={{ minWidth: 0, display: 'flex', alignItems: 'flex-end', mb: 0.5 }}>
            <PlayerActiveSelector
              size="xs"
              value={draft?.active}
              disabled={pending}
              onChange={setField('active')}
            />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <PlayerIfaLinkField
              value={draft?.ifaLink || ''}
              onChange={setField('ifaLink')}
              size="sm"
              disabled={pending}
              sx={{ minWidth: 0, width: '100%' }}
            />
          </Box>
        </Box>

        <Box sx={sx.formGrid2}>
          <Box sx={{ minWidth: 0 }}>
            <PhoneField
              size="sm"
              value={draft?.phone || ''}
              onChange={setField('phone')}
              disabled={pending}
              sx={{ minWidth: 0, width: '100%' }}
            />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <SquadRoleSelectField
              size="sm"
              value={draft?.squadRole || ''}
              onChange={(next) => setField('squadRole')(next || '')}
              disabled={pending}
              sx={{ minWidth: 0, width: '100%' }}
            />
          </Box>
        </Box>
      </Box>
    </Sheet>
  )
}
