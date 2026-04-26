// videoHub/components/mobile/entry/VideoHubEntryCard.js

import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { entrySx as sx } from './mobileEntry.sx.js'

export default function VideoHubEntryCard({
  tone = 'general',
  iconId,
  title,
  description,
  count,
  countLabel = 'פריטים',
  secondaryLabel,
  onClick,
}) {
  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onClick()
        }
      }}
      sx={sx.entryCard(tone)}
    >
      <Box sx={sx.cardContent}>
        <Box sx={sx.cardTop}>
          <Box sx={sx.cardIconWrap(tone)}>
            {iconUi({ id: iconId, size: 'lg' })}
          </Box>

          <Box sx={sx.arrowWrap(tone)}>
            {iconUi({ id: 'back' })}
          </Box>
        </Box>

        <Box>
          <Typography level="title-lg" sx={{ fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.1 }}>
            {title}
          </Typography>

          <Typography level="body-sm" sx={sx.cardText}>
            {description}
          </Typography>
        </Box>
      </Box>

      <Box sx={sx.metricRow}>
        <Chip size="sm" variant="soft" sx={sx.metricChip(tone)}>
          {count} {countLabel}
        </Chip>

        {secondaryLabel ? (
          <Chip size="sm" variant="outlined" sx={sx.secondaryChip}>
            {secondaryLabel}
          </Chip>
        ) : null}
      </Box>
    </Box>
  )
}
