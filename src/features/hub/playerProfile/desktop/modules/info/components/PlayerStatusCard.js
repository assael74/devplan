// features/hub/playerProfile/desktop/modules/info/components/PlayerStatusCard.js

import React from 'react'
import { Box, Chip, Sheet, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import PlayerContactFields from '../../../../../../../ui/forms/players/edit/PlayerContactFields.js'

import { sharedSx as sx } from './sx/shared.sx.js'

const TEXT = {
  active: 'פעיל',
  notActive: 'לא פעיל',
  title: 'קשר ומקור',
}

const getPlayerActiveChipMeta = (active) => {
  return active
    ? { color: 'success', iconId: 'active', label: TEXT.active }
    : { color: 'danger', iconId: 'notActive', label: TEXT.notActive }
}

export default function PlayerStatusCard({ draft, setDraft, pending }) {
  const activeMeta = getPlayerActiveChipMeta(draft?.active)

  const handleField = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Sheet variant="outlined" sx={sx.card}>
      <Box sx={sx.cardHead}>
        <Box sx={sx.cardTitle}>
          <Typography level="title-md" noWrap>
            {TEXT.title}
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

      <PlayerContactFields
        draft={draft}
        onField={handleField}
        disabled={pending}
        topLayout={sx.statusTopRow}
        bottomLayout={sx.statusBottomRow}
      />
    </Sheet>
  )
}
