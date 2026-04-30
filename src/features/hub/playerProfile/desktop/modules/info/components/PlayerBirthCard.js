// playerProfile/desktop/modules/info/components/PlayerBirthCard.js

import React, { useEffect, useMemo, useState } from 'react'
import { Box, Typography, Sheet, Button, Chip } from '@mui/joy'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { playerInfoModuleSx as sx } from '../playerInfo.module.sx.js'
import { MonthYearPicker, DateInputField } from '../../../../../../../ui/fields'

export default function PlayerBirthCard({ draft, setDraft, pending }) {
  const hasBirth = Boolean(draft.birth)
  const hasBirthDay = Boolean(draft.birthDay)

  return (
    <Sheet variant="outlined" sx={sx.card}>
      <Box sx={sx.cardHead}>
        <Box sx={sx.cardTitle}>
          {iconUi({ id: 'birth', size: 'sm' }) || null}
          <Typography level="title-md" noWrap>
            תאריך לידה ושנתון
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Chip size="sm" variant="soft" color={hasBirth ? 'primary' : 'neutral'}>
            {hasBirth ? `שנתון ${draft.birth}` : 'ללא שנתון'}
          </Chip>

          <Chip size="sm" variant="soft" color={hasBirthDay ? 'primary' : 'neutral'}>
            {hasBirthDay ? 'תאריך מלא' : 'ללא תאריך מלא'}
          </Chip>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gap: 1 }}>
        <MonthYearPicker
          value={draft.birth}
          onChange={(v) => setDraft((prev) => ({ ...prev, birth: v }))}
        />

        <DateInputField
          value={draft.birthDay}
          onChange={(v) => setDraft((prev) => ({ ...prev, birthDay: v }))}
        />
      </Box>
    </Sheet>
  )
}
