// playerProfile/desktop/modules/info/components/PlayerNamesCard.js

import React from 'react'
import { Box, Typography, Sheet, Chip } from '@mui/joy'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { playerInfoModuleSx as sx } from '../playerInfo.module.sx.js'

import {
  PlayerFirstNameField,
  PlayerLastNameField,
  PlayerShortNameField,
} from '../../../../../../../ui/fields'

const getChipText = (draft = {}) => {
  const fullName = [draft.playerFirstName, draft.playerLastName]
    .filter(Boolean)
    .join(' ')
    .trim()

  return fullName || draft.playerShortName || 'ללא שם'
}

export default function PlayerNamesCard({ draft, setDraft, pending }) {
  const chipText = getChipText(draft)

  return (
    <Sheet variant="outlined" sx={sx.card}>
      <Box sx={sx.cardHead}>
        <Box sx={sx.cardTitle}>
          {iconUi({ id: 'name', size: 'sm' }) || null}
          <Typography level="title-md" noWrap>
            שמות
          </Typography>
        </Box>

        <Chip size="sm" variant="soft" color={chipText === 'ללא שם' ? 'neutral' : 'primary'}>
          {chipText}
        </Chip>
      </Box>

      <Box sx={sx.formGrid2}>
        <PlayerFirstNameField
          value={draft.playerFirstName}
          disabled={pending}
          onChange={(value) => setDraft((prev) => ({ ...prev, playerFirstName: value }))}
        />

        <PlayerLastNameField
          value={draft.playerLastName}
          disabled={pending}
          onChange={(value) => setDraft((prev) => ({ ...prev, playerLastName: value }))}
        />

        <PlayerShortNameField
          value={draft.playerShortName}
          disabled={pending}
          onChange={(value) => setDraft((prev) => ({ ...prev, playerShortName: value }))}
        />
      </Box>
    </Sheet>
  )
}
