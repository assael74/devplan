// playerProfile/sharedUi/insights/playerGames/print/printSections.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import { PrintMetricCard } from './printCards.js'

import {
  getCardKey,
  getSectionSummary,
  getSectionTitle,
  hasCards,
  hasText,
} from './printView.helpers.js'

import { printSx as sx } from './print.sx.js'

export function PrintSection({ section }) {
  const title = getSectionTitle(section)
  const summary = getSectionSummary(section)
  const cards = Array.isArray(section?.cards) ? section.cards : []

  return (
    <Box className="dpPrintSection" sx={sx.section}>
      <Box sx={sx.sectionHeader}>
        <Typography sx={sx.sectionTitle}>
          {title}
        </Typography>

        {hasText(summary) && (
          <Typography sx={sx.sectionSummary}>
            {summary}
          </Typography>
        )}
      </Box>

      {hasCards(cards) && (
        <Box sx={sx.sectionCardsGrid}>
          {cards.map((card, index) => (
            <PrintMetricCard
              key={getCardKey(card, index)}
              item={card}
            />
          ))}
        </Box>
      )}
    </Box>
  )
}
