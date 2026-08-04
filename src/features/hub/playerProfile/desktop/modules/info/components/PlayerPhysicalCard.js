// playerProfile/desktop/modules/info/components/PlayerPhysicalCard.js

import React, { useMemo } from 'react'
import { Box, Typography, Sheet, Input, Chip } from '@mui/joy'

import { sharedSx as sx } from './sx/shared.sx.js'

import {
  calcPlayerBmi,
  getPlayerBmiText,
} from '../../../../../../../shared/players/players.logic.js'

const TEXT = {
  title: '\u05de\u05d3\u05d3\u05d9\u05dd \u05e4\u05d9\u05d6\u05d9\u05d9\u05dd',
  height: '\u05d2\u05d5\u05d1\u05d4 (\u05e1\u05de)',
  weight: '\u05de\u05e9\u05e7\u05dc (\u05e7\u05d2)',
  heightPlaceholder: '\u05dc\u05d3\u05d5\u05d2\u05de\u05d4: 145',
  weightPlaceholder: '\u05dc\u05d3\u05d5\u05d2\u05de\u05d4: 38',
}

export default function PlayerPhysicalCard({ draft, setDraft, pending }) {
  const bmi = useMemo(() => calcPlayerBmi(draft?.heightCm, draft?.weightKg), [draft?.heightCm, draft?.weightKg])
  const bmiText = useMemo(() => getPlayerBmiText(draft?.heightCm, draft?.weightKg), [draft?.heightCm, draft?.weightKg])

  return (
    <Sheet variant='outlined' sx={sx.card}>
      <Box sx={sx.cardHead}>
        <Box sx={sx.cardTitle}>
          <Typography level='title-md' noWrap>{TEXT.title}</Typography>
        </Box>

        <Chip size='sm' variant='soft' color={bmi == null ? 'neutral' : 'primary'}>{bmiText}</Chip>
      </Box>

      <Box sx={sx.formGrid2}>
        <Box sx={{ display: 'grid', gap: 0.5 }}>
          <Typography level='body-xs' sx={{ opacity: 0.7 }}>{TEXT.height}</Typography>
          <Input
            value={draft?.heightCm || ''}
            disabled={pending}
            onChange={(event) => setDraft((prev) => ({ ...prev, heightCm: event.target.value }))}
            placeholder={TEXT.heightPlaceholder}
          />
        </Box>

        <Box sx={{ display: 'grid', gap: 0.5 }}>
          <Typography level='body-xs' sx={{ opacity: 0.7 }}>{TEXT.weight}</Typography>
          <Input
            value={draft?.weightKg || ''}
            disabled={pending}
            onChange={(event) => setDraft((prev) => ({ ...prev, weightKg: event.target.value }))}
            placeholder={TEXT.weightPlaceholder}
          />
        </Box>
      </Box>
    </Sheet>
  )
}
