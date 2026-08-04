// features/hub/playerProfile/mobile/modules/info/components/PlayerBirthCard.js

import React from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import PlayerBirthFields from '../../../../../../../ui/forms/players/edit/PlayerBirthFields.js'

import { infoModuleSx as sx } from '../info.module.sx.js'

export default function PlayerBirthCard({ draft, setDraft, pending }) {
  const handleField = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Sheet variant="outlined" sx={sx.card}>
      <Box sx={sx.cardHead}>
        <Typography
          level="title-md"
          noWrap
          startDecorator={iconUi({ id: 'birth' })}
        >
          תאריך לידה ושנתון
        </Typography>
      </Box>

      <PlayerBirthFields
        draft={draft}
        onField={handleField}
        disabled={pending}
        layout={sx.formGrid3}
        mode="split"
      />
    </Sheet>
  )
}
