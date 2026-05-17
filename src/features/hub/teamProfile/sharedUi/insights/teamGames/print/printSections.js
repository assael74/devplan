// teamProfile/sharedUi/insights/teamGames/print/printSections.js

import React from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import { sectionSx as sx } from './sx/section.sx.js'
import { CardItem } from './printCards.js'
import { hasText } from './printView.helpers.js'

const SectionTakeaway = ({ takeaway }) => {
  if (!hasText(takeaway?.text)) return null

  return (
    <Sheet variant="soft" sx={sx.sectionTakeaway}>
      <Typography level="title-sm" sx={{ fontWeight: 700, mb: 0.35 }}>
        {takeaway.title}
      </Typography>

      <Typography level="body-sm" sx={{ color: '#374151', lineHeight: 1.65 }}>
        {takeaway.text}
      </Typography>
    </Sheet>
  )
}

export const TriadCardsSection = ({ section }) => {
  return (
    <Box className="dpPrintSection" sx={sx.section}>
      <Typography level="title-md" sx={{ fontWeight: 700, mb: 0.75 }}>
        {section.title}
      </Typography>

      <Box sx={sx.triadGrid}>
        <Box sx={sx.triadPanel}>
          <Typography level="title-sm" sx={{ fontWeight: 700, mb: 0.75 }}>
            {section.current.title}
          </Typography>

          <Box
            sx={{
              ...{ display: 'grid', gap: 0.75 },
              gridTemplateColumns: `repeat(${section.current.columns || 2}, 1fr)`,
            }}
          >
            {section.current.cards.map((card) => (
              <CardItem key={card.id || card.title} card={card} />
            ))}
          </Box>
        </Box>

        <Sheet variant="soft" sx={sx.triadInsight}>
          <Typography level="title-sm" sx={{ fontWeight: 700, mb: 0.75 }}>
            {section.insight.title}
          </Typography>

          <Typography level="body-sm" sx={{ color: '#374151', lineHeight: 1.55 }}>
            {section.insight.text}
          </Typography>
        </Sheet>

        <Sheet
          variant="outlined"
          sx={{
            ...sx.triadProjection,
          }}
        >
          <Typography level="body-xs" sx={{ color: '#6b7280', fontSize: 11 }}>
            {section.projection.title}
          </Typography>

          <Typography level="h3" sx={sx.cardValue}>
            {section.projection.value}
          </Typography>

          {hasText(section.projection.sub) && (
            <Typography level="body-xs" sx={sx.cardSub}>
              {section.projection.sub}
            </Typography>
          )}
        </Sheet>
      </Box>
    </Box>
  )
}

export const MetricCardsSection = ({ section }) => {
  return (
    <Box className="dpPrintSection" sx={sx.section}>
      <Typography level="title-md" sx={{ fontWeight: 700, mb: 0.75 }}>
        {section.title}
      </Typography>

      {hasText(section.subtitle) && (
        <Typography level="body-sm" sx={{ color: '#374151', mb: 1 }}>
          {section.subtitle}
        </Typography>
      )}

      <Box
        sx={{
          ...{ display: 'grid', gap: 1 },
          gridTemplateColumns: `repeat(${section.columns || 2}, 1fr)`,
        }}
      >
        {section.cards.map((card) => (
          <CardItem key={card.id || card.title} card={card} />
        ))}
      </Box>

      <SectionTakeaway takeaway={section.takeaway} />
    </Box>
  )
}
