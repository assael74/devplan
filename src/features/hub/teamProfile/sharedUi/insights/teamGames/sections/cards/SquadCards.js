// teamProfile/sharedUi/insights/teamGames/sections/cards/SquadCards.js

import React from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import {
  Takeaway,
} from '../../../../../../../../ui/patterns/insights/index.js'

import {
  buildSquadCardsModel,
} from '../../../../../sharedLogic/games/index.js'

import {
  EmptyStateView,
  MetricCardView,
} from '../shared/index.js'

import SquadOffenseCards from './SquadOffenseCards.js'

import { squadSx as sx } from '../sx/squad.sx.js'

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

function SquadUsageBlock({ model, isMobile }) {
  return (
    <Sheet variant="soft" sx={sx.sectionCard}>
      <Box sx={sx.sectionHeader}>
        <Box sx={{ minWidth: 0 }}>
          <Typography level="body-sm" sx={sx.sectionTitle}>
            {model.title}
          </Typography>

          <Typography level="body-xs" sx={sx.sectionSubtitle}>
            {model.subtitle}
          </Typography>
        </Box>
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

      {model.insight ? (
        <Box sx={sx.takeawayWrap}>
          <Takeaway
            item={model.insight}
            details={model.insight?.details}
            icon={model.icon}
            value={model.insight?.value}
          />
        </Box>
      ) : null}
    </Sheet>
  )
}

function SquadCurrentCard({ data, brief, isMobile }) {
  const model = buildSquadCardsModel({
    data,
    brief,
  })

  return (
    <Sheet variant="soft" sx={sx.mainCard}>
      <Box sx={sx.sectionsStack}>
        <SquadOffenseCards brief={brief} isMobile={isMobile} />

        <Box sx={sx.usageRow}>
          <SquadUsageBlock model={model.lineup} isMobile={isMobile} />
          <SquadUsageBlock model={model.integration} isMobile={isMobile} />
        </Box>
      </Box>
    </Sheet>
  )
}

export default function SquadCards({ data, brief, isMobile }) {
  return (
    <Box sx={sx.grid}>
      <SquadCurrentCard data={data} brief={brief} isMobile={isMobile} />
    </Box>
  )
}
