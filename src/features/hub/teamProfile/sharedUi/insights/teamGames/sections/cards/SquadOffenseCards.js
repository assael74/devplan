// teamProfile/sharedUi/insights/teamGames/sections/cards/SquadOffenseCards.js

import React from 'react'
import { Box, Chip, Sheet, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'

import {
  Takeaway,
} from '../../../../../../../../ui/patterns/insights/index.js'

import {
  buildSquadOffenseCardsModel,
} from '../../../../../sharedLogic/games/index.js'

import {
  EmptyStateView,
  MetricCardView,
} from '../shared/index.js'

import { squadOffenseSx as sx } from '../sx/squadOffense.sx.js'

function renderMetricCard(isMobile) {
  return function render(item) {
    return (
      <MetricCardView
        key={item.id}
        item={item}
        isMobile={isMobile}
      />
    )
  }
}

export default function SquadOffenseCards({ brief, isMobile }) {
  const model = buildSquadOffenseCardsModel({
    brief,
  })

  return (
    <Sheet variant="soft" sx={sx.root}>
      <Box sx={sx.header}>
        <Box sx={sx.headerText}>
          <Typography level="body-sm" sx={sx.sectionTitle}>
            {model.title}
          </Typography>

          <Typography level="body-xs" sx={sx.sectionSubtitle}>
            {model.subtitle}
          </Typography>
        </Box>

        <Chip
          size="sm"
          variant="soft"
          color={model.chipColor}
          startDecorator={iconUi({
            id: model.chipIcon,
            size: 'sm',
          })}
          sx={sx.headerChip}
        >
          {model.chipLabel}
        </Chip>
      </Box>

      {model.cards.length ? (
        <Box sx={sx.metricsGrid}>
          {model.cards.map((item) => (
            <MetricCardView
              key={item.id}
              item={item}
              isMobile={isMobile}
            />
          ))}
        </Box>
      ) : (
        <EmptyStateView
          model={model.empty}
          sx={sx}
          mode="section"
        />
      )}

      <Takeaway
        item={model.insight}
        details={model.insight?.details}
        icon="goals"
        value={model.insight?.value}
      />
    </Sheet>
  )
}
