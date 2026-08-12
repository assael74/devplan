// src/features/playersDatabase/ui/components/modals/workTask/cards/LevelChoiceCard.js

import * as React from 'react'
import {
  Box,
  Button,
  Typography,
} from '@mui/joy'

import { workTaskCardsSx as sx } from '../sx/workTaskCards.sx.js'

function LevelStatusIcon({ missingCount }) {
  const complete = missingCount === 0

  return (
    <Box
      aria-label={complete ? 'תקין' : 'חסרות טבלאות'}
      sx={[
        sx.levelStatusIcon,
        complete ? sx.levelStatusIconSuccess : sx.levelStatusIconDanger,
      ]}
    >
      {complete ? '✓' : '!'}
    </Box>
  )
}

export default function LevelChoiceCard({ label, selected, seasons, onClick }) {
  return (
    <Button
      variant={selected ? 'soft' : 'outlined'}
      sx={[
        sx.levelCard,
        selected && sx.levelCardSelected,
      ]}
      onClick={onClick}
    >
      <Typography sx={sx.levelCardTitle}>
        {label}
      </Typography>

      <Box sx={sx.levelSeasonList}>
        {seasons.map(item => (
          <Box key={item.key} sx={sx.levelSeasonRow}>
            <Box sx={sx.levelSeasonMain}>
              <Typography sx={sx.levelSeasonName}>
                {item.season}
              </Typography>
              <LevelStatusIcon missingCount={item.missingCount} />
            </Box>

            <Typography level='body-xs' sx={sx.levelSeasonStatus}>
              {item.statusLabel}
            </Typography>
          </Box>
        ))}
      </Box>
    </Button>
  )
}
