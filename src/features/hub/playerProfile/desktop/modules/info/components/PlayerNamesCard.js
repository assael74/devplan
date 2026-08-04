// features/hub/playerProfile/desktop/modules/info/components/PlayerNamesCard.js

import React from 'react'
import { Box, Chip, Sheet, Typography } from '@mui/joy'

import PlayerNamesFields from '../../../../../../../ui/forms/players/edit/PlayerNamesFields.js'

import { sharedSx as sx } from './sx/shared.sx.js'

const TEXT = {
  noName: 'ללא שם',
  title: 'שמות',
}

const getChipText = (draft = {}) => {
  const fullName = [draft.playerFirstName, draft.playerLastName]
    .filter(Boolean)
    .join(' ')
    .trim()

  return fullName || draft.playerShortName || TEXT.noName
}

export default function PlayerNamesCard({ draft, setDraft, pending }) {
  const chipText = getChipText(draft)

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
          color={chipText === TEXT.noName ? 'neutral' : 'primary'}
        >
          {chipText}
        </Chip>
      </Box>

      <PlayerNamesFields
        draft={draft}
        onField={handleField}
        disabled={pending}
        layout={sx.formGrid2}
        showShortName
      />
    </Sheet>
  )
}
