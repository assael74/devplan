// teamProfile/sharedUi/insights/teamPlayers/components/MetricCardsGrid.js

import React from 'react'
import { Box } from '@mui/joy'

import {
  MetricMiniCard,
} from '../../../../../../../ui/patterns/insights/index.js'

import TooltipContent from './TooltipContent.js'

import { componentsSx as sx } from './sx/components.sx.js'

const renderTooltip = (tooltip) => {
  if (!tooltip) return null

  return <TooltipContent model={tooltip} />
}

export default function MetricCardsGrid({
  cards = [],
}) {
  const safeCards = Array.isArray(cards) ? cards : []

  if (!safeCards.length) return null

  return (
    <Box sx={sx.grid}>
      {safeCards.map((card) => (
        <MetricMiniCard
          key={card.id}
          label={card.label}
          value={card.value}
          sub={card.sub}
          icon={card.icon}
          color={card.color}
          tooltip={renderTooltip(card.tooltip)}
        />
      ))}
    </Box>
  )
}
