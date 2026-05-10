// playerProfile/desktop/modules/info/components/PlayerPhysicalCard.js

import React, { useMemo } from 'react'
import { Box, Typography, Sheet, Input, Chip } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { sharedSx as sx } from './sx/shared.sx.js'

import {
  calcPlayerBmi,
  getPlayerBmiText,
} from '../../../../../../../shared/players/players.logic.js'

export default function PlayerPhysicalCard({ draft, setDraft, pending }) {
  const bmi = useMemo(() => {
    return calcPlayerBmi(draft?.heightCm, draft?.weightKg)
  }, [draft?.heightCm, draft?.weightKg])

  const bmiText = useMemo(() => {
    return getPlayerBmiText(draft?.heightCm, draft?.weightKg)
  }, [draft?.heightCm, draft?.weightKg])

  return (
    <Sheet variant="outlined" sx={sx.card}>
      <Box sx={sx.cardHead}>
        <Box sx={sx.cardTitle}>
          {iconUi?.({ id: 'performance', size: 'sm' }) || null}
          <Typography level="title-md" noWrap>
            מדדים פיזיים
          </Typography>
        </Box>

        <Chip size="sm" variant="soft" color={bmi == null ? 'neutral' : 'primary'}>
          {bmiText}
        </Chip>
      </Box>

      <Box sx={sx.formGrid2}>
        <Box sx={{ display: 'grid', gap: 0.5 }}>
          <Typography level="body-xs" sx={{ opacity: 0.7 }}>
            גובה (ס״מ)
          </Typography>

          <Input
            value={draft?.heightCm || ''}
            disabled={pending}
            onChange={(event) => {
              setDraft((prev) => ({
                ...prev,
                heightCm: event.target.value,
              }))
            }}
            placeholder="לדוגמה: 145"
          />
        </Box>

        <Box sx={{ display: 'grid', gap: 0.5 }}>
          <Typography level="body-xs" sx={{ opacity: 0.7 }}>
            משקל (ק״ג)
          </Typography>

          <Input
            value={draft?.weightKg || ''}
            disabled={pending}
            onChange={(event) => {
              setDraft((prev) => ({
                ...prev,
                weightKg: event.target.value,
              }))
            }}
            placeholder="לדוגמה: 38"
          />
        </Box>
      </Box>
    </Sheet>
  )
}
