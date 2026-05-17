// teamProfile/sharedUi/insights/teamGames/print/TeamGamesInsightsPrintView.js

import React from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import { printSx as sx } from './sx/print.sx.js'
import { CardItem, MetaItem } from './printCards.js'
import {
  MetricCardsSection,
  TriadCardsSection,
} from './printSections.js'
import {
  getCardsTakeaway,
  hasText,
} from './printView.helpers.js'

const MainTakeaway = ({ takeaway }) => {
  if (!hasText(takeaway?.text)) return null

  return (
    <Sheet variant="soft" sx={sx.mainTakeaway}>
      <Typography level="title-sm" sx={{ fontWeight: 700 }}>
        {takeaway.title}
      </Typography>

      <Typography level="body-sm" sx={{ color: '#374151', lineHeight: 1.65 }}>
        {takeaway.text}
      </Typography>
    </Sheet>
  )
}

const CardsTakeaway = ({ cards }) => {
  const text = getCardsTakeaway(cards)

  if (!hasText(text)) return null

  return (
    <Sheet variant="soft" sx={sx.mainTakeaway}>
      <Typography level="title-sm" sx={{ fontWeight: 700 }}>
        תובנה מרכזית
      </Typography>

      <Typography level="body-sm" sx={{ color: '#374151', lineHeight: 1.65 }}>
        {text}
      </Typography>
    </Sheet>
  )
}

const PrintSection = ({ section }) => {
  if (section.variant === 'triadCards') {
    return (
      <TriadCardsSection
        key={section.id || section.title}
        section={section}
      />
    )
  }

  if (section.variant === 'metricCards') {
    return (
      <MetricCardsSection
        key={section.id || section.title}
        section={section}
      />
    )
  }

  return null
}

export default function TeamGamesInsightsPrintView({ model }) {
  if (!model) return null

  return (
    <Box dir="rtl" className="dpPrintRoot" sx={sx.page}>
      <Box sx={sx.header}>
        <Typography level="body-sm" sx={{ color: '#6b7280', mb: 0.5 }}>
          {model.reportType}
        </Typography>

        <Typography level="h2" sx={{ fontWeight: 700, mb: 0.5 }}>
          {model.title}
        </Typography>

        {!!model.subtitle && (
          <Typography level="body-md" sx={{ color: '#374151' }}>
            {model.subtitle}
          </Typography>
        )}

        <Typography level="body-xs" sx={{ color: '#6b7280', mt: 1 }}>
          הופק בתאריך: {model.producedAtLabel}
        </Typography>
      </Box>

      <Box sx={sx.metaGrid}>
        {model.meta.map((item) => (
          <MetaItem key={item.id || item.title} item={item} />
        ))}
      </Box>

      {!!model.cards.length && (
        <>
          <Box sx={sx.cardsGrid}>
            {model.cards.map((card) => (
              <CardItem key={card.id || card.title} card={card} />
            ))}
          </Box>

          <CardsTakeaway cards={model.cards} />
        </>
      )}

      <MainTakeaway takeaway={model.mainTakeaway} />

      {model.sections.map((section) => (
        <PrintSection
          key={section.id || section.title}
          section={section}
        />
      ))}
    </Box>
  )
}
