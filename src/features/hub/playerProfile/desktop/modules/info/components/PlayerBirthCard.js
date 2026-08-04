// features/hub/playerProfile/desktop/modules/info/components/PlayerBirthCard.js

import React from 'react'
import { Box, Chip, Sheet, Typography } from '@mui/joy'

import PlayerBirthFields from '../../../../../../../ui/forms/players/edit/PlayerBirthFields.js'

import { sharedSx as sx } from './sx/shared.sx.js'

const TEXT = {
  title: 'תאריך לידה ושנתון',
  year: 'שנתון',
  noYear: 'ללא שנתון',
  fullDate: 'תאריך מלא',
  noFullDate: 'ללא תאריך מלא',
}

export default function PlayerBirthCard({ draft, setDraft, pending }) {
  const hasBirth = Boolean(draft?.birth)
  const hasBirthDay = Boolean(draft?.birthDay)

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

        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Chip
            size="sm"
            variant="soft"
            color={hasBirth ? 'primary' : 'neutral'}
          >
            {hasBirth ? `${TEXT.year} ${draft.birth}` : TEXT.noYear}
          </Chip>

          <Chip
            size="sm"
            variant="soft"
            color={hasBirthDay ? 'primary' : 'neutral'}
          >
            {hasBirthDay ? TEXT.fullDate : TEXT.noFullDate}
          </Chip>
        </Box>
      </Box>

      <PlayerBirthFields
        draft={draft}
        onField={handleField}
        disabled={pending}
        layout={{ display: 'grid', gap: 1 }}
        mode="combined"
      />
    </Sheet>
  )
}
