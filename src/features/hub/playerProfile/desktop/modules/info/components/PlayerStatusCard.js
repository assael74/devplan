// playerProfile/desktop/modules/info/components/PlayerStatusCard.js

import React from 'react'
import { Box, Typography, Sheet, Chip } from '@mui/joy'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { playerInfoModuleSx as sx } from '../playerInfo.module.sx.js'

import {
  PhoneField,
  PlayerIfaLinkField,
  PlayerActiveSelector,
  SquadRoleSelectField,
} from '../../../../../../../ui/fields'

const getPlayerActiveChipMeta = (active) => {
  return active
    ? { color: 'success', iconId: 'active', label: 'פעיל' }
    : { color: 'danger', iconId: 'notActive', label: 'לא פעיל' }
}

export default function PlayerStatusCard({ draft, setDraft, pending }) {
  const activeMeta = getPlayerActiveChipMeta(draft?.active)

  return (
    <Sheet variant="outlined" sx={sx.card}>
      <Box sx={sx.cardHead}>
        <Box sx={sx.cardTitle}>
          {iconUi?.({ id: 'info', size: 'sm' }) || null}
          <Typography level="title-md" noWrap>
            סטטוס וטלפון
          </Typography>
        </Box>

        <Chip
          size="sm"
          variant="soft"
          color={activeMeta.color}
          startDecorator={iconUi({ id: activeMeta.iconId })}
        >
          {activeMeta.label}
        </Chip>
      </Box>

      <Box sx={sx.statusCardBody}>
        <Box sx={sx.statusTopRow}>
          <Box sx={{ minWidth: 0, width: '100%', pt: 2 }}>
            <PlayerActiveSelector
              value={draft.active}
              disabled={pending}
              onChange={(value) => setDraft((prev) => ({ ...prev, active: value }))}
            />
          </Box>

          <Box sx={{ minWidth: 0, width: '100%' }}>
            <PlayerIfaLinkField
              value={draft.ifaLink}
              disabled={pending}
              onChange={(value) => setDraft((prev) => ({ ...prev, ifaLink: value }))}
              size="sm"
            />
          </Box>
        </Box>

        <Box sx={sx.statusBottomRow}>
          <Box sx={{ minWidth: 0, width: '100%' }}>
            <PhoneField
              size="sm"
              value={draft.phone}
              disabled={pending}
              onChange={(value) => setDraft((prev) => ({ ...prev, phone: value }))}
            />
          </Box>

          <Box sx={{ minWidth: 0, width: '100%' }}>
            <SquadRoleSelectField
              size="sm"
              value={draft.squadRole}
              disabled={pending}
              onChange={(value) => setDraft((prev) => ({ ...prev, squadRole: value || '' }))}
            />
          </Box>
        </Box>
      </Box>
    </Sheet>
  )
}
