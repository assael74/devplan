// features/insightsHub/performance/components/PerformanceRichText.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'

import {
  cardSx,
} from './sx/card.sx.js'

function TextBreak() {
  return <Box component="span" sx={cardSx.textBreak} />
}

function HighlightPart({ part }) {
  return (
    <Box component="span" sx={cardSx.highlightText(part.tone)}>
      {part.text}

      {part.iconId ? (
        <Box component="span" sx={cardSx.inlineIcon}>
          {iconUi({ id: part.iconId })}
        </Box>
      ) : null}
    </Box>
  )
}

function TextPart({ part }) {
  if (part.br) return <TextBreak />

  if (part.tone || part.iconId) {
    return <HighlightPart part={part} />
  }

  return part.text
}

export default function PerformanceRichText({ item }) {
  const parts = item.textParts || [{ text: item.text || '' }]

  return (
    <Typography sx={cardSx.mainText}>
      {parts.map((part, index) => (
        <TextPart key={`${part.text || 'br'}-${index}`} part={part} />
      ))}
    </Typography>
  )
}
