// playerProfile/sharedUi/insights/playerGames/sections/TeamImpactSection.js

import React from 'react'
import { Sheet, Typography } from '@mui/joy'

import {
  buildImpactView,
} from '../../../../sharedLogic/games/insightsDrawer/index.js'

import {
  SectionEmptyState,
  SectionMetricsGrid,
  SectionTakeaway,
} from './shared/index.js'

import { teamImpactSx as sx } from './sx/TeamImpact.sx.js'

export default function TeamImpactSection({ brief }) {
  if (!brief) {
    return (
      <SectionEmptyState
        sx={sx}
        title="אין מספיק נתוני השפעה קבוצתית"
        text="כדי לבדוק השפעה קבוצתית צריך נתוני משחקים עם השחקן ובלעדיו."
      />
    )
  }

  const model = buildImpactView({ brief, })

  return (
    <Sheet variant="soft" sx={sx.root}>
      <Typography level="title-sm" sx={sx.title}>
        השפעה קבוצתית
      </Typography>

      <SectionMetricsGrid
        sx={sx}
        metrics={model.metrics}
        emptyTitle="אין מספיק נתוני השפעה קבוצתית"
        emptyText="כדי לבדוק השפעה קבוצתית צריך נתוני משחקים עם השחקן ובלעדיו."
      />

      <SectionTakeaway
        sx={sx}
        takeaway={model.takeaway}
      />
    </Sheet>
  )
}
