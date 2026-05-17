// teamProfile/sharedUi/insights/teamGames/print/printCards.js

import React from 'react'
import { Sheet, Typography } from '@mui/joy'

import { cardSx as sx } from './sx/card.sx.js'
import {
  getPrintCardToneSx,
  hasText,
} from './printView.helpers.js'

export const MetaItem = ({ item }) => {
  return (
    <Sheet variant="soft" sx={sx.metaItem}>
      <Typography level="body-xs" sx={{ color: '#6b7280', mb: 0.4 }}>
        {item.title}
      </Typography>

      <Typography level="title-sm" sx={{ fontWeight: 700 }}>
        {item.value}
      </Typography>
    </Sheet>
  )
}

export const CardItem = ({ card }) => {
  return (
    <Sheet
      variant="outlined"
      className="dpPrintCard"
      sx={{
        ...sx.card,
        ...getPrintCardToneSx(card.color),
      }}
    >
      <Typography level="body-xs" sx={{ color: '#6b7280', fontSize: 11 }}>
        {card.title}
      </Typography>

      {hasText(card.value) && (
        <Typography level="h3" sx={sx.cardValue}>
          {card.value}
        </Typography>
      )}

      {hasText(card.sub) && (
        <Typography level="body-sm" sx={sx.cardSub}>
          {card.sub}
        </Typography>
      )}

      {hasText(card.takeaway) && (
        <Typography level="body-sm" sx={{ color: '#111827', mt: 0.75, fontWeight: 600 }}>
          {card.takeaway}
        </Typography>
      )}
    </Sheet>
  )
}
