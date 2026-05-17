// src/features/hub/teamProfile/sharedUi/insights/teamPlayers/components/RangeCardsGrid.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'

import RangeIndicator from './RangeIndicator.js'

import { indicatorSx as sx } from './sx/indicator.sx.js'

export default function RangeCardsGrid({
  cards = [],
  compact = false,
}) {
  const safeCards = Array.isArray(cards) ? cards : []

  if (!safeCards.length) return null

  const gridSx = compact ? sx.positionGrid : sx.grid
  const cardSx = compact ? sx.positionCard : sx.rangeCard
  const headSx = compact ? sx.positionHead : sx.rangeHead
  const labelSx = compact ? sx.positionLabel : sx.rangeLabel
  const valueSx = compact ? sx.positionValue : sx.rangeValue
  const subSx = compact ? sx.positionSub : sx.rangeSub

  return (
    <Box sx={gridSx}>
      {safeCards.map((card) => {
        const clickable = typeof card.onClick === 'function'

        return (
          <Box
            key={card.id}
            onClick={card.onClick}
            sx={{
              ...cardSx,
              cursor: clickable ? 'pointer' : 'default',
              outline: card.selected ? '2px solid' : 'none',
              outlineColor: card.selected ? 'primary.400' : 'transparent',
              outlineOffset: card.selected ? 1 : 0,
              transition: '160ms ease',
            }}
          >
            <Box sx={headSx}>
              <Typography level="body-sm" sx={labelSx}>
                {card.label}
              </Typography>

              {iconUi({
                id: card.icon || 'players',
                size: 'sm',
              })}
            </Box>

            <Box>
              <Typography level="h3" sx={valueSx}>
                {card.value}
              </Typography>

              <Typography level="body-xs" sx={subSx}>
                {card.sub}
              </Typography>
            </Box>

            <RangeIndicator status={card.rangeStatus} />
          </Box>
        )
      })}
    </Box>
  )
}
