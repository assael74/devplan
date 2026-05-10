// teamProfile/sharedUi/insights/teamGames/sections/shared/CurrentMetricsCardView.js

import React from 'react'
import { Box, Chip, Sheet, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'

import EmptyStateView from './EmptyStateView.js'
import MetricCardView from './MetricCardView.js'

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

export default function CurrentMetricsCardView({ model, sx, isMobile = false }) {
  return (
    <Sheet variant="soft" sx={sx.currentCard}>
      <Box sx={sx.cardTop}>
        <Typography level="body-sm" sx={sx.cardTitle}>
          {model.title}
        </Typography>

        <Chip
          size="sm"
          variant="soft"
          color={model.chipColor}
          startDecorator={iconUi({
            id: model.chipIcon,
            size: 'sm',
          })}
        >
          {model.chipLabel}
        </Chip>
      </Box>

      {model.isReady ? (
        <Box sx={sx.splitGrid}>
          {model.cards.map(renderMetricCard(isMobile))}
        </Box>
      ) : (
        <EmptyStateView
          model={model.empty}
          sx={sx}
        />
      )}
    </Sheet>
  )
}
