// teamProfile/sharedUi/insights/teamPlayers/components/SummaryChips.js

import React from 'react'
import { Box, Chip, Tooltip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'

import TooltipContent from './TooltipContent.js'

import { componentsSx as sx } from './sx/components.sx.js'

const buildInlineText = (card = {}) => {
  return [card.label, card.value]
    .filter((item) => item !== null && item !== undefined && item !== '')
    .join(' · ')
}

export default function SummaryChips({
  cards = [],
  forceNeutral = false,
}) {
  const safeCards = Array.isArray(cards) ? cards : []

  if (!safeCards.length) return null

  return (
    <Box sx={sx.chips}>
      {safeCards.map((card) => {
        const color = forceNeutral ? 'neutral' : card.color || 'neutral'

        const chip = (
          <Chip
            key={card.id}
            size="md"
            variant="outlined"
            color={color}
            sx={sx.summaryChip}
          >
            {card.inline ? (
              <Typography
                level="body-sm"
                sx={sx.chipTitle}
                startDecorator={iconUi({
                  id: card.icon || 'info',
                  size: 'sm',
                })}
              >
                {buildInlineText(card)}
              </Typography>
            ) : (
              <Box sx={sx.chipContent}>
                <Typography
                  level="body-sm"
                  sx={sx.chipTitle}
                  startDecorator={iconUi({
                    id: card.icon || 'info',
                    size: 'sm',
                  })}
                >
                  {card.label}
                </Typography>

                <Typography level="body-xs" sx={sx.chipSub}>
                  {card.value}
                  {card.sub ? ` · ${card.sub}` : ''}
                </Typography>
              </Box>
            )}
          </Chip>
        )

        if (!card.tooltip) return chip

        return (
          <Tooltip
            key={card.id}
            arrow
            placement="top"
            variant="soft"
            color="primary"
            title={<TooltipContent model={card.tooltip} />}
          >
            {chip}
          </Tooltip>
        )
      })}
    </Box>
  )
}
