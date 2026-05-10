// playerProfile/sharedUi/insights/playerGames/sections/DifficultyImpactSection.js

import React from 'react'
import { Sheet, Typography } from '@mui/joy'

import {
  buildDifficultyView,
} from '../../../../sharedLogic/games/insightsDrawer/index.js'

import {
  SectionEmptyState,
  SectionMetricsGrid,
  SectionTakeaway,
} from './shared/index.js'

import { difficultyImpactSx as sx } from './sx/DifficultyImpact.sx.js'

const emptyTitle = 'אין מספיק נתוני יריבה'
const emptyText = 'כדי לבדוק ביצועים לפי רמת יריבה צריך לחבר מדדי ביצוע לפי רמת קושי.'

export default function DifficultyImpactSection({ brief }) {
  if (!brief) {
    return (
      <SectionEmptyState
        sx={sx}
        title={emptyTitle}
        text={emptyText}
      />
    )
  }

  const model = buildDifficultyView({
    brief,
  })

  return (
    <Sheet variant="soft" sx={sx.root}>
      <Typography level="title-sm" sx={sx.title}>
        ביצועים לפי רמת יריבה
      </Typography>

      <SectionMetricsGrid
        sx={sx}
        metrics={model.metrics}
        emptyTitle={emptyTitle}
        emptyText={emptyText}
      />

      <SectionTakeaway
        sx={sx}
        takeaway={model.takeaway}
      />
    </Sheet>
  )
}
